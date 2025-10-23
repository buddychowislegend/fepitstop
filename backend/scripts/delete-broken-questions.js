const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontendpitstop';

async function deleteBrokenQuestions() {
  let client;
  try {
    console.log('🔗 Connecting to MongoDB...\n');
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('frontendpitstop');
    const collection = db.collection('quizQuestions');

    // Get all questions
    const allQuestions = await collection.find({}).toArray();
    console.log(`📊 Total questions before: ${allQuestions.length}\n`);

    // Define broken question ID ranges
    const brokenIds = [];
    
    // Backend: B11-B100
    for (let i = 11; i <= 100; i++) {
      brokenIds.push(`B${i}`);
    }
    
    // Product: P11-P100
    for (let i = 11; i <= 100; i++) {
      brokenIds.push(`P${i}`);
    }
    
    // HR: H11-H100
    for (let i = 11; i <= 100; i++) {
      brokenIds.push(`H${i}`);
    }
    
    // QA: Q1-Q100
    for (let i = 1; i <= 100; i++) {
      brokenIds.push(`Q${i}`);
    }

    console.log(`🗑️  Deleting ${brokenIds.length} broken questions...\n`);

    // Delete broken questions
    const result = await collection.deleteMany({
      id: { $in: brokenIds }
    });

    console.log(`✅ Deleted: ${result.deletedCount} questions\n`);

    // Get remaining questions
    const remaining = await collection.find({}).toArray();
    console.log(`📊 Total questions after: ${remaining.length}\n`);

    // Show remaining by profile
    const byProfile = {};
    remaining.forEach(q => {
      if (!byProfile[q.profile]) {
        byProfile[q.profile] = 0;
      }
      byProfile[q.profile]++;
    });

    console.log('📈 Remaining Questions by Profile:\n');
    Object.entries(byProfile).sort().forEach(([profile, count]) => {
      console.log(`   ${profile}: ${count} questions`);
    });

    console.log('\n✅ Successfully deleted all broken questions from MongoDB!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

deleteBrokenQuestions();
