const fs = require('fs');
const path = require('path');

// Use persistent file-based database for all environments
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Use /tmp directory for serverless environments (writable)
const DB_DIR = isServerless 
  ? path.join('/tmp', 'fepitstop-db')
  : path.join(__dirname, '../database');

const DB_FILE = path.join(DB_DIR, 'data.json');

// Initialize persistent database
let inMemoryDB = {
  users: [],
  problems: [],
  prepPlans: [],
  quizQuestions: [],
  communitySolutions: [],
  systemDesignScenarios: [],
  submissions: [],
  // Company-related data
  candidates: [],
  interviewDrives: [],
  interviewTokens: [],
  interviewResponses: [],
  screenings: []
};

try {
  // Ensure database directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Initialize database file if it doesn't exist
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      problems: [],
      prepPlans: [],
      quizQuestions: [],
      communitySolutions: [],
      systemDesignScenarios: [],
      submissions: [],
      // Company-related data
      candidates: [],
      interviewDrives: [],
      interviewTokens: [],
      interviewResponses: [],
      screenings: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log(`✅ Database initialized at: ${DB_FILE}`);
  } else {
    console.log(`✅ Database loaded from: ${DB_FILE}`);
  }
} catch (error) {
  console.warn('File system not available, using in-memory storage:', error.message);
}

class Database {
  constructor() {
    this.filePath = DB_FILE;
    this.isServerless = isServerless;
  }

  read() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data);
      } else {
        // Return empty database if file doesn't exist
        return {
          users: [],
          problems: [],
          prepPlans: [],
          quizQuestions: [],
          communitySolutions: [],
          systemDesignScenarios: [],
          submissions: []
        };
      }
    } catch (error) {
      console.warn('Failed to read from file system, using fallback:', error.message);
      return { ...inMemoryDB };
    }
  }

  write(data) {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Database written to: ${this.filePath}`);
    } catch (error) {
      console.warn('Failed to write to file system, using in-memory storage:', error.message);
      inMemoryDB = { ...data };
    }
  }

  // Users
  async getUsers() {
    const db = this.read();
    return db.users;
  }

  async findUserByEmail(email) {
    const db = this.read();
    return db.users.find(u => u.email === email);
  }

  async findUserById(id) {
    const db = this.read();
    return db.users.find(u => u.id === id);
  }

  async createUser(userData) {
    const db = this.read();
    const user = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    this.write(db);
    return user;
  }

  async updateUser(id, updates) {
    const db = this.read();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      db.users[userIndex] = { ...db.users[userIndex], ...updates };
      this.write(db);
      return db.users[userIndex];
    }
    return null;
  }

  async deleteUser(id) {
    const db = this.read();
    db.users = db.users.filter(u => u.id !== id);
    this.write(db);
    return true;
  }

  // Problems
  async getProblems() {
    const db = this.read();
    return db.problems;
  }

  async findProblemById(id) {
    const db = this.read();
    return db.problems.find(p => p.id === id);
  }

  // Prep Plans
  async getPrepPlans() {
    const db = this.read();
    return db.prepPlans;
  }

  async findPrepPlanById(id) {
    const db = this.read();
    return db.prepPlans.find(p => p.id === id);
  }

  // Quiz Questions
  async getQuizQuestions() {
    const db = this.read();
    return db.quizQuestions;
  }

  async getRandomQuizQuestions(count, profile) {
    const db = this.read();
    const filteredQuestions = profile ? db.quizQuestions.filter(q => q.profile === profile) : db.quizQuestions;
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Community Solutions
  async getCommunitySolutions() {
    const db = this.read();
    return db.communitySolutions;
  }

  async findCommunitySolutionById(id) {
    const db = this.read();
    return db.communitySolutions.find(s => s.id === id);
  }

  async upvoteCommunitySolution(id) {
    const db = this.read();
    const solution = db.communitySolutions.find(s => s.id === id);
    if (solution) {
      solution.upvotes = (solution.upvotes || 0) + 1;
      this.write(db);
      return solution;
    }
    return null;
  }

  // System Design Scenarios
  async getSystemDesignScenarios() {
    const db = this.read();
    return db.systemDesignScenarios;
  }

  async findSystemDesignScenarioById(id) {
    const db = this.read();
    return db.systemDesignScenarios.find(s => s.id === id);
  }

  // User Activity
  async addUserActivity(userId, activity) {
    const db = this.read();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      if (!user.activityHistory) {
        user.activityHistory = [];
      }
      user.activityHistory.push(activity);
      this.write(db);
    }
  }

  async getUserActivity(userId) {
    const db = this.read();
    const user = db.users.find(u => u.id === userId);
    return user?.activityHistory || [];
  }

  // Seed database
  async seed(data) {
    const db = this.read();
    db.problems = data.problems || db.problems;
    db.prepPlans = data.prepPlans || db.prepPlans;
    db.quizQuestions = data.quizQuestions || db.quizQuestions;
    db.communitySolutions = data.communitySolutions || db.communitySolutions;
    db.systemDesignScenarios = data.systemDesignScenarios || db.systemDesignScenarios;
    this.write(db);
    return db;
  }

  // Initialize persistent database with problems data
  async initializeServerlessData() {
    try {
      // Load all data from data files
      const problemsArray = require('../data/comprehensive-problems');
      const { prepPlans } = require('../data/prepPlans');
      const { quizQuestions } = require('../data/quizQuestions');
      const { communitySolutions } = require('../data/communitySolutions');
      const { systemDesignScenarios } = require('../data/systemDesignScenarios');
      
      // Read current database
      const db = this.read();
      
      // Initialize all data if database is empty or incomplete
      if (!db.problems || db.problems.length === 0) {
        db.problems = problemsArray || [];
        db.prepPlans = prepPlans || [];
        db.quizQuestions = quizQuestions || [];
        db.communitySolutions = communitySolutions || [];
        db.systemDesignScenarios = systemDesignScenarios || [];
        db.submissions = db.submissions || [];
        db.users = db.users || [];
        
        // Write to persistent storage
        this.write(db);
        console.log(`✅ Database initialized with ${db.problems.length} problems, ${db.quizQuestions.length} quiz questions at ${this.filePath}`);
      } else {
        // Even if problems exist, check if quiz questions need to be initialized
        if (!db.quizQuestions || db.quizQuestions.length === 0) {
          db.quizQuestions = quizQuestions || [];
          this.write(db);
          console.log(`✅ Quiz questions initialized: ${db.quizQuestions.length} questions`);
        }
        
        // Check other collections too
        if (!db.prepPlans || db.prepPlans.length === 0) {
          db.prepPlans = prepPlans || [];
          this.write(db);
          console.log(`✅ Prep plans initialized: ${db.prepPlans.length} plans`);
        }
        
        if (!db.communitySolutions || db.communitySolutions.length === 0) {
          db.communitySolutions = communitySolutions || [];
          this.write(db);
          console.log(`✅ Community solutions initialized: ${db.communitySolutions.length} solutions`);
        }
        
        if (!db.systemDesignScenarios || db.systemDesignScenarios.length === 0) {
          db.systemDesignScenarios = systemDesignScenarios || [];
          this.write(db);
          console.log(`✅ System design scenarios initialized: ${db.systemDesignScenarios.length} scenarios`);
        }
        
        console.log(`✅ Database initialized with ${db.problems.length} problems, ${db.quizQuestions.length} quiz questions`);
      }
    } catch (error) {
      console.warn('Failed to load data:', error.message);
      console.error(error);
    }
  }

  // Submissions
  async addSubmission(submission) {
    const db = this.read();
    if (!db.submissions) {
      db.submissions = [];
    }
    db.submissions.push(submission);
    this.write(db);
    return submission;
  }

  async getUserSubmissions(userId, problemId = null) {
    const db = this.read();
    if (!db.submissions) {
      return [];
    }
    let submissions = db.submissions.filter(s => s.userId === userId);
    if (problemId) {
      submissions = submissions.filter(s => s.problemId === problemId);
    }
    return submissions;
  }

  async addUserCompletedProblem(userId, problemId) {
    const db = this.read();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      if (!user.completedProblems) {
        user.completedProblems = [];
      }
      if (!user.completedProblems.includes(problemId)) {
        user.completedProblems.push(problemId);
        this.write(db);
      }
    }
  }

  async isProblemCompletedByUser(userId, problemId) {
    const db = this.read();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.completedProblems) {
      return false;
    }
    return user.completedProblems.includes(problemId);
  }

  async getUserCompletedProblems(userId) {
    const db = this.read();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.completedProblems) {
      return [];
    }
    return user.completedProblems;
  }

  // Quiz Completions
  async addQuizCompletion(quizCompletion) {
    const db = this.read();
    if (!db.quizCompletions) {
      db.quizCompletions = [];
    }
    
    const completion = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...quizCompletion,
      completedAt: new Date().toISOString()
    };
    
    db.quizCompletions.push(completion);
    
    // Update user's quiz stats
    const user = db.users.find(u => u.id === quizCompletion.userId);
    if (user) {
      if (!user.totalQuizzesTaken) user.totalQuizzesTaken = 0;
      if (!user.quizHistory) user.quizHistory = [];
      
      user.totalQuizzesTaken += 1;
      user.quizHistory.push({
        score: quizCompletion.score,
        totalQuestions: quizCompletion.totalQuestions,
        rating: quizCompletion.rating,
        completedAt: completion.completedAt
      });
    }
    
    this.write(db);
    return completion;
  }

  async getUserQuizCompletions(userId) {
    const db = this.read();
    if (!db.quizCompletions) {
      return [];
    }
    return db.quizCompletions.filter(c => c.userId === userId).sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    );
  }

  async getUserQuizStats(userId) {
    const db = this.read();
    const completions = (db.quizCompletions || []).filter(c => c.userId === userId);
    
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
    const db = this.read();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) return null;
    
    // Get user's stats
    const problemsSolved = user.totalSolved || 0;
    const quizStats = await this.getUserQuizStats(userId);
    
    // Calculate score: problems (70%) + quiz performance (30%)
    const problemScore = problemsSolved * 10; // 10 points per problem
    const quizScore = quizStats.totalQuizzes * 5 + (quizStats.averageScore / 10); // 5 points per quiz + bonus for accuracy
    const totalScore = problemScore + quizScore;
    
    // Update user's rank score
    user.rankScore = totalScore;
    
    // Calculate rank position
    const sortedUsers = db.users
      .filter(u => u.rankScore !== undefined)
      .sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
    
    const rank = sortedUsers.findIndex(u => u.id === userId) + 1;
    user.rank = rank;
    
    this.write(db);
    
    return {
      rank,
      totalScore,
      problemsSolved,
      quizzesTaken: quizStats.totalQuizzes,
      quizAverageScore: quizStats.averageScore
    };
  }

  async getLeaderboard(limit = 10) {
    const db = this.read();
    return db.users
      .filter(u => u.rankScore !== undefined)
      .sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0))
      .slice(0, limit);
  }

  // Analytics
  async trackPageView(data) {
    const db = this.read();
    if (!db.analytics) {
      db.analytics = [];
    }
    
    const pageView = {
      ...data,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };
    
    db.analytics.push(pageView);
    this.write(db);
    return pageView;
  }

  async getAnalytics(startDate, endDate) {
    const db = this.read();
    if (!db.analytics) {
      return [];
    }
    
    let analytics = db.analytics;
    
    if (startDate || endDate) {
      analytics = analytics.filter(a => {
        const timestamp = new Date(a.timestamp);
        if (startDate && timestamp < new Date(startDate)) return false;
        if (endDate && timestamp > new Date(endDate)) return false;
        return true;
      });
    }
    
    return analytics;
  }

  async getAnalyticsSummary(days = 7) {
    const db = this.read();
    if (!db.analytics) {
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        avgTimeSpent: 0,
        topPages: [],
        dateRange: {
          start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      };
    }
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentAnalytics = db.analytics.filter(a => new Date(a.timestamp) >= startDate);
    
    // Calculate metrics
    const totalViews = recentAnalytics.length;
    const uniqueVisitors = new Set(recentAnalytics.map(a => a.sessionId)).size;
    
    // Average time spent
    const timeSpentEntries = recentAnalytics.filter(a => a.timeSpent && a.timeSpent > 0);
    const avgTimeSpent = timeSpentEntries.length > 0
      ? Math.round(timeSpentEntries.reduce((sum, a) => sum + a.timeSpent, 0) / timeSpentEntries.length)
      : 0;
    
    // Top pages
    const pageViewsMap = {};
    const pageVisitorsMap = {};
    
    recentAnalytics.forEach(a => {
      if (!pageViewsMap[a.path]) {
        pageViewsMap[a.path] = 0;
        pageVisitorsMap[a.path] = new Set();
      }
      pageViewsMap[a.path]++;
      pageVisitorsMap[a.path].add(a.sessionId);
    });
    
    const topPages = Object.entries(pageViewsMap)
      .map(([path, views]) => ({
        path,
        views,
        uniqueVisitors: pageVisitorsMap[path].size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    return {
      totalViews,
      uniqueVisitors,
      avgTimeSpent,
      topPages,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      }
    };
  }

  // OTP Management (for email verification)
  async storeOTP(email, otp, userData) {
    const db = this.read();
    if (!db.otps) {
      db.otps = [];
    }
    
    // Remove any existing OTP for this email
    db.otps = db.otps.filter(o => o.email !== email);
    
    // Add new OTP with expiration
    db.otps.push({
      email,
      otp,
      userData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });
    
    this.write(db);
    return { email, otp, userData };
  }

  async verifyOTP(email, otp) {
    const db = this.read();
    if (!db.otps) {
      return null;
    }
    
    const otpData = db.otps.find(o => 
      o.email === email && 
      o.otp === otp && 
      new Date(o.expiresAt) > new Date()
    );
    
    if (!otpData) {
      return null;
    }
    
    // Delete OTP after verification
    db.otps = db.otps.filter(o => !(o.email === email && o.otp === otp));
    this.write(db);
    
    return otpData.userData;
  }

  async deleteOTP(email) {
    const db = this.read();
    if (!db.otps) {
      return;
    }
    db.otps = db.otps.filter(o => o.email !== email);
    this.write(db);
  }

  // Password Reset Token Management
  async storePasswordResetToken(email, token) {
    const db = this.read();
    if (!db.passwordResets) {
      db.passwordResets = [];
    }
    
    // Remove any existing token for this email
    db.passwordResets = db.passwordResets.filter(r => r.email !== email);
    
    // Add new token with expiration
    db.passwordResets.push({
      email,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    });
    
    this.write(db);
    return { email, token };
  }

  async verifyPasswordResetToken(email, token) {
    const db = this.read();
    if (!db.passwordResets) {
      return null;
    }
    
    const resetData = db.passwordResets.find(r => 
      r.email === email && 
      r.token === token && 
      new Date(r.expiresAt) > new Date()
    );
    
    return resetData || null;
  }

  async deletePasswordResetToken(email) {
    const db = this.read();
    if (!db.passwordResets) {
      return;
    }
    db.passwordResets = db.passwordResets.filter(r => r.email !== email);
    this.write(db);
  }

  // Company-related methods
  async addCandidate(candidateData) {
    const db = this.read();
    if (!db.candidates) {
      db.candidates = [];
    }
    const candidate = {
      id: Date.now().toString(),
      companyId: candidateData.companyId,
      name: candidateData.name,
      email: candidateData.email,
      profile: candidateData.profile,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    db.candidates.push(candidate);
    this.write(db);
    return candidate;
  }

  async getCandidatesByCompany(companyId) {
    const db = this.read();
    if (!db.candidates) {
      db.candidates = [];
      this.write(db);
    }
    return db.candidates.filter(c => c.companyId === companyId);
  }

  async updateCandidate(candidateId, updateData) {
    const db = this.read();
    if (!db.candidates) {
      db.candidates = [];
    }
    const index = db.candidates.findIndex(c => c.id === candidateId);
    if (index !== -1) {
      db.candidates[index] = { ...db.candidates[index], ...updateData };
      this.write(db);
      return db.candidates[index];
    }
    return null;
  }

  async deleteCandidate(candidateId) {
    const db = this.read();
    if (!db.candidates) {
      db.candidates = [];
    }
    db.candidates = db.candidates.filter(c => c.id !== candidateId);
    this.write(db);
    return true;
  }

  async addInterviewDrive(driveData) {
    const db = this.read();
    if (!db.interviewDrives) {
      db.interviewDrives = [];
    }

    const candidateIds = Array.isArray(driveData.candidateIds)
      ? driveData.candidateIds
      : Array.isArray(driveData.candidates)
        ? driveData.candidates
        : [];

    const driveId = (typeof driveData.id === 'string' && driveData.id.trim().length > 0)
      ? driveData.id.trim()
      : (typeof driveData.screeningId === 'string' && driveData.screeningId.trim().length > 0)
        ? driveData.screeningId.trim()
        : Date.now().toString();

    const drive = {
      id: driveId,
      companyId: driveData.companyId,
      name: driveData.name,
      status: driveData.status || 'draft',
      candidateIds,
      questions: Array.isArray(driveData.questions) ? driveData.questions : [],
      jobDescription: driveData.jobDescription || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      screeningId: (typeof driveData.screeningId === 'string' && driveData.screeningId.trim().length > 0)
        ? driveData.screeningId.trim()
        : driveId
    };

    // Backward compatibility for any legacy code still reading `candidates`
    drive.candidates = drive.candidateIds;

    db.interviewDrives.push(drive);
    this.write(db);
    return drive;
  }

  async getDrivesByCompany(companyId) {
    const db = this.read();
    if (!db.interviewDrives) {
      db.interviewDrives = [];
      this.write(db);
    }
    return db.interviewDrives
      .filter(d => d.companyId === companyId)
      .map(drive => ({
        ...drive,
        candidateIds: Array.isArray(drive.candidateIds)
          ? drive.candidateIds
          : Array.isArray(drive.candidates)
            ? drive.candidates
            : [],
        candidates: Array.isArray(drive.candidateIds)
          ? drive.candidateIds
          : Array.isArray(drive.candidates)
            ? drive.candidates
            : [],
        questions: Array.isArray(drive.questions) ? drive.questions : [],
        jobDescription: drive.jobDescription || '',
      }));
  }

  async updateInterviewDrive(driveId, updateData) {
    const db = this.read();
    if (!db.interviewDrives) {
      db.interviewDrives = [];
    }
    const index = db.interviewDrives.findIndex(d => d.id === driveId);
    if (index !== -1) {
      const existing = db.interviewDrives[index];
      const candidateIds = Array.isArray(updateData.candidateIds)
        ? updateData.candidateIds
        : existing.candidateIds;
      const questions = Array.isArray(updateData.questions)
        ? updateData.questions
        : existing.questions || [];

      db.interviewDrives[index] = {
        ...existing,
        ...updateData,
        candidateIds,
        candidates: candidateIds,
        questions,
        jobDescription: updateData.jobDescription !== undefined ? updateData.jobDescription : (existing.jobDescription || ''),
        updatedAt: new Date().toISOString()
      };

      this.write(db);
      return db.interviewDrives[index];
    }
    return null;
  }

  async addInterviewToken(tokenData) {
    const db = this.read();
    if (!db.interviewTokens) {
      db.interviewTokens = [];
    }
    const token = {
      id: Date.now().toString(),
      ...tokenData
    };
    
    db.interviewTokens.push(token);
    this.write(db);
    return token;
  }

  async getTokenData(token) {
    const db = this.read();
    if (!db.interviewTokens) {
      db.interviewTokens = [];
    }
    return db.interviewTokens.find(t => t.token === token);
  }

  async updateToken(token, updateData) {
    const db = this.read();
    if (!db.interviewTokens) {
      db.interviewTokens = [];
    }
    const index = db.interviewTokens.findIndex(t => t.token === token);
    if (index !== -1) {
      db.interviewTokens[index] = { ...db.interviewTokens[index], ...updateData };
      this.write(db);
      return db.interviewTokens[index];
    }
    return null;
  }

  async addInterviewResponse(responseData) {
    const db = this.read();
    if (!db.interviewResponses) {
      db.interviewResponses = [];
    }
    const response = {
      id: Date.now().toString(),
      ...responseData
    };
    
    db.interviewResponses.push(response);
    this.write(db);
    return response;
  }

  async getInterviewResponses(token) {
    const db = this.read();
    if (!db.interviewResponses) {
      db.interviewResponses = [];
    }
    return db.interviewResponses.filter(r => r.token === token);
  }

  async getCandidateById(candidateId) {
    const db = this.read();
    if (!db.candidates) {
      db.candidates = [];
    }
    return db.candidates.find(c => c.id === candidateId);
  }

  async getDriveById(driveId) {
    const db = this.read();
    if (!db.interviewDrives) {
      db.interviewDrives = [];
    }
    const drive = db.interviewDrives.find(d => d.id === driveId);
    if (!drive) {
      return null;
    }
    const candidateIds = Array.isArray(drive.candidateIds)
      ? drive.candidateIds
      : Array.isArray(drive.candidates)
        ? drive.candidates
        : [];

    return {
      ...drive,
      candidateIds,
      candidates: candidateIds,
      questions: Array.isArray(drive.questions) ? drive.questions : [],
      jobDescription: drive.jobDescription || '',
    };
  }

  // Screening methods
  async addScreening(screening) {
    const db = this.read();
    if (!db.screenings) {
      db.screenings = [];
    }
    const newScreening = {
      id: Date.now().toString(),
      ...screening
    };
    db.screenings.push(newScreening);
    this.write(db);
    return newScreening;
  }

  async getScreeningsByCompany(companyId) {
    const db = this.read();
    if (!db.screenings) {
      db.screenings = [];
    }
    return db.screenings.filter(s => s.companyId === companyId);
  }

  async updateScreening(screeningId, companyId, updateData) {
    const db = this.read();
    if (!db.screenings) {
      db.screenings = [];
    }
    const index = db.screenings.findIndex(s => s.id === screeningId && s.companyId === companyId);
    if (index !== -1) {
      db.screenings[index] = { 
        ...db.screenings[index], 
        ...updateData, 
        updatedAt: new Date().toISOString() 
      };
      this.write(db);
      return db.screenings[index];
    }
    return null;
  }

  async deleteScreening(screeningId, companyId) {
    const db = this.read();
    if (!db.screenings) {
      db.screenings = [];
    }
    const index = db.screenings.findIndex(s => s.id === screeningId && s.companyId === companyId);
    if (index !== -1) {
      db.screenings.splice(index, 1);
      this.write(db);
      return true;
    }
    return false;
  }
}

module.exports = Database;
