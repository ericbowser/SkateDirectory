const fs = require('fs');
const path = require('path');

/** On-disk park photo folders live in repo-root skate_assets/. */
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

function saveManifest(entries) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

function listImagesInFolder(folder) {
  const dir = path.join(ASSETS_ROOT, folder);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => {
      const full = path.join(dir, file);
      return fs.statSync(full).isFile() && IMAGE_EXT.has(path.extname(file).toLowerCase());
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function photoUrl(folder, filename) {
  const safeName = filename
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `/skate_assets/${folder}/${safeName}`;
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

function findManifestEntry(parkName) {
  const key = normalizeKey(parkName);
  return loadManifest().find((entry) => {
    const names = [entry.parkName, ...(Array.isArray(entry.aliases) ? entry.aliases : [])];
    return names.some((name) => normalizeKey(name) === key);
  });
}

/** Derive a filesystem folder like Fairmont_SkatePark from a display name. */
function folderNameFromParkName(parkName) {
  const cleaned = String(parkName || 'Park')
    .replace(/[()[\]]/g, ' ')
    .replace(/&/g, ' and ')
    .trim();
  let folder = cleaned
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  folder = folder.replace(/_skate_?park$/i, '');
  return `${folder}_SkatePark`;
}

/**
 * Resolve (or create) the on-disk folder + manifest row for a park name.
 */
function ensureParkAssetFolder(parkName) {
  if (!parkName) {
    const err = new Error('Park name is required for photo storage');
    err.status = 400;
    throw err;
  }

  if (!fs.existsSync(ASSETS_ROOT)) {
    fs.mkdirSync(ASSETS_ROOT, { recursive: true });
  }

  const existing = findManifestEntry(parkName);
  const folder = existing?.folder || folderNameFromParkName(parkName);
  const dir = path.join(ASSETS_ROOT, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!existing) {
    const entries = loadManifest();
    entries.push({
      folder,
      parkName,
      parkStatus: 'Active',
    });
    entries.sort((a, b) => String(a.parkName).localeCompare(String(b.parkName)));
    saveManifest(entries);
  }

  return folder;
}

function sanitizeUploadBasename(originalName = 'photo.jpg') {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const safeExt = IMAGE_EXT.has(ext) ? ext : '.jpg';
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d+Z$/, '')
    .replace('T', '_');
  const rand = Math.random().toString(36).slice(2, 6);
  return `${stamp}_${rand}${safeExt}`;
}

function refreshIndex() {
  indexCache = null;
  indexBuiltAt = 0;
}

/**
 * Write one uploaded image into the park's skate_assets folder.
 */
function saveUploadedParkPhoto(parkName, file) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimeOk = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype || '');
  if (!mimeOk && !IMAGE_EXT.has(ext)) {
    const err = new Error('Only JPEG, PNG, WebP, or GIF images are allowed');
    err.status = 400;
    throw err;
  }

  const folder = ensureParkAssetFolder(parkName);
  const filename = sanitizeUploadBasename(file.originalname);
  const dest = path.join(ASSETS_ROOT, folder, filename);
  fs.writeFileSync(dest, file.buffer);

  refreshIndex();
  const photos = getPhotosForParkName(parkName);
  const photo =
    photos.find(
      (p) =>
        p.url?.endsWith(`/${encodeURIComponent(filename)}`) || p.url?.endsWith(`/${filename}`)
    ) || mapAssetPhoto(folder, filename, photos.length);

  return { photo, folder, filename, photos };
}

/**
 * Remove one image from the park's skate_assets folder (and the build/ copy nginx may serve).
 */
function deleteParkPhoto(parkName, filename) {
  const name = String(filename || '');
  if (!name || name !== path.basename(name) || !IMAGE_EXT.has(path.extname(name).toLowerCase())) {
    const err = new Error('Invalid photo filename');
    err.status = 400;
    throw err;
  }

  const entry = findManifestEntry(parkName);
  if (!entry) {
    const err = new Error('Photo not found');
    err.status = 404;
    throw err;
  }

  const target = path.join(ASSETS_ROOT, entry.folder, name);
  if (!fs.existsSync(target)) {
    const err = new Error('Photo not found');
    err.status = 404;
    throw err;
  }
  fs.unlinkSync(target);

  const buildCopy = path.join(ASSETS_ROOT, '..', 'build', 'skate_assets', entry.folder, name);
  if (fs.existsSync(buildCopy)) fs.unlinkSync(buildCopy);

  refreshIndex();
  return { folder: entry.folder, filename: name, photos: getPhotosForParkName(parkName) };
}

function buildIndex() {
  const index = new Map();

  for (const entry of loadManifest()) {
    const files = listImagesInFolder(entry.folder);
    if (files.length === 0) continue;

    const photos = files.map((file, i) => mapAssetPhoto(entry.folder, file, i));
    const keys = [
      entry.parkName,
      entry.folder.replace(/_/g, ' '),
      ...(Array.isArray(entry.aliases) ? entry.aliases : []),
    ];

    for (const key of keys) {
      if (!key) continue;
      const normalized = normalizeKey(key);
      if (!index.has(normalized)) {
        index.set(normalized, photos);
      }
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
  IMAGE_EXT,
  getPhotosForParkName,
  mergePhotos,
  normalizeKey,
  ensureParkAssetFolder,
  saveUploadedParkPhoto,
  deleteParkPhoto,
  refreshIndex,
};
