const { Pool } = require('pg');
const { getPhotosForParkName, mergePhotos } = require('../skateAssets');

// Shared Postgres instance (same box as the other sites) — this app gets its own
// schema so `search_path` scopes every unqualified table name to `skate`.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: `-c search_path=${process.env.DB_SCHEMA || 'skate'},public`,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error', err);
});

const PARK_COLUMNS = `
  id, park_name, park_status, location_latitude, location_longitude,
  park_address, has_lighting, park_description, opens, closes,
  last_updated_date, park_website, is_open_24_hours
`;

function mapPark(row) {
  return {
    id: row.id,
    parkName: row.park_name,
    parkStatus: row.park_status,
    locationLatitude: row.location_latitude === null ? null : Number(row.location_latitude),
    locationLongitude: row.location_longitude === null ? null : Number(row.location_longitude),
    parkAddress: row.park_address,
    hasLighting: row.has_lighting,
    parkDescription: row.park_description,
    opens: row.opens,
    closes: row.closes,
    lastUpdatedDate: row.last_updated_date,
    parkWebsite: row.park_website,
    isOpen24Hours: row.is_open_24_hours,
  };
}

function mapFeature(row) {
  return {
    id: row.id,
    featureName: row.feature_name,
    featureCategory: row.feature_category,
    featureType: row.feature_type ?? null,
  };
}

function mapPhoto(row) {
  const url = row.external_url || row.storage_path;
  return {
    id: row.id,
    slug: row.slug,
    photoUrl: url,
    url,
    filePath: url,
    caption: row.caption,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
    uploadedAt: row.uploaded_at,
    source: 'database',
  };
}

async function GetParks() {
  const { rows } = await pool.query(
    `SELECT ${PARK_COLUMNS} FROM park ORDER BY park_name`
  );
  return rows.map(mapPark);
}

async function getDbPhotosForPark(parkId) {
  try {
    const { rows } = await pool.query(
      `SELECT pp.id, pp.caption, pp.sort_order, pp.is_primary, pp.uploaded_at,
              ph.slug, ph.storage_path, ph.external_url, ph.alt_text
       FROM park_photo pp
       JOIN photo ph ON ph.id = pp.photo_id
       WHERE pp.park_id = $1
       ORDER BY pp.is_primary DESC, pp.sort_order, pp.uploaded_at`,
      [parkId]
    );
    return rows.map(mapPhoto);
  } catch (err) {
    // Normalized photo tables not migrated yet — filesystem assets still work
    if (err.code === '42P01' || err.code === '42703') {
      return [];
    }
    throw err;
  }
}

async function GetParkById(id) {
  const parkResult = await pool.query(
    `SELECT ${PARK_COLUMNS} FROM park WHERE id = $1`,
    [id]
  );
  if (parkResult.rows.length === 0) return null;

  const parkRow = parkResult.rows[0];

  const [featuresResult, dbPhotos] = await Promise.all([
    pool.query(
      `SELECT pf.id, pf.feature_name, pf.feature_category, ft.feature_type_id AS feature_type
       FROM park_feature_mapping pfm
       JOIN park_feature pf ON pf.id = pfm.feature_id
       LEFT JOIN feature_type ft ON ft.id = pfm.feature_type_id
       WHERE pfm.park_id = $1
       ORDER BY pf.feature_name`,
      [id]
    ),
    getDbPhotosForPark(id),
  ]);

  return {
    ...mapPark(parkRow),
    features: featuresResult.rows.map(mapFeature),
    photos: mergePhotos(dbPhotos, getPhotosForParkName(parkRow.park_name)),
  };
}

async function GetFeatures() {
  const { rows } = await pool.query(
    `SELECT pf.id, pf.feature_name, pf.feature_category, ft.feature_type_id AS feature_type
     FROM park_feature pf
     LEFT JOIN feature_type ft ON ft.id = pf.feature_type_id
     ORDER BY pf.feature_name`
  );
  return rows.map(mapFeature);
}

async function InsertPark(body) {
  const parkName = body.ParkName ?? body.parkName;
  if (!parkName) {
    const err = new Error('ParkName is required');
    err.status = 400;
    throw err;
  }

  const parkStatus = body.ParkStatus ?? body.parkStatus ?? 'Active';
  const locationLatitude = body.LocationLatitude ?? body.locationLatitude ?? null;
  const locationLongitude = body.LocationLongitude ?? body.locationLongitude ?? null;
  const parkAddress = body.ParkAddress ?? body.parkAddress ?? null;
  const hasLighting = Boolean(body.HasLighting ?? body.hasLighting ?? false);
  const parkDescription = body.ParkDescription ?? body.parkDescription ?? null;
  const opens = body.Opens ?? body.opens ?? null;
  const closes = body.Closes ?? body.closes ?? null;
  const parkWebsite = body.ParkWebsite ?? body.parkWebsite ?? null;

  const { rows } = await pool.query(
    `INSERT INTO park (
       park_name, park_status, location_latitude, location_longitude,
       park_address, has_lighting, park_description, opens, closes,
       last_updated_date, park_website
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, CURRENT_DATE, $10)
     RETURNING ${PARK_COLUMNS}`,
    [
      parkName, parkStatus, locationLatitude, locationLongitude,
      parkAddress, hasLighting, parkDescription, opens, closes, parkWebsite,
    ]
  );

  const park = mapPark(rows[0]);
  // Frontend's success message reads `.ParkName` — keep it working without a UI rewrite.
  return { ...park, ParkName: park.parkName };
}

async function InsertFeature(body) {
  const featureName = body.FeatureName ?? body.featureName;
  if (!featureName) {
    const err = new Error('FeatureName is required');
    err.status = 400;
    throw err;
  }

  const featureCategory = body.FeatureCategory ?? body.featureCategory ?? null;
  const featureTypeLabel = body.FeatureType ?? body.featureType ?? null;

  let featureTypeId = null;
  if (featureTypeLabel) {
    const existing = await pool.query(
      `SELECT id FROM feature_type WHERE feature_type_id = $1`,
      [featureTypeLabel]
    );
    if (existing.rows.length > 0) {
      featureTypeId = existing.rows[0].id;
    } else {
      const created = await pool.query(
        `INSERT INTO feature_type (feature_type_id) VALUES ($1) RETURNING id`,
        [featureTypeLabel]
      );
      featureTypeId = created.rows[0].id;
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO park_feature (feature_name, feature_category, feature_type_id)
     VALUES ($1,$2,$3)
     RETURNING id, feature_name, feature_category, $4::text AS feature_type`,
    [featureName, featureCategory, featureTypeId, featureTypeLabel]
  );

  return mapFeature(rows[0]);
}

module.exports = { GetParks, GetParkById, GetFeatures, InsertFeature, InsertPark, pool };
