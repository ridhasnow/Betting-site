import React, { useContext, useState } from "react";
import { BetCartContext } from "./BetCartContext";
import { saveBetForPlayer } from "./betsService";
import AuthSystem from "./AuthSystem";

export default function BetCartPopup({ onClose }) {
  const { cart, removeFromCart, resetCart } = useContext(BetCartContext);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  // جلب بيانات اللاعب من sessionStorage (أو أي مكان آخر)
  const user = JSON.parse(sessionStorage.getItem("auth") || "null");
  const totalCote = cart.reduce((acc,b)=>acc * b.cote, 1).toFixed(2);

  async function handleSubmit() {
    if (!user || user.role !== "player") {
      setNeedLogin(true);
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 1) {
      alert("يرجى إدخال قيمة صحيحة للرهان");
      return;
    }
    setLoading(true);
    try {
      await saveBetForPlayer(user, cart, Number(amount), totalCote);
      setDone(true);
      resetCart();
    } catch (e) {
      alert("فشل حفظ الرهان: " + e.message);
    }
    setLoading(false);
  }

  if (needLogin) return <AuthSystem onLogin={()=>window.location.reload()} />;
  if (done) return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-login" style={{maxWidth:370}} onClick={e=>e.stopPropagation()}>
        <h3>تم تسجيل الرهان بنجاح!</h3>
        <button className="login-btn" onClick={onClose}>موافق</button>
      </div>
    </div>
  );

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-login" style={{maxWidth:370}} onClick={e=>e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} style={{position:"absolute",top:8,right:12}}>×</button>
        <h3>عربة الرهان</h3>
        <table style={{width:"100%",fontSize:"0.98em",marginBottom:8}}>
          <thead><tr><th>المباراة</th><th>الخيار</th><th>الكوت</th><th>حذف</th></tr></thead>
          <tbody>
            {cart.map(b=>(
              <tr key={b.idEvent}>
                <td>{b.home} - {b.away}</td>
                <td>{b.option}</td>
                <td>{b.cote}</td>
                <td>
                  <button style={{background:"red",color:"#fff",border:"none",borderRadius:6,padding:"2px 8px"}} onClick={()=>removeFromCart(b.idEvent)}>X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{margin:"12px 0",fontWeight:"bold"}}>مجموع الكوت: <span style={{color:"#2176c1"}}>{totalCote}</span></div>
        <div>عدد المباريات: {cart.length}</div>
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="قيمة الرهان (دينار)" style={{width:"80%",margin:"14px 0",padding:"9px 12px",borderRadius:8,border:"1px solid #e3e3e3"}} />
        <button className="login-btn" onClick={handleSubmit} disabled={loading}>{loading ? "جاري الحفظ..." : "تأكيد الرهان"}</button>
      </div>
    </div>
  );
}
