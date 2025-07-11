import React, { useState, useEffect } from "react";
import "./App.css";
import {
  FaFutbol,
  FaStopwatch,
  FaDice,
  FaPlayCircle,
  FaGift,
  FaHorseHead,
  FaHome,
  FaSignInAlt
} from "react-icons/fa";
import AuthSystem from "./AuthSystem";
import ProviderDashboard from "./ProviderDashboard";
import AdminDashboard from "./AdminDashboard";
import PlayerUI from "./PlayerUI";
import { getPlayerByCredentials } from "./playersService";
import { getProviderByCredentials } from "./providersService";

// Router فقط بدون useNavigate هنا!
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { BetCartProvider } from "./BetCartContext";
import ParisSportifsPage from "./ParisSportifsPage";
import MyBetsPage from "./MyBetsPage";

// استدعاء الدوال الجديدة للنتائج المباشرة من sportsApi.js
import { getLiveScoresBySport } from "./sportsApi";

// استيراد صفحة الكازينو
import Casino from "./pages/Casino";
// استيراد ألعاب الكازينو الإضافية
import Slot5LionsGame from "./casino-games/slot-5lions/Slot5LionsGame";
import BigBassBonanza from "./casino-games/slot-big-bass-bonanza/BigBassBonanza";

const sliderImages = [
  "/bet-affiche.png",
  "/bet-affiche2.png",
  "/bet-affiche3.png"
];

const gridButtons = [
  {
    title: "Paris Sportifs",
    icon: <FaFutbol size={50} color="#FFF" />,
    key: "paris-sportifs"
  },
  {
    title: "Paris En Ligne",
    icon: <FaStopwatch size={50} color="#FFF" />,
    live: true,
    key: "paris-en-ligne"
  },
  {
    title: "Jeux De Casino",
    icon: <FaDice size={50} color="#FFF" />,
    key: "jeux-de-casino"
  },
  {
    title: "Casino En Direct",
    icon: <FaPlayCircle size={50} color="#FFF" />,
    key: "casino-en-direct"
  },
  {
    title: "Roue De Bonus",
    icon: <FaGift size={50} color="#FFF" />,
    key: "roue-de-bonus"
  },
  {
    title: "Jeux Virtuels",
    icon: <FaHorseHead size={50} color="#FFF" />,
    key: "jeux-virtuels"
  }
];

function PlayerMainContent({ auth, setAuth, navigate }) {
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

  // تم التعديل: جلب النتائج المباشرة من sportsApi.js (api v2)
  useEffect(() => {
    if (showLive) {
      setLoading(true);
      // يمكنك تغيير sport هنا حسب الحاجة (مثلاً "Soccer", "Basketball", إلخ)
      getLiveScoresBySport("Soccer").then(events => {
        // تحويل بيانات الـ API إلى نفس شكل matches القديم
        const matches = (events || []).slice(0, 10).map(ev => ({
          teams: `${ev.strHomeTeam} vs ${ev.strAwayTeam}`,
          time: ev.strTimestamp ? new Date(ev.strTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
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
      }).catch(() => {
        setLiveMatches([]);
        setLoading(false);
      });
    }
  }, [showLive]);

  const [selectedBet, setSelectedBet] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <PlayerUI user={auth} onLogout={() => setAuth(null)} />
      <div className="slider-holder">
        <img
          src={sliderImages[current]}
          alt="affiche"
          className="slider-img"
        />
      </div>
      <main className="grid-container grid-2">
        {gridButtons.map((btn, idx) => (
          <div
            className={`grid-item grid-blue`}
            key={btn.key}
            onClick={() => {
              if (btn.key === "paris-en-ligne") setShowLive(true);
              if (btn.key === "paris-sportifs") navigate("/paris-sportifs");
              if (btn.key === "jeux-de-casino") navigate("/casino");
            }}
          >
            <div className="icon-holder">
              {btn.icon}
              {btn.live && (
                <span className="live-dot-corner" />
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
              <div style={{ textAlign: "center", color: "#2176c1", marginTop: 30 }}>Loading...</div>
            ) : (
              <div className="live-matches-list">
                {liveMatches.map((match, i) => (
                  <div className="live-match-row" key={i}>
                    <div className="teams">{match.teams}</div>
                    <div className="time">{match.time}</div>
                    <div className="odds">
                      {match.odds.map((odd, j) => (
                        <button
                          className={`odd-btn ${selectedBet === `${i}-${j}` ? "selected" : ""}`}
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
                  <div style={{ textAlign: "center", color: "#999", marginTop: 30 }}>No live matches found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <nav className="bottom-nav">
        <div className="nav-btn" onClick={() => navigate("/")}>
          <FaHome size={28} />
          <span>Home</span>
        </div>
        <div className="nav-btn" onClick={() => setShowLogin(true)}>
          <FaSignInAlt size={28} />
          <span>Login</span>
        </div>
        <div className="nav-btn" onClick={() => navigate("/paris-sportifs")}>
          <FaFutbol size={28} />
          <span>Paris Sportif</span>
        </div>
      </nav>
      {showLogin && !auth && (
        <AuthSystem onLogin={async (acc) => {
          if (acc.role === "admin") { setAuth(acc); setShowLogin(false); return; }
          const provider = await getProviderByCredentials(acc.username, acc.password);
          if (provider) { setAuth({ ...provider, role: "provider" }); setShowLogin(false); return; }
          const player = await getPlayerByCredentials(acc.username, acc.password);
          if (player) { setAuth({ ...player, role: "player" }); setShowLogin(false); return; }
          alert("بيانات الدخول غير صحيحة!");
        }} />
      )}
    </>
  );
}

// نفس التعديل في GuestMainContent:
function GuestMainContent({ current, setCurrent, showLive, setShowLive, liveMatches, setLiveMatches, loading, setLoading, selectedBet, setSelectedBet, auth, setAuth, navigate }) {
  const [showLogin, setShowLogin] = useState(false);

  // تم التعديل: جلب النتائج المباشرة من sportsApi.js (api v2)
  useEffect(() => {
    if (showLive) {
      setLoading(true);
      getLiveScoresBySport("Soccer").then(events => {
        const matches = (events || []).slice(0, 10).map(ev => ({
          teams: `${ev.strHomeTeam} vs ${ev.strAwayTeam}`,
          time: ev.strTimestamp ? new Date(ev.strTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
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
      }).catch(() => {
        setLiveMatches([]);
        setLoading(false);
      });
    }
  }, [showLive, setLiveMatches, setLoading]);

  return (
    <div className="main-wrapper" style={{ background: "#fff" }}>
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
      <main className="grid-container grid-2">
        {gridButtons.map((btn, idx) => (
          <div
            className={`grid-item grid-blue`}
            key={btn.key}
            onClick={() => {
              if (btn.key === "paris-en-ligne") setShowLive(true);
              if (btn.key === "paris-sportifs") navigate("/paris-sportifs");
              if (btn.key === "jeux-de-casino") navigate("/casino");
            }}
          >
            <div className="icon-holder">
              {btn.icon}
              {btn.live && (
                <span className="live-dot-corner" />
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
              <div style={{ textAlign: "center", color: "#2176c1", marginTop: 30 }}>Loading...</div>
            ) : (
              <div className="live-matches-list">
                {liveMatches.map((match, i) => (
                  <div className="live-match-row" key={i}>
                    <div className="teams">{match.teams}</div>
                    <div className="time">{match.time}</div>
                    <div className="odds">
                      {match.odds.map((odd, j) => (
                        <button
                          className={`odd-btn ${selectedBet === `${i}-${j}` ? "selected" : ""}`}
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
                  <div style={{ textAlign: "center", color: "#999", marginTop: 30 }}>No live matches found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <nav className="bottom-nav">
        <div className="nav-btn" onClick={() => navigate("/")}>
          <FaHome size={28} />
          <span>Home</span>
        </div>
        <div className="nav-btn" onClick={() => setShowLogin(true)}>
          <FaSignInAlt size={28} />
          <span>Login</span>
        </div>
        <div className="nav-btn" onClick={() => navigate("/paris-sportifs")}>
          <FaFutbol size={28} />
          <span>Paris Sportif</span>
        </div>
      </nav>
      {showLogin && !auth && (
        <AuthSystem onLogin={async (acc) => {
          if (acc.role === "admin") { setAuth(acc); setShowLogin(false); return; }
          const provider = await getProviderByCredentials(acc.username, acc.password);
          if (provider) { setAuth({ ...provider, role: "provider" }); setShowLogin(false); return; }
          const player = await getPlayerByCredentials(acc.username, acc.password);
          if (player) { setAuth({ ...player, role: "player" }); setShowLogin(false); return; }
          alert("بيانات الدخول غير صحيحة!");
        }} />
      )}
    </div>
  );
}

// هوك صغير لحقن navigate في العناصر الداخلية
function MainRouterWrapper(props) {
  const navigate = useNavigate();
  const {
    current, setCurrent, showLive, setShowLive, liveMatches, setLiveMatches,
    loading, setLoading, selectedBet, setSelectedBet, auth, setAuth
  } = props;
  if (auth?.role === "player")
    return <PlayerMainContent auth={auth} setAuth={setAuth} navigate={navigate} />;
  return <GuestMainContent
    current={current}
    setCurrent={setCurrent}
    showLive={showLive}
    setShowLive={setShowLive}
    liveMatches={liveMatches}
    setLiveMatches={setLiveMatches}
    loading={loading}
    setLoading={setLoading}
    selectedBet={selectedBet}
    setSelectedBet={setSelectedBet}
    auth={auth}
    setAuth={setAuth}
    navigate={navigate}
  />;
}

function App() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const [showLive, setShowLive] = useState(false);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBet, setSelectedBet] = useState(null);

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

  if (auth?.role === "provider") return <ProviderDashboard user={auth} onLogout={() => setAuth(null)} />;
  if (auth?.role === "admin") return <AdminDashboard user={auth} onLogout={() => setAuth(null)} />;

  return (
    <BetCartProvider>
      <Router>
        <Routes>
          <Route path="/paris-sportifs" element={<ParisSportifsPage />} />
          <Route path="/my-bets" element={<MyBetsPage />} />
          <Route path="/casino" element={<Casino />} />
          {/* روت ألعاب الكازينو المنفصلة */}
          <Route path="/casino/slot-5lions" element={<Slot5LionsGame />} />
          <Route path="/casino/big-bass-bonanza" element={<BigBassBonanza />} />
          <Route
            path="*"
            element={
              <MainRouterWrapper
                current={current}
                setCurrent={setCurrent}
                showLive={showLive}
                setShowLive={setShowLive}
                liveMatches={liveMatches}
                setLiveMatches={setLiveMatches}
                loading={loading}
                setLoading={setLoading}
                selectedBet={selectedBet}
                setSelectedBet={setSelectedBet}
                auth={auth}
                setAuth={setAuth}
              />
            }
          />
        </Routes>
      </Router>
    </BetCartProvider>
  );
}

export default App;
