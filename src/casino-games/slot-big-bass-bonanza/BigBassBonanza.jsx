import React, { useState } from "react";
import "./BigBassBonanza.css";

const SYMBOLS = [
  { type: "fish", label: "سمكة", value: 10 },
  { type: "fisherman", label: "صياد", value: 0 },
  { type: "scatter", label: "سكتر", value: 0 },
  { type: "tacklebox", label: "صندوق", value: 20 },
  { type: "rod", label: "سنارة", value: 15 },
  { type: "lure", label: "طعم", value: 12 },
  { type: "letter", label: "A", value: 8 },
  { type: "letter", label: "K", value: 7 },
  { type: "letter", label: "Q", value: 6 },
  { type: "letter", label: "J", value: 5 },
  { type: "letter", label: "10", value: 4 }
];

const REELS = 5;
const ROWS = 3;

function getRandomSymbol() {
  let rand = Math.random();
  if (rand < 0.09) return getSymbol("scatter");
  if (rand < 0.16) return getSymbol("fisherman");
  if (rand < 0.31) return getSymbol("fish", true);
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}
function getSymbol(type, randomFishValue = false) {
  let found = SYMBOLS.filter(s => s.type === type);
  if (type === "fish" && randomFishValue) {
    let v = [10, 15, 20, 25, 50, 100];
    let fish = { ...found[0] };
    fish.value = v[Math.floor(Math.random() * v.length)];
    return fish;
  }
  return { ...found[Math.floor(Math.random() * found.length)] };
}
function getEmptyBoard() {
  let board = [];
  for (let r = 0; r < REELS; r++) {
    let col = [];
    for (let c = 0; c < ROWS; c++) {
      col.push({ type: "letter", label: "A", value: 8 });
    }
    board.push(col);
  }
  return board;
}

export default function BigBassBonanza() {
  const [score, setScore] = useState(1000);
  const [freeSpins, setFreeSpins] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [board, setBoard] = useState(getEmptyBoard());
  const [message, setMessage] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [collectedFish, setCollectedFish] = useState(0);
  const [fishermanCount, setFishermanCount] = useState(0);
  const [showCollect, setShowCollect] = useState(false);

  const drawBoard = (b = null) => {
    return (b || board).map((col, r) => (
      <div className="reel" key={r}>
        {col.map((sym, c) => (
          <div key={c} className={`symbol ${sym.type}`}>
            {sym.label}
            {sym.type === "fish" ? <div>(${sym.value})</div> : ""}
          </div>
        ))}
      </div>
    ));
  };

  function spin() {
    if (isSpinning) return;
    if (freeSpins === 0 && score < 10) {
      setMessage("انتهت نقاطك! أعد تحميل الصفحة للبدء من جديد.");
      return;
    }
    setIsSpinning(true);
    setMessage("");
    setShowCollect(false);

    let newFreeSpins = freeSpins;
    let newScore = score;
    if (freeSpins > 0) {
      newFreeSpins--;
    } else {
      newScore -= 10;
    }

    // تدوير افتراضي
    let spins = 20;
    let intv = setInterval(() => {
      setBoard(getRandomBoard());
      spins--;
      if (spins <= 0) {
        clearInterval(intv);
        afterSpin(newScore, newFreeSpins);
      }
    }, 55);
  }

  function getRandomBoard() {
    let board = [];
    for (let r = 0; r < REELS; r++) {
      let col = [];
      for (let c = 0; c < ROWS; c++) {
        col.push(getRandomSymbol());
      }
      board.push(col);
    }
    return board;
  }

  function afterSpin(newScore, newFreeSpins) {
    let currentBoard = getRandomBoard();
    setBoard(currentBoard);

    // عد السكترات
    let scatters = 0;
    for (let r = 0; r < REELS; r++) {
      for (let c = 0; c < ROWS; c++) {
        if (currentBoard[r][c].type === "scatter") scatters++;
      }
    }
    if (scatters >= 3) {
      let spinsWon = scatters === 3 ? 10 : scatters === 4 ? 15 : 20;
      setFreeSpins(newFreeSpins + spinsWon);
      setMessage(`مبروك! حصلت على ${spinsWon} لفة مجانية 🎣`);
      setIsSpinning(false);
      return;
    }

    // جمع الأسماك أثناء لفات مجانية
    if (newFreeSpins > 0) {
      let fishSum = 0, fishermen = 0;
      for (let r = 0; r < REELS; r++) {
        for (let c = 0; c < ROWS; c++) {
          if (currentBoard[r][c].type === "fish") fishSum += currentBoard[r][c].value;
          if (currentBoard[r][c].type === "fisherman") fishermen++;
        }
      }
      setCollectedFish(fishSum);
      if (fishermen > 0 && fishSum > 0) {
        setShowCollect(true);
        setMessage(`يوجد ${fishermen} صياد وجوائز أسماك بقيمة $${fishSum}!`);
      }
      let totalFisherman = fishermanCount + fishermen;
      if (totalFisherman >= 4) {
        setMultiplier(multiplier + 1);
        setFishermanCount(totalFisherman - 4);
        setMessage(`تم ترقية المضاعف! الآن المضاعف: x${multiplier + 1}`);
      } else {
        setFishermanCount(totalFisherman);
      }
      setFreeSpins(newFreeSpins);
      setIsSpinning(false);
      return;
    }

    // الفوز العادي (مطابقات أفقية فقط)
    let win = checkWinLines(currentBoard);
    if (win > 0) {
      setMessage(`مبروك! ربحت ${win * multiplier} نقطة.`);
      setScore(newScore + win * multiplier);
    } else {
      setMessage("");
      setScore(newScore);
    }
    setFreeSpins(newFreeSpins);
    setIsSpinning(false);
  }

  function checkWinLines(board) {
    let totalWin = 0;
    for (let row = 0; row < ROWS; row++) {
      let matchType = board[0][row].type;
      let match = true;
      for (let col = 1; col < REELS; col++) {
        if (board[col][row].type !== matchType) {
          match = false;
          break;
        }
      }
      if (match) {
        let val = board[0][row].value;
        totalWin += val * REELS;
      }
    }
    return totalWin;
  }

  function collectFishPrize() {
    setScore(score + collectedFish * multiplier);
    setMessage(`تم جمع جوائز الأسماك: +${collectedFish * multiplier} نقطة!`);
    setShowCollect(false);
    setCollectedFish(0);
    setIsSpinning(false);
  }

  return (
    <div className="bbb-root">
      <h2>Big Bass Bonanza (تجريبية)</h2>
      <div className="game-info">
        <div>النقاط: <span>{score}</span></div>
        <div>لفات مجانية: <span>{freeSpins}</span></div>
        <div>المضاعف: <span>x{multiplier}</span></div>
        <div className="bbb-message">{message}</div>
      </div>
      <div className="slot-container">
        {drawBoard()}
      </div>
      <button onClick={spin} disabled={isSpinning || (freeSpins === 0 && score < 10)}>
        تدوير
      </button>
      {showCollect &&
        <button onClick={collectFishPrize}>
          جمع الجوائز
        </button>
      }
    </div>
  );
}
