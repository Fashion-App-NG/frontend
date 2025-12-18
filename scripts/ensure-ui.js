const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, '..', 'src', 'components', 'Auth');
const designerPath = path.join(__dirname, '..', 'src', 'components', 'Auth-Designer');
const aiPath = path.join(__dirname, '..', 'src', 'components', 'Auth-AI');

console.log('🔍 Ensuring UI components are available for build...');
console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`📁 Auth path: ${authPath}`);
console.log(`📁 Designer path: ${designerPath}`);
console.log(`📁 AI path: ${aiPath}`);

// ✅ LEARNING: Enhanced build-safe UI resolution with debugging
function ensureUIForBuild() {
  try {
    // Log current directory structure for debugging
    console.log('📋 Directory structure check:');
    const componentsPath = path.join(__dirname, '..', 'src', 'components');
    if (fs.existsSync(componentsPath)) {
      const contents = fs.readdirSync(componentsPath);
      console.log(`📂 Components directory contents: ${contents.join(', ')}`);
    } else {
      console.error('❌ Components directory not found!');
      process.exit(1);
    }

    // Check if Auth directory already exists (local development)
    if (fs.existsSync(authPath)) {
      const stats = fs.lstatSync(authPath);
      if (stats.isSymbolicLink()) {
        console.log('✅ Symlink exists - keeping current UI selection');
        const linkTarget = fs.readlinkSync(authPath);
        console.log(`🔗 Symlink points to: ${linkTarget}`);
        return;
      } else if (stats.isDirectory()) {
        console.log('✅ Auth directory exists - using current UI');
        const files = fs.readdirSync(authPath).slice(0, 5); // Show first 5 files
        console.log(`📋 Auth directory contents: ${files.join(', ')}...`);
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
      console.error('📋 Available directories:');
      console.error(`   - Auth-Designer exists: ${fs.existsSync(designerPath)}`);
      console.error(`   - Auth-AI exists: ${fs.existsSync(aiPath)}`);
      
      // Try to find what directories do exist
      const componentsDir = path.join(__dirname, '..', 'src', 'components');
      if (fs.existsSync(componentsDir)) {
        const dirs = fs.readdirSync(componentsDir).filter(item => {
          return fs.statSync(path.join(componentsDir, item)).isDirectory();
        });
        console.error(`   - Existing component directories: ${dirs.join(', ')}`);
      }
      
      process.exit(1);
    }

    // Copy the selected UI directory
    console.log(`📋 Copying ${sourcePath} → ${authPath}`);
    copyDirectory(sourcePath, authPath);
    
    // Verify the copy worked
    if (fs.existsSync(authPath)) {
      const copiedFiles = fs.readdirSync(authPath).slice(0, 5);
      console.log(`✅ ${uiType.toUpperCase()} UI copied to Auth/ successfully`);
      console.log(`📋 Copied files: ${copiedFiles.join(', ')}...`);
    } else {
      console.error('❌ Copy operation failed - Auth directory not created');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error ensuring UI components:', error.message);
    console.error('📋 Stack trace:', error.stack);
    
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

// ✅ Enhanced copy function with error handling
function copyDirectory(src, dest) {
  try {
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
  } catch (error) {
    console.error(`❌ Error copying ${src} to ${dest}:`, error.message);
    throw error;
  }
}

// Run the function
ensureUIForBuild();
