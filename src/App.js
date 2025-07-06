import React, { useState, useEffect } from "react";
import "./App.css";
import { FaHome, FaSignInAlt, FaFutbol } from "react-icons/fa";
import AuthSystem from "./AuthSystem";
import ProviderDashboard from "./ProviderDashboard";
import AdminDashboard from "./AdminDashboard";
import PlayerUI from "./PlayerUI";
import { getPlayerByCredentials } from "./playersService";
import { getProviderByCredentials } from "./providersService";

// صور السلايدر
const sliderImages = [
  "/bet-affiche.png",
  "/bet-affiche2.png",
  "/bet-affiche3.png"
];

// بيانات المربعات
const gridButtons = [
  {
    title: "Paris En Ligne",
    icon: <FaFutbol size={40} color="#FFF" />,
    live: true,
  },
  // ... باقي الأقسام كما عندك
];

const ADMIN_ACCOUNT = {
  username: "ridhasnow",
  password: "azerty12345",
  role: "admin",
  balance: 999999999,
};

function App() {
  // Slider
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Live matches
  const [showLive, setShowLive] = useState(false);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showLive) {
      setLoading(true);
      fetch("https://api.football-data.org/v4/matches?dateFrom=today&dateTo=today", {
        headers: {
          "X-Auth-Token": "c25adbeecce0469e8ff30485070581db",
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

  const [selectedBet, setSelectedBet] = useState(null);

  // Auth system
  const [auth, setAuthRaw] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("auth")) || null;
    } catch { return null; }
  });
  const setAuth = (acc) => {
    setAuthRaw(acc);
    if (acc) sessionStorage.setItem("auth", JSON.stringify(acc));
    else sessionStorage.removeItem("auth");
  };
  const [showLogin, setShowLogin] = useState(false);

  // توجيه حسب الدور
  if (auth?.role === "provider") return <ProviderDashboard user={auth} onLogout={()=>setAuth(null)} />;
  if (auth?.role === "admin") return <AdminDashboard user={auth} onLogout={()=>setAuth(null)} />;
  if (auth?.role === "player") return (
    <>
      <PlayerUI user={auth} onLogout={()=>setAuth(null)} />
      {/* الصفحة الرئيسية كما هي */}
      <div className="slider-holder">
        <img
          src={sliderImages[current]}
          alt="affiche"
          className="slider-img"
        />
      </div>
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
      <nav className="bottom-nav">
        <div className="nav-btn">
          <FaHome size={28} />
          <span>Home</span>
        </div>
        <div className="nav-btn" onClick={() => setShowLogin(true)}>
          <FaSignInAlt size={28} />
          <span>Login</span>
        </div>
        <div className="nav-btn">
          <FaFutbol size={28} />
          <span>Paris Sportif</span>
        </div>
      </nav>
    </>
  );

  // زائر ليس مسجلاً
  return (
    <div className="main-wrapper" style={{background:"#fff"}}>
      <header className="header header-black">
        <span className="header-title">Accueil</span>
        <img src="/cazabet.png" alt="Cazabet Logo" className="header-logo" />
      </header>
      <div className="slider-holder">
        <img
          src={sliderImages[current]}
          alt="affiche"
          className="slider-img"
        />
      </div>
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
      <nav className="bottom-nav">
        <div className="nav-btn">
          <FaHome size={28} />
          <span>Home</span>
        </div>
        <div className="nav-btn" onClick={() => setShowLogin(true)}>
          <FaSignInAlt size={28} />
          <span>Login</span>
        </div>
        <div className="nav-btn">
          <FaFutbol size={28} />
          <span>Paris Sportif</span>
        </div>
      </nav>
      {showLogin && !auth && (
        <AuthSystem onLogin={async (acc) => {
          // دخول أدمن
          if (acc.role === "admin") { setAuth(acc); setShowLogin(false); return; }
          // دخول مزود
          const provider = await getProviderByCredentials(acc.username, acc.password);
          if (provider) { setAuth({ ...provider, role: "provider" }); setShowLogin(false); return; }
          // دخول لاعب
          const player = await getPlayerByCredentials(acc.username, acc.password);
          if (player) { setAuth({ ...player, role: "player" }); setShowLogin(false); return; }
          alert("بيانات الدخول غير صحيحة!");
        }} />
      )}
    </div>
  );
}

export default App;
