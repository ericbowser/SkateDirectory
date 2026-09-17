require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const {
  GetParks,
  GetParkById,
  GetFeatures,
  InsertFeature,
  InsertPark,
  DeletePark,
} = require('./sqldb/sqlclient');
const { ASSETS_ROOT, saveUploadedParkPhoto, refreshIndex } = require('./lib/parkPhotos');
const { validateSuggestion, saveSuggestion } = require('./lib/suggestPark');

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/skate_assets', express.static(ASSETS_ROOT, { maxAge: '7d', etag: true, lastModified: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 12 },
  fileFilter(_req, file, cb) {
    if (/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'));
  },
});

function requireAdmin(req, res, next) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey && req.headers['x-admin-key'] === adminKey) {
    return next();
  }
  // Local/dev convenience only — never set ALLOW_OPEN_ADMIN on production.
  if (process.env.ALLOW_OPEN_ADMIN === 'true') {
    return next();
  }
  return res.status(403).json({
    message: adminKey
      ? 'Admin access required'
      : 'Admin access required — set ADMIN_API_KEY on the server',
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/getparks', async (req, res) => {
  try {
    const parks = await GetParks();
    // Short CDN/browser cache — park list changes rarely
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json(parks);
  } catch (err) {
    console.error('[getparks]', err);
    res.status(500).json({ message: 'Failed to fetch parks' });
  }
});

app.get('/api/getpark/:id', async (req, res) => {
  try {
    const park = await GetParkById(req.params.id);
    if (!park) return res.status(404).json({ message: 'Park not found' });
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.json(park);
  } catch (err) {
    console.error('[getpark]', err);
    res.status(500).json({ message: 'Failed to fetch park' });
  }
});

app.post('/api/addpark', requireAdmin, async (req, res) => {
  try {
    const park = await InsertPark(req.body);
    res.json(park);
  } catch (err) {
    console.error('[addpark]', err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Failed to add park' });
  }
});

app.delete('/api/parks/:id', requireAdmin, async (req, res) => {
  try {
    const park = await DeletePark(req.params.id);
    res.json({ ok: true, park });
  } catch (err) {
    console.error('[deletepark]', err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Failed to delete park' });
  }
});

app.get('/api/getfeatures', async (req, res) => {
  try {
    const features = await GetFeatures();
    res.json(features);
  } catch (err) {
    console.error('[getfeatures]', err);
    res.status(500).json({ message: 'Failed to fetch features' });
  }
});

app.post('/api/addfeature', requireAdmin, async (req, res) => {
  try {
    const feature = await InsertFeature(req.body);
    res.json(feature);
  } catch (err) {
    console.error('[addfeature]', err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Failed to add feature' });
  }
});

app.post('/api/suggest-park', async (req, res) => {
  try {
    const entry = validateSuggestion(req.body);
    saveSuggestion(entry);
    console.log('[suggest-park]', entry.parkName, entry.address);
    res.json({ ok: true, message: 'Suggestion received' });
  } catch (err) {
    console.error('[suggest-park]', err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Failed to save suggestion' });
  }
});

/**
 * Upload one or more photos for a park — saved under skate_assets/{folder}/.
 * Field name: "photos" (multipart). Same admin gate as addpark when ADMIN_API_KEY is set.
 */
app.post('/api/parks/:id/photos', requireAdmin, (req, res) => {
  upload.array('photos', 12)(req, res, async (err) => {
    if (err) {
      const message = err.message || 'Upload failed';
      console.error('[upload-photos]', message);
      return res.status(400).json({ message });
    }

    try {
      const park = await GetParkById(req.params.id);
      if (!park) return res.status(404).json({ message: 'Park not found' });

      const files = req.files || [];
      if (!files.length) {
        return res.status(400).json({ message: 'Choose at least one photo to upload' });
      }

      const saved = [];
      for (const file of files) {
        const result = saveUploadedParkPhoto(park.parkName, file);
        saved.push(result.photo);
      }

      refreshIndex();
      const refreshed = await GetParkById(req.params.id);
      console.log('[upload-photos]', park.parkName, saved.length, 'file(s)');
      res.json({
        ok: true,
        uploaded: saved,
        photos: refreshed?.photos || [],
        park: refreshed,
      });
    } catch (uploadErr) {
      console.error('[upload-photos]', uploadErr);
      res
        .status(uploadErr.status || 500)
        .json({ message: uploadErr.status ? uploadErr.message : 'Failed to save photos' });
    }
  });
});

const port = Number(process.env.API_PORT) || 3001;
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
