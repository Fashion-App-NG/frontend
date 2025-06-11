const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, '..', 'src', 'components', 'Auth');

console.log('🔍 Checking current UI configuration...');

try {
  if (!fs.existsSync(authPath)) {
    console.log('❌ Auth component directory does not exist');
    console.log('💡 Run "npm run switch:designer" or "npm run switch:ai" to set up UI components');
    process.exit(1);
  }

  const stats = fs.lstatSync(authPath);
  
  if (stats.isSymbolicLink()) {
    const target = fs.readlinkSync(authPath);
    const resolvedTarget = path.resolve(path.dirname(authPath), target);
    const targetName = path.basename(resolvedTarget);
    
    if (targetName === 'Auth-AI') {
      console.log('✅ 🤖 Currently using AI UI components (symlinked)');
      console.log(`🔗 Symlink target: ${target}`);
    } else if (targetName === 'Auth-Designer') {
      console.log('✅ 🎨 Currently using Designer UI components (symlinked)');
      console.log(`🔗 Symlink target: ${target}`);
    } else {
      console.log(`🔗 Symlinked to: ${target}`);
      console.log('⚠️  Unknown UI type - expected Auth-AI or Auth-Designer');
    }
  } else if (stats.isDirectory()) {
    // Check if it's a copied directory by examining contents
    const items = fs.readdirSync(authPath);
    console.log(`📁 Auth directory contains ${items.length} items (copied, not symlinked)`);
    
    // Try to determine which UI type based on file contents
    if (items.includes('UserTypeSelection.jsx')) {
      console.log('🎨 Appears to be Designer UI components (copied)');
    } else if (items.includes('index.js')) {
      console.log('🤖 Appears to be AI UI components (copied)');
    } else {
      console.log('❓ Cannot determine UI type from contents');
    }
    
    console.log(`📂 Contents: ${items.join(', ')}`);
    console.log('💡 Consider using symlinks for easier switching');
  } else {
    console.log('❓ Auth path exists but is neither directory nor symlink');
  }

} catch (error) {
  console.error('❌ Error checking UI components:', error.message);
  process.exit(1);
}