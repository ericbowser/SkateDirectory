const fs = require('fs');
const path = require('path');

const ASSETS_ROOT = path.join(__dirname, '..', 'skate_assets');
const MANIFEST_PATH = path.join(ASSETS_ROOT, 'skate_assets.json');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

/** Match DB park names to manifest entries (e.g. "Fairmont Skatepark"). */
function normalizeKey(name) {
  return String(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return [];
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function listImagesInFolder(folder) {
  const dir = path.join(ASSETS_ROOT, folder);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXT.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function photoUrl(folder, filename) {
  return `/skate_assets/${folder}/${encodeURIComponent(filename)}`;
}

function mapAssetPhoto(folder, filename, index) {
  const url = photoUrl(folder, filename);
  const base = path.basename(filename, path.extname(filename));
  return {
    id: `asset:${folder}:${filename}`,
    url,
    photoUrl: url,
    filePath: url,
    caption: base.replace(/_/g, ' '),
    sortOrder: index,
    isPrimary: index === 0,
    source: 'skate_assets',
  };
}

function buildIndex() {
  const index = new Map();

  for (const entry of loadManifest()) {
    const files = listImagesInFolder(entry.folder);
    if (files.length === 0) continue;

    const photos = files.map((file, i) => mapAssetPhoto(entry.folder, file, i));
    index.set(normalizeKey(entry.parkName), photos);

    const folderAsName = entry.folder.replace(/_/g, ' ');
    const folderKey = normalizeKey(folderAsName);
    if (!index.has(folderKey)) {
      index.set(folderKey, photos);
    }
  }

  return index;
}

let indexCache = null;
let indexBuiltAt = 0;
const INDEX_TTL_MS = 30_000;

function getIndex() {
  const now = Date.now();
  if (!indexCache || now - indexBuiltAt > INDEX_TTL_MS) {
    indexCache = buildIndex();
    indexBuiltAt = now;
  }
  return indexCache;
}

function getPhotosForParkName(parkName) {
  if (!parkName) return [];
  return getIndex().get(normalizeKey(parkName)) || [];
}

function mergePhotos(dbPhotos, assetPhotos) {
  const seen = new Set(
    dbPhotos.map((p) => p.url || p.photoUrl || p.filePath).filter(Boolean)
  );
  const merged = [...dbPhotos];

  for (const photo of assetPhotos) {
    const key = photo.url || photo.photoUrl;
    if (key && !seen.has(key)) {
      merged.push(photo);
      seen.add(key);
    }
  }

  return merged.sort(
    (a, b) =>
      Number(b.isPrimary) - Number(a.isPrimary) ||
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
}

module.exports = {
  ASSETS_ROOT,
  getPhotosForParkName,
  mergePhotos,
  normalizeKey,
  refreshIndex: () => {
    indexCache = null;
    indexBuiltAt = 0;
  },
};
