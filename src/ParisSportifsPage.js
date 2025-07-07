import React, { useEffect, useState, useContext } from "react";
import { getSoccerLeagues, getEventsByLeague } from "./sportsApi";
import { BetCartContext } from "./BetCartContext";
import BetCartFab from "./BetCartFab";

export default function ParisSportifsPage() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  let betCart = {};
  try {
    betCart = useContext(BetCartContext) || {};
  } catch {
    betCart = {};
  }
  const { addToCart = ()=>{}, cart = [] } = betCart;

  useEffect(() => {
    setError("");
    getSoccerLeagues()
      .then(result => {
        if (Array.isArray(result)) setLeagues(result);
        else setLeagues([]);
      })
      .catch(() => {
        setError("خطأ في تحميل البطولات، حاول لاحقاً");
        setLeagues([]);
      });
  }, []);

  const handleLeagueSelect = async (lg) => {
    setSelectedLeague(lg);
    setLoading(true);
    setError("");
    try {
      const evs = await getEventsByLeague(lg.idLeague);
      if (Array.isArray(evs)) setEvents(evs);
      else setEvents([]);
    } catch {
      setError("خطأ في تحميل المباريات، حاول لاحقاً");
      setEvents([]);
    }
    setLoading(false);
  };

  return (
    <div style={{padding:"0 0 70px 0", background:"#f7f7ff", minHeight:"100vh"}}>
      <header className="header header-black">
        <span className="header-title">Paris Sportifs</span>
      </header>
      <div style={{padding:"12px 8px"}}>
        {error && <div style={{color:"red", marginBottom:12}}>{error}</div>}
        <div>
          <h3 style={{fontSize:"1.1em", marginBottom:8}}>اختر البطولة</h3>
          <div style={{display:"flex", flexWrap:"wrap", gap:10}}>
            {leagues.map(lg => (
              <button
                key={lg?.idLeague || Math.random()}
                style={{
                  background: selectedLeague?.idLeague === lg?.idLeague ? "#2176c1" : "#eee",
                  color: selectedLeague?.idLeague === lg?.idLeague ? "#fff" : "#222",
                  borderRadius: 8, border: "none", padding: "7px 10px", fontWeight: "bold", cursor:"pointer"
                }}
                onClick={() => handleLeagueSelect(lg)}
                disabled={!lg?.idLeague}
              >{lg?.strLeague || "بطولة غير معروفة"}</button>
            ))}
          </div>
        </div>

        {selectedLeague && (
          <div style={{marginTop:22}}>
            <h3 style={{fontSize:"1.1em"}}>المباريات</h3>
            {loading ? <div>جاري التحميل...</div> :
              <div style={{display:"flex", flexDirection:"column", gap:13}}>
                {events.map(ev => (
                  <div key={ev?.idEvent || Math.random()} style={{
                    background:"#fff", borderRadius:10, boxShadow:"0 2px 10px #2176c12a",
                    padding:"16px 9px", display:"flex", flexDirection:"column", gap:6
                  }}>
                    <div style={{fontWeight:"bold", fontSize:"1.05em", color:"#2176c1"}}>
                      {ev?.strHomeTeam || "??"} vs {ev?.strAwayTeam || "??"}
                    </div>
                    <div style={{color:"#666", fontSize:"0.98em"}}>
                      {ev?.dateEvent || ""} {ev?.strTime || ""}
                    </div>
                    <div style={{display:"flex", gap:8, marginTop:5}}>
                      {["1", "X", "2"].map(opt => (
                        <button key={opt}
                          style={{
                            background:"#2176c1", color:"#fff", border:"none",
                            borderRadius:6, padding:"7px 14px", fontWeight:"bold", fontSize:"1.07em", cursor:"pointer"
                          }}
                          onClick={() => addToCart({
                            idEvent: ev?.idEvent,
                            home: ev?.strHomeTeam,
                            away: ev?.strAwayTeam,
                            date: ev?.dateEvent,
                            time: ev?.strTime,
                            league: selectedLeague?.strLeague,
                            option: opt,
                            cote: Math.floor(Math.random()*5*100)/100 + 1.5 // قيمة كوت عشوائية
                          })}
                          disabled={cart.some(c=>c.idEvent===ev?.idEvent)}
                        >
                          {opt} {opt === "1" ? ev?.strHomeTeam : opt === "2" ? ev?.strAwayTeam : "تعادل"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {events.length === 0 && <div style={{color:"#888"}}>لا توجد مباريات متوفرة</div>}
              </div>
            }
          </div>
        )}
      </div>
      <BetCartFab />
    </div>
  );
}
