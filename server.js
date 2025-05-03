const express = require('express');
const app = express();
const cors = require('cors');
const router = express.Router();
const logger = require('./logs/skateLog');
const {json} = require('body-parser');
const {InsertPark, GetParks} = require('./sqldb/sqlclient.js');
const {connectLocalPostgres} = require('./documentdb/client');
const sendEmailWithAttachment = require('./api/gmailSender');

let _logger = logger();
_logger.info('Logger Initialized');

router.use(json());
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({extended: true}));

// API Routes
// GET all skateparks
router.get('/api/skateparks', async (req, res) => {
  try {
    const result = await GetParks();
    return res.status(200).send({...result}).end();
  } catch (err) {
    console.error('Error fetching skateparks:', err);
    res.status(500).json({message: 'Error fetching skateparks', error: err.message});
  }
});

// GET skatepark by ID with features
/*app.get('/api/skateparks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get park details
    const parkResult = await sql.query`
      SELECT p.*, 
        CASE 
          WHEN p.HasVariableHours = 1 THEN p.VariableClosingType 
          ELSE CONVERT(nvarchar, p.Closes, 8) 
        END as ClosingDisplay
      FROM Park p
      WHERE p.Id = ${id}
    `;

    if (parkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Skatepark not found' });
    }

    // Get park features
    const featuresResult = await sql.query`
      SELECT f.*
      FROM ParkFeature f
      JOIN ParkFeatureMapping m ON f.Id = m.FeatureId
      WHERE m.ParkId = ${id}
    `;

    // Combine results
    const skatepark = parkResult.recordset[0];
    skatepark.features = featuresResult.recordset;

    res.json(skatepark);
  } catch (err) {
    console.error('Error fetching skatepark:', err);
    res.status(500).json({ message: 'Error fetching skatepark', error: err.message });
  }
});*/

// POST new skatepark
router.post('/api/skateparks/addpark', async (req, res) => {
  try {
    const {
      ParkName,
      ParkStatus,
      LocationLatitude,
      LocationLongitude,
      ParkAddress,
      DifficultyOpinion,
      HasLighting,
      ParkDescription,
      Opens,
      Closes,
      LastUpdatedDate,
      ParkWebsite,
      HasVariableHours
    } = req.body;
    if (!ParkName || !ParkStatus || !LocationLatitude || !LocationLongitude || !ParkAddress || !DifficultyOpinion || !ParkDescription || !Opens || !Closes || !LastUpdatedDate || !ParkWebsite)   {
      return res.status(404).send("Bad request").end();
    }
    
    const result = await InsertPark(req.body);
    return res.status(200).send({...result}).end();
  } catch (e) {
    _logger.error(e);
    throw e;
  }
});


module.exports = router;
