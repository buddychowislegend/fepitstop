const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../database');
const DB_FILE = path.join(DB_DIR, 'data.json');

// Check if we're in a serverless environment (read-only file system)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';

// Initialize in-memory database for serverless environments
let inMemoryDB = {
  users: [],
  problems: [],
  prepPlans: [],
  quizQuestions: [],
  communitySolutions: [],
  systemDesignScenarios: [],
  submissions: []
};

// Only use file system if not in serverless environment
if (!isServerless) {
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
        submissions: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (error) {
    console.warn('File system not available, using in-memory storage:', error.message);
  }
}

class Database {
  constructor() {
    this.filePath = DB_FILE;
    this.isServerless = isServerless;
  }

  read() {
    if (this.isServerless) {
      return { ...inMemoryDB };
    }
    
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to read from file system, using in-memory storage:', error.message);
      return { ...inMemoryDB };
    }
  }

  write(data) {
    if (this.isServerless) {
      inMemoryDB = { ...data };
      return;
    }
    
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
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
      createdAt: new Date().toISOString(),
      solvedProblems: [],
      streak: 0,
      rank: 0,
      totalSolved: 0,
      achievements: [],
      activityHistory: [],
    };
    db.users.push(user);
    this.write(db);
    return user;
  }

  async updateUser(id, updates) {
    const db = this.read();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    this.write(db);
    return db.users[userIndex];
  }

  async deleteUser(id) {
    const db = this.read();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    
    db.users.splice(userIndex, 1);
    this.write(db);
    return true;
  }

  async addUserActivity(userId, activity) {
    const db = this.read();
    const user = db.users.find(u => u.id === userId);
    if (!user) return null;
    
    if (!user.activityHistory) user.activityHistory = [];
    user.activityHistory.unshift({
      ...activity,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 50 activities
    if (user.activityHistory.length > 50) {
      user.activityHistory = user.activityHistory.slice(0, 50);
    }
    
    this.write(db);
    return user;
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

  async getRandomQuizQuestions(count) {
    const db = this.read();
    const shuffled = [...db.quizQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Community Solutions
  async getCommunitySolutions() {
    const db = this.read();
    return db.communitySolutions.sort((a, b) => b.upvotes - a.upvotes);
  }

  async findCommunitySolutionById(id) {
    const db = this.read();
    return db.communitySolutions.find(s => s.id === id);
  }

  async upvoteCommunitySolution(id) {
    const db = this.read();
    const solution = db.communitySolutions.find(s => s.id === id);
    if (solution) {
      solution.upvotes += 1;
      this.write(db);
    }
    return solution;
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

  // Initialize in-memory database with problems data for serverless
  async initializeServerlessData() {
    if (this.isServerless) {
      try {
        // Load problems data from the comprehensive problems file
        const problemsArray = require('../data/comprehensive-problems');
        inMemoryDB.problems = problemsArray || [];
        
        // Initialize other collections as empty arrays
        inMemoryDB.prepPlans = [];
        inMemoryDB.quizQuestions = [];
        inMemoryDB.communitySolutions = [];
        inMemoryDB.systemDesignScenarios = [];
        inMemoryDB.submissions = [];
        
        console.log(`✅ Serverless database initialized with ${inMemoryDB.problems.length} problems`);
      } catch (error) {
        console.warn('Failed to load problems data for serverless:', error.message);
        // Initialize with empty arrays if loading fails
        inMemoryDB.problems = [];
        inMemoryDB.prepPlans = [];
        inMemoryDB.quizQuestions = [];
        inMemoryDB.communitySolutions = [];
        inMemoryDB.systemDesignScenarios = [];
        inMemoryDB.submissions = [];
      }
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
}

module.exports = new Database();

