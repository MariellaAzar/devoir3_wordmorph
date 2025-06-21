import React from 'react';

const Leaderboard = () => {
  const scores = JSON.parse(localStorage.getItem('morph_scores') || '[]')
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div>
      <h2>🏆 High Scores</h2>
      <ul>
        {scores.map((s, i) => (
          <li key={i}>{s.score} pts – {s.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
