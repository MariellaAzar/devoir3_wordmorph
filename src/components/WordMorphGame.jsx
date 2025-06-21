import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import LanguageSelector from './LanguageSelector';

const EN_WORDS = ["cat", "bat", "rat", "hat", "mat", "fat", "dog", "fog", "log", "bog"];
const FR_WORDS = ["mur", "pur", "sur", "dur", "tur", "bur", "fou", "loup", "lait", "fait"];

const getDictionary = (lang, difficulty) => {
  const list = lang === 'en' ? EN_WORDS : FR_WORDS;
  return difficulty === 'long' ? list.filter(w => w.length > 3) : list.filter(w => w.length <= 3);
};

const oneLetterDiff = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff === 1;
};

const getNextWord = (current, used, dict) => {
  const options = dict.filter(word => !used.includes(word) && oneLetterDiff(current, word));
  return options[Math.floor(Math.random() * options.length)] || null;
};

function WordMorphGame() {
  const [language, setLanguage] = useState('en');
  const [difficulty, setDifficulty] = useState('short');
  const [started, setStarted] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [score, setScore] = useState(null);
  const [showWin, setShowWin] = useState(false);

  const morphCount = 4;

  const startGame = () => {
    const dict = getDictionary(language, difficulty);
    const first = dict[Math.floor(Math.random() * dict.length)];
    let temp = [first];
    setSequence([first]);
    setCurrentWord(first);
    setStarted(true);
    setShowInput(false);
    setInput('');
    setResult('');
    setScore(null);
    setShowWin(false);

    let next = first;
    let count = 1;

    const interval = setInterval(() => {
      const newWord = getNextWord(next, temp, dict);
      if (!newWord || count >= morphCount) {
        clearInterval(interval);
        setShowInput(true);
        return;
      }
      temp.push(newWord);
      setSequence([...temp]);
      setCurrentWord(newWord);
      next = newWord;
      count++;
    }, 1200);
  };

  const handleSubmit = () => {
    const entries = input.split(',').map(w => w.trim().toLowerCase());
    let correct = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (entries[i] === sequence[i]) correct++;
    }
    const points = correct * 10;
    setResult(`${correct}/${sequence.length} correct`);
    setScore(points);
    setShowWin(correct === sequence.length);

    const saved = JSON.parse(localStorage.getItem('morph_scores') || '[]');
    saved.push({ score: points, date: new Date().toLocaleString() });
    localStorage.setItem('morph_scores', JSON.stringify(saved));
  };

  return (
    <div className="game">
      <h1 className="logo">W★RD M★RPH</h1>

      {!started && (
        <>
          <LanguageSelector value={language} setValue={setLanguage} />
          <div className="difficulty">
            <label>Difficulté:</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="short">Short Words</option>
              <option value="long">Long Words</option>
            </select>
          </div>
          <button onClick={startGame}>Play</button>
        </>
      )}

      {started && <div className="word">{currentWord}</div>}

      {showInput && (
        <div className="recall">
          <p>Type the words you remember (comma separated):</p>
          <textarea value={input} onChange={e => setInput(e.target.value)} />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}

      {result && <div className="result">
        <p>{result}</p>
        <p>Your score: {score}</p>
        {showWin
          ? <img src="/win.png" alt="Win" className="feedback-img" />
          : <img src="/lose.png" alt="Lose" className="feedback-img" />}
        <button onClick={() => setStarted(false)}>Restart</button>
      </div>}

      <Leaderboard />
    </div>
  );
}

export default WordMorphGame;
