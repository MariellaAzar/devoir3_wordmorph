import React, { useEffect, useState, useRef } from 'react';
import '../styles/LandingPage.css';

import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import playButton from '../assets/play-button.PNG';
import startBtn from '../assets/img-start.png';
import helpIcon from '../assets/interro-img.png';
import exitIcon from '../assets/img-exit.png';
import footerImg from '../assets/footer-img.png';
import { useCallback } from "react";

import winImg from '../assets/win.png';
import loseImg from '../assets/lose.png';
import winSoundFile from '../assets/win.MP3';
import loseSoundFile from '../assets/lose.MP3';
import confetti from 'canvas-confetti';

import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


const wordDict = {
  EN: {
    fruits: {
      easy: ['fig', 'pea', 'yam'],
      medium: ['apple', 'grape', 'mango', 'lemon', 'melon'],
      hard: ['avocado', 'papaya', 'durian', 'pumpkin', 'cherry'],
      insane: ['pomegranate', 'starfruit', 'watermelon', 'cranberries', 'grapefruit']
    },
    animals: {
      easy: ['cat', 'dog', 'fox'],
      medium: ['zebra', 'horse', 'shark', 'otter', 'eagle'],
      hard: ['dolphin', 'leopard', 'crocodile', 'panther', 'buffalo'],
      insane: ['alligatoridae', 'orangutaness', 'hippopotamus']
    },
    objects: {
      easy: ['pen', 'cup', 'key'],
      medium: ['table', 'chair', 'phone', 'watch', 'glass'],
      hard: ['printer', 'cabinet', 'backpack', 'notebook', 'umbrella'],
      insane: ['refrigerator', 'microwaveoven', 'televisionset']
    }
  },
  FR: {
    fruits: {
      easy: ['fig', 'riz', 'mûr'],
      medium: ['pomme', 'raisin', 'melon', 'banan', 'ceris'],
      hard: ['avocat', 'papaye', 'citron', 'potiron', 'cerise'],
      insane: ['pomme grenade', 'carambole', 'pastèque', 'canneberge', 'pamplemousse']
    },
    animals: {
      easy: ['rat', 'chat', 'pie'],
      medium: ['zèbre', 'cheval', 'requin', 'loutre', 'aigle'],
      hard: ['dauphin', 'léopard', 'crocodile', 'panthère', 'buffle'],
      insane: ['alligatorid', 'orang-outan', 'hippopotam']
    },
    objects: {
      easy: ['sty', 'tasse', 'clé'],
      medium: ['table', 'chaise', 'téléph', 'montre', 'verre'],
      hard: ['impriman', 'armoire', 'sac à dos', 'carnet', 'parapluie'],
      insane: ['réfrigéra', 'micro-ondes', 'téléviseur']
    }
  }
};

function LandingPage() {
  const [mistakes, setMistakes] = useState(0);

  const [step, setStep] = useState("landing");
  const [showSecondLogo, setShowSecondLogo] = useState(false);
  const [language, setLanguage] = useState('EN');

  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const [wordSequence, setWordSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');

  const [recallAnswers, setRecallAnswers] = useState([]);

  const [isWin, setIsWin] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  const winSound = useRef(null);
  const loseSound = useRef(null);

  const isFR = language === 'FR';

  useEffect(() => {
    if (step === 'landing') {
      const timer = setTimeout(() => {
        setShowSecondLogo(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'game') {
      let wordsToDisplay = 3;
      let delay = 2000;

      switch (difficulty) {
        case 'easy':
          wordsToDisplay = 3;
          delay = 2000;
          break;
        case 'medium':
          wordsToDisplay = 5;
          delay = 1500;
          break;
        case 'hard':
          wordsToDisplay = 7;
          delay = 1000;
          break;
        case 'insane':
          wordsToDisplay = 10;
          delay = 500;
          break;
        default:
          wordsToDisplay = 3;
          delay = 2000;
      }

      const catDict = wordDict[language]?.[category];
      if (!catDict) {
        alert(isFR ? "Catégorie invalide" : "Invalid category");
        setStep('selection');
        return;
      }

      const wordsList = catDict[difficulty];
      if (!wordsList || wordsList.length === 0) {
        alert(isFR ? "Difficulté invalide" : "Invalid difficulty");
        setStep('selection');
        return;
      }

      const sequence = wordsList.slice(0, wordsToDisplay);

      setWordSequence(sequence);
      setCurrentIndex(0);
      setCurrentWord(sequence[0]);
      setStartTime(Date.now());

      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= sequence.length) {
            clearInterval(interval);
            setTimeout(() => {
              setRecallAnswers(Array(sequence.length).fill(''));
              setStep('recall');
            }, 1000);
            return prev;
          } else {
            setCurrentWord(sequence[nextIndex]);
            return nextIndex;
          }
        });
      }, delay);

      return () => clearInterval(interval);
    }
  }, [step, difficulty, category, language, isFR]);

  // Calculate score helper
  const calculateScore = (mistakesCount, startTimeValue) => {
    const timeTaken = (Date.now() - startTimeValue) / 1000; // seconds
    const baseScore = (wordSequence.length - mistakesCount) * 10;
    const timeBonus = Math.max(0, 100 - timeTaken); // max 100 bonus points
    return Math.round(baseScore + timeBonus);
  };

  // Fetch best score from Firebase
const fetchBestScore = useCallback(async () => {
  if (!category || !difficulty) return;
  try {
    const docRef = doc(db, "leaderboard", `${language}-${category}-${difficulty}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setBestScore(docSnap.data().bestScore);
    } else {
      setBestScore(null);
    }
  } catch (error) {
    console.error("Fetch best score error:", error);
  }
}, [category, difficulty, language]);


  // Save best score if better
  const saveBestScore = async (newScore) => {
    try {
      const docRef = doc(db, "leaderboard", `${language}-${category}-${difficulty}`);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || newScore > docSnap.data().bestScore) {
        await setDoc(docRef, { bestScore: newScore });
        setBestScore(newScore);
      }
    } catch (error) {
      console.error("Save best score error:", error);
    }
  };

useEffect(() => {
  fetchBestScore();
}, [fetchBestScore]);

  const handleRecallChange = (index, value) => {
    const newAnswers = [...recallAnswers];
    newAnswers[index] = value.toLowerCase();
    setRecallAnswers(newAnswers);
  };

  const isValidInput = (word) => /^[\p{L}]+$/u.test(word);

  const handleRecallSubmit = () => {
    if (recallAnswers.some(ans => !ans || !isValidInput(ans))) {
      alert(isFR
        ? "Veuillez remplir tous les champs avec uniquement des lettres."
        : "Please fill all fields with letters only.");
      return;
    }

    let mistakesCount = 0;
    for (let i = 0; i < wordSequence.length; i++) {
      if ((recallAnswers[i] || '').trim().toLowerCase() !== wordSequence[i].toLowerCase()) {
        mistakesCount++;
      }
    }

    setMistakes(mistakesCount);
    const newScore = calculateScore(mistakesCount, startTime);
    setScore(newScore);
    setIsWin(mistakesCount === 0);

    saveBestScore(newScore);

    setStep('result');
  };

  const handleRecallKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (recallAnswers.some(ans => !ans || !isValidInput(ans))) {
        alert(isFR ? "Veuillez remplir tous les champs avec uniquement des lettres." : "Please fill all fields with letters only.");
        return;
      }
      handleRecallSubmit();
    }
  };

  const handleRestart = () => {
    setStep('landing');
    setCategory('');
    setDifficulty('');
    setShowHelp(false);
    setShowSecondLogo(false);
    setWordSequence([]);
    setCurrentIndex(0);
    setCurrentWord('');
    setRecallAnswers([]);
    setIsWin(false);
    setScore(0);
    setMistakes(0);
  };

  useEffect(() => {
    if (step === 'result') {
      if (isWin) {
        confetti();
        winSound.current?.play();
      } else {
        loseSound.current?.play();
      }
    }
  }, [step, isWin]);

  const handleExitClick = () => {
    setShowHelp(false);
    setShowSecondLogo(true);
    setStep('landing');
    setCategory('');
    setDifficulty('');
    setRecallAnswers([]);
  };

  return (
    <div className="landing-page">
      <header className="navbar">
        <img
          src={logo1}
          alt="Logo 1"
          className="logo-small clickable-logo"
          onClick={() => window.location.reload()}
        />
        <div className="navbar-title">
          <span className="title-part roboto-28">Welcome</span>{' '}
          <span className="title-part roboto-24">to</span>{' '}
          <span className="title-part scope-24">(the best memory game)</span>{' '}
          <span className="title-part roboto-28">Word Morph!</span>
        </div>
        <div className="lang-toggle">
          <button className={`lang-btn ${isFR ? 'selected' : ''}`} onClick={() => setLanguage('FR')}>FR</button>
          <button className={`lang-btn ${!isFR ? 'selected' : ''}`} onClick={() => setLanguage('EN')}>EN</button>
        </div>
      </header>

      <main className="main-content">
        <div className="black-box">
          {step === 'landing' && (
            !showSecondLogo ? (
              <img src={logo1} alt="Logo 1" className="logo-large" />
            ) : (
              <div className="logo-transition">
                <img src={logo2} alt="Logo 2" className="logo-large" />
                <img
                  src={playButton}
                  alt="Play Button"
                  className="play-button"
                  onClick={() => setStep("selection")}
                />
              </div>
            )
          )}

          {step === 'selection' && (
            <div className="inner-pink-box">
              <div className="category-selection-content">
                <h2 className="subtitle">{isFR ? 'Catégorie' : 'Category'}</h2>
                <select
                  className="dropdown"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">{isFR ? 'Choisissez une catégorie' : 'Choose a category'}</option>
                  <option value="fruits">{isFR ? 'Fruits' : 'Fruits'}</option>
                  <option value="animals">{isFR ? 'Animaux' : 'Animals'}</option>
                  <option value="objects">{isFR ? 'Objets' : 'Objects'}</option>
                </select>

                <h2 className="subtitle">{isFR ? 'Difficulté' : 'Difficulty'}</h2>
                <select
                  className="dropdown"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="">{isFR ? 'Choisissez une difficulté' : 'Choose a difficulty'}</option>
                  <option value="easy">{isFR ? 'Facile' : 'Easy'}</option>
                  <option value="medium">{isFR ? 'Moyenne' : 'Medium'}</option>
                  <option value="hard">{isFR ? 'Difficile' : 'Hard'}</option>
                  <option value="insane">{isFR ? 'Démentielle' : 'Insane'}</option>
                </select>

                <img
                  src={startBtn}
                  alt="Start"
                  className="start-button"
                  onClick={() => {
                    if (category && difficulty) {
                      setStep('game');
                    } else {
                      alert(isFR ? "Choisissez une catégorie et une difficulté" : "Please choose a category and difficulty");
                    }
                  }}
                />
              </div>

              <img
                src={helpIcon}
                alt="Help"
                className="help-icon"
                onClick={() => setShowHelp(!showHelp)}
              />

              <img
                src={exitIcon}
                alt="Exit"
                className="exit-button"
                onClick={handleExitClick}
              />

              {showHelp && (
                <div className="help-popup">
                  <p>{isFR
                    ? "Choisissez un thème et une difficulté. Cliquez ensuite sur Démarrer pour commencer à mémoriser des mots qui changent (morph) ! Plus la difficulté est élevée, plus les mots sont longs et moins vous avez de temps pour les mémoriser."
                    : "Choose a theme and a difficulty. Then click Start to begin memorizing words that morph! The higher the difficulty, the longer the words are and the less time you have to memorize them."}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'game' && (
            <div className="game-screen">
              <h2 className="game-subtitle">{isFR ? "MOT ACTUEL" : "CURRENT WORD"}</h2>
              <div className="current-word-display">{currentWord.toUpperCase()}</div>

              <h2 className="game-subtitle">{isFR ? "MOTS PRÉCÉDENTS" : "PREVIOUS WORDS"}</h2>
              <div className="previous-words">
                {wordSequence.slice(0, currentIndex).map((word, index) => (
                  <div key={index} className="word-chip">
                    {word.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'recall' && (
            <div className="recall-screen">
              <h2 className="game-subtitle">{isFR ? "Rappelez-vous les mots" : "Recall the words"}</h2>
              <p className="recall-instruction">
                {isFR
                  ? "Tapez chaque mot dans l'ordre correct. Un mot par champ."
                  : "Type each word in the correct order. One word per field."}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRecallSubmit();
                }}
                onKeyDown={handleRecallKeyDown}
              >
                <div className="recall-inputs-vertical">
                  {wordSequence.map((word, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={word.length}
                      className="recall-word-input"
                      placeholder={`#${idx + 1}`}
                      value={recallAnswers[idx] || ''}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        if (/^[\p{L}]*$/u.test(val)) {
                          handleRecallChange(idx, val);
                        }
                      }}
                      spellCheck={false}
                      autoComplete="off"
                      aria-label={isFR ? `Mot numéro ${idx + 1}` : `Word number ${idx + 1}`}
                    />
                  ))}
                </div>

                <button type="submit" className="submit-recall-button">
                  {isFR ? "Valider" : "Submit"}
                </button>
              </form>

              <img
                src={exitIcon}
                alt="Exit"
                className="exit-button"
                onClick={handleExitClick}
              />
            </div>
          )}

          {step === 'result' && (
            <div className="result-screen">
              <img
                src={isWin ? winImg : loseImg}
                alt={isWin ? (isFR ? "Vous avez gagné" : "You Win") : (isFR ? "Vous avez perdu" : "You Lose")}
                className="result-image"
              />
              <button className="restart-button" onClick={handleRestart}>
                {isFR ? "Rejouer" : "Play Again"}
              </button>
              <p className="score-text">
                {isFR ? `Score : ${score} | Meilleur : ${bestScore ?? '...'}` : `Score: ${score} | Best: ${bestScore ?? '...'}`}
              </p>
              {!isWin && (
                <p className="mistake-text">
                  {isFR
                    ? `Vous avez fait ${mistakes} erreur(s)`
                    : `You made ${mistakes} mistake(s)`}
                </p>
              )}

              <audio ref={winSound} src={winSoundFile} />
              <audio ref={loseSound} src={loseSoundFile} />
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p className="footer-text">
          Made with ❤️ by User 01100001 01101110 01101111 01101110 01111001 01101101 01100101
        </p>
        <img src={footerImg} alt="Cute rectangle" className="footer-img" />
      </footer>
    </div>
  );
}

export default LandingPage;