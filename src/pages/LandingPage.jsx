import React, { useEffect, useState, useRef } from 'react';
import '../styles/LandingPage.css';

import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import playButton from '../assets/play-button.PNG';
import startBtn from '../assets/img-start.png';
import helpIcon from '../assets/interro-img.png';
import exitIcon from '../assets/img-exit.png';
import footerImg from '../assets/footer-img.png';

import winImg from '../assets/win.png';
import loseImg from '../assets/lose.png';
import winSoundFile from '../assets/win.MP3';
import loseSoundFile from '../assets/lose.MP3';

function LandingPage() {
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

  const winSound = useRef(null);
  const loseSound = useRef(null);

  const isFR = language === 'FR';

  const wordDict = {
    EN: {
      fruits: {
        easy: ['fig', 'pea', 'yam'],
        medium: ['apple', 'grape', 'mango', 'lemon', 'melon'],
        hard: ['avocado', 'papaya', 'durian', 'pumpkin', 'cherry'],
        insane: ['pomegranate', 'blackcurrant', 'watermelon', 'cranberries']
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
        insane: ['grenadefruit', 'cassisnoir', 'pastèquefr', 'canneberge']
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

  const handleRecallChange = (index, value) => {
    const newAnswers = [...recallAnswers];
    newAnswers[index] = value.toLowerCase();
    setRecallAnswers(newAnswers);
  };

  const handleRecallSubmit = () => {
    let won = true;
    for (let i = 0; i < wordSequence.length; i++) {
      if ((recallAnswers[i] || '').trim().toLowerCase() !== wordSequence[i].toLowerCase()) {
        won = false;
        break;
      }
    }
    setIsWin(won);
    setStep('result');
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
  };

  useEffect(() => {
    if (step === 'result') {
      if (isWin) {
        winSound.current?.play();
      } else {
        loseSound.current?.play();
      }
    }
  }, [step, isWin]);

  const isValidInput = (word) => /^[a-zA-Z]+$/.test(word);

  // Handle enter key to submit recall form
  const handleRecallKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // validate inputs before submit
      if (recallAnswers.some(ans => !ans || !isValidInput(ans))) {
        alert(isFR ? "Veuillez remplir tous les champs avec uniquement des lettres." : "Please fill all fields with letters only.");
        return;
      }
      handleRecallSubmit();
    }
  };

  // EXIT button handler: returns to landing screen, reset variables
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
                    ? "Choisissez un thème et une difficulté. Ensuite, cliquez sur Start pour commencer à mémoriser des mots qui changent lettre par lettre !"
                    : "Choose a theme and a difficulty. Then click Start to begin memorizing words that morph letter by letter!"}
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
                  if (recallAnswers.some(ans => !ans || !isValidInput(ans))) {
                    alert(isFR ? "Veuillez remplir tous les champs avec uniquement des lettres." : "Please fill all fields with letters only.");
                    return;
                  }
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
                        // Only allow letters, max length enforced by maxLength prop
                        if (/^[\p{L}]*$/u.test(val)) { // \p{L} = any Unicode letter, 'u' = Unicode flag
                            handleRecallChange(idx, val);
                        }

                      }}
                      spellCheck={false}
                      autoComplete="off"
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
