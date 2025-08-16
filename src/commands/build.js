import fs from 'fs-extra';
import path from 'path';
import { generateCSS } from '../utils/css-generator.js';

export default async function buildCommand() {
  try {
    console.log('Building hdoc project...');
    
    // Check if we're in an hdoc project
    if (!await fs.pathExists('.doc-config.json')) {
      console.error('❌ No .doc-config.json found. Are you in an hdoc project directory?');
      process.exit(1);
    }
    
    // Read configuration
    const config = await fs.readJSON('.doc-config.json');
    
    // Find all page files in numerical order
    const pagesDir = 'pages';
    if (!await fs.pathExists(pagesDir)) {
      console.error('❌ Pages directory not found');
      process.exit(1);
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
      process.exit(1);
    }
    
    console.log(`📄 Found ${pageFiles.length} pages: ${pageFiles.join(', ')}`);
    
    // Read and combine page contents
    let combinedContent = '';
    for (const file of pageFiles) {
      const filePath = path.join(pagesDir, file);
      const content = await fs.readFile(filePath, 'utf8');
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
    process.exit(1);
  }
}