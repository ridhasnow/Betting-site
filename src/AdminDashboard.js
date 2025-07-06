import React, { useState, useEffect } from "react";
import { getAllProviders, addProvider, updateProviderBalance, suspendProvider } from "./providersService";
import { addTransaction, getTransactionsBetween } from "./transactionsService";

function AdminDashboard({ user, onLogout }) {
  const [showBalance, setShowBalance] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [balanceEdit, setBalanceEdit] = useState({});
  const [showTxList, setShowTxList] = useState(false);
  const [txList, setTxList] = useState([]);
  const [txTargetProvider, setTxTargetProvider] = useState(null);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showAddShop, setShowAddShop] = useState(false);
  const [shopUsername, setShopUsername] = useState("");
  const [shopPassword, setShopPassword] = useState("");
  const [addShopError, setAddShopError] = useState("");
  const [addShopSuccess, setAddShopSuccess] = useState("");
  const [showProviderTxModal, setShowProviderTxModal] = useState(false); // جديد

  const fetchProviders = async () => {
    setLoadingProviders(true);
    const data = await getAllProviders();
    setProviders(data);
    setLoadingProviders(false);
  };

  useEffect(() => {
    if (showBalance || showSuspend) fetchProviders();
    setBalanceEdit({});
  }, [showBalance, showSuspend]);

  // تعديل الرصيد (إضافة/سحب)
  const handleBalanceChange = async (id, type) => {
    const value = balanceEdit[id]?.value;
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      alert("أدخل رقم صحيح!");
      return;
    }
    try {
      await updateProviderBalance(id, Number(value), type); // type: "add" or "sub"
      await addTransaction({
        fromId: type === "add" ? "admin" : id,
        fromType: "admin",
        toId: type === "add" ? id : "admin",
        toType: "provider",
        amount: Number(value),
        action: type
      });
      setBalanceEdit(edit => ({ ...edit, [id]: undefined }));
      fetchProviders();
    } catch (e) {
      alert("حدث خطأ أثناء تعديل الرصيد");
    }
  };

  // سجل المعاملات مع مزود
  const handleShowTx = async (provider) => {
    setTxTargetProvider(provider);
    setShowProviderTxModal(true); // فتح النافذة الجديدة
    const txs = await getTransactionsBetween("admin", provider.id);
    setTxList(txs);
  };

  // تعليق/إلغاء تعليق مزود
  const handleSuspend = async (id, isSuspended) => {
    try {
      await suspendProvider(id, isSuspended);
      fetchProviders();
    } catch (e) {
      alert("خطأ في التعليق/التفعيل");
    }
  };

  // إضافة مزود (متجر)
  const handleAddShop = async () => {
    setAddShopError("");
    setAddShopSuccess("");
    if (!shopUsername || !shopPassword) {
      setAddShopError("يرجى تعبئة جميع الحقول");
      return;
    }
    if (shopUsername.length < 3 || shopPassword.length < 6) {
      setAddShopError("اسم المستخدم 3 أحرف على الأقل وكلمة المرور 6 أحرف على الأقل");
      return;
    }
    try {
      await addProvider(shopUsername.trim(), shopPassword);
      setAddShopSuccess("تم إنشاء المتجر بنجاح!");
      setShopUsername("");
      setShopPassword("");
      fetchProviders();
    } catch (e) {
      setAddShopError(e.message || "خطأ أثناء إنشاء المتجر");
    }
  };

  return (
    <div>
      <header className="header header-black">
        <span className="header-title">Admin</span>
        <span style={{color:'#fff', fontWeight:'bold', fontSize:'1.1em', background:'#2176c1', borderRadius:8, padding:'6px 14px', marginLeft:'12px'}}>
          999,999,999 TND
        </span>
        <button onClick={onLogout} style={{ color:'#fff', background:'transparent', border:'none', fontSize:"1.2em", cursor:"pointer", marginLeft:2}}>⏻</button>
      </header>
      <div style={{padding: '22px 6px 0 6px'}}>
        <button className="provider-btn" onClick={()=>setShowAddShop(true)}>Add Shop</button>
        <button className="provider-btn" onClick={()=>setShowBalance(true)}>Add/Withdraw Balance</button>
        <button className="provider-btn" onClick={()=>setShowSuspend(true)}>Delete Shop</button>
        <button className="provider-btn" onClick={fetchProviders}>Transaction History</button>
      </div>

      {/* نافذة إضافة متجر (مزود) جديد */}
      {showAddShop && (
        <div className="modal-bg" onClick={()=>setShowAddShop(false)}>
          <div className="modal-login" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowAddShop(false)} style={{position:"absolute",top:8,right:12}}>×</button>
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

      {/* نافذة التحكم بالرصيد */}
      {showBalance && (
        <div className="modal-bg" onClick={()=>setShowBalance(false)}>
          <div className="modal-login" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowBalance(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>قائمة المزودين (تحكم في الرصيد)</h4>
            {loadingProviders ? <div>جاري التحميل...</div> :
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
                      <td>{p.balance} TND</td>
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
        <div className="modal-bg" onClick={()=>setShowSuspend(false)}>
          <div className="modal-login" style={{maxWidth:410}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowSuspend(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>قائمة المزودين (تعليق/تفعيل الحسابات)</h4>
            {loadingProviders ? <div>جاري التحميل...</div> :
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

      {/* سجل التحويلات مع المزودين (الجدول الرئيسي مع أزرار voir) */}
      {!showBalance && !showSuspend && providers.length > 0 && (
        <div style={{margin:"18px 0"}}>
          <div className="modal-login" style={{maxWidth:440, minWidth:300, margin:"0 auto"}}>
            <h4>سجل التحويلات مع المزودين</h4>
            {loadingProviders ? <div>جاري التحميل...</div> :
              <table style={{width:"100%", fontSize:"1em"}}>
                <thead>
                  <tr><th>الاسم</th><th>الرصيد</th><th>سجل التحويلات</th></tr>
                </thead>
                <tbody>
                  {providers.map(p=>(
                    <tr key={p.id}>
                      <td>{p.username}</td>
                      <td>{p.balance} TND</td>
                      <td>
                        <button className="login-btn" style={{fontSize:14, padding:"4px 10px"}} onClick={()=>handleShowTx(p)}>voir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </div>
      )}

      {/* نافذة سجل التحويلات لكل مزود */}
      {showProviderTxModal && (
        <div className="modal-bg" onClick={()=>setShowProviderTxModal(false)}>
          <div className="modal-login" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowProviderTxModal(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>سجل {txTargetProvider?.username}</h4>
            <table style={{width:"100%", fontSize:"1em"}}>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>المعاملة</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {txList.length === 0 && (
                  <tr><td colSpan={3} style={{textAlign:"center",color:"#999"}}>لا يوجد معاملات</td></tr>
                )}
                {txList.map((tx,i)=>(
                  <tr key={i}>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                    <td style={{color:tx.action==="add"?"green":"red"}}>{tx.action === "add" ? "+" : "-"}</td>
                    <td>{tx.amount} TND</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="login-btn" style={{marginTop:10}} onClick={()=>setShowProviderTxModal(false)}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
