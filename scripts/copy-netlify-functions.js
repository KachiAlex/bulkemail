const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const candidates = [
    path.join(repoRoot, 'functions', 'lib'),
    path.join(repoRoot, 'functions', 'dist'),
    path.join(repoRoot, 'functions', 'build')
  ];

  let srcDir = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isDirectory());
  if (!srcDir) {
    console.error('No compiled functions directory found. Expected one of:');
    console.error(candidates.join('\n'));
    process.exit(1);
  }

  const outDir = path.join(repoRoot, 'netlify', 'functions');
  // Remove existing outDir to avoid stale files
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  console.log('Copying functions from', srcDir, 'to', outDir);
  copyRecursive(srcDir, outDir);

  // Remove node_modules if accidentally copied
  const nm = path.join(outDir, 'node_modules');
  if (fs.existsSync(nm)) {
    fs.rmSync(nm, { recursive: true, force: true });
  }

  console.log('Functions copied successfully.');

  // Also copy frontend build to repo root 'dist' so Netlify publish path exists
  const frontendDist = path.join(repoRoot, 'frontend', 'dist');
  const outDist = path.join(repoRoot, 'dist');
  if (fs.existsSync(frontendDist) && fs.statSync(frontendDist).isDirectory()) {
    if (fs.existsSync(outDist)) fs.rmSync(outDist, { recursive: true, force: true });
    console.log('Copying frontend build from', frontendDist, 'to', outDist);
    copyRecursive(frontendDist, outDist);
    console.log('Frontend build copied to dist.');
  } else {
    console.warn('No frontend/dist found to copy to repo root dist.');
  }
}

if (require.main === module) main();
