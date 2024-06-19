CREATE TABLE [dbo].[userPhotos](
	[id] [char](36) NOT NULL,
	[photo] [varchar](max) NULL,
	[modified] [datetime] NOT NULL,
 CONSTRAINT [PK_userPhotos] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
CREATE TABLE [dbo].[users](
	[id] [char](36) NOT NULL,
	[properties] [nvarchar](4000) NOT NULL,
	[modified] [datetime] NOT NULL,
	[isNew] [bit] NOT NULL DEFAULT ((0)),
 CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_userPhotos_modified] ON [dbo].[userPhotos]
(
	[modified] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_users_isNew] ON [dbo].[users]
(
	[isNew] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_users_modified] ON [dbo].[users]
(
	[modified] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
-- Warning! The maximum key length for a nonclustered index is 1700 bytes. 
-- The index 'IX_users_properties' has maximum length of 8000 bytes. For some combination of large values, the insert/update operation will fail.
-- If applicable, reduce properties column length to 800 chars. Note nvarchar(MAX) does not support indexing.
-- This index is used in LIKE operations. For instance, to find user by userPrincipalName in properties.
CREATE NONCLUSTERED INDEX [IX_users_properties] ON [dbo].[users]
(
	[properties] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
/*
-- Optionally, create SQL access account
CREATE USER [hradmin] WITH PASSWORD = '***';
ALTER ROLE db_datareader ADD MEMBER [hradmin];
ALTER ROLE db_datawriter ADD MEMBER [hradmin];
/*