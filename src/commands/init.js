import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function initCommand(projectName) {
  try {
    console.log(`Initializing hdoc project: ${projectName}`);
    
    // Create project directory
    await fs.ensureDir(projectName);
    
    // Create subdirectories
    const dirs = ['pages', 'assets/styles', 'components'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(projectName, dir));
    }
    
    // Create default configuration file
    const config = {
      global: {
        page: {
          size: 'A4',              // A4, A3, Letter, Legal, Custom
          orientation: 'portrait', // portrait, landscape
          margins: {
            top: '2.5cm',
            right: '2cm',
            bottom: '2.5cm',
            left: '2cm'
          },
          padding: {
            top: '0',
            right: '0', 
            bottom: '0',
            left: '0'
          },
          pageBreak: 'always',     // always, avoid, auto
          minHeight: 'auto'        // auto, 100vh, specific value
        },
        typography: {
          fontSize: '12pt',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.6',
          textAlign: 'left'        // left, center, right, justify
        },
        layout: {
          maxWidth: '100%',
          spacing: '1.5em',        // spacing between elements
          columnGap: '2em',        // for multi-column layouts
          rowGap: '1em'
        }
      },
      pages: {
        "01": {
          page: {
            orientation: 'portrait',
            margins: {
              top: '1cm',
              bottom: '1cm'
            }
          },
          typography: {
            fontSize: '24pt',
            textAlign: 'center'
          },
          layout: {
            spacing: '2em'
          }
        }
      }
    };
    
    await fs.writeJSON(path.join(projectName, '.doc-config.json'), config, { spaces: 2 });
    
    // Create main CSS file
    const mainCSS = `/* hdoc main styles */
/* CSS variables will be auto-generated from config */

body {
  font-family: var(--typography-font-family);
  font-size: var(--typography-font-size);
  line-height: var(--typography-line-height);
  text-align: var(--typography-text-align);
  margin: var(--page-margins-top) var(--page-margins-right) var(--page-margins-bottom) var(--page-margins-left);
  padding: var(--page-padding-top) var(--page-padding-right) var(--page-padding-bottom) var(--page-padding-left);
  max-width: var(--layout-max-width);
}

.page {
  margin-bottom: var(--layout-spacing);
  page-break-after: var(--page-page-break);
  min-height: var(--page-min-height);
}

/* Page size and orientation */
@page {
  size: var(--page-size) var(--page-orientation);
  margin: var(--page-margins-top) var(--page-margins-right) var(--page-margins-bottom) var(--page-margins-left);
}

/* Multi-column layout support */
.columns {
  column-gap: var(--layout-column-gap);
  row-gap: var(--layout-row-gap);
}

/* Page-specific styles */
.page-01 {
  /* Page 1 specific styles will be applied via CSS variables */
}

@media print {
  .page {
    page-break-after: var(--page-page-break);
  }
  
  body {
    margin: 0;
    padding: 0;
  }
}`;
    
    await fs.writeFile(path.join(projectName, 'assets/styles/main.css'), mainCSS);
    
    // Create sample pages
    const samplePage1 = `<div class="page">
  <h1>First Page</h1>
  <p>This is the first page created with hdoc.</p>
  <p>Edit this file to add your content.</p>
</div>`;
    
    const samplePage2 = `<div class="page">
  <h2>Second Page</h2>
  <p>Pages are combined in numerical order.</p>
  <ul>
    <li>01.html</li>
    <li>02.html</li>
    <li>03.html...</li>
  </ul>
</div>`;
    
    await fs.writeFile(path.join(projectName, 'pages/01.html'), samplePage1);
    await fs.writeFile(path.join(projectName, 'pages/02.html'), samplePage2);
    
    console.log(`✅ Project ${projectName} created successfully!`);
    console.log(`📁 Project structure:`);
    console.log(`   ${projectName}/`);
    console.log(`   ├── pages/`);
    console.log(`   │   ├── 01.html`);
    console.log(`   │   └── 02.html`);
    console.log(`   ├── assets/styles/`);
    console.log(`   │   └── main.css`);
    console.log(`   ├── components/`);
    console.log(`   └── .doc-config.json`);
    console.log(`\nNext steps:`);
    console.log(`   cd ${projectName}`);
    console.log(`   hdoc build`);
    
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    process.exit(1);
  }
}