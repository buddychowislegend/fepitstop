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
  submissions: []
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
      submissions: []
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

  async getRandomQuizQuestions(count) {
    const db = this.read();
    const shuffled = db.quizQuestions.sort(() => 0.5 - Math.random());
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
      // Load problems data from the comprehensive problems file
      const problemsArray = require('../data/comprehensive-problems');
      
      // Read current database
      const db = this.read();
      
      // Only initialize problems if they don't exist yet
      if (!db.problems || db.problems.length === 0) {
        db.problems = problemsArray || [];
        db.prepPlans = db.prepPlans || [];
        db.quizQuestions = db.quizQuestions || [];
        db.communitySolutions = db.communitySolutions || [];
        db.systemDesignScenarios = db.systemDesignScenarios || [];
        db.submissions = db.submissions || [];
        db.users = db.users || [];
        
        // Write to persistent storage
        this.write(db);
        console.log(`✅ Database initialized with ${db.problems.length} problems at ${this.filePath}`);
      } else {
        console.log(`✅ Database already initialized with ${db.problems.length} problems`);
      }
    } catch (error) {
      console.warn('Failed to load problems data:', error.message);
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
