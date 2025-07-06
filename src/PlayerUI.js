import React, { useState } from "react";

export default function PlayerUI({ user, onLogout }) {
  const [show, setShow] = useState(false);

  return (
    <header className="header header-black">
      <span className="header-title">Accueil</span>
      <button
        style={{
          color: '#fff',
          background: 'transparent',
          border: 'none',
          fontWeight: "bold",
          fontSize: "1.1em",
          borderRadius: 8,
          padding: '6px 14px',
          marginLeft: '12px',
          cursor: "pointer"
        }}
        onClick={() => setShow(s => !s)}
      >{user.username}</button>
      <button
        onClick={onLogout}
        style={{
          marginLeft: "auto", color: '#fff',
          background: 'transparent',
          border: 'none',
          fontSize: "1.2em",
          cursor: "pointer"
        }}
        title="Logout"
      >⏻</button>
      {show && (
        <div className="modal-bg" onClick={()=>setShow(false)}>
          <div className="modal-login" style={{maxWidth:220}} onClick={e=>e.stopPropagation()}>
            <h4>رصيدك</h4>
            <div style={{color:"#2176c1", fontWeight:"bold", fontSize:"1.3em", margin:"18px 0"}}>{user.balance ?? 0} TND</div>
            <button className="login-btn" onClick={()=>setShow(false)}>إغلاق</button>
          </div>
        </div>
      )}
    </header>
  );
}
