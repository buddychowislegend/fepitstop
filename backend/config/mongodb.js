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

  async getRandomQuizQuestions(count, profile = null) {
    await this.ensureConnection();
    const query = {};
    if (profile) {
      query.profile = profile;
    }
    const questions = await this.db.collection('quizQuestions').aggregate([
      { $match: query },
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

  // Quiz Completions
  async addQuizCompletion(quizCompletion) {
    await this.ensureConnection();
    const completion = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...quizCompletion,
      completedAt: new Date().toISOString()
    };
    await this.db.collection('quizCompletions').insertOne(completion);
    
    // Update user's quiz stats
    await this.db.collection('users').updateOne(
      { id: quizCompletion.userId },
      { 
        $inc: { totalQuizzesTaken: 1 },
        $push: { 
          quizHistory: {
            score: quizCompletion.score,
            totalQuestions: quizCompletion.totalQuestions,
            rating: quizCompletion.rating,
            completedAt: completion.completedAt
          }
        }
      }
    );
    
    return completion;
  }

  async getUserQuizCompletions(userId) {
    await this.ensureConnection();
    return await this.db.collection('quizCompletions').find({ userId }).sort({ completedAt: -1 }).toArray();
  }

  async getUserQuizStats(userId) {
    await this.ensureConnection();
    const completions = await this.db.collection('quizCompletions').find({ userId }).toArray();
    
    if (completions.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        averageRating: 0,
        totalQuestions: 0
      };
    }
    
    const totalScore = completions.reduce((sum, c) => sum + c.score, 0);
    const totalQuestions = completions.reduce((sum, c) => sum + c.totalQuestions, 0);
    const totalRating = completions.reduce((sum, c) => sum + (c.rating || 0), 0);
    
    return {
      totalQuizzes: completions.length,
      averageScore: Math.round((totalScore / totalQuestions) * 100),
      averageRating: totalRating / completions.length,
      totalQuestions
    };
  }

  // Ranking System
  async calculateUserRank(userId) {
    await this.ensureConnection();
    const user = await this.db.collection('users').findOne({ id: userId });
    
    if (!user) return null;
    
    // Get user's stats
    const problemsSolved = user.totalSolved || 0;
    const quizStats = await this.getUserQuizStats(userId);
    
    // Calculate score: problems (70%) + quiz performance (30%)
    const problemScore = problemsSolved * 10; // 10 points per problem
    const quizScore = quizStats.totalQuizzes * 5 + (quizStats.averageScore / 10); // 5 points per quiz + bonus for accuracy
    const totalScore = problemScore + quizScore;
    
    // Update user's rank score
    await this.db.collection('users').updateOne(
      { id: userId },
      { $set: { rankScore: totalScore } }
    );
    
    // Get user's rank position
    const usersWithHigherScore = await this.db.collection('users').countDocuments({
      rankScore: { $gt: totalScore }
    });
    
    const rank = usersWithHigherScore + 1;
    
    // Update user's rank
    await this.db.collection('users').updateOne(
      { id: userId },
      { $set: { rank } }
    );
    
    return {
      rank,
      totalScore,
      problemsSolved,
      quizzesTaken: quizStats.totalQuizzes,
      quizAverageScore: quizStats.averageScore
    };
  }

  async getLeaderboard(limit = 10) {
    await this.ensureConnection();
    return await this.db.collection('users')
      .find({ rankScore: { $exists: true } })
      .sort({ rankScore: -1 })
      .limit(limit)
      .toArray();
  }

  // Analytics
  async trackPageView(data) {
    await this.ensureConnection();
    const pageView = {
      ...data,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
    await this.db.collection('analytics').insertOne(pageView);
    return pageView;
  }

  async getAnalytics(startDate, endDate) {
    await this.ensureConnection();
    const query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    return await this.db.collection('analytics').find(query).toArray();
  }

  async getAnalyticsSummary(days = 7) {
    await this.ensureConnection();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const [
      totalViews,
      uniqueVisitors,
      pageViews,
      avgTimeSpent,
      topPages
    ] = await Promise.all([
      // Total page views
      this.db.collection('analytics').countDocuments({ timestamp: { $gte: startDate } }),
      
      // Unique visitors
      this.db.collection('analytics').distinct('sessionId', { timestamp: { $gte: startDate } }).then(arr => arr.length),
      
      // Page views by path
      this.db.collection('analytics').aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Average time spent
      this.db.collection('analytics').aggregate([
        { $match: { timestamp: { $gte: startDate }, timeSpent: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, avgTime: { $avg: '$timeSpent' } } }
      ]).toArray().then(result => result[0]?.avgTime || 0),
      
      // Top pages
      this.db.collection('analytics').aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { 
            _id: '$path', 
            views: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$sessionId' }
          } 
        },
        { $project: {
            path: '$_id',
            views: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ]).toArray()
    ]);
    
    return {
      totalViews,
      uniqueVisitors,
      avgTimeSpent: Math.round(avgTimeSpent),
      topPages: topPages.map(p => ({
        path: p.path || p._id,
        views: p.views,
        uniqueVisitors: p.uniqueVisitors
      })),
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      }
    };
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

  // OTP Management
  async storeOTP(email, otp, userData) {
    await this.ensureConnection();
    
    // Store OTP with 10 minute expiration
    const otpData = {
      email,
      otp,
      userData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    
    // Remove any existing OTP for this email
    await this.db.collection('otps').deleteMany({ email });
    
    // Insert new OTP
    await this.db.collection('otps').insertOne(otpData);
    
    // Create TTL index for auto-deletion (only needs to be done once)
    await this.db.collection('otps').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    ).catch(() => {}); // Ignore if index already exists
    
    return otpData;
  }

  async verifyOTP(email, otp) {
    await this.ensureConnection();
    
    const otpData = await this.db.collection('otps').findOne({ 
      email, 
      otp,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpData) {
      return null;
    }
    
    // Delete OTP after successful verification
    await this.db.collection('otps').deleteOne({ email, otp });
    
    return otpData.userData;
  }

  async deleteOTP(email) {
    await this.ensureConnection();
    await this.db.collection('otps').deleteMany({ email });
  }

  // Password Reset Token Management
  async storePasswordResetToken(email, token) {
    await this.ensureConnection();
    
    const resetData = {
      email,
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };
    
    // Remove any existing token for this email
    await this.db.collection('passwordResets').deleteMany({ email });
    
    // Insert new token
    await this.db.collection('passwordResets').insertOne(resetData);
    
    // Create TTL index for auto-deletion
    await this.db.collection('passwordResets').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    ).catch(() => {});
    
    return resetData;
  }

  async verifyPasswordResetToken(email, token) {
    await this.ensureConnection();
    
    const resetData = await this.db.collection('passwordResets').findOne({ 
      email, 
      token,
      expiresAt: { $gt: new Date() }
    });
    
    if (!resetData) {
      return null;
    }
    
    return resetData;
  }

  async deletePasswordResetToken(email) {
    await this.ensureConnection();
    await this.db.collection('passwordResets').deleteMany({ email });
  }

  // Company Data Operations
  async addCandidate(candidate) {
    await this.ensureConnection();
    const result = await this.db.collection('candidates').insertOne(candidate);
    console.log('Candidate added to MongoDB:', result.insertedId);
    return { ...candidate, _id: result.insertedId };
  }

  async getCandidatesByCompany(companyId) {
    await this.ensureConnection();
    const candidates = await this.db.collection('candidates').find({ companyId }).toArray();
    console.log(`Found ${candidates.length} candidates for company ${companyId}`);
    return candidates;
  }

  async updateCandidate(candidateId, updates) {
    await this.ensureConnection();
    const result = await this.db.collection('candidates').updateOne(
      { id: candidateId },
      { $set: updates }
    );
    console.log('Candidate updated in MongoDB:', result.modifiedCount);
    return result;
  }

  async deleteCandidate(candidateId) {
    await this.ensureConnection();
    const result = await this.db.collection('candidates').deleteOne({ id: candidateId });
    console.log('Candidate deleted from MongoDB:', result.deletedCount);
    return result;
  }

  async addInterviewDrive(drive) {
    await this.ensureConnection();
    const result = await this.db.collection('interviewDrives').insertOne(drive);
    console.log('Interview drive added to MongoDB:', result.insertedId);
    return { ...drive, _id: result.insertedId };
  }

  async getDrivesByCompany(companyId) {
    await this.ensureConnection();
    const drives = await this.db.collection('interviewDrives').find({ companyId }).toArray();
    console.log(`Found ${drives.length} drives for company ${companyId}`);
    return drives;
  }

  async addInterviewToken(token) {
    await this.ensureConnection();
    const result = await this.db.collection('interviewTokens').insertOne(token);
    console.log('Interview token added to MongoDB:', result.insertedId);
    return { ...token, _id: result.insertedId };
  }

  async getTokenData(token) {
    await this.ensureConnection();
    const tokenData = await this.db.collection('interviewTokens').findOne({ token });
    console.log('Token data retrieved from MongoDB:', tokenData ? 'Found' : 'Not found');
    return tokenData;
  }

  async updateToken(token, updates) {
    await this.ensureConnection();
    const result = await this.db.collection('interviewTokens').updateOne(
      { token },
      { $set: updates }
    );
    console.log('Token updated in MongoDB:', result.modifiedCount);
    return result;
  }

  async addInterviewResponse(response) {
    await this.ensureConnection();
    const result = await this.db.collection('interviewResponses').insertOne(response);
    console.log('Interview response added to MongoDB:', result.insertedId);
    return { ...response, _id: result.insertedId };
  }

  async getInterviewResponses(companyId) {
    await this.ensureConnection();
    const responses = await this.db.collection('interviewResponses').find({ companyId }).toArray();
    console.log(`Found ${responses.length} interview responses for company ${companyId}`);
    return responses;
  }

  // Additional company methods
  async getCandidateById(candidateId) {
    await this.ensureConnection();
    return await this.db.collection('candidates').findOne({ id: candidateId });
  }

  async getDriveById(driveId) {
    await this.ensureConnection();
    return await this.db.collection('interviewDrives').findOne({ id: driveId });
  }

  async updateInterviewDrive(driveId, updateData) {
    await this.ensureConnection();
    const result = await this.db.collection('interviewDrives').updateOne(
      { id: driveId },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
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
