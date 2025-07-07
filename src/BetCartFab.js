import React, { useContext, useState } from "react";
import { BetCartContext } from "./BetCartContext";
import BetCartPopup from "./BetCartPopup";

export default function BetCartFab() {
  const { cart } = useContext(BetCartContext);
  const [show, setShow] = useState(false);

  if (cart.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          position:"fixed", bottom:80, right:18, zIndex:1002,
          background:"#2176c1", color:"#fff", border:"none", borderRadius:"50%",
          width:56, height:56, fontSize:28, boxShadow:"0 2px 15px #2176c13a", display:"flex", alignItems:"center", justifyContent:"center"
        }}
      >
        🛒
        <span style={{
          background:"red", color:"#fff", borderRadius:"50%", fontSize:15, padding:"2px 7px", marginLeft:4, fontWeight:"bold"
        }}>{cart.length}</span>
      </button>
      {show && <BetCartPopup onClose={()=>setShow(false)} />}
    </>
  );
}
