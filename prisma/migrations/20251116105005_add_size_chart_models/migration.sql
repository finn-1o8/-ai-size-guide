-- CreateTable
CREATE TABLE "SizeChart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SizeChartRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chartId" TEXT NOT NULL,
    "sizeLabel" TEXT NOT NULL,
    "chest" REAL,
    "waist" REAL,
    "hips" REAL,
    "sleeve" REAL,
    "inseam" REAL,
    CONSTRAINT "SizeChartRow_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "SizeChart" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chartId" TEXT NOT NULL,
    "productId" TEXT,
    "collectionId" TEXT,
    "tag" TEXT,
    CONSTRAINT "ProductAssignment_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "SizeChart" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
