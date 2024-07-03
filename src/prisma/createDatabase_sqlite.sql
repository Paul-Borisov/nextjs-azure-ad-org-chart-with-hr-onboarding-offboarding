-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "properties" TEXT NOT NULL,
    "modified" DATETIME NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "userPhotos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photo" TEXT,
    "modified" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "users_properties_idx" ON "users"("properties" ASC);

-- CreateIndex
CREATE INDEX "users_modified_idx" ON "users"("modified" ASC);

-- CreateIndex
CREATE INDEX "users_isNew_idx" ON "users"("isNew" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id" DESC);

-- CreateIndex
CREATE INDEX "userPhotos_modified_idx" ON "userPhotos"("modified" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "userPhotos_id_key" ON "userPhotos"("id" DESC);
