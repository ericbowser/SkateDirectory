require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  GetParks,
  GetParkById,
  GetFeatures,
  InsertFeature,
  InsertPark,
} = require('./sqldb/sqlclient');
const { ASSETS_ROOT } = require('./skateAssets');
const { validateSuggestion, saveSuggestion } = require('./lib/suggestPark');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/skate_assets', express.static(ASSETS_ROOT, { maxAge: '7d' }));

function requireAdmin(req, res, next) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return next();
  }
  if (req.headers['x-admin-key'] === adminKey) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/getparks', async (req, res) => {
  try {
    const parks = await GetParks();
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

const port = Number(process.env.API_PORT) || 3001;
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
