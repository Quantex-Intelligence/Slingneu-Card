const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../node_modules/react-native-cashfree-pg-sdk');

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('../package.json')) {
        content = content.split('../package.json').join('../../package.json');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Patched ${path.relative(targetDir, fullPath)}`);
      }
    }
  }
}

replaceInDir(targetDir);
