# Company Data MongoDB Setup

## Overview
Company data (candidates, interview drives, tokens, responses) is now stored in MongoDB for persistent storage.

## MongoDB Collections

### 1. Candidates Collection
```javascript
{
  _id: ObjectId,
  id: String,           // Custom ID for frontend
  companyId: String,    // Company identifier
  name: String,
  email: String,
  profile: String,
  status: String,       // 'active', 'inactive'
  createdAt: String,    // ISO date
  updatedAt: String     // ISO date
}
```

### 2. Interview Drives Collection
```javascript
{
  _id: ObjectId,
  id: String,           // Custom ID for frontend
  companyId: String,    // Company identifier
  name: String,
  status: String,       // 'draft', 'active', 'completed'
  candidateIds: [String], // Array of candidate IDs
  createdAt: String,    // ISO date
  updatedAt: String    // ISO date
}
```

### 3. Interview Tokens Collection
```javascript
{
  _id: ObjectId,
  id: String,           // Custom ID for frontend
  candidateId: String,  // Candidate ID
  driveId: String,     // Drive ID
  companyId: String,   // Company identifier
  token: String,       // Unique interview token
  used: Boolean,        // Whether token has been used
  createdAt: String,   // ISO date
  usedAt: String      // ISO date when used
}
```

### 4. Interview Responses Collection
```javascript
{
  _id: ObjectId,
  candidateId: String,  // Candidate ID
  driveId: String,     // Drive ID
  companyId: String,   // Company identifier
  token: String,      // Interview token used
  answers: [String],  // Array of candidate answers
  submittedAt: String, // ISO date
  score: Number,      // Optional: calculated score
  feedback: String    // Optional: AI feedback
}
```

## Environment Variables

Add to your `.env.local` file:

```bash
MONGODB_URI=mongodb://localhost:27017/hireog
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hireog
```

## Database Operations

### Adding a Candidate
```javascript
const candidate = {
  id: Date.now().toString(),
  companyId: 'hireog',
  name: 'John Doe',
  email: 'john@example.com',
  profile: 'Frontend Developer',
  status: 'active',
  createdAt: new Date().toISOString()
};

await addCandidate(candidate);
```

### Getting Company Candidates
```javascript
const candidates = await getCandidatesByCompany('hireog');
```

### Creating Interview Drive
```javascript
const drive = {
  id: Date.now().toString(),
  companyId: 'hireog',
  name: 'Frontend Screening',
  status: 'draft',
  candidateIds: ['candidate1', 'candidate2'],
  createdAt: new Date().toISOString()
};

await addInterviewDrive(drive);
```

### Generating Interview Tokens
```javascript
const tokenData = {
  id: Date.now().toString(),
  candidateId: 'candidate1',
  driveId: 'drive1',
  companyId: 'hireog',
  token: 'base64-encoded-token',
  used: false,
  createdAt: new Date().toISOString()
};

await addInterviewToken(tokenData);
```

### Storing Interview Responses
```javascript
const response = {
  candidateId: 'candidate1',
  driveId: 'drive1',
  companyId: 'hireog',
  token: 'interview-token',
  answers: ['Answer 1', 'Answer 2', 'Answer 3'],
  submittedAt: new Date().toISOString()
};

await addInterviewResponse(response);
```

## Benefits of MongoDB Storage

### ✅ **Persistent Data**
- Data survives server restarts
- Data persists across deployments
- No data loss on cold starts

### ✅ **Scalable**
- Multiple Vercel instances can access same data
- Handles concurrent requests
- Proper data consistency

### ✅ **Queryable**
- Complex queries for analytics
- Filter by company, date, status
- Aggregation pipelines for reports

### ✅ **Reliable**
- ACID transactions
- Data backup and recovery
- Professional data management

## API Endpoints

All company API endpoints now use MongoDB:

- `POST /api/company/candidates` - Add candidate to MongoDB
- `GET /api/company/dashboard` - Get data from MongoDB
- `PUT /api/company/candidates/[id]` - Update candidate in MongoDB
- `DELETE /api/company/candidates/[id]` - Delete candidate from MongoDB
- `POST /api/company/drives` - Create drive in MongoDB
- `POST /api/company/drives/[id]/send-links` - Generate tokens in MongoDB
- `GET /api/company/interview/[token]` - Get token data from MongoDB
- `POST /api/company/interview/[token]/submit` - Store response in MongoDB

## Testing

1. **Add Candidate**: Data stored in MongoDB
2. **Create Drive**: Drive stored in MongoDB
3. **Generate Links**: Tokens stored in MongoDB
4. **Take Interview**: Response stored in MongoDB
5. **View Dashboard**: Data retrieved from MongoDB

All company data is now properly persisted in MongoDB! 🎉
