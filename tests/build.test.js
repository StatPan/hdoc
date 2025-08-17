import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import buildCommand from '../src/commands/build.js';

describe('build command', () => {
  const TEST_DIR = path.join(process.cwd(), 'temp-test-dir');

  beforeEach(async () => {
    // Create a temporary directory for each test
    await fs.ensureDir(TEST_DIR);
    process.chdir(TEST_DIR);
  });

  afterEach(async () => {
    // Go back to the original directory and clean up
    process.chdir(process.cwd().replace(/\/temp-test-dir$/, ''));
    await fs.remove(TEST_DIR);
  });

  it('should build a document from a simple project structure', async () => {
    // 1. Set up a mock project
    await fs.writeJson('.doc-config.json', { global: { typography: { fontSize: '16pt' } } });
    await fs.ensureDir('pages');
    await fs.writeFile('pages/01.html', '<h1>Test Page</h1>');

    // 2. Run the build command
    await buildCommand({}); // empty options for a standard build

    // 3. Assert the output
    const outputPath = path.join(TEST_DIR, 'dist', 'document.html');
    expect(await fs.pathExists(outputPath)).toBe(true);

    const outputContent = await fs.readFile(outputPath, 'utf8');
    expect(outputContent).toContain('<h1>Test Page</h1>');
    expect(outputContent).toContain('--typography-font-size: 16pt;');
  });

  it('should include component content', async () => {
    // 1. Set up a mock project with a component
    await fs.writeJson('.doc-config.json', { global: {} });
    await fs.ensureDir('pages');
    await fs.ensureDir('components');
    await fs.writeFile('components/header.html', '<header>My Header</header>');
    await fs.writeFile('pages/01.html', '{{> header.html }}<h1>Test Page</h1>');

    // 2. Run the build command
    await buildCommand({});

    // 3. Assert the output
    const outputPath = path.join(TEST_DIR, 'dist', 'document.html');
    const outputContent = await fs.readFile(outputPath, 'utf8');

    expect(outputContent).toContain('<header>My Header</header>');
    expect(outputContent).toContain('<h1>Test Page</h1>');
    expect(outputContent).not.toContain('{{> header.html }}');
  });
});
