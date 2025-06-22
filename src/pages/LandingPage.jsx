import React, { useEffect, useState } from 'react';
import '../styles/LandingPage.css';

import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import playButton from '../assets/play-button.PNG';
import footerImg from '../assets/footer-img.png';

function LandingPage() {
  const [showSecondLogo, setShowSecondLogo] = useState(false);
  const [language, setLanguage] = useState('EN'); // Default language

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSecondLogo(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="navbar">
        <img
          src={logo1}
          alt="Logo 1"
          className="logo-small clickable-logo"
          onClick={handleLogoClick}
        />

        <div className="navbar-title">
          <span className="title-part roboto-28">Welcome</span>{' '}
          <span className="title-part roboto-24">to</span>{' '}
          <span className="title-part scope-24">(the best memory game)</span>{' '}
          <span className="title-part roboto-28">Word Morph!</span>
        </div>

        <div className="lang-toggle">
          <button
            className={`lang-btn ${language === 'FR' ? 'selected' : ''}`}
            onClick={() => setLanguage('FR')}
          >
            FR
          </button>
          <button
            className={`lang-btn ${language === 'EN' ? 'selected' : ''}`}
            onClick={() => setLanguage('EN')}
          >
            EN
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <div className="black-box">
          {!showSecondLogo ? (
            <img src={logo1} alt="Logo 1" className="logo-large" />
          ) : (
            <div className="logo-transition">
              <img src={logo2} alt="Logo 2" className="logo-large" />
              <img
                src={playButton}
                alt="Play Button"
                className="play-button"
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
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
