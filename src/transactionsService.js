import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// إضافة معاملة جديدة
export async function addTransaction({ fromId, fromType, toId, toType, amount, action }) {
  // action: "add" أو "sub" (add=شحن، sub=سحب)
  await addDoc(collection(db, "transactions"), {
    fromId, fromType, toId, toType, amount, action,
    date: Date.now()
  });
}

// جلب كل معاملات بين طرفين (أدمن/مزود أو مزود/لاعب)
export async function getTransactionsBetween(id1, id2) {
  // جلب كل العمليات ثم الفلترة يدويا لضمان ظهور كل العمليات في الاتجاهين
  const q = query(collection(db, "transactions"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  const all = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(tx =>
      (tx.fromId === id1 && tx.toId === id2) ||
      (tx.fromId === id2 && tx.toId === id1)
    );
  return all;
}
