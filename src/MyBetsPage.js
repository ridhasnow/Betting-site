import React, { useEffect, useState } from "react";
import { getBetsForPlayer } from "./betsService";

export default function MyBetsPage() {
  const user = JSON.parse(sessionStorage.getItem("auth") || "null");
  const [bets, setBets] = useState([]);

  useEffect(() => {
    if (user && user.role === "player") {
      getBetsForPlayer(user.id).then(setBets);
    }
  }, []);

  function statusColor(status) {
    if (status === "winner") return "#0c8";
    if (status === "loser") return "#d00";
    return "#fa0";
  }

  return (
    <div style={{padding:"0 0 40px 0",minHeight:"100vh",background:"#f7f8fa"}}>
      <header className="header header-black">
        <span className="header-title">رهاناتي</span>
      </header>
      <div style={{padding:"14px 8px"}}>
        {bets.length === 0 ? <div style={{color:"#888"}}>لا توجد رهانات بعد</div>
          :
          bets.map(bt=>(
            <div key={bt.id} style={{
              background:"#fff",borderRadius:11,boxShadow:"0 2px 12px #2176c122",
              padding:"15px 8px",marginBottom:14
            }}>
              <div style={{marginBottom:8,fontWeight:"bold"}}>تذكرة رقم: {bt.id.slice(-5)}</div>
              <table style={{width:"100%",fontSize:"0.96em",marginBottom:7}}>
                <thead><tr><th>المباراة</th><th>الخيار</th><th>الكوت</th></tr></thead>
                <tbody>
                  {bt.bets.map(ev=>(
                    <tr key={ev.idEvent}>
                      <td>{ev.home} - {ev.away}</td>
                      <td>{ev.option}</td>
                      <td>{ev.cote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>المبلغ: <b>{bt.amount}</b> د.ت | الكوت الكلي: <b>{bt.totalCote}</b></div>
              <div>الربح المحتمل: <b>{bt.potentialWin}</b> د.ت</div>
              <div style={{color:statusColor(bt.status),fontWeight:"bold",marginTop:5}}>
                {bt.status === "en cours" ? "قيد الانتظار" : bt.status === "winner" ? "رابح" : "خاسر"}
              </div>
              <div style={{fontSize:"0.88em",color:"#888"}}>{new Date(bt.createdAt).toLocaleString()}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
