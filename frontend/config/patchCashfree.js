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
      // Idempotent regex matching any number of ../ before package.json inside cashfree SDK
      const regex = /\.\.\/(\.\.\/)*package\.json/g;
      if (regex.test(content)) {
        content = content.replace(regex, '../../package.json');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Patched ${path.relative(targetDir, fullPath)}`);
      }
    }
  }
}

replaceInDir(targetDir);
