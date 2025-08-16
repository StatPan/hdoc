import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer';

export default async function exportCommand(outputPath, options) {
  try {
    const { format } = options;
    
    // Check if dist/document.html exists
    const htmlPath = path.join(process.cwd(), 'dist', 'document.html');
    if (!fs.existsSync(htmlPath)) {
      console.error('❌ Error: dist/document.html not found. Run "hdoc build" first.');
      process.exit(1);
    }

    if (format === 'pdf') {
      await exportToPDF(htmlPath, outputPath);
    } else {
      console.error(`❌ Error: Unsupported format "${format}". Currently only "pdf" is supported.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error during export:', error.message);
    process.exit(1);
  }
}

async function exportToPDF(htmlPath, outputPath) {
  console.log('📄 Exporting to PDF...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Load the HTML file
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF with optimized settings for document printing
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0', 
        bottom: '0',
        left: '0'
      },
      preferCSSPageSize: true
    });
    
    console.log(`✅ PDF exported successfully: ${outputPath}`);
    
  } finally {
    await browser.close();
  }
}