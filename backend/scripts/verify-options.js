const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontendpitstop';

async function verifyOptions() {
  let client;
  try {
    console.log('🔗 Verifying quiz questions...\n');
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('frontendpitstop');
    const collection = db.collection('quizQuestions');

    // Check question option counts
    const pipeline = [
      {
        $project: {
          id: 1,
          question: { $substr: ['$question', 0, 50] },
          optionCount: { $size: '$options' },
          correct: 1,
          profile: 1
        }
      },
      { $group: {
          _id: '$optionCount',
          count: { $sum: 1 },
          sample: { $first: '$$ROOT' }
        }
      },
      { $sort: { _id: -1 } }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    
    console.log('📊 Option Count Distribution:\n');
    results.forEach(result => {
      console.log(`   ${result._id} options: ${result.count} questions`);
    });

    // Check for invalid correct indices
    const badCorrect = await collection.find({
      $expr: { $gte: ['$correct', { $size: '$options' }] }
    }).toArray();

    console.log(`\n🔍 Questions with invalid correct indices: ${badCorrect.length}`);
    if (badCorrect.length > 0) {
      console.log('   IDs:', badCorrect.map(q => q.id).join(', '));
    }

    // Sample questions
    console.log('\n📋 Sample Questions (with 4 options each):\n');
    const samples = await collection.find({}).limit(3).toArray();
    samples.forEach((q, idx) => {
      console.log(`${idx + 1}. ${q.id}: ${q.question.substring(0, 50)}...`);
      console.log(`   Options: ${q.options.length}`);
      console.log(`   Correct: ${q.correct}`);
      console.log();
    });

    // Profile distribution
    const profiles = await collection.aggregate([
      { $group: { _id: '$profile', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    console.log('📈 Questions by Profile:\n');
    profiles.forEach(p => {
      console.log(`   ${p._id}: ${p.count} questions`);
    });

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

verifyOptions();
