import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = process.cwd();
const src = join(root, 'skate_assets');
const dest = join(root, 'build', 'skate_assets');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function countImages(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countImages(fullPath);
    } else if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) {
      count += 1;
    }
  }
  return count;
}

if (!existsSync(src)) {
  console.warn('[copy-skate-assets] skate_assets/ not found — skipping');
  process.exit(0);
}

mkdirSync(join(root, 'build'), { recursive: true });
cpSync(src, dest, { recursive: true });

const imageCount = countImages(dest);
console.log(`[copy-skate-assets] copied skate_assets → build/skate_assets (${imageCount} images)`);
