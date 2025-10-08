require('dotenv').config();
const db = require('../config/db');
const problems = require('../data/comprehensive-problems');
const { prepPlans } = require('../data/prepPlans');
const { quizQuestions } = require('../data/quizQuestions');
const { communitySolutions } = require('../data/communitySolutions');
const { systemDesignScenarios } = require('../data/systemDesignScenarios');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...\n');

    const result = await db.seed({
      problems,
      prepPlans,
      quizQuestions,
      communitySolutions,
      systemDesignScenarios,
    });

    console.log(`✓ Seeded ${problems.length} problems`);
    console.log(`✓ Seeded ${prepPlans.length} prep plans`);
    console.log(`✓ Seeded ${quizQuestions.length} quiz questions`);
    console.log(`✓ Seeded ${communitySolutions.length} community solutions`);
    console.log(`✓ Seeded ${systemDesignScenarios.length} system design scenarios`);
    console.log('\n✅ Database seeded successfully!');
    console.log(`📁 Data stored in: backend/database/data.json`);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
