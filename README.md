# Frontend Pitstop

A comprehensive platform for mastering frontend interviews with real questions, interactive code editor, and AI-powered features.

## Features

- **Problems**: 500+ curated frontend interview questions
- **System Design Simulator**: Step-by-step interactive scenarios
- **Personalized Prep Plans**: Adaptive study plans by experience level
- **Community Solutions**: Share and learn from peer solutions
- **Progress Tracking**: Leaderboards and achievement system
- **Quiz & Trivia**: Quick revision sessions
- **Mock Interviews**: Schedule and record practice interviews
- **Live Code Editor**: HTML/CSS/JS editor with live preview and console logs
- **AI Code Review**: Get instant feedback on your solutions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Running both frontend (Next.js) and backend (Express)

### Installation

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Application

1. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:5000

2. **Start Frontend** (Terminal 2)
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000

### Environment Variables

Create `.env.local` in the root directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Backend `.env` is already configured in `backend/.env`

## Authentication

- Sign Up: http://localhost:3000/signup
- Sign In: http://localhost:3000/signin

User data is stored in-memory (replace with database in production).

## Tech Stack

**Frontend:**
- Next.js 15 with App Router
- React 19
- TailwindCSS 4
- TypeScript

**Backend:**
- Express.js
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

## Project Structure

```
frontendpitstop/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # Reusable components
│   ├── context/          # Auth context
│   └── data/             # Problem data
├── backend/
│   ├── routes/           # API routes
│   └── server.js         # Express server
└── public/               # Static assets
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT
