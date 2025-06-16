const fs = require('fs');
const path = require('path');

const uiType = process.argv[2]; // 'ai' or 'designer'

if (!uiType || !['ai', 'designer'].includes(uiType)) {
  console.error('❌ Please specify ui type: ai or designer');
  console.error('Usage: node switch-ui.js <ai|designer>');
  process.exit(1);
}

const authPath = path.join(__dirname, '..', 'src', 'components', 'Auth');
const targetPath = path.join(__dirname, '..', 'src', 'components', `Auth-${uiType === 'ai' ? 'AI' : 'Designer'}`);

console.log(`🔄 Switching to ${uiType.toUpperCase()} UI components...`);

try {
  // Remove existing Auth symlink/directory if it exists
  if (fs.existsSync(authPath)) {
    const stats = fs.lstatSync(authPath);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(authPath);
      console.log('📁 Removed existing symlink');
    } else if (stats.isDirectory()) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('📁 Removed existing directory');
    }
  }

  // Check if target directory exists
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Target directory does not exist: ${targetPath}`);
    console.error('Please ensure you have the required UI components directory');
    process.exit(1);
  }

  // Create symlink (works on Windows 10+ with Developer Mode or Admin rights)
  try {
    const relativePath = path.relative(path.dirname(authPath), targetPath);
    fs.symlinkSync(relativePath, authPath, process.platform === 'win32' ? 'junction' : 'dir');
    console.log(`✅ ${uiType === 'ai' ? '🤖' : '🎨'} Successfully switched to ${uiType.toUpperCase()} UI components (symlinked)`);
  } catch (symlinkError) {
    // Fallback: Copy directory instead of symlink
    console.log('⚠️  Symlink failed, copying directory instead...');
    console.log(`   This might happen on Windows without admin rights`);
    copyDirectory(targetPath, authPath);
    console.log(`✅ ${uiType === 'ai' ? '🤖' : '🎨'} Successfully switched to ${uiType.toUpperCase()} UI components (copied)`);
  }

} catch (error) {
  console.error('❌ Error switching UI components:', error.message);
  console.error('Please check your file permissions and try again');
  process.exit(1);
}

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