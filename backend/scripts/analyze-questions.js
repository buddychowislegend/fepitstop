const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/frontendpitstop';

async function analyzeQuestions() {
  let client;
  try {
    console.log('🔗 Analyzing quiz questions...\n');
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('frontendpitstop');
    const collection = db.collection('quizQuestions');

    // Get all questions
    const allQuestions = await collection.find({}).toArray();

    console.log('📊 Analysis Results\n');
    console.log('═'.repeat(80));

    // Group by profile
    const byProfile = {};
    allQuestions.forEach(q => {
      if (!byProfile[q.profile]) {
        byProfile[q.profile] = [];
      }
      byProfile[q.profile].push(q);
    });

    // Analyze each profile
    for (const [profile, questions] of Object.entries(byProfile)) {
      console.log(`\n\n📌 PROFILE: ${profile.toUpperCase()}`);
      console.log('─'.repeat(80));
      console.log(`Total questions: ${questions.length}\n`);

      // Check for duplicate option sets
      const optionSets = {};
      questions.forEach(q => {
        const optKey = JSON.stringify(q.options.sort());
        if (!optionSets[optKey]) {
          optionSets[optKey] = [];
        }
        optionSets[optKey].push(q.id);
      });

      const duplicateOptionSets = Object.entries(optionSets).filter(([_, ids]) => ids.length > 1);
      
      if (duplicateOptionSets.length > 0) {
        console.log(`⚠️  Found ${duplicateOptionSets.length} duplicate option sets:\n`);
        duplicateOptionSets.slice(0, 5).forEach(([optKey, ids]) => {
          const opts = JSON.parse(optKey);
          console.log(`   Questions: ${ids.join(', ')}`);
          console.log(`   Options: [${opts.slice(0, 2).join(', ')}...]`);
          console.log();
        });
      }

      // Sample questions
      console.log(`\n📋 Sample Questions (first 5):\n`);
      questions.slice(0, 5).forEach((q, idx) => {
        console.log(`${idx + 1}. [${q.id}] ${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}`);
        console.log(`   Category: ${q.category}`);
        console.log(`   Difficulty: ${q.difficulty}`);
        console.log(`   Options: [${q.options[0]}, ${q.options[1]}, ...]`);
        console.log();
      });

      // Check for generic/irrelevant questions
      const genericKeywords = ['undefined', 'how do you', 'explain', 'what is', 'describe'];
      const possiblyGeneric = questions.filter(q => {
        const qLower = q.question.toLowerCase();
        return genericKeywords.filter(kw => qLower.includes(kw)).length > 0 && 
               q.question.includes('undefined');
      });

      if (possiblyGeneric.length > 0) {
        console.log(`\n⚠️  Found ${possiblyGeneric.length} questions with 'undefined' in them (possibly broken):\n`);
        possiblyGeneric.slice(0, 3).forEach(q => {
          console.log(`   [${q.id}] ${q.question}`);
        });
      }
    }

    console.log('\n\n' + '═'.repeat(80));
    console.log('\n✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

analyzeQuestions();
