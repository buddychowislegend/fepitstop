require('dotenv').config();
const { MongoClient } = require('mongodb');
const comprehensiveProblems = require('../data/comprehensive-problems');
const { prepPlans } = require('../data/prepPlans');
const { quizQuestions } = require('../data/quizQuestions');
const { communitySolutions } = require('../data/communitySolutions');
const { systemDesignScenarios } = require('../data/systemDesignScenarios');

const seedAllData = async () => {
  let client;
  
  try {
    console.log('🌱 Starting comprehensive database seed...\n');

    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }

    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db('frontendpitstop');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('problems').deleteMany({});
    await db.collection('prepPlans').deleteMany({});
    await db.collection('quizQuestions').deleteMany({});
    await db.collection('communitySolutions').deleteMany({});
    await db.collection('systemDesignScenarios').deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Insert problems
    console.log('📥 Inserting problems...');
    if (comprehensiveProblems && comprehensiveProblems.length > 0) {
      await db.collection('problems').insertMany(comprehensiveProblems);
      console.log(`✅ Inserted ${comprehensiveProblems.length} problems`);
    } else {
      console.log('⚠️  No problems to insert');
    }

    // Insert prep plans
    console.log('📥 Inserting prep plans...');
    if (prepPlans && prepPlans.length > 0) {
      await db.collection('prepPlans').insertMany(prepPlans);
      console.log(`✅ Inserted ${prepPlans.length} prep plans`);
    } else {
      console.log('⚠️  No prep plans to insert');
    }

    // Insert quiz questions
    console.log('📥 Inserting quiz questions...');
    if (quizQuestions && quizQuestions.length > 0) {
      await db.collection('quizQuestions').insertMany(quizQuestions);
      console.log(`✅ Inserted ${quizQuestions.length} quiz questions`);
    } else {
      console.log('⚠️  No quiz questions to insert');
    }

    // Insert community solutions
    console.log('📥 Inserting community solutions...');
    if (communitySolutions && communitySolutions.length > 0) {
      await db.collection('communitySolutions').insertMany(communitySolutions);
      console.log(`✅ Inserted ${communitySolutions.length} community solutions`);
    } else {
      console.log('⚠️  No community solutions to insert');
    }

    // Insert system design scenarios
    console.log('📥 Inserting system design scenarios...');
    if (systemDesignScenarios && systemDesignScenarios.length > 0) {
      await db.collection('systemDesignScenarios').insertMany(systemDesignScenarios);
      console.log(`✅ Inserted ${systemDesignScenarios.length} system design scenarios`);
    } else {
      console.log('⚠️  No system design scenarios to insert');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Problems: ${comprehensiveProblems.length}`);
    console.log(`   Prep Plans: ${prepPlans.length}`);
    console.log(`   Quiz Questions: ${quizQuestions.length}`);
    console.log(`   Community Solutions: ${communitySolutions.length}`);
    console.log(`   System Design Scenarios: ${systemDesignScenarios.length}`);

    // Verify quiz questions
    console.log('\n🔍 Verifying quiz questions...');
    const quizCount = await db.collection('quizQuestions').countDocuments();
    console.log(`✅ Quiz questions in database: ${quizCount}`);

    // Show sample quiz question
    const sampleQuiz = await db.collection('quizQuestions').findOne({});
    if (sampleQuiz) {
      console.log('\n📝 Sample quiz question:');
      console.log(`   Question: ${sampleQuiz.question}`);
      console.log(`   Category: ${sampleQuiz.category}`);
      console.log(`   Difficulty: ${sampleQuiz.difficulty}`);
    }

  } catch (error) {
    console.error('\n❌ Seed error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
    process.exit(0);
  }
};

seedAllData();
