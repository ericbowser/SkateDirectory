const sql = require('mssql');

// Configuration object
const config = {
  server: 'Erbow-PC',
  database: 'SkateDirectory',
  port: 1433, // SQL Authentication
  user: 'ericbo',
  password: '1006',
  // OR for Windows Authentication
  trustedConnection: true,
}

async function InsertPark(request) {
  try {
    // Connect to the database
    await sql.connect(config)

    // Execute a simple query
    const result = await sql.query(
      `INSERT INTO dbo.Park (
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
           HasVariableHours)
       VALUES (${request.ParkName},
               ${request.ParkStatus},
               ${request.LocationLongitude},
               ${request.LocationLatitude},
               ${request.ParkAddress},
               ${request.DifficultyOpinion},
               ${request.HasLighting},
               ${request.ParkDescription},
               ${request.Opens},
               ${request.Closes},
               ${request.LastUpdatedDate},
               ${request.ParkWebsite},
               ${request.HasVariableHours}
      `);
    return result;
  } catch (err) {
    console.error('SQL error:', err)
  } finally {
    // Close the connection pool
    await sql.close()
  }
}

async function GetParks() {
  try {
    // Connect to the database
    await sql.connect(config)

    // Execute a simple query
    const result = await sql.query('SELECT * FROM dbo.SkateDirectory');

    return result;
  } catch (err) {
    console.error('SQL error:', err)
  } finally {
    // Close the connection pool
    await sql.close()
  }
}

module.exports = {GetParks, InsertPark};