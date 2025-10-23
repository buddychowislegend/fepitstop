const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontendpitstop';

async function rebuildAfterCleanup() {
  let client;
  try {
    console.log('🔗 Fetching remaining questions from MongoDB...\n');
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('frontendpitstop');
    const collection = db.collection('quizQuestions');

    // Get all remaining questions sorted by ID
    const questions = await collection.find({}).sort({ id: 1 }).toArray();

    console.log(`📋 Retrieved ${questions.length} questions from MongoDB\n`);

    // Remove MongoDB specific fields
    const cleanedQuestions = questions.map(q => {
      const cleaned = {};
      Object.keys(q).forEach(key => {
        if (!key.startsWith('_')) {
          cleaned[key] = q[key];
        }
      });
      return cleaned;
    });

    // Write to source file
    const filePath = path.join(__dirname, '../data/quizQuestions.js');
    const content = `const quizQuestions = ${JSON.stringify(cleanedQuestions, null, 2)};\n\nmodule.exports = quizQuestions;\n`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Successfully rebuilt quizQuestions.js!\n`);
    console.log(`📝 File size: ${(content.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Total questions: ${cleanedQuestions.length}\n`);

    // Show breakdown
    const byProfile = {};
    cleanedQuestions.forEach(q => {
      if (!byProfile[q.profile]) {
        byProfile[q.profile] = 0;
      }
      byProfile[q.profile]++;
    });

    console.log('📈 Questions by Profile:\n');
    Object.entries(byProfile).sort().forEach(([profile, count]) => {
      console.log(`   ${profile}: ${count} questions`);
    });

    console.log('\n✅ Source file synchronized with MongoDB!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

rebuildAfterCleanup();
