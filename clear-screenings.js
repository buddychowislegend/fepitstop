const { MongoClient } = require('mongodb');

async function clearScreenings() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireog';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const screeningsCollection = db.collection('screenings');

    // Delete all screenings
    const result = await screeningsCollection.deleteMany({});
    console.log(`Deleted ${result.deletedCount} screenings from MongoDB`);

    // Also clear from file-based database
    const fs = require('fs');
    const path = require('path');
    
    const dbFile = path.join(__dirname, 'backend', 'data', 'db.json');
    
    if (fs.existsSync(dbFile)) {
      const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      data.screenings = [];
      fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
      console.log('Cleared screenings from file-based database');
    }

    console.log('All screenings cleared successfully!');
  } catch (error) {
    console.error('Error clearing screenings:', error);
  } finally {
    await client.close();
  }
}

clearScreenings();
