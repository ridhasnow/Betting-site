import React from "react";
import "./App.css";
import { FaHome, FaSignInAlt, FaFutbol, FaDice, FaCasino, FaGamepad, FaWheelchair } from "react-icons/fa";
import { GiSpinningWheel } from "react-icons/gi";
import { MdOutlineSportsSoccer } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";

const gridButtons = [
  {
    title: "Paris En Ligne",
    icon: <MdOutlineSportsSoccer size={48} color="#fff" />,
  },
  {
    title: "Jeux De Casino",
    icon: <FaDice size={48} color="#fff" />,
  },
  {
    title: "Paris Sportif",
    icon: <FaFutbol size={48} color="#fff" />,
  },
  {
    title: "Jeux Virtuels",
    icon: <FaGamepad size={48} color="#fff" />,
  },
  {
    title: "Wheel of Fortune",
    icon: <GiSpinningWheel size={48} color="#fff" />,
  },
  {
    title: "Casino En Direct",
    icon: <FaCasino size={48} color="#fff" />,
  },
];

function App() {
  return (
    <div className="main-wrapper">
      {/* Header */}
      <header className="header">
        <span className="header-title">Accueil</span>
        <span className="header-logo">{/* Logo Placeholder */}</span>
      </header>

      {/* Main grid */}
      <main className="grid-container">
        {gridButtons.map((btn, idx) => (
          <div className="grid-item" key={idx}>
            <div className="icon">{btn.icon}</div>
            <div className="title">{btn.title}</div>
          </div>
        ))}
      </main>

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
