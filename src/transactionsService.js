import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
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
  // معاملات حيث id1 هو from أو to
  const q1 = query(
    collection(db, "transactions"),
    where("fromId", "==", id1),
    where("toId", "==", id2),
    orderBy("date", "desc")
  );
  const q2 = query(
    collection(db, "transactions"),
    where("fromId", "==", id2),
    where("toId", "==", id1),
    orderBy("date", "desc")
  );
  const s1 = await getDocs(q1);
  const s2 = await getDocs(q2);

  // دمج النتائج
  const all = [
    ...s1.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    ...s2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  ];
  return all.sort((a, b) => b.date - a.date);
}
