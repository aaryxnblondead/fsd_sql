const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to esbuild directory
const esbuildPath = path.join(__dirname, 'node_modules', 'esbuild');

console.log('Fixing esbuild version mismatch...');

try {
  // Remove any existing installation
  if (fs.existsSync(esbuildPath)) {
    console.log('Removing existing esbuild installation...');
    fs.rmSync(esbuildPath, { recursive: true, force: true });
  }

  // Install the correct version
  console.log('Installing esbuild@0.25.2...');
  execSync('npm install esbuild@0.25.2 --no-save', { stdio: 'inherit' });
  
  console.log('Successfully fixed esbuild version!');
} catch (error) {
  console.error('Error fixing esbuild:', error);
  process.exit(1);
} 