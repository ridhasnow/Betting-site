import React, { useState, useEffect } from "react";
import {
  addProvider,
  getAllProviders,
  updateProviderBalance,
  suspendProvider,
  getProviderByCredentials
} from "./providersService";

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

      {/* نافذة تعليق الحسابات
