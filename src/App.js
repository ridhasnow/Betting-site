import React, { useState, useEffect } from "react";
import "./App.css";
import { FaHome, FaSignInAlt, FaFutbol, FaDice, FaGem, FaGamepad } from "react-icons/fa";
import { GiSpinningWheel } from "react-icons/gi";
import { MdOutlineSportsSoccer } from "react-icons/md";
import AuthSystem from "./AuthSystem";
import {
  getAllProviders,
} from "./providersService";

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
    icon: <MdOutlineSportsSoccer size={40} color="#FFF" />,
    live: true,
  },
  {
    title: "Jeux De Casino",
    icon: <FaDice size={40} color="#FFF" />,
  },
  {
    title: "Paris Sportif",
    icon: <FaFutbol size={40} color="#FFF" />,
  },
  {
    title: "Jeux Virtuels",
    icon: <FaGamepad size={40} color="#FFF" />,
  },
  {
    title: "Roue de la Fortune",
    icon: <GiSpinningWheel size={40} color="#FFF" />,
  },
  {
    title: "Casino En Direct",
    icon: <FaGem size={40} color="#FFF" />,
  },
];

const FOOTBALL_API_KEY = "c25adbeecce0469e8ff30485070581db";

// واجهة مزود
function ProviderDashboard({ user, onLogout }) {
  return (
    <div>
      <header className="header header-black">
        <span className="header-title">{user.username}</span>
        <span style={{color:'#fff', fontWeight:'bold', fontSize:'1.1em', background:'#2176c1', borderRadius:8, padding:'6px 14px', marginLeft:'12px'}}>
          {user.balance ?? 0} DZD
        </span>
        <button onClick={onLogout} style={{marginLeft:"auto", color:'#fff', background:'transparent', border:'none', fontSize:"1.2em", cursor:"pointer"}}>⏻</button>
      </header>
      <div style={{padding: '22px 6px 0 6px'}}>
        <button className="provider-btn">New User Registration</button>
        <button className="provider-btn">List of Users</button>
        <button className="provider-btn">Add/Withdraw Balance</button>
        <button className="provider-btn">Transaction History Players</button>
        <button className="provider-btn">Transaction History Account</button>
      </div>
    </div>
  );
}

// واجهة الأدمن الجديدة
function AdminDashboard({ user, onLogout }) {
  const [showPassEdit, setShowPassEdit] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");

  // نافذة إضافة مزود (نفس القديم)
  const [showAddShop, setShowAddShop] = useState(false);
  const [shopUsername, setShopUsername] = useState("");
  const [shopPassword, setShopPassword] = useState("");
  const [addShopError, setAddShopError] = useState("");
  const [addShopSuccess, setAddShopSuccess] = useState("");

  // قوائم التحكم
  const [showBalance, setShowBalance] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  // بيانات المزودين
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [errProviders, setErrProviders] = useState("");

  // حالة التعديل الفردي
  const [balanceEdit, setBalanceEdit] = useState({}); // { [providerId]: { type: "add"|"sub", value: "" } }

  // جلب قائمة المزودين
  const fetchProviders = async () => {
    setLoadingProviders(true); setErrProviders("");
    try {
      const data = await getAllProviders();
      setProviders(data);
    } catch(e) {
      setErrProviders("خطأ في جلب المزودين!");
    }
    setLoadingProviders(false);
  };

  useEffect(() => {
    if (showBalance || showSuspend) fetchProviders();
    // Reset edit state
    setBalanceEdit({});
  }, [showBalance, showSuspend]);

  // تغيير كلمة السر (وهمي)
  const handlePassChange = () => {
    setMsg("تم تغيير كلمة السر (وهميًا)");
    setTimeout(()=>setMsg(""), 2000);
    setShowPassEdit(false);
  };

  // إضافة مزود (نفس القديم)
  const handleAddShop = async () => {
    setAddShopError(""); setAddShopSuccess("");
    try {
      // استدعاء دالة addProvider من providersService.js
      const { addProvider } = await import("./providersService");
      await addProvider(shopUsername.trim(), shopPassword);
      setAddShopSuccess("تم إضافة المزود بنجاح!");
      setShopUsername(""); setShopPassword("");
    } catch (e) {
      setAddShopError(e.message);
    }
  };

  // تعديل الرصيد (إضافة/سحب)
  const handleBalanceChange = async (id, type) => {
    const value = balanceEdit[id]?.value;
    if (!value || isNaN(Number(value))) {
      alert("أدخل رقم صحيح!");
      return;
    }
    try {
      // استدعاء دالة updateProviderBalance من providersService.js
      const { updateProviderBalance } = await import("./providersService");
      await updateProviderBalance(id, Number(value), type); // type: "add" or "sub"
      setBalanceEdit(edit => ({ ...edit, [id]: undefined }));
      fetchProviders();
    } catch (e) {
      alert("حدث خطأ أثناء تعديل الرصيد");
    }
  };

  // تعليق/إلغاء تعليق
  const handleSuspend = async (id, isSuspended) => {
    try {
      const { suspendProvider } = await import("./providersService");
      await suspendProvider(id, isSuspended);
      fetchProviders();
    } catch (e) {
      alert("خطأ في التعليق/التفعيل");
    }
  };

  // واجهة الأدمن الكاملة
  return (
    <div>
      <header className="header header-black">
        <span className="header-title">Admin</span>
        <span style={{color:'#fff', fontWeight:'bold', fontSize:'1.1em', background:'#2176c1', borderRadius:8, padding:'6px 14px', marginLeft:'12px'}}>
          999,999,999 DZD
        </span>
        <button onClick={() => setShowPassEdit(true)} style={{ background:'transparent', border:'none', fontSize:"1.2em", cursor:"pointer", marginLeft:6 }} title="تغيير كلمة السر">⚙️</button>
        <button onClick={onLogout} style={{ color:'#fff', background:'transparent', border:'none', fontSize:"1.2em", cursor:"pointer", marginLeft:2}}>⏻</button>
      </header>
      <div style={{padding: '22px 6px 0 6px'}}>
        <button className="provider-btn" onClick={() => setShowAddShop(true)}>Add Shop</button>
        <button className="provider-btn" onClick={() => setShowBalance(true)}>Add/Withdraw Balance</button>
        <button className="provider-btn">Transaction History</button>
        <button className="provider-btn" onClick={() => setShowSuspend(true)}>Delete Shop</button>
      </div>
      {showPassEdit && (
        <div className="modal-bg">
          <div className="modal-login" style={{maxWidth:320}}>
            <h4>تغيير كلمة السر</h4>
            <input
              type="password"
              placeholder="كلمة السر الجديدة"
              value={newPass}
              onChange={e=>setNewPass(e.target.value)}
              autoFocus
            />
            <button className="login-btn" onClick={handlePassChange}>تأكيد</button>
            <button className="login-btn" style={{background:'#ccc', color:'#222'}} onClick={()=>setShowPassEdit(false)}>إلغاء</button>
            {msg && <div className="login-error" style={{color:'#080'}}>{msg}</div>}
          </div>
        </div>
      )}
      {/* نافذة إضافة مزود */}
      {showAddShop && (
        <div className="modal-bg">
          <div className="modal-login" style={{maxWidth:340}}>
            <h4>إنشاء حساب مزود جديد</h4>
            <input
              type="text"
              placeholder="اسم المستخدم (حروف أو أرقام)"
              value={shopUsername}
              onChange={e => setShopUsername(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="كلمة المرور (6 أحرف أو أكثر)"
              value={shopPassword}
              onChange={e => setShopPassword(e.target.value)}
            />
            {addShopError && <div className="login-error">{addShopError}</div>}
            {addShopSuccess && <div style={{color:'#080',fontWeight:'bold',margin:'6px 0'}}>{addShopSuccess}</div>}
            <button className="login-btn" onClick={handleAddShop}>إنشاء</button>
            <button className="login-btn" style={{background:'#ccc',color:'#222'}} onClick={()=>setShowAddShop(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {/* نافذة تحكم الرصيد */}
      {showBalance && (
        <div className="modal-bg">
          <div className="modal-login" style={{maxWidth:500}}>
            <h4>قائمة المزودين (تحكم في الرصيد)</h4>
            {loadingProviders ? <div>جاري التحميل...</div> :
              errProviders ? <div style={{color:'red'}}>{errProviders}</div> :
              <table style={{width:"100%", fontSize:"1em", borderCollapse:"collapse"}}>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الرصيد</th>
                    <th colSpan={2}>تحكم</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map(p=>(
                    <tr key={p.id} style={{opacity: p.suspended ? 0.5 : 1}}>
                      <td>{p.username}</td>
                      <td>{p.balance}</td>
                      <td>
                        {/* زر زائد */}
                        <button
                          style={{
                            background:"#09c178",
                            color:"#fff",
                            border:"none",
                            borderRadius:"50%",
                            width:32, height:32,
                            fontSize:22,
                            marginRight:8,
                            cursor:"pointer"
                          }}
                          title="إضافة رصيد"
                          onClick={() => setBalanceEdit(edit => ({ ...edit, [p.id]: { type: "add", value: "" } }))}
                          disabled={p.suspended}
                        >+</button>
                        {/* حقل إدخال للزائد */}
                        {balanceEdit[p.id]?.type==="add" && (
                          <span style={{marginRight:6}}>
                            <input
                              type="number"
                              min="1"
                              style={{width:70, marginRight:4}}
                              value={balanceEdit[p.id].value}
                              placeholder="المبلغ"
                              onChange={e =>
                                setBalanceEdit(edit=>({
                                  ...edit,
                                  [p.id]: { ...edit[p.id], value: e.target.value }
                                }))
                              }
                            />
                            <button
                              className="login-btn"
                              style={{padding:"3px 10px", fontSize:14}}
                              onClick={()=>handleBalanceChange(p.id, "add")}
                            >تأكيد</button>
                            <button
                              className="login-btn"
                              style={{padding:"3px 10px", fontSize:14, background:"#ccc", color:"#222"}}
                              onClick={() => setBalanceEdit(edit => ({ ...edit, [p.id]: undefined }))}
                            >X</button>
                          </span>
                        )}
                      </td>
                      <td>
                        {/* زر ناقص */}
                        <button
                          style={{
                            background:"#e53935",
                            color:"#fff",
                            border:"none",
                            borderRadius:"50%",
                            width:32, height:32,
                            fontSize:22,
                            marginRight:8,
                            cursor:"pointer"
                          }}
                          title="سحب رصيد"
                          onClick={() => setBalanceEdit(edit => ({ ...edit, [p.id]: { type: "sub", value: "" } }))}
                          disabled={p.suspended}
                        >-</button>
                        {/* حقل إدخال للناقص */}
                        {balanceEdit[p.id]?.type==="sub" && (
                          <span style={{marginRight:6}}>
                            <input
                              type="number"
                              min="1"
                              style={{width:70, marginRight:4}}
                              value={balanceEdit[p.id].value}
                              placeholder="المبلغ"
                              onChange={e =>
                                setBalanceEdit(edit=>({
                                  ...edit,
                                  [p.id]: { ...edit[p.id], value: e.target.value }
                                }))
                              }
                            />
                            <button
                              className="login-btn"
                              style={{padding:"3px 10px", fontSize:14}}
                              onClick={()=>handleBalanceChange(p.id, "sub")}
                            >تأكيد</button>
                            <button
                              className="login-btn"
                              style={{padding:"3px 10px", fontSize:14, background:"#ccc", color:"#222"}}
                              onClick={() => setBalanceEdit(edit => ({ ...edit, [p.id]: undefined }))}
                            >X</button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            <button className="login-btn" style={{marginTop:10}} onClick={()=>setShowBalance(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة تعليق الحسابات */}
      {showSuspend && (
        <div className="modal-bg">
          <div className="modal-login" style={{maxWidth:410}}>
            <h4>قائمة المزودين (تعليق/تفعيل الحسابات)</h4>
            {loadingProviders ? <div>جاري التحميل...</div> :
              errProviders ? <div style={{color:'red'}}>{errProviders}</div> :
              <table style={{width:"100%", fontSize:"1em"}}>
                <thead><tr><th>الاسم</th><th>الحالة</th><th>تعليق/إلغاء</th></tr></thead>
                <tbody>
                  {providers.map(p=>(
                    <tr key={p.id}>
                      <td>{p.username}</td>
                      <td>{p.suspended ? <span style={{color:"red"}}>معلق</span> : <span style={{color:"green"}}>نشط</span>}</td>
                      <td>
                        <button
                          style={{
                            background: p.suspended ? "#09c178" : "#e53935",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 12px",
                            fontWeight:"bold",
                            fontSize:15,
                            cursor:"pointer"
                          }}
                          onClick={()=>handleSuspend(p.id, !p.suspended)}
                        >
                          {p.suspended ? "تفعيل" : "تعليق"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            <button className="login-btn" style={{marginTop:10}} onClick={()=>setShowSuspend(false)}>إغلاق</button>
          </div>
        </div>
      )}

    </div>
  );
}

// الحساب الإداري الثابت
const ADMIN_ACCOUNT = {
  username: "ridhasnow",
  password: "azerty12345",
  role: "admin",
  balance: 999999999,
};

function App() {
  // سلايدر الصور
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // فتح قائمة مباريات لايف
  const [showLive, setShowLive] = useState(false);

  // جلب مباريات اليوم من football-data.org
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showLive) {
      setLoading(true);
      fetch("https://api.football-data.org/v4/matches?dateFrom=today&dateTo=today", {
        headers: {
          "X-Auth-Token": FOOTBALL_API_KEY,
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

  // اختيار رهان (للتوضيح فقط)
  const [selectedBet, setSelectedBet] = useState(null);

  // نظام الدخول
  const [auth, setAuth] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // زر تسجيل الخروج
  const handleLogout = () => {
    setAuth(null);
    setShowLogin(false);
  };

  // في حال مزود
  if (auth?.role === "provider") {
    return <ProviderDashboard user={auth} onLogout={handleLogout} />;
  }
  // في حال الأدمن
  if (auth?.role === "admin") {
    return <AdminDashboard user={auth} onLogout={handleLogout} />;
  }
  // في حال لاعب أو زائر عادي
  return (
    <div className="main-wrapper" style={{background:"#fff"}}>
      {/* Header */}
      <header className="header header-black">
        <span className="header-title">Accueil</span>
        <img src="/cazabet.png" alt="Cazabet Logo" className="header-logo" />
      </header>

      {/* Slider */}
      <div className="slider-holder">
        <img
          src={sliderImages[current]}
          alt="affiche"
          className="slider-img"
        />
      </div>

      {/* Grid */}
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

      {/* Pop-up Live Matches */}
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

      {/* Bottom navigation */}
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
      {/* نافذة الدخول */}
      {showLogin && !auth && (
        <AuthSystem onLogin={(acc) => { setAuth(acc); setShowLogin(false); }} />
      )}
    </div>
  );
}

export default App;
