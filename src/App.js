import React, { useState, useEffect } from "react";
import { FaHome, FaFutbol, FaBasketballBall, FaVolleyballBall, FaTableTennis, FaHandPaper } from "react-icons/fa";
import "./App.css";

function App() {
  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % images.length), 2000);
    return () => clearInterval(timer);
  }, []);
  const sports = [
    { name: "Football", icon: <FaFutbol size={22} /> },
    { name: "Basketball", icon: <FaBasketballBall size={22} /> },
    { name: "Handball", icon: <FaHandPaper size={22} /> },
    { name: "Volleyball", icon: <FaVolleyballBall size={22} /> },
    { name: "Tennis", icon: <FaTableTennis size={22} /> },
  ];
  const matches = [
    {
      id: 1,
      teams: "FC Utrecht (Res.) vs Rodinghausen",
      status: "LIVE",
      time: "83'",
      league: "Club Friendly Game",
      odds: [31.0, 4.75, 1.20],
      scores: [0, 1]
    },
    {
      id: 2,
      teams: "Livingston vs Aris",
      status: "LIVE",
      time: "75'",
      league: "Club Friendly Game",
      odds: [1.61, 3.44, 5.20],
      scores: [1, 0]
    },
  ];
  const tournaments = [
    { name: "Champions League", matches: 4 },
    { name: "Premier League", matches: 3 },
    { name: "La Liga", matches: 2 },
  ];

  return (
    <div className="app-root">
      <header className="header">
        <div className="logo">CAZABET</div>
        <button className="login-btn">Login</button>
      </header>
      <div className="slider-container">
        <img className="slider-img" src={images[index]} alt="Slider" />
      </div>
      <div className="main-navbar">
        <button className="nav-btn">
          <FaHome size={22} />
        </button>
        <button className="nav-btn live-btn">
          <span className="live-dot"></span>
          LIVE
        </button>
      </div>
      <div className="sports-bar">
        {sports.map((sport) => (
          <button className="sport-btn" key={sport.name}>
            {sport.icon}
            <span className="sport-text">{sport.name}</span>
          </button>
        ))}
      </div>
      <div className="matches-section">
        <div className="section-title">Live Football Matches</div>
        <div className="matches-list">
          {matches.map((m) => (
            <div className="match-card" key={m.id}>
              <div className="match-header">
                <span className="match-status">{m.status}</span>
                <span className="match-time">{m.time}</span>
                <span className="match-league">{m.league}</span>
              </div>
              <div className="match-teams">{m.teams}</div>
              <div className="odds-row">
                <div className="odd-btn">{m.odds[0]}</div>
                <div className="odd-btn">{m.odds[1]}</div>
                <div className="odd-btn">{m.odds[2]}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="section-title">Tournaments</div>
        <div className="tournaments-list">
          {tournaments.map((t, idx) => (
            <div className="tournament-card" key={idx}>
              <span className="tournament-name">{t.name}</span>
              <span className="tournament-matches">{t.matches} matches</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
