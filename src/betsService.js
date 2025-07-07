import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// حفظ رهان جديد
export async function saveBetForPlayer(user, bets, amount, totalCote) {
  // خصم الرصيد أولاً
  if (user.balance < amount) throw new Error("الرصيد غير كافٍ");
  // Save ticket
  await addDoc(collection(db, "bets"), {
    playerId: user.id,
    bets,
    amount,
    totalCote,
    potentialWin: (amount * totalCote).toFixed(2),
    status: "en cours",
    createdAt: Date.now()
  });
  // (ملاحظة: خصم الرصيد من player في Firestore - أضف ذلك حسب نظامك)
}

// جلب كل رهانات لاعب
export async function getBetsForPlayer(playerId) {
  const q = query(collection(db, "bets"), where("playerId", "==", playerId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
