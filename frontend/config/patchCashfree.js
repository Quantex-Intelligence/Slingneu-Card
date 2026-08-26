const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '../node_modules/react-native-cashfree-pg-sdk/lib/commonjs/index.js'),
  path.join(__dirname, '../node_modules/react-native-cashfree-pg-sdk/lib/module/index.js')
];

filesToPatch.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let patched = false;
      if (content.includes("require('../package.json')")) {
        content = content.replace(/require\(['"]\.\.\/package\.json['"]\)/g, "require('../../package.json')");
        patched = true;
      }
      if (content.includes("from '../package.json'")) {
        content = content.replace(/from ['"]\.\.\/package\.json['"]/g, "from '../../package.json'");
        patched = true;
      }
      if (patched) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ Patched cashfree SDK in ${file}`);
      }
    }
  } catch (err) {
    console.warn(`Warning patching ${file}:`, err.message);
  }
});
