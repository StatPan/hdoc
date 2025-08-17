import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import { generateCSS } from '../utils/css-generator.js';

/**
 * Recursively processes template includes like {{> path/to/component.html }}
 * @param {string} content - The HTML content to process.
 * @param {string} componentsDir - The directory where components are stored.
 * @param {Set<string>} includedFiles - A set to track already included files to prevent circular dependencies.
 * @returns {Promise<string>} - The processed HTML content.
 */
async function processIncludes(content, componentsDir, includedFiles) {
  const includeRegex = /{{>\s*([\w.-]+)\s*}}/g;

  // Use Promise.all to handle all includes concurrently
  const promises = [];
  // Use replace with a function to gather all matches and create promises
  content.replace(includeRegex, (match, componentName) => {
    const promise = (async () => {
      if (includedFiles.has(componentName)) {
        console.warn(`⚠️  Circular include detected: ${componentName} was already included. Skipping.`);
        // Replace with empty string to break the loop
        return { original: match, replacement: '' };
      }

      const componentPath = path.join(componentsDir, componentName);
      if (await fs.pathExists(componentPath)) {
        const componentContent = await fs.readFile(componentPath, 'utf8');

        // Recursively process includes within the component
        const newIncludedFiles = new Set(includedFiles);
        newIncludedFiles.add(componentName);
        const processedComponent = await processIncludes(componentContent, componentsDir, newIncludedFiles);

        return { original: match, replacement: processedComponent };
      } else {
        console.warn(`⚠️  Component not found: ${componentName}. Leaving placeholder.`);
        // Leave the placeholder in the content if the component file doesn't exist
        return { original: match, replacement: match };
      }
    })();
    promises.push(promise);
    return match; // a return is required but not used in this pattern
  });

  // Wait for all component processing to complete
  const results = await Promise.all(promises);

  // Perform all replacements in one go
  for (const result of results) {
    // Ensure we replace only the first instance in case of duplicate component tags
    content = content.replace(result.original, result.replacement);
  }

  return content;
}

async function runBuild() {
  try {
    console.log('Building hdoc project...');
    
    // Check if we're in an hdoc project
    if (!await fs.pathExists('.doc-config.json')) {
      console.error('❌ No .doc-config.json found. Are you in an hdoc project directory?');
      return;
    }
    
    // Read configuration
    const config = await fs.readJSON('.doc-config.json');
    
    // Find all page files in numerical order
    const pagesDir = 'pages';
    if (!await fs.pathExists(pagesDir)) {
      console.error('❌ Pages directory not found');
      return;
    }
    
    const files = await fs.readdir(pagesDir);
    const pageFiles = files
      .filter(file => file.match(/^\d+\.html$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/^(\d+)\.html$/)[1]);
        const numB = parseInt(b.match(/^(\d+)\.html$/)[1]);
        return numA - numB;
      });
    
    if (pageFiles.length === 0) {
      console.error('❌ No page files found (format: 01.html, 02.html, etc.)');
      return;
    }
    
    console.log(`📄 Found ${pageFiles.length} pages: ${pageFiles.join(', ')}`);
    
    // Read and combine page contents, processing includes
    const componentsDir = 'components';
    let combinedContent = '';
    for (const file of pageFiles) {
      const filePath = path.join(pagesDir, file);
      let content = await fs.readFile(filePath, 'utf8');

      // Process components if the directory exists
      if (await fs.pathExists(componentsDir)) {
        // Pass the page file itself to the tracking set to prevent self-inclusion
        content = await processIncludes(content, componentsDir, new Set([file]));
      }

      combinedContent += content + '\n';
    }
    
    // Generate CSS variables from config
    const cssVariables = generateCSS(config);
    
    // Read main CSS file
    const mainCSSPath = 'assets/styles/main.css';
    let mainCSS = '';
    if (await fs.pathExists(mainCSSPath)) {
      mainCSS = await fs.readFile(mainCSSPath, 'utf8');
    }
    
    // Create final HTML document
    const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
${cssVariables}

${mainCSS}
  </style>
</head>
<body>
${combinedContent}
</body>
</html>`;
    
    // Write output file
    const outputPath = 'dist/document.html';
    await fs.ensureDir('dist');
    await fs.writeFile(outputPath, htmlDocument);
    
    console.log(`✅ Document built successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
  }
}

export default async function buildCommand(options) {
  if (options.watch) {
    console.log('👀 Watching for changes... (Press Ctrl+C to stop)');

    const watchedPaths = [
      'pages/**/*.html',
      'assets/styles/**/*.css',
      'components/**/*.html',
      '.doc-config.json'
    ];

    const watcher = chokidar.watch(watchedPaths, {
      persistent: true,
      ignoreInitial: true,
    });

    // Initial build
    await runBuild();

    watcher.on('all', async (event, filePath) => {
      console.log(`\n🔄 File ${event}: ${filePath}. Rebuilding...`);
      await runBuild();
    });

  } else {
    try {
      await runBuild();
    } catch (error) {
      process.exit(1);
    }
  }
}