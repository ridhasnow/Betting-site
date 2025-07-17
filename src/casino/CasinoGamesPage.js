import React from "react";
import { useNavigate } from "react-router-dom";

export default function CasinoGamesPage() {
  const navigate = useNavigate();

  const games = [
    { name: "Slot Machine", path: "/casino/slot-machine" },
    { name: "Roulette", path: "/casino/roulette" },
    // أضف ألعابك هنا بسهولة
  ];

  return (
    <div className="casino-page">
      {/* زر الرجوع */}
      <button className="back-btn" onClick={() => navigate("/")}>
        ← رجوع
      </button>
      <h2>قائمة ألعاب الكازينو</h2>
      <ul className="casino-games-list">
        {games.map((game) => (
          <li key={game.path} className="casino-game-item">
            <a href={game.path}>{game.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
