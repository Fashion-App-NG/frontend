const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, '..', 'src', 'components', 'Auth');
const designerPath = path.join(__dirname, '..', 'src', 'components', 'Auth-Designer');
const aiPath = path.join(__dirname, '..', 'src', 'components', 'Auth-AI');

console.log('�� Ensuring UI components are available for build...');

// ✅ LEARNING: Build-safe UI resolution
function ensureUIForBuild() {
  try {
    // Check if Auth directory already exists (local development)
    if (fs.existsSync(authPath)) {
      const stats = fs.lstatSync(authPath);
      if (stats.isSymbolicLink()) {
        console.log('✅ Symlink exists - keeping current UI selection');
        return;
      } else if (stats.isDirectory()) {
        console.log('✅ Auth directory exists - using current UI');
        return;
      }
    }

    // Determine which UI to use based on environment or default
    const uiType = process.env.UI_TYPE || process.env.NETLIFY_BUILD_UI || 'designer';
    console.log(`🎯 No Auth directory found - setting up ${uiType.toUpperCase()} UI for build`);

    const sourcePath = uiType === 'ai' ? aiPath : designerPath;

    // Verify source directory exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Source UI directory not found: ${sourcePath}`);
      console.error('Available directories:');
      console.error(`- Auth-Designer exists: ${fs.existsSync(designerPath)}`);
      console.error(`- Auth-AI exists: ${fs.existsSync(aiPath)}`);
      process.exit(1);
    }

    // Copy the selected UI directory
    copyDirectory(sourcePath, authPath);
    console.log(`✅ ${uiType.toUpperCase()} UI copied to Auth/ for build`);

  } catch (error) {
    console.error('❌ Error ensuring UI components:', error.message);
    
    // ✅ FALLBACK: Try to use Designer UI as default
    if (fs.existsSync(designerPath)) {
      console.log('🔄 Falling back to Designer UI...');
      try {
        copyDirectory(designerPath, authPath);
        console.log('✅ Designer UI copied as fallback');
      } catch (fallbackError) {
        console.error('❌ Fallback failed:', fallbackError.message);
        process.exit(1);
      }
    } else {
      console.error('❌ No UI components available for build');
      process.exit(1);
    }
  }
}

// ✅ Same copy function as switch-ui.js
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stats = fs.statSync(srcPath);
    
    if (stats.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run the function
ensureUIForBuild();
