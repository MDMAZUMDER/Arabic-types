import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const srcDist = path.join(root, 'dist');
const targetAssetsDist = path.join(root, 'app', 'src', 'main', 'assets', 'dist');

if (!fs.existsSync(srcDist)) {
  console.error(`Source dist directory not found at ${srcDist}. Run vite build first.`);
  process.exit(1);
}

// Clean and recreate target assets dist directory
if (fs.existsSync(targetAssetsDist)) {
  fs.rmSync(targetAssetsDist, { recursive: true, force: true });
}
fs.mkdirSync(targetAssetsDist, { recursive: true });

// Copy all assets
fs.cpSync(srcDist, targetAssetsDist, { recursive: true });
console.log(`[Asset Packager] Successfully bundled web build into Android assets: ${targetAssetsDist}`);
