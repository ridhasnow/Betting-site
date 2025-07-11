import React, { useState } from "react";
import "./styles.css";

// مبدئيًا قائمة الرموز مع أسماء الصور (بدون استيراد فعلي بعد، سنعدلها بعد رفع الصور)
const SYMBOLS = [
  { name: "dragon",      label: "تنين",      file: "dragon.png",    type: "high" },
  { name: "phoenix",     label: "طائر",      file: "phoenix.png",   type: "high" },
  { name: "frog",        label: "ضفدع",      file: "frog.png",      type: "high" },
  { name: "fish",        label: "سمكة",      file: "fish.png",      type: "high" },
  { name: "turtle",      label: "سلحفاة",    file: "turtle.png",    type: "high" },
  { name: "lion",        label: "أسد",       file: "lion.png",      type: "wild" },
  { name: "bonus",       label: "يين-يانغ", file: "bonus.png",     type: "scatter" },
  { name: "a",           label: "A",         file: "a.png",         type: "low" },
  { name: "k",           label: "K",         file: "k.png",         type: "low" },
  { name: "q",           label: "Q",         file: "q.png",         type: "low" },
  { name: "j",           label: "J",         file: "j.png",         type: "low" },
  { name: "ten",         label: "10",        file: "ten.png",       type: "low" },
];

// عدد البكرات والصفوف (متغير حسب ميكانيكية Megaways)
const REELS = 6; // في بعض نسخ 5 Lions Megaways تكون 6 بكرات
const MIN_ROWS = 2;
const MAX_ROWS = 7;

function getRandomSymbol() {
  // لا نريد ظهور WILD و SCATTER إلا حسب شروط خاصة (سنضبطها لاحقًا)
  const filtered = SYMBOLS.filter(s => s.type !== "wild" && s.type !== "scatter");
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function generateSpin() {
  // ترجع مصفوفة تمثل البكرات والصفوف (كل بكرة عدد رموز عشوائي)
  let reels = [];
  for (let i = 0; i < REELS; i++) {
    const rows = Math.floor(Math.random() * (MAX_ROWS - MIN_ROWS + 1)) + MIN_ROWS;
    let reel = [];
    for (let j = 0; j < rows; j++) {
      reel.push(getRandomSymbol());
    }
    reels.push(reel);
  }
  return reels;
}

const Slot5LionsGame = () => {
  const [spinResult, setSpinResult] = useState(generateSpin());

  const handleSpin = () => {
    setSpinResult(generateSpin());
  };

  return (
    <div className="slot5lions-container">
      <h2>Slot 5 Lions Megaways</h2>
      <div className="slotmegas-reels">
        {spinResult.map((reel, i) => (
          <div className="slotmegas-reel" key={i}>
            {reel.map((symbol, j) => (
              <div className={`slotmegas-symbol ${symbol.type}`} key={j}>
                {/* لاحقًا سنستبدل النص بصورة */}
                <div>{symbol.label}</div>
                <small>({symbol.file})</small>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="spin-btn" onClick={handleSpin}>Spin</button>
      <div className="slotmegas-note">
        <p>بعد رفع الصور، سنعرض الرموز الحقيقية هنا تلقائيًا.</p>
      </div>
    </div>
  );
};

export default Slot5LionsGame;
