require('dotenv').config();
const db = require('../config/db');

// Assign rankScore and rank for seeded dummy users so they appear on leaderboard
(async () => {
  try {
    const users = await db.getUsers();
    if (!users || users.length === 0) {
      console.log('No users found. Run seed-users.js first.');
      process.exit(0);
    }

    // Identify dummy users we created (heuristic: password === 'Pass@1234')
    const dummy = users.filter(u => u.password === 'Pass@1234');
    if (dummy.length === 0) {
      console.log('No dummy users detected. Nothing to rank.');
      process.exit(0);
    }

    // Generate deterministic scores for stability across runs
    function pseudoRandom(id) {
      let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h;
    }

    const scored = dummy.map(u => {
      const r = pseudoRandom(u.id);
      const problemsSolved = 10 + (r % 50); // 10..59
      const quizzesTaken = 1 + (Math.floor(r / 7) % 10); // 1..10
      const avgScore = 60 + (Math.floor(r / 13) % 40); // 60..99
      const problemScore = problemsSolved * 10;
      const quizScore = quizzesTaken * 5 + (avgScore / 10);
      const rankScore = Math.round(problemScore + quizScore);
      return { user: u, rankScore, problemsSolved };
    });

    // Sort and assign ranks
    scored.sort((a, b) => b.rankScore - a.rankScore);
    for (let i = 0; i < scored.length; i++) {
      const { user, rankScore, problemsSolved } = scored[i];
      await db.updateUser(user.id, { rankScore, rank: i + 1, totalSolved: problemsSolved });
    }

    console.log(`✅ Updated ranks for ${scored.length} dummy users.`);
    process.exit(0);
  } catch (e) {
    console.error('✗ Failed to update user ranks:', e);
    process.exit(1);
  }
})();


