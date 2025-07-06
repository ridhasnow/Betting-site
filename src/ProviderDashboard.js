import React, { useState, useEffect } from "react";
import {
  getPlayersByProvider,
  addPlayer,
  updatePlayerBalance
} from "./playersService";
import {
  updateProviderBalance,
  getProviderByCredentials
} from "./providersService";
import {
  addTransaction,
  getTransactionsBetween
} from "./transactionsService";

function ProviderDashboard({ user, onLogout }) {
  // إدارة الواجهات المنبثقة
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [addPlayerUsername, setAddPlayerUsername] = useState("");
  const [addPlayerPassword, setAddPlayerPassword] = useState("");
  const [addPlayerMsg, setAddPlayerMsg] = useState("");
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [showListUsers, setShowListUsers] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [balanceEdit, setBalanceEdit] = useState({});
  const [showPlayerTx, setShowPlayerTx] = useState(false);
  const [txPlayers, setTxPlayers] = useState([]);
  const [showTxList, setShowTxList] = useState(false);
  const [txList, setTxList] = useState([]);
  const [txTargetPlayer, setTxTargetPlayer] = useState(null);
  const [showAdminTx, setShowAdminTx] = useState(false);
  const [adminTxList, setAdminTxList] = useState([]);
  const [showLogout, setShowLogout] = useState(false);

  // جلب اللاعبين
  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    const p = await getPlayersByProvider(user.id);
    setPlayers(p);
    setLoadingPlayers(false);
  };

  useEffect(() => {
    // تحديث قائمة اللاعبين عند فتح أي modal متعلق باللاعبين
    if (showListUsers || showBalance || showPlayerTx) fetchPlayers();
  }, [showListUsers, showBalance, showPlayerTx, showAddPlayer]);

  // إضافة لاعب جديد
  const handleAddPlayer = async () => {
    setAddPlayerMsg("");
    if (!addPlayerUsername || !addPlayerPassword) {
      setAddPlayerMsg("يرجى تعبئة جميع الحقول");
      return;
    }
    try {
      await addPlayer(addPlayerUsername.trim(), addPlayerPassword, user.id);
      setAddPlayerMsg("تم تسجيل اللاعب بنجاح!");
      setAddPlayerUsername(""); setAddPlayerPassword("");
      fetchPlayers();
    } catch (e) {
      setAddPlayerMsg(e.message || "فشل التسجيل");
    }
  };

  // التحكم في رصيد لاعب
  const handlePlayerBalance = async (playerId, type) => {
    const value = balanceEdit[playerId]?.value;
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      alert("أدخل مبلغ صحيح!");
      return;
    }
    // تحقق رصيد المزود قبل الشحن
    if (type === "add" && Number(value) > Number(user.balance)) {
      alert("لا يوجد رصيد كافٍ في حسابك لإرسال هذا المبلغ!");
      return;
    }
    try {
      // تحديث رصيد اللاعب
      await updatePlayerBalance(playerId, Number(value), type);
      // تحديث رصيد المزود
      await updateProviderBalance(user.id, Number(value), type === "add" ? "sub" : "add");
      // سجل معاملة
      await addTransaction({
        fromId: type === "add" ? user.id : playerId,
        fromType: type === "add" ? "provider" : "player",
        toId: type === "add" ? playerId : user.id,
        toType: type === "add" ? "player" : "provider",
        amount: Number(value),
        action: type
      });
      setBalanceEdit(edit => ({ ...edit, [playerId]: undefined }));
      fetchPlayers();
      // تحديث رصيد المزود في الجلسة بعد العملية
      const provider = await getProviderByCredentials(user.username, user.password);
      if (provider) sessionStorage.setItem("auth", JSON.stringify({ ...provider, role: "provider" }));
    } catch (e) {
      alert("حدث خطأ أثناء تعديل الرصيد: " + e.message);
    }
  };

  // سجل المعاملات مع لاعب
  const handleShowPlayerTx = async (player) => {
    setTxTargetPlayer(player);
    setShowTxList(true);
    const txs = await getTransactionsBetween(user.id, player.id);
    setTxList(txs);
  };

  // سجل المعاملات مع الأدمن
  const handleShowAdminTx = async () => {
    setShowAdminTx(true);
    const txs = await getTransactionsBetween("admin", user.id);
    setAdminTxList(txs);
  };

  // فلترة اللاعبين حسب البحث
  const filteredPlayers = playerSearch
    ? players.filter(p => p.username.toLowerCase().includes(playerSearch.toLowerCase()))
    : players;

  return (
    <div>
      <header className="header header-black">
        <span className="header-title">{user.username}</span>
        <span style={{color:'#fff', fontWeight:'bold', fontSize:'1.1em', background:'#2176c1', borderRadius:8, padding:'6px 14px', marginLeft:'12px'}}>
          {user.balance ?? 0} TND
        </span>
        <button onClick={()=>setShowLogout(true)} style={{marginLeft:"auto", color:'#fff', background:'transparent', border:'none', fontSize:"1.2em", cursor:"pointer"}}>⏻</button>
      </header>
      <div style={{padding: '22px 6px 0 6px'}}>
        <button className="provider-btn" onClick={()=>setShowAddPlayer(true)}>New User Registration</button>
        <button className="provider-btn" onClick={()=>setShowListUsers(true)}>List of Users</button>
        <button className="provider-btn" onClick={()=>setShowBalance(true)}>Add/Withdraw Balance</button>
        <button className="provider-btn" onClick={()=>setShowPlayerTx(true)}>Transaction History Players</button>
        <button className="provider-btn" onClick={handleShowAdminTx}>Transaction History</button>
      </div>

      {/* نافذة تسجيل لاعب جديد */}
      {showAddPlayer && (
        <div className="modal-bg" onClick={()=>setShowAddPlayer(false)}>
          <div className="modal-login" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowAddPlayer(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>تسجيل لاعب جديد</h4>
            <input
              type="text"
              placeholder="اسم المستخدم"
              value={addPlayerUsername}
              onChange={e => setAddPlayerUsername(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={addPlayerPassword}
              onChange={e => setAddPlayerPassword(e.target.value)}
            />
            {addPlayerMsg && (
              <div className={`login-error ${addPlayerMsg.includes("نجاح") ? "success" : ""}`} style={{color: addPlayerMsg.includes("نجاح")?"green":"red"}}>
                {addPlayerMsg}
              </div>
            )}
            <button className="login-btn" onClick={handleAddPlayer}>Add</button>
            <button className="login-btn" style={{background:'#ccc',color:'#222'}} onClick={()=>setShowAddPlayer(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {/* نافذة قائمة المستخدمين */}
      {showListUsers && (
        <div className="modal-bg" onClick={()=>setShowListUsers(false)}>
          <div className="modal-login" style={{maxWidth:440, minWidth:300}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowListUsers(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>قائمة اللاعبين</h4>
            <input
              type="text"
              placeholder="بحث عن لاعب..."
              value={playerSearch}
              onChange={e=>setPlayerSearch(e.target.value)}
              style={{width:"98%",marginBottom:8}}
            />
            {loadingPlayers ? <div>جاري التحميل...</div> :
              <table style={{width:"100%", fontSize:"1em"}}>
                <thead><tr><th>الاسم</th><th>الرصيد</th></tr></thead>
                <tbody>
                  {filteredPlayers.map(p=>(
                    <tr key={p.id}>
                      <td>{p.username}</td>
                      <td>{p.balance} TND</td>
                    </tr>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <tr><td colSpan={2} style={{textAlign:"center",color:"#999"}}>لا يوجد لاعبين</td></tr>
                  )}
                </tbody>
              </table>
            }
            <button className="login-btn" style={{marginTop:10}} onClick={()=>setShowListUsers(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة التحكم بالرصيد */}
      {showBalance && (
        <div className="modal-bg" onClick={()=>setShowBalance(false)}>
          <div className="modal-login" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowBalance(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>تحكم في رصيد اللاعبين</h4>
            {loadingPlayers ? <div>جاري التحميل...</div> :
              <table style={{width:"100%", fontSize:"1em", borderCollapse:"collapse"}}>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الرصيد</th>
                    <th colSpan={2}>تحكم</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(p=>(
                    <tr key={p.id}>
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
                              onClick={()=>handlePlayerBalance(p.id, "add")}
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
                              onClick={()=>handlePlayerBalance(p.id, "sub")}
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

      {/* نافذة سجل معاملات اللاعبين */}
      {showPlayerTx && (
        <div className="modal-bg" onClick={()=>setShowPlayerTx(false)}>
          <div className="modal-login" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowPlayerTx(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>سجل المعاملات مع اللاعبين</h4>
            <input
              type="text"
              placeholder="بحث عن لاعب..."
              value={playerSearch}
              onChange={e=>setPlayerSearch(e.target.value)}
              style={{width:"98%",marginBottom:8}}
            />
            {loadingPlayers ? <div>جاري التحميل...</div> :
              <table style={{width:"100%", fontSize:"1em"}}>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>رصيد</th>
                    <th>سجل المعاملات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map(p=>(
                    <tr key={p.id}>
                      <td>{p.username}</td>
                      <td>{p.balance} TND</td>
                      <td>
                        <button className="login-btn" style={{fontSize:14, padding:"4px 10px"}} onClick={()=>handleShowPlayerTx(p)}>voir</button>
                      </td>
                    </tr>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <tr><td colSpan={3} style={{textAlign:"center",color:"#999"}}>لا يوجد لاعبين</td></tr>
                  )}
                </tbody>
              </table>
            }
            <button className="login-btn" style={{marginTop:10}} onClick={()=>setShowPlayerTx(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة سجل معاملات لاعب معين */}
      {showTxList && (
        <div className="modal-bg" onClick={()=>setShowTxList(false)}>
          <div className="modal-login" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowTxList(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>سجل {txTargetPlayer?.username}</h4>
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
            <button className="login-btn" style={{marginTop:10}} onClick={()=>setShowTxList(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {/* سجل معاملات مع الأدمن */}
      {showAdminTx && (
        <div className="modal-bg" onClick={()=>setShowAdminTx(false)}>
          <div className="modal-login" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setShowAdminTx(false)} style={{position:"absolute",top:8,right:12}}>×</button>
            <h4>سجل معاملاتك مع الأدمن</h4>
            <table style={{width:"100%", fontSize:"1em"}}>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>المعاملة</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {adminTxList.length === 0 && (
                  <tr><td colSpan={3} style={{textAlign:"center",color:"#999"}}>لا يوجد معاملات</td></tr>
                )}
                {adminTxList.map((tx,i)=>(
                  <tr key={i}>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                    <td style={{color:tx.action==="add"?"green":"red"}}>{tx.action === "add" ? "+" : "-"}</td>
                    <td>{tx.amount} TND</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="login-btn" style={{marginTop:10}} onClick={()=>setShowAdminTx(false)}>إغلاق</button>
          </div>
        </div>
      )}

      {/* تأكيد الخروج */}
      {showLogout && (
        <div className="modal-bg" onClick={()=>setShowLogout(false)}>
          <div className="modal-login" style={{maxWidth:260}} onClick={e=>e.stopPropagation()}>
            <h4>تأكيد الخروج</h4>
            <button className="login-btn" onClick={onLogout}>تأكيد</button>
            <button className="login-btn" style={{background:'#ccc',color:'#222'}} onClick={()=>setShowLogout(false)}>إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderDashboard;
