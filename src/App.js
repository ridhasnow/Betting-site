import React, { useState, useEffect } from "react";
import AuthSystem from "./AuthSystem";
import {
  addProvider,
  getAllProviders,
  updateProviderBalance,
  suspendProvider,
  getProviderPlayers,
  addPlayerToProvider,
  updatePlayerBalance,
} from "./providersService";
import {
  addAdminProviderTransaction,
  getAdminProviderTransactions,
  addProviderPlayerTransaction,
  getProviderPlayerTransactions,
} from "./transactionsService";
import { MdLogout, MdVisibility, MdVisibilityOff } from "react-icons/md";

// حساب الأدمن الثابت
const ADMIN_ACCOUNT = {
  username: "ridhasnow",
  password: "azerty12345",
  role: "admin",
  balance: 999999999,
};

export default function App() {
  // الجلسة
  const [user, setUser] = useState(null);

  // عند تسجيل الدخول
  const handleLogin = (userData) => {
    setUser(userData);
    window.localStorage.setItem("sessionUser", JSON.stringify(userData));
  };

  // إعادة الجلسة
  useEffect(() => {
    const u = window.localStorage.getItem("sessionUser");
    if (u) setUser(JSON.parse(u));
  }, []);

  // تسجيل الخروج (يدوي فقط)
  const handleLogout = () => {
    setUser(null);
    window.localStorage.removeItem("sessionUser");
  };

  // واجهة الأدمن
  if (user && user.role === "admin") return <AdminDashboard admin={user} onLogout={handleLogout} />;

  // واجهة المزود
  if (user && user.role === "provider") return <ProviderDashboard provider={user} onLogout={handleLogout} />;

  // واجهة اللاعب
  if (user && user.role === "player") return <PlayerDashboard player={user} onLogout={handleLogout} />;

  // شاشة الدخول
  return <AuthSystem onLogin={handleLogin} />;
}

// ========== Admin Dashboard ==========
function AdminDashboard({ admin, onLogout }) {
  // مزودين
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [errProviders, setErrProviders] = useState("");
  // إضافة مزود
  const [showAdd, setShowAdd] = useState(false);
  const [addUser, setAddUser] = useState("");
  const [addPass, setAddPass] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addErr, setAddErr] = useState("");
  // رصيد مزود
  const [showBalance, setShowBalance] = useState(false);
  const [balanceId, setBalanceId] = useState("");
  const [balanceType, setBalanceType] = useState("add");
  const [balanceVal, setBalanceVal] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceErr, setBalanceErr] = useState("");
  // تعليق مزود
  const [suspLoading, setSuspLoading] = useState("");
  // سجل التحويلات الأدمن
  const [showTransHistory, setShowTransHistory] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [providerTransactions, setProviderTransactions] = useState([]);
  const [loadingTrans, setLoadingTrans] = useState(false);

  // جلب المزودين
  const fetchProviders = async () => {
    setLoadingProviders(true);
    setErrProviders("");
    try {
      const data = await getAllProviders();
      setProviders(data);
    } catch (e) {
      setErrProviders("فشل تحميل المزودين");
    }
    setLoadingProviders(false);
  };
  useEffect(() => {
    fetchProviders();
  }, []);

  // إضافة مزود
  const handleAddProvider = async (e) => {
    e.preventDefault();
    if (!addUser.trim() || !addPass) {
      setAddErr("أدخل اسم مستخدم وكلمة سر");
      return;
    }
    setAddLoading(true);
    setAddErr("");
    try {
      await addProvider(addUser.trim(), addPass);
      setAddUser(""); setAddPass(""); setShowAdd(false);
      fetchProviders();
    } catch (e) {
      setAddErr("خطأ: " + e.message);
    }
    setAddLoading(false);
  };

  // رصيد مزود
  const openBalance = (id, type) => {
    setBalanceId(id);
    setBalanceType(type);
    setBalanceVal("");
    setBalanceErr("");
    setShowBalance(true);
  };
  const handleBalanceChange = async (e) => {
    e.preventDefault();
    if (!balanceVal || isNaN(balanceVal) || Number(balanceVal) <= 0) {
      setBalanceErr("أدخل مبلغ صحيح");
      return;
    }
    setBalanceLoading(true);
    setBalanceErr("");
    try {
      await updateProviderBalance(balanceId, Number(balanceVal), balanceType);
      // سجل العملية
      await addAdminProviderTransaction({
        providerId: balanceId,
        amount: Number(balanceVal),
        type: balanceType,
      });
      setShowBalance(false);
      fetchProviders();
    } catch (e) {
      setBalanceErr("خطأ: " + e.message);
    }
    setBalanceLoading(false);
  };

  // تعليق
  const handleSuspend = async (id, isSusp) => {
    setSuspLoading(id);
    await suspendProvider(id, isSusp);
    fetchProviders();
    setSuspLoading("");
  };

  // سجل التحويلات مع مزود
  const openTrans = async (provId) => {
    setSelectedProviderId(provId);
    setLoadingTrans(true);
    const data = await getAdminProviderTransactions(provId);
    setProviderTransactions(data);
    setLoadingTrans(false);
  };

  return (
    <div>
      <div className="header header-black">
        <span className="header-title">لوحة الأدمن</span>
        <button className="provider-btn" style={{ width: 120, margin: 0 }} onClick={onLogout}>
          <MdLogout size={22} /> خروج
        </button>
      </div>

      <button className="provider-btn" onClick={() => setShowAdd(true)}>إضافة مزود جديد</button>
      <button className="provider-btn" style={{background:"#444"}} onClick={() => setShowTransHistory(true)}>
        سجل التحويلات (transaction history)
      </button>

      <h3 style={{margin:"20px 0 5px 0"}}>المزودون:</h3>
      {loadingProviders ? <div>جاري التحميل...</div> :
        errProviders ? <div style={{ color: 'red' }}>{errProviders}</div> :
        <table style={{ width: "100%", fontSize: "1em", direction:"rtl" }}>
          <thead><tr>
            <th>اسم المستخدم</th><th>الرصيد (TND)</th>
            <th>تحكم الرصيد</th>
            <th>تعليق/إلغاء</th>
          </tr></thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.id} style={{opacity:p.suspended ? 0.5 : 1}}>
                <td>{p.username}</td>
                <td>{p.balance}</td>
                <td>
                  <button className="login-btn" style={{padding:"2px 7px", fontSize:14}} onClick={()=>openBalance(p.id,"add")}>شحن</button>
                  <button className="login-btn" style={{padding:"2px 7px", fontSize:14, background:"#b31d1d"}} onClick={()=>openBalance(p.id,"sub")}>سحب</button>
                </td>
                <td>
                  <button className="login-btn" style={{padding:"2px 7px", fontSize:14, background:p.suspended?"#2176c1":"#b31d1d"}}
                    onClick={()=>handleSuspend(p.id,!p.suspended)} disabled={suspLoading===p.id}>
                    {p.suspended ? "إلغاء تعليق" : "تعليق"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }

      {/* نافذة إضافة مزود */}
      {showAdd && (
        <div className="modal-bg">
          <div className="modal-login">
            <h4>إضافة مزود جديد</h4>
            <form onSubmit={handleAddProvider}>
              <input type="text" placeholder="اسم المستخدم" value={addUser} onChange={e=>setAddUser(e.target.value)} />
              <input type="password" placeholder="كلمة السر" value={addPass} onChange={e=>setAddPass(e.target.value)} />
              {addErr && <div style={{color:"red"}}>{addErr}</div>}
              <button className="login-btn" type="submit" disabled={addLoading}>{addLoading ? "..." : "إضافة"}</button>
            </form>
            <button className="close-btn" style={{position:"absolute",top:8,right:16}} onClick={()=>setShowAdd(false)}>×</button>
          </div>
        </div>
      )}

      {/* نافذة شحن/سحب */}
      {showBalance && (
        <div className="modal-bg">
          <div className="modal-login">
            <h4>{balanceType==="add"?"شحن رصيد مزود":"سحب رصيد من مزود"}</h4>
            <form onSubmit={handleBalanceChange}>
              <input type="number" placeholder="المبلغ (TND)" value={balanceVal} onChange={e=>setBalanceVal(e.target.value)} />
              {balanceErr && <div style={{color:"red"}}>{balanceErr}</div>}
              <button className="login-btn" type="submit" disabled={balanceLoading}>{balanceLoading ? "..." : (balanceType==="add"?"شحن":"سحب")}</button>
            </form>
            <button className="close-btn" style={{position:"absolute",top:8,right:16}} onClick={()=>setShowBalance(false)}>×</button>
          </div>
        </div>
      )}

      {/* نافذة سجل التحويلات مع جميع المزودين */}
      {showTransHistory && (
        <div className="modal-bg">
          <div className="modal-login" style={{ maxWidth: 410 }}>
            <h4>سجل المعاملات مع المزودين</h4>
            {loadingProviders ? <div>جاري التحميل...</div> :
              errProviders ? <div style={{ color: 'red' }}>{errProviders}</div> :
              <table style={{ width: "100%", fontSize: "1em" }}>
                <thead><tr><th>الاسم</th><th>الرصيد</th><th>سجل التحويلات</th></tr></thead>
                <tbody>
                  {providers.map(p => (
                    <tr key={p.id}>
                      <td>{p.username}</td>
                      <td>{p.balance}</td>
                      <td>
                        <button
                          className="login-btn"
                          style={{ padding: "2px 10px", fontSize: 14 }}
                          onClick={() => openTrans(p.id)}
                        >
                          voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            <button className="login-btn" style={{ marginTop: 10 }} onClick={() => setShowTransHistory(false)}>×</button>
          </div>

          {/* نافذة سجل معاملات مزود معين */}
          {selectedProviderId && (
            <div className="modal-bg">
              <div className="modal-login" style={{ maxWidth: 420 }}>
                <h4>سجل مزود</h4>
                <button className="close-btn" style={{position:"absolute", top:8, right:16, fontSize:22}} onClick={() => setSelectedProviderId(null)}>×</button>
                {loadingTrans ? (
                  <div>جاري التحميل...</div>
                ) : providerTransactions.length === 0 ? (
                  <div style={{ color: "#888" }}>لا يوجد معاملات</div>
                ) : (
                  <table style={{ width: "100%", fontSize: "1em" }}>
                    <thead>
                      <tr>
                        <th>التاريخ</th>
                        <th>النوع</th>
                        <th>المبلغ (TND)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providerTransactions.map(tr => (
                        <tr key={tr.id}>
                          <td>{new Date(tr.createdAt).toLocaleString()}</td>
                          <td style={{ color: tr.type === "add" ? "green" : "red", fontWeight: "bold" }}>
                            {tr.type === "add" ? "+" : "-"}
                          </td>
                          <td>{tr.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ========== Provider Dashboard ==========
function ProviderDashboard({ provider, onLogout }) {
  // لاعبين المزود
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [errPlayers, setErrPlayers] = useState("");
  // إضافة لاعب
  const [showAdd, setShowAdd] = useState(false);
  const [addUser, setAddUser] = useState("");
  const [addPass, setAddPass] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addErr, setAddErr] = useState("");
  // رصيد لاعب
  const [showBalance, setShowBalance] = useState(false);
  const [balanceId, setBalanceId] = useState("");
  const [balanceType, setBalanceType] = useState("add");
  const [balanceVal, setBalanceVal] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceErr, setBalanceErr] = useState("");
  // سجل التحويلات
  const [showTransHistory, setShowTransHistory] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [playerTransactions, setPlayerTransactions] = useState([]);
  const [loadingTrans, setLoadingTrans] = useState(false);

  // جلب اللاعبين
  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    setErrPlayers("");
    try {
      const data = await getProviderPlayers(provider.id);
      setPlayers(data);
    } catch (e) {
      setErrPlayers("فشل تحميل اللاعبين");
    }
    setLoadingPlayers(false);
  };
  useEffect(() => {
    fetchPlayers();
  }, [provider.id]);

  // إضافة لاعب
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!addUser.trim() || !addPass) {
      setAddErr("أدخل اسم مستخدم وكلمة سر");
      return;
    }
    setAddLoading(true);
    setAddErr("");
    try {
      await addPlayerToProvider(provider.id, addUser.trim(), addPass);
      setAddUser(""); setAddPass(""); setShowAdd(false);
      fetchPlayers();
    } catch (e) {
      setAddErr("خطأ: " + e.message);
    }
    setAddLoading(false);
  };

  // رصيد لاعب
  const openBalance = (id, type) => {
    setBalanceId(id);
    setBalanceType(type);
    setBalanceVal("");
    setBalanceErr("");
    setShowBalance(true);
  };
  const handleBalanceChange = async (e) => {
    e.preventDefault();
    if (!balanceVal || isNaN(balanceVal) || Number(balanceVal) <= 0) {
      setBalanceErr("أدخل مبلغ صحيح");
      return;
    }
    setBalanceLoading(true);
    setBalanceErr("");
    try {
      await updatePlayerBalance(balanceId, Number(balanceVal), balanceType);
      // سجل العملية
      await addProviderPlayerTransaction({
        providerId: provider.id,
        playerId: balanceId,
        amount: Number(balanceVal),
        type: balanceType,
      });
      setShowBalance(false);
      fetchPlayers();
    } catch (e) {
      setBalanceErr("خطأ: " + e.message);
    }
    setBalanceLoading(false);
  };

  // سجل التحويلات مع لاعب
  const openTrans = async (playerId) => {
    setSelectedPlayerId(playerId);
    setLoadingTrans(true);
    const data = await getProviderPlayerTransactions(provider.id, playerId);
    setPlayerTransactions(data);
    setLoadingTrans(false);
  };

  return (
    <div>
      <div className="header header-black">
        <span className="header-title">لوحة المزود</span>
        <span style={{fontWeight:"bold",fontSize:"1.1em",marginRight:10}}>الرصيد: {provider.balance} TND</span>
        <button className="provider-btn" style={{ width: 120, margin: 0 }} onClick={onLogout}>
          <MdLogout size={22} /> خروج
        </button>
      </div>

      <button className="provider-btn" onClick={() => setShowAdd(true)}>إضافة لاعب جديد</button>
      <button className="provider-btn" style={{background:"#444"}} onClick={() => setShowTransHistory(true)}>
        سجل التحويلات (transaction history)
      </button>

      <h3 style={{margin:"20px 0 5px 0"}}>اللاعبون:</h3>
      {loadingPlayers ? <div>جاري التحميل...</div> :
        errPlayers ? <div style={{ color: 'red' }}>{errPlayers}</div> :
        <table style={{ width: "100%", fontSize: "1em", direction:"rtl" }}>
          <thead><tr>
            <th>اسم المستخدم</th><th>الرصيد (TND)</th>
            <th>تحكم الرصيد</th>
          </tr></thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id}>
                <td>{p.username}</td>
                <td>{p.balance}</td>
                <td>
                  <button className="login-btn" style={{padding:"2px 7px", fontSize:14}} onClick={()=>openBalance(p.id,"add")}>شحن</button>
                  <button className="login-btn" style={{padding:"2px 7px", fontSize:14, background:"#b31d1d"}} onClick={()=>openBalance(p.id,"sub")}>سحب</button>
                  <button className="login-btn" style={{padding:"2px 7px", fontSize:14, background:"#2176c1", marginRight:7}} onClick={()=>openTrans(p.id)}>سجل التحويلات</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }

      {/* نافذة إضافة لاعب */}
      {showAdd && (
        <div className="modal-bg">
          <div className="modal-login">
            <h4>إضافة لاعب جديد</h4>
            <form onSubmit={handleAddPlayer}>
              <input type="text" placeholder="اسم المستخدم" value={addUser} onChange={e=>setAddUser(e.target.value)} />
              <input type="password" placeholder="كلمة السر" value={addPass} onChange={e=>setAddPass(e.target.value)} />
              {addErr && <div style={{color:"red"}}>{addErr}</div>}
              <button className="login-btn" type="submit" disabled={addLoading}>{addLoading ? "..." : "إضافة"}</button>
            </form>
            <button className="close-btn" style={{position:"absolute",top:8,right:16}} onClick={()=>setShowAdd(false)}>×</button>
          </div>
        </div>
      )}

      {/* نافذة شحن/سحب */}
      {showBalance && (
        <div className="modal-bg">
          <div className="modal-login">
            <h4>{balanceType==="add"?"شحن رصيد لاعب":"سحب رصيد من لاعب"}</h4>
            <form onSubmit={handleBalanceChange}>
              <input type="number" placeholder="المبلغ (TND)" value={balanceVal} onChange={e=>setBalanceVal(e.target.value)} />
              {balanceErr && <div style={{color:"red"}}>{balanceErr}</div>}
              <button className="login-btn" type="submit" disabled={balanceLoading}>{balanceLoading ? "..." : (balanceType==="add"?"شحن":"سحب")}</button>
            </form>
            <button className="close-btn" style={{position:"absolute",top:8,right:16}} onClick={()=>setShowBalance(false)}>×</button>
          </div>
        </div>
      )}

      {/* سجل التحويلات لكل لاعب */}
      {showTransHistory && (
        <div className="modal-bg">
          <div className="modal-login" style={{ maxWidth: 410 }}>
            <h4>سجل المعاملات مع اللاعبين</h4>
            {loadingPlayers ? <div>جاري التحميل...</div> :
              errPlayers ? <div style={{ color: 'red' }}>{errPlayers}</div> :
              <table style={{ width: "100%", fontSize: "1em" }}>
                <thead><tr><th>الاسم</th><th>الرصيد</th><th>سجل التحويلات</th></tr></thead>
                <tbody>
                  {players.map(p => (
                    <tr key={p.id}>
                      <td>{p.username}</td>
                      <td>{p.balance}</td>
                      <td>
                        <button
                          className="login-btn"
                          style={{ padding: "2px 10px", fontSize: 14 }}
                          onClick={() => openTrans(p.id)}
                        >
                          voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            <button className="login-btn" style={{ marginTop: 10 }} onClick={() => setShowTransHistory(false)}>×</button>
          </div>

          {/* نافذة سجل معاملات لاعب معين */}
          {selectedPlayerId && (
            <div className="modal-bg">
              <div className="modal-login" style={{ maxWidth: 420 }}>
                <h4>سجل لاعب</h4>
                <button className="close-btn" style={{position:"absolute", top:8, right:16, fontSize:22}} onClick={() => setSelectedPlayerId(null)}>×</button>
                {loadingTrans ? (
                  <div>جاري التحميل...</div>
                ) : playerTransactions.length === 0 ? (
                  <div style={{ color: "#888" }}>لا يوجد معاملات</div>
                ) : (
                  <table style={{ width: "100%", fontSize: "1em" }}>
                    <thead>
                      <tr>
                        <th>التاريخ</th>
                        <th>النوع</th>
                        <th>المبلغ (TND)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerTransactions.map(tr => (
                        <tr key={tr.id}>
                          <td>{new Date(tr.createdAt).toLocaleString()}</td>
                          <td style={{ color: tr.type === "add" ? "green" : "red", fontWeight: "bold" }}>
                            {tr.type === "add" ? "+" : "-"}
                          </td>
                          <td>{tr.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== Player Dashboard ==========
function PlayerDashboard({ player, onLogout }) {
  return (
    <div>
      <div className="header header-black">
        <span className="header-title">مرحبا {player.username}</span>
        <span style={{fontWeight:"bold",fontSize:"1.1em",marginRight:10}}>الرصيد: {player.balance} TND</span>
        <button className="provider-btn" style={{ width: 120, margin: 0 }} onClick={onLogout}>
          <MdLogout size={22} /> خروج
        </button>
      </div>
      <div style={{margin:"40px auto",textAlign:"center",fontSize:"1.2em",color:"#2176c1"}}>
        يمكنك رؤية رصيدك في الأعلى.<br/>
        إذا واجهتك مشكلة تواصل مع مزودك.
      </div>
    </div>
  );
}
