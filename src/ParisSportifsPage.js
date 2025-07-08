import React, { useEffect, useState, useContext } from "react";
import { BetCartContext } from "./BetCartContext";
import BetCartFab from "./BetCartFab";

// ----------- RapidAPI Config -------------
const RAPIDAPI_KEY = "5915cc956amsh7c4b63e2d2d2e8bp1ee65bjsnb56f28ec67fd";
const RAPIDAPI_HOST = "api-football-v1.p.rapidapi.com";
const BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";

// قائمة الرياضات المعتمدة (ثابتة)
const SPORTS = [
  { key: "Soccer", label: "Football", icon: "⚽" },
  { key: "Basketball", label: "Basketball", icon: "🏀" },
  { key: "Tennis", label: "Tennis", icon: "🎾" },
  { key: "Handball", label: "Handball", icon: "🤾‍♂️" },
  { key: "Rugby", label: "Rugby", icon: "🏉" },
  { key: "Ice Hockey", label: "Ice Hockey", icon: "🏒" },
  { key: "Volleyball", label: "Volleyball", icon: "🏐" },
  { key: "Table Tennis", label: "Tennis Table", icon: "🏓" }
];

// أدوات الوقت
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysStr(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
// دالة أيام الأسبوع
function getDayTabs() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label:
        i === 0
          ? "Aujourd'hui"
          : d
              .toLocaleDateString("fr-FR", { weekday: "long" })
              .replace(/^\w/, (c) => c.toUpperCase()),
      value: d.toISOString().slice(0, 10)
    });
  }
  return days;
}
// أعلام تجريبية
function Flag({ country }) {
  if (!country) return null;
  const emojiFlags = {
    France: "🇫🇷", Italy: "🇮🇹", Spain: "🇪🇸", Germany: "🇩🇪", England: "🏴",
    Tunisia: "🇹🇳", Morocco: "🇲🇦", USA: "🇺🇸", Denmark: "🇩🇰", Ecuador: "🇪🇨",
    DR: "🇨🇩", "DR Congo": "🇨🇩", Dominican: "🇩🇴", Albania: "🇦🇱", Algeria: "🇩🇿", Europe: "🇪🇺", UK: "🇬🇧", World:"🌍"
  };
  // محاولة استخراج العلم من اسم الدولة
  const match = Object.keys(emojiFlags).find(key =>
    (country || "").toLowerCase().includes(key.toLowerCase())
  );
  return (
    <span style={{ fontSize: 21, marginRight: 7 }}>
      {emojiFlags[match] || "🏳️"}
    </span>
  );
}

// ---------- API Calls ---------------
// جلب البطولات حسب الرياضة (مع فلترة حسب الرياضة)
async function fetchLeaguesBySport(sportKey) {
  try {
    const res = await fetch(`${BASE_URL}/leagues`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    if (!data.response) return [];
    if (sportKey === "Soccer") {
      // البطولات النشيطة فقط ونختار المواسم الحالية
      return data.response
        .filter(lg => lg.sport === "Soccer" && lg.league?.name && lg.seasons.some(season => season.current))
        .map(lg => ({
          idLeague: String(lg.league.id),
          strLeague: lg.league.name,
          strCountry: lg.country.name,
          logo: lg.league.logo
        }));
    } else {
      // الباقي لا يدعمها API-Football، أعد قائمة فارغة
      return [];
    }
  } catch (err) {
    return [];
  }
}

// جلب مباريات اليوم لبطولة معينة
async function fetchEventsForLeagueAndDay(leagueId, dayStr) {
  try {
    const res = await fetch(`${BASE_URL}/fixtures?league=${leagueId}&date=${dayStr}`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    if (!data.response) return [];
    // فلترة: فقط المباريات التي لم تبدأ بعد
    return data.response
      .filter(ev => ev.fixture.status.short === "NS")
      .map(ev => ({
        idEvent: String(ev.fixture.id),
        strHomeTeam: ev.teams.home.name,
        strAwayTeam: ev.teams.away.name,
        dateEvent: ev.fixture.date.slice(0, 10),
        strTime: ev.fixture.date.slice(11, 16),
        leagueLogo: ev.league.logo,
        fixtureId: ev.fixture.id
      }));
  } catch {
    return [];
  }
}

// جلب كوتات 1X2 (سوق رئيسي) لمباراة واحدة
async function fetchOdds1X2(fixtureId) {
  try {
    const res = await fetch(`${BASE_URL}/odds?fixture=${fixtureId}&bet=1`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    // odds.response = [{ league, fixture, update, bookmakers:[{id,name,bets:[{id,name,values:[{value,odd}]}]}]}]
    if (!data.response || !data.response.length) return null;
    // نبحث عن أول Bookmaker فيه سوق 1X2
    for (const bookmaker of data.response[0].bookmakers || []) {
      const bet = bookmaker.bets && bookmaker.bets.find(b => b.id === 1);
      if (bet && bet.values) {
        // يكون values = [{value: "Home", odd: "2.01"}, {value:"Draw", odd:"3.2"}, {value:"Away", odd:"2.79"}]
        const odds = {};
        bet.values.forEach(val => {
          if (val.value === "Home") odds["1"] = val.odd;
          if (val.value === "Draw") odds["X"] = val.odd;
          if (val.value === "Away") odds["2"] = val.odd;
        });
        return odds;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// جلب كل الأسواق (كل الرهانات) لمباراة واحدة (Bookmaker=1 مثلاً)
async function fetchAllOddsForFixture(fixtureId, bookmakerId = 1) {
  try {
    const res = await fetch(`${BASE_URL}/odds?fixture=${fixtureId}&bookmaker=${bookmakerId}`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });
    const data = await res.json();
    if (!data.response || !data.response.length) return [];
    // جلب كل الرهانات (كل الأسواق)
    const bookmaker = data.response[0].bookmakers.find(bm => bm.id === bookmakerId) || data.response[0].bookmakers[0];
    if (!bookmaker || !bookmaker.bets) return [];
    // كل bet = { id, name, values: [ { value, odd } ] }
    return bookmaker.bets.map(bet => ({
      id: bet.id,
      name: bet.name,
      values: bet.values
    }));
  } catch {
    return [];
  }
}

export default function ParisSportifsPage() {
  const [selectedSport, setSelectedSport] = useState(SPORTS[0].key);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsOdds, setEventsOdds] = useState({}); // fixtureId -> {1,X,2}
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingOdds, setLoadingOdds] = useState({});
  const [error, setError] = useState("");
  const dayTabs = getDayTabs();
  const [selectedDay, setSelectedDay] = useState(dayTabs[0].value);
  const [expandedMarkets, setExpandedMarkets] = useState({}); // fixtureId -> true/false
  const [marketsData, setMarketsData] = useState({}); // fixtureId -> [markets]

  // سلة الرهانات
  let betCart = {};
  try {
    betCart = useContext(BetCartContext) || {};
  } catch {
    betCart = {};
  }
  const { addToCart = () => {}, cart = [] } = betCart;

  // عند تغيير الرياضة: جلب البطولات الحقيقية (API) أو فارغة إذا ليست Soccer
  useEffect(() => {
    setLoadingLeagues(true);
    setError("");
    setLeagues([]);
    setSelectedLeague(null);
    setEvents([]);
    setEventsOdds({});
    setMarketsData({});
    fetchLeaguesBySport(selectedSport)
      .then(res => {
        setLeagues(res);
        setLoadingLeagues(false);
        if (selectedSport !== "Soccer" && res.length === 0) {
          setError("هذه الرياضة غير مدعومة حالياً من مزود البيانات.");
        }
      })
      .catch(() => {
        setLeagues([]);
        setLoadingLeagues(false);
        setError("فشل في جلب البطولات، حاول لاحقاً.");
      });
  }, [selectedSport]);

  // عند اختيار بطولة أو تغيير اليوم: جلب مباريات اليوم من الـAPI
  useEffect(() => {
    if (!selectedLeague) {
      setEvents([]);
      setEventsOdds({});
      setMarketsData({});
      return;
    }
    setLoadingEvents(true);
    setEvents([]);
    setEventsOdds({});
    setMarketsData({});
    fetchEventsForLeagueAndDay(selectedLeague.idLeague, selectedDay)
      .then(async res => {
        setEvents(res);
        setLoadingEvents(false);
        // جلب كوتات 1X2 لكل مباراة (بالتوازي)
        const oddsArr = await Promise.all(res.map(ev => fetchOdds1X2(ev.fixtureId)));
        const oddsObj = {};
        res.forEach((ev, i) => {
          oddsObj[ev.fixtureId] = oddsArr[i];
        });
        setEventsOdds(oddsObj);
      })
      .catch(() => {
        setEvents([]);
        setLoadingEvents(false);
      });
  }, [selectedLeague, selectedDay]);

  // جلب كل الأسواق عند الضغط على السهم
  async function handleExpandMarkets(ev) {
    const fixtureId = ev.fixtureId;
    setExpandedMarkets(exp => ({ ...exp, [fixtureId]: !exp[fixtureId] }));
    if (!marketsData[fixtureId]) {
      setLoadingOdds(lo => ({ ...lo, [fixtureId]: true }));
      const markets = await fetchAllOddsForFixture(fixtureId, 1);
      setMarketsData(md => ({ ...md, [fixtureId]: markets }));
      setLoadingOdds(lo => ({ ...lo, [fixtureId]: false }));
    }
  }

  function handleBackMarkets(ev) {
    setExpandedMarkets(exp => ({ ...exp, [ev.fixtureId]: false }));
  }

  return (
    <div style={{ padding: "0 0 70px 0", background: "#f7f7ff", minHeight: "100vh" }}>
      <header className="header header-black">
        <span className="header-title">Paris Sportifs</span>
      </header>

      <div style={{ padding: "12px 8px" }}>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

        {/* اختيار الرياضة */}
        <div style={{ marginBottom: 22 }}>
          <h3 style={{ fontSize: "1.1em", marginBottom: 12, color: "#2176c1" }}>اختر الرياضة</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            justifyItems: "center"
          }}>
            {SPORTS.map(sport => (
              <button
                key={sport.key}
                style={{
                  background: selectedSport === sport.key ? "#2176c1" : "#fff",
                  color: selectedSport === sport.key ? "#fff" : "#222",
                  borderRadius: 13,
                  border: "1.5px solid #2176c1",
                  boxShadow: selectedSport === sport.key ? "0 2px 14px #2176c12a" : "none",
                  padding: "25px 0 13px 0",
                  fontWeight: "bold",
                  fontSize: "1.06em",
                  cursor: "pointer",
                  minWidth: 0,
                  width: "92%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.1s"
                }}
                onClick={() => setSelectedSport(sport.key)}
              >
                <span style={{ fontSize: 33, marginBottom: 5 }}>{sport.icon}</span>
                {sport.label}
              </button>
            ))}
          </div>
        </div>

        {/* شريط الأيام */}
        <div style={{
          display: "flex",
          gap: 8,
          margin: "18px 0 14px 0",
          overflowX: "auto",
          paddingBottom: 6
        }}>
          {dayTabs.map(day => (
            <button
              key={day.value}
              style={{
                background: selectedDay === day.value ? "#2176c1" : "#e3eaf4",
                color: selectedDay === day.value ? "#fff" : "#2176c1",
                border: "none",
                borderRadius: 8,
                padding: "7px 16px",
                fontWeight: "bold",
                cursor: "pointer",
                minWidth: 90
              }}
              onClick={() => {
                setSelectedDay(day.value);
                setSelectedLeague(null);
                setEvents([]);
                setEventsOdds({});
                setMarketsData({});
              }}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* البطولات */}
        <div>
          <h3 style={{ fontSize: "1.1em", marginBottom: 8 }}>اختر البطولة</h3>
          {loadingLeagues ? (
            <div>جاري تحميل البطولات...</div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              marginBottom: 10
            }}>
              {leagues.map(lg => (
                <button
                  key={lg?.idLeague}
                  style={{
                    background: selectedLeague?.idLeague === lg?.idLeague ? "#2176c1" : "#fff",
                    color: selectedLeague?.idLeague === lg?.idLeague ? "#fff" : "#222",
                    borderRadius: 10,
                    border: "1px solid #2176c1",
                    padding: "10px 8px",
                    fontWeight: "bold",
                    fontSize: "1em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    minWidth: 0,
                    textAlign: "right",
                    justifyContent: "flex-start"
                  }}
                  onClick={() => setSelectedLeague(lg)}
                  disabled={!lg?.idLeague}
                >
                  <Flag country={lg?.strCountry} />
                  {lg.logo && (
                    <img src={lg.logo} alt="" style={{ width: 23, height: 23, marginRight: 7, borderRadius: 5 }}/>
                  )}
                  <span>{lg?.strLeague || "بطولة غير معروفة"}</span>
                </button>
              ))}
              {!error && leagues.length === 0 && (
                <div style={{ color: "#888", margin: "12px 0" }}>
                  لا توجد بطولات متوفرة لهذه الرياضة
                </div>
              )}
            </div>
          )}
        </div>

        {/* عرض المباريات */}
        {selectedLeague && (
          <div style={{ marginTop: 22 }}>
            <h3 style={{ fontSize: "1.1em" }}>المباريات</h3>
            {loadingEvents ? (
              <div>جاري تحميل المباريات...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {events.map(ev => {
                  const odds = eventsOdds[ev.fixtureId] || {};
                  return (
                    <div
                      key={ev?.idEvent}
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        boxShadow: "0 2px 10px #2176c12a",
                        padding: "16px 9px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6
                      }}
                    >
                      <div style={{ fontWeight: "bold", fontSize: "1.08em", color: "#2176c1" }}>
                        {ev?.strHomeTeam || "??"} vs {ev?.strAwayTeam || "??"}
                      </div>
                      <div style={{ color: "#666", fontSize: "0.98em" }}>
                        {ev?.dateEvent || ""} {ev?.strTime || ""}
                      </div>
                      {/* خيارات 1X2 مع الكوت الحقيقي */}
                      <div style={{ display: "flex", gap: 9, marginTop: 5 }}>
                        {["1", "X", "2"].map(opt => (
                          <button
                            key={opt}
                            style={{
                              background: odds[opt] ? "#2176c1" : "#ccc",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "7px 10px",
                              fontWeight: "bold",
                              fontSize: "1.07em",
                              cursor: odds[opt] ? "pointer" : "not-allowed",
                              opacity: odds[opt] ? 1 : 0.7,
                              position: "relative"
                            }}
                            onClick={() =>
                              odds[opt] && addToCart({
                                idEvent: ev?.idEvent,
                                home: ev?.strHomeTeam,
                                away: ev?.strAwayTeam,
                                date: ev?.dateEvent,
                                time: ev?.strTime,
                                league: selectedLeague?.strLeague,
                                option: opt,
                                cote: odds[opt]
                              })
                            }
                            disabled={cart.some(c => c.idEvent === ev?.idEvent) || !odds[opt]}
                          >
                            {opt} {opt === "1" ? ev?.strHomeTeam : opt === "2" ? ev?.strAwayTeam : "تعادل"}
                            <span style={{
                              display: "inline-block",
                              marginLeft: 8,
                              background: "#fff",
                              color: "#2176c1",
                              borderRadius: 5,
                              padding: "0px 7px",
                              fontWeight: "bold",
                              fontSize: "0.96em",
                              border: "1px solid #2176c1",
                              minWidth: 38
                            }}>
                              {odds[opt] ? odds[opt] : "--"}
                            </span>
                          </button>
                        ))}
                        {/* سهم لفتح كل الأسواق */}
                        <button
                          onClick={() => handleExpandMarkets(ev)}
                          style={{
                            background: "#f2f8fd",
                            color: "#2176c1",
                            border: "1px solid #2176c1",
                            borderRadius: "50%",
                            width: 35,
                            height: 35,
                            fontWeight: "bold",
                            fontSize: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                          }}
                          title="كل الرهانات"
                        >
                          {expandedMarkets[ev.fixtureId] ? "←" : "↓"}
                        </button>
                      </div>
                      {/* قائمة كل الأسواق */}
                      {expandedMarkets[ev.fixtureId] && (
                        <div style={{
                          margin: "12px 0 0 0",
                          background: "#f2f8fd",
                          borderRadius: 8,
                          padding: "12px 7px"
                        }}>
                          <button
                            onClick={() => handleBackMarkets(ev)}
                            style={{
                              background: "#e3eaf4",
                              color: "#2176c1",
                              border: "none",
                              borderRadius: 7,
                              padding: "6px 13px",
                              fontWeight: "bold",
                              fontSize: "1em",
                              marginBottom: 8,
                              cursor: "pointer"
                            }}
                          >← رجوع</button>
                          {loadingOdds[ev.fixtureId] ? (
                            <div>جاري تحميل كل الأسواق...</div>
                          ) : (
                            <>
                              {marketsData[ev.fixtureId] && marketsData[ev.fixtureId].length ? (
                                marketsData[ev.fixtureId].map(mkt => (
                                  <div key={mkt.id} style={{ marginBottom: 14 }}>
                                    <div style={{ fontWeight: "bold", color: "#2176c1", marginBottom: 4 }}>
                                      {mkt.name}
                                    </div>
                                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                                      {mkt.values && mkt.values.map(val => (
                                        <button
                                          key={val.value}
                                          style={{
                                            background: "#2176c1",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 6,
                                            padding: "6px 11px",
                                            fontWeight: "bold",
                                            fontSize: "0.99em",
                                            cursor: "pointer"
                                          }}
                                          onClick={() =>
                                            addToCart({
                                              idEvent: ev?.idEvent,
                                              home: ev?.strHomeTeam,
                                              away: ev?.strAwayTeam,
                                              date: ev?.dateEvent,
                                              time: ev?.strTime,
                                              league: selectedLeague?.strLeague,
                                              option: mkt.name + " - " + val.value,
                                              cote: val.odd
                                            })
                                          }
                                          disabled={cart.some(c => c.idEvent === ev?.idEvent)}
                                        >
                                          {val.value}
                                          <span style={{
                                            display: "inline-block",
                                            marginLeft: 6,
                                            background: "#fff",
                                            color: "#2176c1",
                                            borderRadius: 4,
                                            padding: "0px 6px",
                                            fontWeight: "bold",
                                            fontSize: "0.96em",
                                            border: "1px solid #2176c1"
                                          }}>
                                            {val.odd}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ color: "#888" }}>لا توجد أسواق متاحة حالياً</div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {events.length === 0 && (
                  <div style={{ color: "#888" }}>لا توجد مباريات متوفرة لهذه البطولة في هذا اليوم</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <BetCartFab />
    </div>
  );
}
