import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const src = join(root, 'skate_assets');
const dest = join(root, 'build', 'skate_assets');

if (!existsSync(src)) {
  console.warn('[copy-skate-assets] skate_assets/ not found — skipping');
  process.exit(0);
}

mkdirSync(join(root, 'build'), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log('[copy-skate-assets] copied skate_assets → build/skate_assets');
