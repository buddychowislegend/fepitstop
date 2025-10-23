const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontendpitstop';

async function verifyCleanup() {
  let client;
  try {
    console.log('✅ VERIFICATION REPORT\n');
    console.log('═'.repeat(80) + '\n');
    
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('frontendpitstop');
    const collection = db.collection('quizQuestions');

    // Check for any remaining broken questions
    const brokenChecks = {
      'B11-B100': await collection.countDocuments({ $expr: { $and: [{ $gte: ['$id', 'B11'] }, { $lte: ['$id', 'B100'] }] } }),
      'P11-P100': await collection.countDocuments({ $expr: { $and: [{ $gte: ['$id', 'P11'] }, { $lte: ['$id', 'P100'] }] } }),
      'H11-H100': await collection.countDocuments({ $expr: { $and: [{ $gte: ['$id', 'H11'] }, { $lte: ['$id', 'H100'] }] } }),
      'Q1-Q100': await collection.countDocuments({ id: { $regex: '^Q' } })
    };

    console.log('🔍 Broken Questions Check:\n');
    let allClean = true;
    Object.entries(brokenChecks).forEach(([range, count]) => {
      const status = count === 0 ? '✅' : '❌';
      console.log(`   ${status} ${range}: ${count} questions`);
      if (count > 0) allClean = false;
    });

    console.log('\n' + '─'.repeat(80));

    // Get quality questions
    const allQuestions = await collection.find({}).sort({ id: 1 }).toArray();
    console.log(`\n📊 Quality Questions by Profile:\n`);

    const profiles = ['frontend', 'backend', 'product', 'hr', 'business'];
    let total = 0;
    profiles.forEach(profile => {
      const count = allQuestions.filter(q => q.profile === profile).length;
      console.log(`   ✅ ${profile.padEnd(12)}: ${count} questions`);
      total += count;
    });

    console.log(`\n   📈 Total: ${total} questions`);

    console.log('\n' + '─'.repeat(80));

    // Sample questions
    console.log(`\n📋 Sample of Remaining Questions:\n`);
    allQuestions.slice(0, 5).forEach((q, idx) => {
      console.log(`${idx + 1}. [${q.id}] ${q.question.substring(0, 55)}${q.question.length > 55 ? '...' : ''}`);
      console.log(`   Profile: ${q.profile} | Category: ${q.category}\n`);
    });

    console.log('─'.repeat(80));
    console.log(`\n${allClean ? '✅ CLEANUP SUCCESSFUL!' : '⚠️  Some broken questions remain'}\n`);
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

verifyCleanup();
