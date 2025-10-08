/**
 * Smart Database Wrapper
 * - Uses MongoDB Atlas on Vercel/Production (permanent storage)
 * - Uses file-based storage locally (development)
 */

const FileDatabase = require('./db-file');
const MongoDatabase = require('./mongodb');

// Determine which database to use
const USE_MONGODB = !!process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/frontendpitstop';

let dbInstance;

if (USE_MONGODB) {
  console.log('🍃 Using MongoDB Atlas for permanent storage');
  dbInstance = new MongoDatabase();
  
  // Initialize MongoDB connection
  dbInstance.connect().catch(err => {
    console.error('Failed to connect to MongoDB, falling back to file storage:', err.message);
    dbInstance = new FileDatabase();
  });
} else {
  console.log('📁 Using file-based storage (local development)');
  dbInstance = new FileDatabase();
}

module.exports = dbInstance;
