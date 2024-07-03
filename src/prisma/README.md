# Initialization before the first build

- Remove node_modules/.prisma and execute the following commands to recreate .prisma folder from a fresh schema

After that use desired provider and create your database. For instance, sqlite (the simplest case), Azure SQL, etc.

provider = "sqlite" // default

- Create the database, which has the schema given in the file schema.prisma below, using the migration command
  - npx prisma generate
  - npx prisma migrate dev --name init
  - connection string for sqlite can be found in .env. For instance, DATABASE_URL=file:../public/db/.sqlite
  - In deloyments to Azure App Service you should use full path like DATABASE_URL=file:/home/site/wwwroot/public/db/.sqlite

provider = "postgresql"

- Exactly the same steps as above
  - connection string for postgres can be found in .env. For instance:
    - DATABASE_URL=postgres://avnadmin:PASSWORD@INSTANCE.aivencloud.com:PORT/pgHR?sslmode=require

provider = "sqlserver" // Azure SQL uses this provider

- Create the database, which has the schema given in the file schema.prisma below, using the migration command
  - npx prisma generate
  - prisma does not support migrations over Azure SQL.
  - Create a new Azure SQL database and use the script from the file AzureSql_createDatabase.sql to create required entities.
  - connection string for sqlite can be found in .env. Note the space in "initial catalog"; this is important. For instance:
    - DATABASE_URL=sqlserver://SERVERNAME.database.windows.net:1433;initial catalog=dbHR;integratedSecurity=false;username=SQLUSER;password=SQLPASSWORD;trustServerCertificate=false;encrypt=true;

# SQL scripts

- Alternatively, create a database and execute a proper SQL script found in this folder.

# Best practices

https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
https://www.youtube.com/watch?v=_ER9jHiylAo
