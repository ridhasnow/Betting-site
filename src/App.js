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
    icon: <MdOutlineSportsSoccer size={40} color="#FFF" />,
    live: true, // لإظهار النقطة الحمراء
  },
  {
    title: "Jeux De Casino",
    icon: <FaDice size={40} color="#FFF" />,
  },
  {
    title: "Paris Sportif",
    icon: <FaFutbol size={40} color="#FFF" />,
  },
  {
    title: "Jeux Virtuels",
    icon: <FaGamepad size={40} color="#FFF" />,
  },
  {
    title: "Roue de la Fortune",
    icon: <GiSpinningWheel size={40} color="#FFF" />,
  },
  {
    title: "Casino En Direct",
    icon: <FaGem size={40} color="#FFF" />,
  },
];

const FOOTBALL_API_KEY = "c25adbeecce0469e8ff30485070581db";

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

  // جلب مباريات اليوم من football-data.org
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showLive) {
      setLoading(true);
      fetch("https://api.football-data.org/v4/matches?dateFrom=today&dateTo=today", {
        headers: {
          "X-Auth-Token": FOOTBALL_API_KEY,
        },
      })
        .then(res => res.json())
        .then(data => {
          const matches = (data.matches || []).slice(0, 10).map(ev => ({
            teams: `${ev.homeTeam.name} vs ${ev.awayTeam.name}`,
            time: ev.utcDate ? ev.utcDate.slice(11, 16) : "",
            odds: [
              { label: "1", value: (Math.random() * 2 + 1).toFixed(2) },
              { label: "X", value: (Math.random() * 2 + 2).toFixed(2) },
              { label: "2", value: (Math.random() * 2 + 1).toFixed(2) },
              { label: "Over 0.5", value: (Math.random() * 1.5 + 1.1).toFixed(2) },
              { label: "Under 0.5", value: (Math.random() * 1.5 + 1.1).toFixed(2) },
            ],
          }));
          setLiveMatches(matches);
          setLoading(false);
        });
    }
  }, [showLive]);

  // اختيار رهان (للتوضيح فقط)
  const [selectedBet, setSelectedBet] = useState(null);

  return (
    <div className="main-wrapper" style={{background:"#fff"}}>
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
            className={`grid-item grid-blue`}
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
            {loading ? (
              <div style={{textAlign: "center", color: "#2176c1", marginTop: 30}}>Loading...</div>
            ) : (
              <div className="live-matches-list">
                {liveMatches.map((match, i) => (
                  <div className="live-match-row" key={i}>
                    <div className="teams">{match.teams}</div>
                    <div className="time">{match.time}</div>
                    <div className="odds">
                      {match.odds.map((odd, j) => (
                        <button
                          className={`odd-btn ${selectedBet===`${i}-${j}` ? "selected" : ""}`}
                          key={j}
                          onClick={() => setSelectedBet(`${i}-${j}`)}
                        >
                          {odd.label}
                          <span>{odd.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {liveMatches.length === 0 && (
                  <div style={{textAlign: "center", color: "#999", marginTop: 30}}>No live matches found.</div>
                )}
              </div>
            )}
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
