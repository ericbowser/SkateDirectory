-- Basic park information
INSERT INTO dbo.Park (
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
	CreatedDate,
	LastUpdatedDate,
	ParkWebsite
) VALUES (
    ' Skatepark',
    'Active',
    40.73518763301098, 
          -114.0636259318366,
    'Holladay City Skatepark, 4621 Holladay Blvd E, Holladay, UT 84117',
	'Intermediate/Advanced',
    1, -- Assuming it has lights, verify this
	'Sandy skatepark is a great time. Featuring .',
	'08:00:00',
	'22:00:00',
	GETDATE(),
	GETDATE(),
	'https://sandy.utah.gov/407/Parks-and-Recreation'
	
);


