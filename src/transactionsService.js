import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// معاملات بين الأدمن والمزودين
export async function addAdminProviderTransaction({ providerId, amount, type }) {
  await addDoc(collection(db, "transactions"), {
    providerId,
    amount,
    type,
    createdAt: Date.now(),
  });
}
export async function getAdminProviderTransactions(providerId) {
  const q = query(
    collection(db, "transactions"),
    where("providerId", "==", providerId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// معاملات بين المزود ولاعبيه
export async function addProviderPlayerTransaction({ providerId, playerId, amount, type }) {
  await addDoc(collection(db, "playerTransactions"), {
    providerId,
    playerId,
    amount,
    type, // add: شحن، sub: سحب
    createdAt: Date.now(),
  });
}
export async function getProviderPlayerTransactions(providerId, playerId) {
  const q = query(
    collection(db, "playerTransactions"),
    where("providerId", "==", providerId),
    where("playerId", "==", playerId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
