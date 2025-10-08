const { MongoClient } = require('mongodb');

async function forceReseed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('❌ MONGODB_URI not configured');
    return;
  }

  try {
    console.log('🔗 Connecting to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('frontendpitstop');
    
    console.log('🗑️  Clearing existing data...');
    await db.collection('problems').deleteMany({});
    
    console.log('📥 Loading new problems data...');
    const comprehensiveProblems = require('../data/comprehensive-problems');
    
    console.log(`📊 Inserting ${comprehensiveProblems.length} problems...`);
    await db.collection('problems').insertMany(comprehensiveProblems);
    
    console.log('✅ Database re-seeded successfully!');
    console.log(`📝 Sample test cases for first problem:`);
    const firstProblem = comprehensiveProblems[0];
    firstProblem.testCases.forEach((testCase, i) => {
      console.log(`  ${i + 1}. Input: ${testCase.input}`);
      console.log(`     Expected: ${testCase.expected}`);
    });
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

forceReseed();
