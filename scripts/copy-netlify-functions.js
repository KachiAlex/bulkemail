const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'functions', 'lib');
const dest = path.join(__dirname, '..', 'netlify', 'functions');

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

copyDir(src, dest);
console.log('Copied Netlify functions from', src, 'to', dest);
