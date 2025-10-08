const { MongoClient } = require('mongodb');

class MongoDatabase {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI not configured');
      }

      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
      });

      await this.client.connect();
      this.db = this.client.db('frontendpitstop');
      this.isConnected = true;
      console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async ensureConnection() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  // Users
  async getUsers() {
    await this.ensureConnection();
    return await this.db.collection('users').find({}).toArray();
  }

  async findUserByEmail(email) {
    await this.ensureConnection();
    return await this.db.collection('users').findOne({ email });
  }

  async findUserById(id) {
    await this.ensureConnection();
    return await this.db.collection('users').findOne({ id });
  }

  async createUser(userData) {
    await this.ensureConnection();
    const user = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date().toISOString(),
      completedProblems: [],
      streak: 0,
      rank: 0,
      totalSolved: 0,
      achievements: [],
      activityHistory: []
    };
    await this.db.collection('users').insertOne(user);
    return user;
  }

  async updateUser(id, updates) {
    await this.ensureConnection();
    const result = await this.db.collection('users').findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result;
  }

  async deleteUser(id) {
    await this.ensureConnection();
    await this.db.collection('users').deleteOne({ id });
    return true;
  }

  // Problems
  async getProblems() {
    await this.ensureConnection();
    return await this.db.collection('problems').find({}).toArray();
  }

  async findProblemById(id) {
    await this.ensureConnection();
    return await this.db.collection('problems').findOne({ id });
  }

  // Prep Plans
  async getPrepPlans() {
    await this.ensureConnection();
    return await this.db.collection('prepPlans').find({}).toArray();
  }

  async findPrepPlanById(id) {
    await this.ensureConnection();
    return await this.db.collection('prepPlans').findOne({ id });
  }

  // Quiz Questions
  async getQuizQuestions() {
    await this.ensureConnection();
    return await this.db.collection('quizQuestions').find({}).toArray();
  }

  async getRandomQuizQuestions(count) {
    await this.ensureConnection();
    const questions = await this.db.collection('quizQuestions').aggregate([
      { $sample: { size: count } }
    ]).toArray();
    return questions;
  }

  // Community Solutions
  async getCommunitySolutions() {
    await this.ensureConnection();
    return await this.db.collection('communitySolutions').find({}).toArray();
  }

  async findCommunitySolutionById(id) {
    await this.ensureConnection();
    return await this.db.collection('communitySolutions').findOne({ id });
  }

  async upvoteCommunitySolution(id) {
    await this.ensureConnection();
    const result = await this.db.collection('communitySolutions').findOneAndUpdate(
      { id },
      { $inc: { upvotes: 1 } },
      { returnDocument: 'after' }
    );
    return result;
  }

  // System Design Scenarios
  async getSystemDesignScenarios() {
    await this.ensureConnection();
    return await this.db.collection('systemDesignScenarios').find({}).toArray();
  }

  async findSystemDesignScenarioById(id) {
    await this.ensureConnection();
    return await this.db.collection('systemDesignScenarios').findOne({ id });
  }

  // User Activity
  async addUserActivity(userId, activity) {
    await this.ensureConnection();
    await this.db.collection('users').updateOne(
      { id: userId },
      { 
        $push: { 
          activityHistory: {
            ...activity,
            timestamp: new Date().toISOString()
          }
        }
      }
    );
  }

  async getUserActivity(userId) {
    await this.ensureConnection();
    const user = await this.db.collection('users').findOne({ id: userId });
    return user?.activityHistory || [];
  }

  // Seed database
  async seed(data) {
    await this.ensureConnection();
    
    // Clear existing data
    await this.db.collection('problems').deleteMany({});
    await this.db.collection('prepPlans').deleteMany({});
    await this.db.collection('quizQuestions').deleteMany({});
    await this.db.collection('communitySolutions').deleteMany({});
    await this.db.collection('systemDesignScenarios').deleteMany({});
    
    // Insert new data
    if (data.problems?.length) {
      await this.db.collection('problems').insertMany(data.problems);
    }
    if (data.prepPlans?.length) {
      await this.db.collection('prepPlans').insertMany(data.prepPlans);
    }
    if (data.quizQuestions?.length) {
      await this.db.collection('quizQuestions').insertMany(data.quizQuestions);
    }
    if (data.communitySolutions?.length) {
      await this.db.collection('communitySolutions').insertMany(data.communitySolutions);
    }
    if (data.systemDesignScenarios?.length) {
      await this.db.collection('systemDesignScenarios').insertMany(data.systemDesignScenarios);
    }
    
    return data;
  }

  // Initialize data on serverless
  async initializeServerlessData() {
    try {
      await this.ensureConnection();
      
      // Check if problems already exist
      const problemsCount = await this.db.collection('problems').countDocuments();
      
      if (problemsCount === 0) {
        console.log('🌱 Initializing MongoDB with seed data...');
        
        const problemsArray = require('../data/comprehensive-problems');
        const { prepPlans } = require('../data/prepPlans');
        const { quizQuestions } = require('../data/quizQuestions');
        const { communitySolutions } = require('../data/communitySolutions');
        const { systemDesignScenarios } = require('../data/systemDesignScenarios');
        
        await this.seed({
          problems: problemsArray,
          prepPlans,
          quizQuestions,
          communitySolutions,
          systemDesignScenarios
        });
        
        console.log(`✅ MongoDB initialized with ${problemsArray.length} problems`);
      } else {
        console.log(`✅ MongoDB already has ${problemsCount} problems`);
      }
    } catch (error) {
      console.error('Failed to initialize MongoDB:', error.message);
    }
  }

  // Submissions
  async addSubmission(submission) {
    await this.ensureConnection();
    await this.db.collection('submissions').insertOne(submission);
    return submission;
  }

  async getUserSubmissions(userId, problemId = null) {
    await this.ensureConnection();
    const query = { userId };
    if (problemId) {
      query.problemId = problemId;
    }
    return await this.db.collection('submissions').find(query).toArray();
  }

  async addUserCompletedProblem(userId, problemId) {
    await this.ensureConnection();
    await this.db.collection('users').updateOne(
      { id: userId },
      { 
        $addToSet: { completedProblems: problemId },
        $inc: { totalSolved: 1 }
      }
    );
  }

  async isProblemCompletedByUser(userId, problemId) {
    await this.ensureConnection();
    const user = await this.db.collection('users').findOne({ id: userId });
    return user?.completedProblems?.includes(problemId) || false;
  }

  async getUserCompletedProblems(userId) {
    await this.ensureConnection();
    const user = await this.db.collection('users').findOne({ id: userId });
    return user?.completedProblems || [];
  }

  // Helper to get database stats (async for MongoDB)
  async read() {
    try {
      await this.ensureConnection();
      
      const [users, problems, submissions, prepPlans, quizQuestions, communitySolutions, systemDesignScenarios] = await Promise.all([
        this.db.collection('users').find({}).toArray(),
        this.db.collection('problems').find({}).toArray(),
        this.db.collection('submissions').find({}).toArray(),
        this.db.collection('prepPlans').find({}).toArray(),
        this.db.collection('quizQuestions').find({}).toArray(),
        this.db.collection('communitySolutions').find({}).toArray(),
        this.db.collection('systemDesignScenarios').find({}).toArray()
      ]);
      
      return {
        users,
        problems,
        submissions,
        prepPlans,
        quizQuestions,
        communitySolutions,
        systemDesignScenarios
      };
    } catch (error) {
      console.error('Error reading from MongoDB:', error);
      return {
        users: [],
        problems: [],
        submissions: [],
        prepPlans: [],
        quizQuestions: [],
        communitySolutions: [],
        systemDesignScenarios: []
      };
    }
  }

  // Compatibility properties
  get isServerless() {
    return true;
  }

  get filePath() {
    return `MongoDB Atlas: ${process.env.MONGODB_URI?.split('@')[1]?.split('?')[0] || 'connected'}`;
  }
}

module.exports = MongoDatabase;
