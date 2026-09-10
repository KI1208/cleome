import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZipArchive } from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function packExtension() {
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version || '1.0.0';

  const distDir = path.join(rootDir, 'dist');
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  const manifestPath = path.join(distDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ dist/manifest.json not found. Build may have failed.');
    process.exit(1);
  }

  // Create release directory if not exists
  const releaseDir = path.join(rootDir, 'release');
  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
  }

  const zipFileName = `cleome-v${version}.zip`;
  const zipFilePath = path.join(releaseDir, zipFileName);

  // Remove existing zip if any
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }

  console.log(`📦 Packaging Cleome v${version}...`);

  const output = fs.createWriteStream(zipFilePath);
  const archive = new ZipArchive({
    zlib: { level: 9 }, // Maximum compression
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInKb = (archive.pointer() / 1024).toFixed(1);
      console.log(`\n✅ Package created successfully!`);
      console.log(`   File: release/${zipFileName}`);
      console.log(`   Size: ${sizeInKb} KB (${archive.pointer()} bytes)`);
      console.log(`   Path: ${zipFilePath}`);
      console.log(`\n🚀 Ready for upload to Chrome Web Store Developer Dashboard!`);
      resolve();
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('⚠️ Archiver warning:', err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Append all contents of dist/ directly into the root of the zip archive
    archive.directory(distDir, false);

    archive.finalize();
  });
}

packExtension().catch((err) => {
  console.error('❌ Packaging failed:', err);
  process.exit(1);
});
