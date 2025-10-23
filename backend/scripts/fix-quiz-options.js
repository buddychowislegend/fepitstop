const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontendpitstop';

async function fixQuizQuestions() {
  let client;
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('frontendpitstop');
    const collection = db.collection('quizQuestions');

    // Find questions with more than 4 options
    const badQuestions = await collection.find({
      $expr: { $gt: [{ $size: "$options" }, 4] }
    }).toArray();

    console.log(`\n⚠️  Found ${badQuestions.length} questions with more than 4 options\n`);

    if (badQuestions.length > 0) {
      console.log('🔧 Fixing questions...\n');
      
      let fixed = 0;
      for (const question of badQuestions) {
        // Keep only first 4 options
        const fixedOptions = question.options.slice(0, 4);
        
        // Ensure correct answer index is valid
        let correctIndex = question.correct;
        if (correctIndex >= fixedOptions.length) {
          correctIndex = 0;
        }

        await collection.updateOne(
          { _id: question._id },
          {
            $set: {
              options: fixedOptions,
              correct: correctIndex
            }
          }
        );

        fixed++;
        console.log(`✅ Fixed: ${question.id}`);
      }

      console.log(`\n✅ Successfully fixed ${fixed} questions!\n`);

      // Verify all questions now have exactly 4 options
      const stillBad = await collection.countDocuments({
        $expr: { $ne: [{ $size: "$options" }, 4] }
      });

      if (stillBad === 0) {
        console.log('✅ All questions now have exactly 4 options!');
        
        // Get stats
        const total = await collection.countDocuments({});
        console.log(`\n📊 Total questions in DB: ${total}`);
      } else {
        console.log(`⚠️  ${stillBad} questions still have incorrect option count`);
      }
    } else {
      console.log('✅ All questions already have 4 or fewer options!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ MongoDB connection closed');
    }
  }
}

fixQuizQuestions();
