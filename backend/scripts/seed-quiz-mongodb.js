const MongoClient = require('mongodb').MongoClient;
const quizQuestions = require('../data/quizQuestions');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontendpitstop';

async function seedQuizQuestions() {
  let client;
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('frontendpitstop');
    const collection = db.collection('quizQuestions');

    console.log('📋 Clearing existing quiz questions...');
    await collection.deleteMany({});

    console.log(`📝 Inserting ${quizQuestions.length} quiz questions...`);
    const result = await collection.insertMany(quizQuestions);

    console.log(`✅ Successfully inserted ${result.insertedCount} questions`);

    // Verify by profile
    const frontend = await collection.countDocuments({ profile: 'frontend' });
    const backend = await collection.countDocuments({ profile: 'backend' });
    const product = await collection.countDocuments({ profile: 'product' });
    const hr = await collection.countDocuments({ profile: 'hr' });
    const business = await collection.countDocuments({ profile: 'business' });
    const qa = await collection.countDocuments({ profile: 'qa' });

    console.log('\n📊 Questions by profile:');
    console.log(`  ⚛️  Frontend: ${frontend}`);
    console.log(`  ☕ Backend: ${backend}`);
    console.log(`  📊 Product: ${product}`);
    console.log(`  👥 HR: ${hr}`);
    console.log(`  🧪 QA: ${qa}`);
    console.log(`  💼 Sales: ${business}`);
    console.log(`  📈 Total: ${frontend + backend + product + hr + business + qa}`);

  } catch (error) {
    console.error('❌ Error seeding quiz questions:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ MongoDB connection closed');
    }
  }
}

seedQuizQuestions();
