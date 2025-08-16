import fs from 'fs-extra';

export default async function configCommand(key, value) {
  try {
    // Check if we're in an hdoc project
    if (!await fs.pathExists('.doc-config.json')) {
      console.error('❌ No .doc-config.json found. Are you in an hdoc project directory?');
      process.exit(1);
    }
    
    const config = await fs.readJSON('.doc-config.json');
    
    // If no arguments, show current config
    if (!key) {
      console.log('📋 Current configuration:');
      console.log(JSON.stringify(config, null, 2));
      return;
    }
    
    // If only key provided, show specific value
    if (!value) {
      const val = getNestedValue(config, key);
      if (val !== undefined) {
        console.log(`${key}: ${JSON.stringify(val)}`);
      } else {
        console.log(`❌ Key '${key}' not found`);
      }
      return;
    }
    
    // Set value
    setNestedValue(config, key, value);
    await fs.writeJSON('.doc-config.json', config, { spaces: 2 });
    console.log(`✅ Set ${key} = ${value}`);
    
  } catch (error) {
    console.error('❌ Config error:', error.message);
    process.exit(1);
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  
  // Try to parse as JSON, otherwise use as string
  try {
    target[lastKey] = JSON.parse(value);
  } catch {
    target[lastKey] = value;
  }
}