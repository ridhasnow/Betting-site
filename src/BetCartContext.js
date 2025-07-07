import React, { createContext, useState } from "react";

export const BetCartContext = createContext();

export function BetCartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function addToCart(bet) {
    setCart(prev => prev.find(b=>b.idEvent===bet.idEvent) ? prev : [...prev, bet]);
  }
  function removeFromCart(idEvent) {
    setCart(prev => prev.filter(b=>b.idEvent!==idEvent));
  }
  function resetCart() {
    setCart([]);
  }

  return (
    <BetCartContext.Provider value={{cart, addToCart, removeFromCart, resetCart}}>
      {children}
    </BetCartContext.Provider>
  );
}
