const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Create connections to both databases
const connectToDatabase = async (connectionString) => {
  try {
    const client = new MongoClient(connectionString);
    await client.connect();
    
    // Ping the database to verify connection
    await client.db().command({ ping: 1 });
    
    return client.db();
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

// Helper function to format collection info
const formatCollectionInfo = (collections) => {
  return collections.reduce((acc, col) => {
    acc[col.name] = { count: 0 }; // Initialize with 0, will be updated later
    return acc;
  }, {});
};

// Helper function to format differences
const formatDifferences = (differences) => {
  const result = {
    countMismatches: [],
    schemaDifferences: {},
    missingInProd: new Set(),
    missingInDev: new Set()
  };

  differences.forEach(diff => {
    if (diff.type === 'count_mismatch') {
      result.countMismatches.push({
        collection: diff.collection,
        devCount: diff.devCount,
        prodCount: diff.prodCount,
        difference: diff.devCount - diff.prodCount
      });
    } else if (diff.type === 'schema_difference') {
      if (!result.schemaDifferences[diff.collection]) {
        result.schemaDifferences[diff.collection] = {
          fieldsMissingInProd: [],
          fieldsMissingInDev: []
        };
      }
      
      if (diff.missingInProd && diff.missingInProd.length > 0) {
        result.schemaDifferences[diff.collection].fieldsMissingInProd.push(...diff.missingInProd);
      }
      
      if (diff.missingInDev && diff.missingInDev.length > 0) {
        result.schemaDifferences[diff.collection].fieldsMissingInDev.push(...diff.missingInDev);
      }
    }
  });

  // Sort count mismatches by absolute difference (descending)
  result.countMismatches.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  return result;
};

// Compare collections between two databases
const compareDatabases = async (req, res) => {
  try {
    // Get database URIs from environment variables
    const devDbUri = process.env.MONGODB_DEV_URI;
    const prodDbUri = process.env.MONGODB_URI;
    
    if (!devDbUri || !prodDbUri) {
      return res.status(500).json({
        success: false,
        message: 'Database configuration is missing. Please check your .env file',
        requiredVariables: {
          development: 'MONGODB_DEV_URI',
          production: 'MONGODB_URI'
        }
      });
    }

    // Connect to both databases
    const devDb = await connectToDatabase(devDbUri);
    const prodDb = await connectToDatabase(prodDbUri);

    // Get all collections from both databases
    const devCollections = await devDb.listCollections().toArray();
    const prodCollections = await prodDb.listCollections().toArray();

    const comparisonResult = {
      devDb: {
        name: 'Development',
        collections: {},
      },
      prodDb: {
        name: 'Production',
        collections: {},
      },
      differences: [],
    };

    // Compare collections
    const allCollectionNames = [
      ...new Set([
        ...devCollections.map((c) => c.name),
        ...prodCollections.map((c) => c.name),
      ]),
    ];

    for (const collectionName of allCollectionNames) {
      const devCollection = devDb.collection(collectionName);
      const prodCollection = prodDb.collection(collectionName);

      // Get document counts
      const devCount = await devCollection.countDocuments();
      const prodCount = await prodCollection.countDocuments();

      // Store collection info
      comparisonResult.devDb.collections[collectionName] = { count: devCount };
      comparisonResult.prodDb.collections[collectionName] = { count: prodCount };

      // Find differences
      if (devCount !== prodCount) {
        comparisonResult.differences.push({
          collection: collectionName,
          type: 'count_mismatch',
          devCount,
          prodCount,
          message: `Document count differs: ${devCount} in dev vs ${prodCount} in prod`,
        });
      }

      // Sample some documents for comparison (first 10 docs)
      const devDocs = await devCollection.find({}).limit(10).toArray();
      const prodDocs = await prodCollection.find({}).limit(10).toArray();

      // Compare field names
      const devFields = new Set();
      const prodFields = new Set();

      devDocs.forEach((doc) => {
        Object.keys(doc).forEach((field) => devFields.add(field));
      });

      prodDocs.forEach((doc) => {
        Object.keys(doc).forEach((field) => prodFields.add(field));
      });

      // Find field differences
      const missingInProd = [...devFields].filter((field) => !prodFields.has(field));
      const missingInDev = [...prodFields].filter((field) => !devFields.has(field));

      if (missingInProd.length > 0 || missingInDev.length > 0) {
        comparisonResult.differences.push({
          collection: collectionName,
          type: 'schema_difference',
          missingInProd,
          missingInDev,
          message: `Schema differences found in collection ${collectionName}`,
        });
      }
    }

    // Close connections
    await devDb.client.close();
    await prodDb.client.close();

    // Format the response for better readability
    const countMismatches = comparisonResult.differences
      .filter(d => d.type === 'count_mismatch')
      .map(d => ({
        collection: d.collection,
        dev: d.devCount,
        prod: d.prodCount,
        difference: d.devCount - d.prodCount,
        status: d.devCount > d.prodCount ? 'More in DEV' : 'More in PROD'
      }))
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

    const schemaDifferences = comparisonResult.differences
      .filter(d => d.type === 'schema_difference')
      .reduce((acc, diff) => {
        if (!acc[diff.collection]) {
          acc[diff.collection] = {
            fieldsMissingInProd: [],
            fieldsMissingInDev: []
          };
        }
        
        if (diff.missingInProd && diff.missingInProd.length > 0) {
          acc[diff.collection].fieldsMissingInProd = [...new Set([...acc[diff.collection].fieldsMissingInProd, ...diff.missingInProd])];
        }
        
        if (diff.missingInDev && diff.missingInDev.length > 0) {
          acc[diff.collection].fieldsMissingInDev = [...new Set([...acc[diff.collection].fieldsMissingInDev, ...diff.missingInDev])];
        }
        
        return acc;
      }, {});

    // Calculate summary metrics
    const totalDevDocs = Object.values(comparisonResult.devDb.collections)
      .reduce((sum, col) => sum + (col.count || 0), 0);
    const totalProdDocs = Object.values(comparisonResult.prodDb.collections)
      .reduce((sum, col) => sum + (col.count || 0), 0);

    // Format the final response
    const formattedResult = {
      // Summary Section
      summary: {
        totalCollections: Object.keys(comparisonResult.devDb.collections).length,
        documents: {
          dev: totalDevDocs,
          prod: totalProdDocs,
          difference: totalDevDocs - totalProdDocs
        },
        collectionsWithIssues: {
          countMismatches: countMismatches.length,
          schemaDifferences: Object.keys(schemaDifferences).length
        }
      },
      
      // Document Count Analysis
      documentCounts: {
        // Top 10 collections by document count difference
        largestDifferences: countMismatches
          .slice(0, 10)
          .map(({ collection, dev, prod, difference, status }) => ({
            collection,
            dev,
            prod,
            difference,
            status
          })),
        
        // Collections only in one environment
        uniqueCollections: {
          onlyInDev: Object.keys(comparisonResult.devDb.collections)
            .filter(name => !comparisonResult.prodDb.collections[name]),
          onlyInProd: Object.keys(comparisonResult.prodDb.collections)
            .filter(name => !comparisonResult.devDb.collections[name])
        }
      },
      
      // Schema Differences
      schemas: Object.entries(schemaDifferences).map(([collection, diffs]) => ({
        collection,
        issues: [
          ...(diffs.fieldsMissingInDev.length ? [
            `Missing in DEV (${diffs.fieldsMissingInDev.length} fields)`
          ] : []),
          ...(diffs.fieldsMissingInProd.length ? [
            `Missing in PROD (${diffs.fieldsMissingInProd.length} fields)`
          ] : [])
        ],
        fieldDetails: {
          missingInDev: diffs.fieldsMissingInDev,
          missingInProd: diffs.fieldsMissingInProd
        }
      })),
      
      // Raw data for reference
      _raw: {
        allCountMismatches: countMismatches,
        allSchemaDifferences: schemaDifferences
      }
    };

    res.status(200).json({
      success: true,
      data: formattedResult,
    });
  } catch (error) {
    console.error('Error comparing databases:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing databases',
      error: error.message,
    });
  }
};

module.exports = {
  compareDatabases,
};
