USE [SkateDirectory]
GO

/****** Object:  Table [dbo].[Park]    Script Date: 3/24/2025 4:34:58 AM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Park]') AND type in (N'U'))
DROP TABLE [dbo].[ParkFeature]
DROP TABLE [dbo].[Park]
GO

/****** Object:  Table [dbo].[Park]    Script Date: 3/24/2025 4:34:58 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Park](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ParkName] [nvarchar](100) NOT NULL,
	[ParkStatus] [nvarchar](50) NOT NULL,
	[LocationLatitude] [decimal](10, 8) NOT NULL,
	[LocationLongitude] [decimal](11, 8) NOT NULL,
	[ParkAddress] [nvarchar](255) NULL,
	[DifficultyOpinion] [nvarchar](50) NULL,
	[HasLighting] [bit] NULL,
	[ParkDescription] [nvarchar](max) NULL,
	Opens TIME NULL,
	Closes TIME NULL,
	[CreatedDate] [datetime2](7) NULL,
	[LastUpdatedDate] [datetime2](7) NULL,
	[ParkWebsite] [varchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


