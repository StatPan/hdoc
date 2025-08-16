export function generateCSS(config) {
  let css = '/* Generated CSS Variables */\n:root {\n';
  
  // Generate global CSS variables
  if (config.global) {
    css += generateCSSVariables(config.global, '');
  }
  
  css += '}\n\n';
  
  // Generate page-specific CSS variables
  if (config.pages) {
    for (const [pageNum, pageConfig] of Object.entries(config.pages)) {
      css += `/* Page ${pageNum} specific styles */\n`;
      css += `.page-${pageNum} {\n`;
      css += generateCSSVariables(pageConfig, '  ');
      css += '}\n\n';
    }
  }
  
  return css;
}

function generateCSSVariables(obj, indent = '  ', prefix = '') {
  let css = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      // Nested object - recursively process
      css += generateCSSVariables(value, indent, prefix + key + '-');
    } else {
      // Leaf value - create CSS variable
      const varName = `--${prefix}${kebabCase(key)}`;
      css += `${indent}${varName}: ${value};\n`;
    }
  }
  
  return css;
}

function kebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}