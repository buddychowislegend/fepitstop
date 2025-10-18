# HireOG Backend

Express.js backend with MongoDB for HireOG platform.

## Setup

### 1. Install MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Or use MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Update `.env` file with your MongoDB URI:
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production_frontendpitstop_2025
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/frontendpitstop
```

### 4. Seed Database
```bash
npm run seed
```

This will populate the database with:
- 6 sample problems
- 4 prep plans
- 5 quiz questions
- 3 community solutions
- 2 system design scenarios

### 5. Start Server
```bash
npm run dev
```

Server runs on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get specific problem

### Prep Plans
- `GET /api/prep-plans` - Get all plans
- `GET /api/prep-plans/:id` - Get specific plan

### Quiz
- `GET /api/quiz` - Get all questions
- `GET /api/quiz/random/:count` - Get random questions

### Community
- `GET /api/community` - Get all solutions
- `GET /api/community/:id` - Get specific solution
- `POST /api/community/:id/upvote` - Upvote solution

### System Design
- `GET /api/system-design` - Get all scenarios
- `GET /api/system-design/:id` - Get specific scenario

## Database Models

- **User** - Authentication and user profiles
- **Problem** - Interview questions
- **PrepPlan** - Study plans
- **QuizQuestion** - Quiz questions
- **CommunitySolution** - User solutions
- **SystemDesignScenario** - Design scenarios

## Development

```bash
npm run dev    # Start with nodemon (auto-reload)
npm run seed   # Reseed database
```

