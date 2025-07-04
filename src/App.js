import React, { useState, useEffect } from "react";
import "./App.css";
import { FaHome, FaSignInAlt, FaFutbol, FaDice, FaGem, FaGamepad } from "react-icons/fa";
import { GiSpinningWheel } from "react-icons/gi";
import { MdOutlineSportsSoccer } from "react-icons/md";

// صور السلايدر
const sliderImages = [
  "/bet-affiche.jpg",
  "/bet-affiche2.jpg",
  "/bet-affiche3.jpg"
];

// بيانات المربعات
const gridButtons = [
  {
    title: "Paris En Ligne",
    icon: <MdOutlineSportsSoccer size={40} color="#2176c1" />,
    live: true, // لإظهار النقطة الحمراء
  },
  {
    title: "Jeux De Casino",
    icon: <FaDice size={40} color="#2176c1" />,
  },
  {
    title: "Paris Sportif",
    icon: <FaFutbol size={40} color="#2176c1" />,
  },
  {
    title: "Jeux Virtuels",
    icon: <FaGamepad size={40} color="#2176c1" />,
  },
  {
    title: "Roue de la Fortune",
    icon: <GiSpinningWheel size={40} color="#2176c1" />,
  },
  {
    title: "Casino En Direct",
    icon: <FaGem size={40} color="#2176c1" />,
  },
];

function App() {
  // سلايدر الصور
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // فتح قائمة مباريات لايف
  const [showLive, setShowLive] = useState(false);
  // بيانات مباريات لايف (وهمية حالياً)
  const liveMatches = [
    {
      teams: "Tunisia vs Algeria",
      time: "45'",
      odds: [
        { label: "1", value: 2.2 },
        { label: "X", value: 2.7 },
        { label: "2", value: 2.9 },
      ],
    },
    {
      teams: "France vs Morocco",
      time: "22'",
      odds: [
        { label: "1", value: 1.9 },
        { label: "X", value: 3.1 },
        { label: "2", value: 3.0 },
      ],
    },
  ];

  return (
    <div className="main-wrapper">
      {/* Header */}
      <header className="header header-black">
        <span className="header-title">Accueil</span>
        <img src="/cazabet.png" alt="Cazabet Logo" className="header-logo" />
      </header>

      {/* Slider */}
      <div className="slider-holder">
        <img
          src={sliderImages[current]}
          alt="affiche"
          className="slider-img"
        />
      </div>

      {/* Grid */}
      <main className="grid-container grid-3">
        {gridButtons.map((btn, idx) => (
          <div
            className="grid-item grid-white"
            key={idx}
            onClick={() => btn.title === "Paris En Ligne" && setShowLive(true)}
          >
            <div className="icon-holder">
              {btn.icon}
              {btn.live && (
                <span className="live-dot" />
              )}
            </div>
            <div className="title">{btn.title}</div>
          </div>
        ))}
      </main>

      {/* Pop-up Live Matches */}
      {showLive && (
        <div className="live-popup">
          <div className="live-popup-content">
            <h3>Live Matches</h3>
            <button className="close-btn" onClick={() => setShowLive(false)}>×</button>
            <div className="live-matches-list">
              {liveMatches.map((match, i) => (
                <div className="live-match-row" key={i}>
                  <div className="teams">{match.teams}</div>
                  <div className="time">{match.time}</div>
                  <div className="odds">
                    {match.odds.map((odd, j) => (
                      <button className="odd-btn" key={j}>{odd.label}<span>{odd.value}</span></button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        <div className="nav-btn">
          <FaHome size={28} />
          <span>Home</span>
        </div>
        <div className="nav-btn">
          <FaSignInAlt size={28} />
          <span>Login</span>
        </div>
        <div className="nav-btn">
          <FaFutbol size={28} />
          <span>Paris Sportif</span>
        </div>
      </nav>
    </div>
  );
}

export default App;
