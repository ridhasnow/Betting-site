// src/pages/Casino.jsx
import React from "react";

const games = [
  {
    name: "Slot 5 Lions",
    path: "/casino/slot-5lions",
    img: "/bet-affiche.png", // استبدلها بصورة مناسبة لكل لعبة
  },
  {
    name: "Big Bass Bonanza",
    path: "/casino/big-bass-bonanza",
    img: "/cazabet.png", // استبدلها بصورة مناسبة للعبة أو صورة افتراضية
  },
];

const Casino = () => (
  <div>
    <h1>🎰 ألعاب الكازينو</h1>
    <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", justifyContent: "center" }}>
      {games.map((game) => (
        <div key={game.name} style={{ border: "1px solid #ccc", borderRadius: "12px", padding: "16px", textAlign: "center", width: "180px", background: "#fafafa" }}>
          <img src={game.img} alt={game.name} style={{ width: "100%", borderRadius: "10px", marginBottom: "10px" }} />
          <div style={{ fontWeight: "bold", marginBottom: "12px" }}>{game.name}</div>
          <a href={game.path} target="_blank" rel="noopener noreferrer">
            <button style={{ padding: "8px 18px", borderRadius: "7px", background: "#ffe17b", fontWeight: "bold", border: "none", cursor: "pointer" }}>
              إلعب الآن
            </button>
          </a>
        </div>
      ))}
    </div>
  </div>
);

export default Casino;
