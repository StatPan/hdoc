# hdoc

HTML-based document builder with page-based architecture. Create professional documents by writing numbered HTML pages that are automatically combined into a single document with consistent styling.

## Features

- **Page-based workflow**: Write content in numbered HTML files (01.html, 02.html, etc.)
- **Configuration-driven styling**: Control layout, typography, and page settings via JSON config
- **CSS Variables system**: Automatic conversion from config to CSS variables
- **Page-specific overrides**: Different settings for individual pages (e.g., title page)
- **Print-ready output**: Optimized for PDF generation and printing
- **LLM-friendly**: Simple structure that works well with AI assistance

## Installation

```bash
npm install -g hdoc
```

## Quick Start

```bash
# Create a new project
hdoc init my-document

# Navigate to project
cd my-document

# Edit your pages
# - pages/01.html (title page)
# - pages/02.html (content)
# - pages/03.html (more content)

# Build the document
hdoc build

# Output: dist/document.html
```

## Project Structure

```
my-document/
├── pages/
│   ├── 01.html          # Title page
│   ├── 02.html          # Content pages
│   └── 03.html
├── assets/styles/
│   └── main.css         # Base styles
├── components/          # Reusable HTML components
├── dist/                # Build output
│   └── document.html
└── .doc-config.json     # Configuration
```

## Configuration

The `.doc-config.json` file controls document layout and styling:

```json
{
  "global": {
    "page": {
      "size": "A4",              // A4, A3, Letter, Legal
      "orientation": "portrait", // portrait, landscape
      "margins": {
        "top": "2.5cm",
        "right": "2cm",
        "bottom": "2.5cm",
        "left": "2cm"
      },
      "padding": {
        "top": "0",
        "right": "0",
        "bottom": "0",
        "left": "0"
      },
      "pageBreak": "always",     // always, avoid, auto
      "minHeight": "auto"
    },
    "typography": {
      "fontSize": "12pt",
      "fontFamily": "Arial, sans-serif",
      "lineHeight": "1.6",
      "textAlign": "left"        // left, center, right, justify
    },
    "layout": {
      "maxWidth": "100%",
      "spacing": "1.5em",        // spacing between elements
      "columnGap": "2em",        // for multi-column layouts
      "rowGap": "1em"
    }
  },
  "pages": {
    "01": {
      "page": {
        "margins": {
          "top": "1cm",
          "bottom": "1cm"
        }
      },
      "typography": {
        "fontSize": "24pt",
        "textAlign": "center"
      }
    }
  }
}
```

## Commands

### `hdoc init [name]`

Initialize a new hdoc project:

```bash
hdoc init my-report
hdoc init presentation
hdoc init .  # Initialize in current directory
```

### `hdoc build`

Build the document from pages:

```bash
hdoc build
```

Outputs: `dist/document.html`

### `hdoc export [output]`

Exports the built `document.html` to another format. If the output path is not specified, it defaults to `document.pdf`.

-   `-f, --format <format>`: The output format. Defaults to `pdf`. Currently, only `pdf` is supported.

```bash
# Build the document first
hdoc build

# Export to default file: document.pdf
hdoc export

# Export to a custom file name
hdoc export my-report.pdf
```

The command automatically uses the `page.size` and `page.orientation` settings from your `.doc-config.json` when creating the PDF.

### `hdoc config [key] [value]`

Manage project configuration:

```bash
# View all config
hdoc config

# View specific value
hdoc config global.typography.fontSize

# Set value
hdoc config global.typography.fontSize "14pt"
hdoc config pages.01.typography.textAlign "center"
```

## Page-Specific Styling

Pages are automatically numbered and can have individual styling:

```html
<!-- pages/01.html - Title page -->
<div class="page page-01">
  <h1>Document Title</h1>
  <p>Author Name</p>
  <p>Date</p>
</div>
```

```html
<!-- pages/02.html - Content page -->
<div class="page page-02">
  <h2>Introduction</h2>
  <p>Content goes here...</p>
</div>
```

The `.page-01`, `.page-02` classes automatically receive CSS variables from the config.

## CSS Variables

Configuration is automatically converted to CSS variables:

```json
{
  "global": {
    "typography": {
      "fontSize": "12pt"
    }
  }
}
```

Becomes:

```css
:root {
  --typography-font-size: 12pt;
}
```

Use in your HTML:

```html
<p style="font-size: var(--typography-font-size)">Text</p>
```

## Advanced Usage

### Custom CSS

Add custom styles in `assets/styles/main.css`:

```css
/* Custom styles */
.highlight {
  background-color: yellow;
}

.two-column {
  column-count: 2;
  column-gap: var(--layout-column-gap);
}
```

### Components

Store reusable HTML snippets in `components/`:

```html
<!-- components/header.html -->
<header class="document-header">
  <h1>Company Name</h1>
  <hr>
</header>
```

Copy into your pages as needed.

### Page Numbering

Pages are combined in numerical order:

- `01.html` → First page
- `02.html` → Second page  
- `10.html` → Tenth page
- `03.html` → Third page (comes after 02.html)

Use zero-padding for proper ordering.

## PDF Generation

The recommended way to generate a PDF is to use the built-in `export` command, which uses Puppeteer under the hood for high-quality output:

```bash
# First, build your document
hdoc build

# Then, export it to PDF
hdoc export my-document.pdf
```

This command automatically respects the page size and orientation defined in your `.doc-config.json`.

## Examples

### Business Report

```bash
hdoc init quarterly-report
cd quarterly-report

# Edit pages:
# 01.html - Cover page
# 02.html - Executive summary  
# 03.html - Financial data
# 04.html - Appendix

hdoc build
```

### Academic Paper

```bash
hdoc init research-paper
cd research-paper

# Configure for academic format
hdoc config global.typography.fontFamily "Times New Roman, serif"
hdoc config global.page.margins.top "3cm"

hdoc build
```

### Presentation Handout

```bash
hdoc init presentation-handout
cd presentation-handout

# Configure for landscape
hdoc config global.page.orientation "landscape"
hdoc config global.layout.spacing "2em"

hdoc build
```

## Requirements

- Node.js 16+
- Modern browser for PDF generation

## License

MIT