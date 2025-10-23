const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontendpitstop';

async function rebuildQuizSource() {
  let client;
  try {
    console.log('🔗 Fetching fixed questions from MongoDB...');
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('frontendpitstop');
    const collection = db.collection('quizQuestions');

    // Get all questions sorted by ID
    const questions = await collection.find({}).sort({ id: 1 }).toArray();

    console.log(`📋 Retrieved ${questions.length} questions from MongoDB`);

    // Remove MongoDB specific fields
    const cleanedQuestions = questions.map(q => {
      const cleaned = {};
      // Copy relevant fields only
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
    console.log(`\n✅ Successfully rebuilt quizQuestions.js from MongoDB!`);
    console.log(`📝 File size: ${(content.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Total questions: ${cleanedQuestions.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

rebuildQuizSource();
