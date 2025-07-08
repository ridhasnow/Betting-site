import React, { useEffect, useState, useContext } from "react";
import {
  getLeaguesBySport,
  getUpcomingEventsByLeague
} from "./sportsApi";
import { BetCartContext } from "./BetCartContext";
import BetCartFab from "./BetCartFab";

// قائمة الرياضات المعتمدة
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

// دالة لجلب أيام الأسبوع (مع اليوم الحالي)
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

// دوال أعلام تجريبية
function Flag({ country }) {
  if (!country) return null;
  const emojiFlags = {
    France: "🇫🇷", Italy: "🇮🇹", Spain: "🇪🇸", Germany: "🇩🇪", England: "🏴",
    Tunisia: "🇹🇳", Morocco: "🇲🇦", USA: "🇺🇸", Denmark: "🇩🇰", Ecuador: "🇪🇨",
    DR: "🇨🇩", "DR Congo": "🇨🇩", Dominican: "🇩🇴", Albania: "🇦🇱", Algeria: "🇩🇿"
    // أضف المزيد حسب الحاجة
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

export default function ParisSportifsPage() {
  const [selectedSport, setSelectedSport] = useState(SPORTS[0].key);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState("");
  const dayTabs = getDayTabs();
  const [selectedDay, setSelectedDay] = useState(dayTabs[0].value);

  // ربط سلة الرهانات
  let betCart = {};
  try {
    betCart = useContext(BetCartContext) || {};
  } catch {
    betCart = {};
  }
  const { addToCart = () => {}, cart = [] } = betCart;

  // جلب البطولات للرياضة المختارة فقط
  useEffect(() => {
    let ignore = false;
    async function fetchLeagues() {
      setLoadingLeagues(true);
      setError("");
      setLeagues([]);
      setSelectedLeague(null);
      setEvents([]);
      try {
        const allLeagues = await getLeaguesBySport(selectedSport);
        if (!ignore) setLeagues(allLeagues);
      } catch {
        setError("خطأ في تحميل البطولات، حاول لاحقاً");
      }
      setLoadingLeagues(false);
    }
    fetchLeagues();
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [selectedSport]);

  // عند اختيار بطولة، جلب كل المباريات القادمة ثم فلترها حسب اليوم المختار
  const handleLeagueSelect = async (lg) => {
    setSelectedLeague(lg);
    setLoadingEvents(true);
    setError("");
    try {
      const allEvents = await getUpcomingEventsByLeague(lg.idLeague);
      const matchesToday = (allEvents || []).filter(ev => ev.dateEvent === selectedDay);
      setEvents(matchesToday);
    } catch {
      setEvents([]);
      setError("خطأ في تحميل المباريات.");
    }
    setLoadingEvents(false);
  };

  // --- واجهة المستخدم ---
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
                  key={lg?.idLeague || Math.random()}
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
                  onClick={() => handleLeagueSelect(lg)}
                  disabled={!lg?.idLeague}
                >
                  <Flag country={lg?.strCountry} />
                  <span>{lg?.strLeague || lg?.strLeagueAlternate || "بطولة غير معروفة"}</span>
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
                {events.map(ev => (
                  <div
                    key={ev?.idEvent || Math.random()}
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
                    <div style={{ display: "flex", gap: 9, marginTop: 5 }}>
                      {["1", "X", "2"].map(opt => (
                        <button
                          key={opt}
                          style={{
                            background: "#2176c1",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "7px 14px",
                            fontWeight: "bold",
                            fontSize: "1.07em",
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
                              option: opt,
                              cote: Math.floor(Math.random() * 5 * 100) / 100 + 1.5 // قيمة كوت عشوائية
                            })
                          }
                          disabled={cart.some(c => c.idEvent === ev?.idEvent)}
                        >
                          {opt} {opt === "1" ? ev?.strHomeTeam : opt === "2" ? ev?.strAwayTeam : "تعادل"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
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
