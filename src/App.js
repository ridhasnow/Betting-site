import React, { useState, useEffect } from "react";
import {
  addProvider,
  getAllProviders,
  updateProviderBalance,
  suspendProvider,
  getProviderByCredentials
} from "./providersService";

// واجهة الهوم (المربعات الزرقاء)
function Home({ onLoginClick }) {
  return (
    <div className="main-wrapper">
      <header className="header">
        <span className="header-title">CAZABET</span>
      </header>
      <div className="grid-container grid-3">
        <div className="grid-item">
          <div className="icon-holder">
            <span role="img" aria-label="مباريات">⚽️</span>
          </div>
          <div className="title">المباريات</div>
        </div>
        <div className="grid-item">
          <div className="icon-holder">
            <span role="img" aria-label="أخبار">📰</span>
          </div>
          <div className="title">الأخبار</div>
        </div>
        <div className="grid-item" onClick={onLoginClick} style={{ background: "#155081", cursor: "pointer" }}>
          <div className="icon-holder">
            <span role="img" aria-label="دخول">🔑</span>
          </div>
          <div className="title">تسجيل الدخول</div>
        </div>
      </div>
    </div>
  );
}

// واجهة مزود مع رسالة "حسابك معلق"
function ProviderDashboard({ user, onLogout }) {
  if (user.suspended) {
    return (
      <div>
        <header className="header header-black">
          <span className="header-title">{user.username}</span>
          <button onClick={onLogout} style={{marginLeft:"auto", color:'#fff', background:'transparent', border:'none', fontSize:"1.2em", cursor:"pointer"}}>⏻</button>
        </header>
        <div style={{padding:40, textAlign:'center', color:'red', fontWeight:'bold', fontSize:'1.2em'}}>
          حسابك معلق حاليا. يرجى التواصل مع الإدارة.
        </div>
      </div>
    );
  }
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

// AdminDashboard مع التحكم بالرصد و التعليق
function AdminDashboard({ user, onLogout }) {
  const [showPassEdit, setShowPassEdit] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");
  const [showAddShop, setShowAddShop] = useState(false);
  const [shopUsername, setShopUsername] = useState("");
  const [shopPassword, setShopPassword] = useState("");
  const [addShopError, setAddShopError] = useState("");
  const [addShopSuccess, setAddShopSuccess] = useState("");
  const [showBalance, setShowBalance] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [errProviders, setErrProviders] = useState("");

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
  }, [showBalance, showSuspend]);

  const handlePassChange = () => {
    setMsg("تم تغيير كلمة السر (وهميًا)");
    setTimeout(()=>setMsg(""), 2000);
    setShowPassEdit(false);
  };

  const handleAddShop = async () => {
    setAddShopError(""); setAddShopSuccess("");
    try {
      await addProvider(shopUsername.trim(), shopPassword);
      setAddShopSuccess("تم إضافة المزود بنجاح!");
      setShopUsername(""); setShopPassword("");
    } catch (e) {
      setAddShopError(e.message);
    }
  };

  const handleBalanceChange = async (id, currentBalance) => {
    const amount = prompt("أدخل الرصيد الجديد:", currentBalance);
    if (amount === null) return;
    const value = Number(amount);
    if (isNaN(value)) return alert("أدخل رقم صحيح!");
    await updateProviderBalance(id, value);
    fetchProviders();
  };

  const handleSuspend = async (id, isSuspended) => {
    await suspendProvider(id, isSuspended);
    fetchProviders();
  };

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

      {/* نافذة التحكم في الأرصدة */}
      {showBalance && (
        <div className="modal-bg">
          <div className="modal-login" style={{maxWidth:410}}>
            <h4>قائمة المزودين (تحكم في الرصيد)</h4>
            {loadingProviders ? <div>جاري التحميل...</div> :
              errProviders ? <div style={{color:'red'}}>{errProviders}</div> :
              <table style={{width:"100%", fontSize:"1em"}}>
                <thead><tr><th>الاسم</th><th>الرصيد</th><th>تحكم</th></tr></thead>
                <tbody>
                  {providers.map(p=>(
                    <tr key={p.id} style={{opacity: p.suspended ? 0.5 : 1}}>
                      <td>{p.username}</td>
                      <td>{p.balance}</td>
                      <td>
                        <button
                          style={{background:"#2176c1", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer"}}
                          onClick={()=>handleBalanceChange(p.id, p.balance)}
                          disabled={p.suspended}
                        >
                          تعديل الرصيد
                        </button>
                        {p.suspended && <span style={{color:"red",marginRight:8}}>معلق</span>}
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
            <h4>قائمة المزودين (تعليق الحسابات)</h4>
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
                            background: p.suspended ? "#ffcc00" : "#09c178",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 10px",
                            cursor:"pointer"
                          }}
                          onClick={()=>handleSuspend(p.id, !p.suspended)}
                        >
                          {p.suspended ? "إلغاء التعليق" : "تعليق"}
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

// واجهة تسجيل الدخول
function AuthSystem({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // تحقق هل الأدمن
    if (
      username.trim() === ADMIN_ACCOUNT.username &&
      password === ADMIN_ACCOUNT.password
    ) {
      setLoading(false);
      onLogin({ ...ADMIN_ACCOUNT });
      return;
    }

    // تحقق من المزودين في Firestore
    try {
      const provider = await getProviderByCredentials(username.trim(), password);
      if (!provider) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      } else if (provider.suspended) {
        setError("حسابك معلق حاليا. يرجى التواصل مع الإدارة.");
      } else {
        onLogin({ ...provider, role: "provider" });
      }
    } catch (e) {
      setError("حدث خطأ تقني، حاول لاحقاً");
    }
    setLoading(false);
  };

  return (
    <div className="modal-bg">
      <div className="modal-login">
        <h3>تسجيل الدخول</h3>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
          <div className="input-pass-wrap" style={{display: "flex", alignItems: "center"}}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{flex: 1}}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="showpass-btn"
              tabIndex={-1}
              aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                marginLeft: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              {showPass
                ? <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6.5c-4.45 0-8.21 2.92-9.5 7.5 1.29 4.58 5.05 7.5 9.5 7.5s8.21-2.92 9.5-7.5c-1.29-4.58-5.05-7.5-9.5-7.5zm0 13c-3.86 0-7.19-2.47-8.31-6 .85-2.74 3.41-5 8.31-5 4.9 0 7.46 2.26 8.31 5-.85 2.74-3.41 5-8.31 5zm0-9a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
                : <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5c-5.05 0-9.27 3.28-10.5 8.5 1.23 5.22 5.45 8.5 10.5 8.5s9.27-3.28 10.5-8.5c-1.23-5.22-5.45-8.5-10.5-8.5zm0 15c-4.62 0-8.16-2.98-9.31-7 .89-3.02 4.12-7 9.31-7 5.19 0 8.42 3.98 9.31 7-.89 3.02-4.12 7-9.31 7zm0-11a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
              }
            </button>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}

// الكومبوننت الرئيسي
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = () => setCurrentUser(null);

  // اول ما تدخل: الهوم + زر تسجيل الدخول
  if (!currentUser) {
    return (
      <>
        <Home onLoginClick={() => setShowLogin(true)} />
        {showLogin && (
          <AuthSystem
            onLogin={(user) => {
              setCurrentUser(user);
              setShowLogin(false);
            }}
          />
        )}
      </>
    );
  }

  if (currentUser.role === "admin")
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  if (currentUser.role === "provider")
    return <ProviderDashboard user={currentUser} onLogout={handleLogout} />;

  return <div>غير مصرح بالدخول</div>;
}

export default App;
