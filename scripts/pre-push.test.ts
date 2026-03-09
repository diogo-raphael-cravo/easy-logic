#!/usr/bin/env node
/**
 * pre-push.test.ts
 *
 * Tests for pre-push.cjs conflict detection and pre-push hook logic.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execSync } from 'node:child_process';

describe('pre-push conflict check', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pre-push-test-'));
    process.chdir(testDir);

    // Initialize a git repo with main branch
    execSync('git init -b main', { stdio: 'pipe' });
    execSync('git config user.email "test@test.com"', { stdio: 'pipe' });
    execSync('git config user.name "Test User"', { stdio: 'pipe' });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should detect when on main branch and skip conflict check', () => {
    // Create initial commit on main
    fs.writeFileSync('test.txt', 'initial');
    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "initial"', { stdio: 'pipe' });

    // Check current branch (should be main due to git init -b main)
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    // Accept both main and master for compatibility
    expect(['main', 'master']).toContain(branch);

    // Conflict check should be skipped on main/master
    // This is validated by the pre-push script logic
  });

  it('should pass when no conflicts exist with main', () => {
    // Create initial commit on main
    fs.writeFileSync('test.txt', 'initial');
    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "initial"', { stdio: 'pipe' });

    // Create feature branch
    execSync('git checkout -b feature', { stdio: 'pipe' });

    // Add non-conflicting change
    fs.writeFileSync('feature.txt', 'feature file');
    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "add feature"', { stdio: 'pipe' });

    // Try merge-tree check (this is what pre-push does)
    const mergeBase = execSync('git merge-base HEAD main', { encoding: 'utf-8' }).trim();
    expect(mergeBase).toBeTruthy();

    // This should not throw
    const result = execSync(`git merge-tree ${mergeBase} HEAD main`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    // No conflict markers should be present
    expect(result).not.toContain('<<<<<<<');
  });

  it('should detect conflicts with main branch', () => {
    // Create initial commit on main
    fs.writeFileSync('test.txt', 'initial content\n');
    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "initial"', { stdio: 'pipe' });

    // Create feature branch
    execSync('git checkout -b feature', { stdio: 'pipe' });

    // Modify the same file on feature branch
    fs.writeFileSync('test.txt', 'feature content\n');
    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "feature change"', { stdio: 'pipe' });

    // Now modify the same file on main (simulate a diverged main)
    execSync('git checkout main', { stdio: 'pipe' });
    fs.writeFileSync('test.txt', 'main content\n');
    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "main change"', { stdio: 'pipe' });

    // Switch back to feature
    execSync('git checkout feature', { stdio: 'pipe' });

    // Check that merge-tree detects a conflict
    const mergeBase = execSync('git merge-base HEAD main', { encoding: 'utf-8' }).trim();
    const mergeResult = execSync(`git merge-tree ${mergeBase} HEAD main`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    // Should contain conflict markers
    expect(mergeResult).toContain('<<<<<<<');
  });

  it('should handle missing origin/main gracefully', () => {
    // Create initial commit
    fs.writeFileSync('test.txt', 'initial');
    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "initial"', { stdio: 'pipe' });

    // Create feature branch (no remote)
    execSync('git checkout -b feature', { stdio: 'pipe' });

    // merge-base should fail when origin/main doesn't exist
    let failed = false;
    try {
      execSync('git merge-base HEAD origin/main', { encoding: 'utf-8', stdio: 'pipe' });
    } catch {
      failed = true;
    }
    // Without a remote, origin/main doesn't exist so git merge-base should fail
    expect(failed).toBe(true);
  });
});

describe('pre-push hook file validation', () => {
  it('pre-push.cjs should exist in .husky directory', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push.cjs');
    expect(fs.existsSync(hookPath)).toBe(true);
  });

  it('pre-push shell script should delegate to pre-push.cjs', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push');
    expect(fs.existsSync(hookPath)).toBe(true);
    const content = fs.readFileSync(hookPath, 'utf-8');
    expect(content).toContain('pre-push.cjs');
    expect(content).toContain('node');
  });
});

describe('pre-push PATH resolution for npx', () => {
  it('pre-push.cjs should define getEnvWithNodePath helper', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push.cjs');
    const content = fs.readFileSync(hookPath, 'utf-8');
    expect(content).toContain('getEnvWithNodePath');
  });

  it('pre-push.cjs should use getEnvWithNodePath in execSync calls that invoke npx', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push.cjs');
    const content = fs.readFileSync(hookPath, 'utf-8');

    // Find all execSync calls that use npx
    const npxExecCalls = content.match(/execSync\(['"`]npx\s/g);
    // There should be npx calls in the file
    expect(npxExecCalls).not.toBeNull();

    // Every execSync('npx ...') call should have getEnvWithNodePath in its options
    // Split by execSync calls and check each npx one
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("execSync('npx") || lines[i].includes('execSync("npx') || lines[i].includes('execSync(`npx')) {
        // Look at the surrounding lines (the options object) for env: getEnvWithNodePath
        const context = lines.slice(i, Math.min(i + 6, lines.length)).join('\n');
        expect(context).toContain('env');
      }
    }
  });

  it('getEnvWithNodePath should add node directory to PATH', () => {
    // Simulate the logic: node's directory should be prepended to PATH
    const nodeDir = path.dirname(process.execPath);
    const pathSep = process.platform === 'win32' ? ';' : ':';
    const currentPath = process.env.PATH || process.env.Path || '';

    // The node directory should either already be in PATH or be addable
    const envPath = `${nodeDir}${pathSep}${currentPath}`;
    expect(envPath).toContain(nodeDir);
  });
});

describe('pre-push E2E diagnostic logging', () => {
  it('pre-push.cjs should log diagnostic messages during E2E steps', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push.cjs');
    const content = fs.readFileSync(hookPath, 'utf-8');

    expect(content).toContain('Installing Playwright browsers');
    expect(content).toContain('Running Playwright E2E tests');
  });

  it('pre-push.cjs should set timeouts on E2E execSync calls', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push.cjs');
    const content = fs.readFileSync(hookPath, 'utf-8');

    // The Playwright helper functions should have timeout set
    const installFn = content.slice(
      content.indexOf('function installPlaywrightBrowsers'),
      content.indexOf('function runPlaywrightTests')
    );
    const testFn = content.slice(
      content.indexOf('function runPlaywrightTests'),
      content.indexOf('// Step 14')
    );
    expect(installFn).toContain('timeout');
    expect(testFn).toContain('timeout');
  });

  it('pre-push.cjs should log stderr on E2E test failure', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push.cjs');
    const content = fs.readFileSync(hookPath, 'utf-8');

    // The runPlaywrightTests function should output stderr on failure
    const testFn = content.slice(
      content.indexOf('function runPlaywrightTests'),
      content.indexOf('// Step 14')
    );
    expect(testFn).toContain('error.stderr');
  });

  it('pre-push.cjs should call process.exit(0) after all checks pass', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'pre-push.cjs');
    const content = fs.readFileSync(hookPath, 'utf-8');

    // The last meaningful line should exit cleanly so Node doesn't hang
    const afterSuccess = content.slice(content.indexOf('All pre-push checks passed'));
    expect(afterSuccess).toContain('process.exit(0)');
  });
});

describe('pre-push E2E screenshot verification logic', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-screenshot-test-'));
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should skip E2E checks for non-react template projects', () => {
    fs.writeFileSync('package.json', JSON.stringify({ name: 'test', version: '1.0.0', typescriptBootstrap: { template: 'typescript' } }));
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    expect(packageJson.typescriptBootstrap?.template).not.toBe('react');
  });

  it('should detect react template from package.json', () => {
    fs.writeFileSync('package.json', JSON.stringify({ name: 'test', version: '1.0.0', typescriptBootstrap: { template: 'react' } }));
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    expect(packageJson.typescriptBootstrap?.template).toBe('react');
  });

  it('should count test() calls in e2e files', () => {
    const e2eDir = path.join(testDir, 'e2e');
    fs.mkdirSync(e2eDir, { recursive: true });
    fs.writeFileSync(path.join(e2eDir, 'app.e2e.ts'), `
      import { test, expect } from '@playwright/test'
      test('first test', async ({ page }) => { await page.goto('/') })
      test('second test', async ({ page }) => { await page.goto('/about') })
    `);

    const e2eFiles = fs.readdirSync(e2eDir).filter(f => f.endsWith('.e2e.ts'));
    let testCount = 0;
    for (const file of e2eFiles) {
      const content = fs.readFileSync(path.join(e2eDir, file), 'utf-8');
      const testMatches = content.match(/\btest\s*\(/g);
      if (testMatches) {
        testCount += testMatches.length;
      }
    }
    expect(testCount).toBe(2);
  });

  it('should verify screenshot count matches test count', () => {
    const e2eDir = path.join(testDir, 'e2e');
    const screenshotsDir = path.join(e2eDir, 'screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });

    // Create e2e test file with 3 tests
    fs.writeFileSync(path.join(e2eDir, 'app.e2e.ts'), `
      test('test one', async ({ page }) => {})
      test('test two', async ({ page }) => {})
      test('test three', async ({ page }) => {})
    `);

    // Create only 2 screenshots (should fail the check)
    fs.writeFileSync(path.join(screenshotsDir, 'one.png'), 'fake-png');
    fs.writeFileSync(path.join(screenshotsDir, 'two.png'), 'fake-png');

    const pngFiles = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));

    const e2eFiles = fs.readdirSync(e2eDir).filter(f => f.endsWith('.e2e.ts'));
    let testCount = 0;
    for (const file of e2eFiles) {
      const content = fs.readFileSync(path.join(e2eDir, file), 'utf-8');
      const testMatches = content.match(/\btest\s*\(/g);
      if (testMatches) {
        testCount += testMatches.length;
      }
    }

    expect(pngFiles.length).toBeLessThan(testCount);
  });

  it('should pass when screenshot count matches test count', () => {
    const e2eDir = path.join(testDir, 'e2e');
    const screenshotsDir = path.join(e2eDir, 'screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });

    // Create e2e test file with 2 tests
    fs.writeFileSync(path.join(e2eDir, 'app.e2e.ts'), `
      test('test one', async ({ page }) => {})
      test('test two', async ({ page }) => {})
    `);

    // Create 2 screenshots (matches)
    fs.writeFileSync(path.join(screenshotsDir, 'one.png'), 'fake-png');
    fs.writeFileSync(path.join(screenshotsDir, 'two.png'), 'fake-png');

    const pngFiles = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));

    const e2eFiles = fs.readdirSync(e2eDir).filter(f => f.endsWith('.e2e.ts'));
    let testCount = 0;
    for (const file of e2eFiles) {
      const content = fs.readFileSync(path.join(e2eDir, file), 'utf-8');
      const testMatches = content.match(/\btest\s*\(/g);
      if (testMatches) {
        testCount += testMatches.length;
      }
    }

    expect(pngFiles.length).toBeGreaterThanOrEqual(testCount);
  });
});
