import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// إضافة لاعب جديد لمزود محدد
export async function addPlayer(username, password, providerId) {
  // تحقق من التكرار عبر جميع اللاعبين
  const q = query(collection(db, "players"), where("username", "==", username));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) throw new Error("اسم المستخدم هذا محجوز!");
  await addDoc(collection(db, "players"), {
    username,
    password,
    providerId,
    balance: 0,
    createdAt: Date.now(),
    suspended: false
  });
}

// جلب كل لاعبي مزود معين
export async function getPlayersByProvider(providerId) {
  const q = query(collection(db, "players"), where("providerId", "==", providerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// جلب لاعب حسب الاسم وكلمة السر
export async function getPlayerByCredentials(username, password) {
  const q = query(collection(db, "players"), where("username", "==", username), where("password", "==", password));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

// تحديث رصيد لاعب
export async function updatePlayerBalance(id, amount, type = "add") {
  const ref = doc(db, "players", id);
  const playerSnap = await getDoc(ref);
  if (!playerSnap.exists()) throw new Error("Player not found");
  const currentBalance = playerSnap.data().balance || 0;
  let newBalance = currentBalance;
  if (type === "add") {
    newBalance = currentBalance + Number(amount);
  } else if (type === "sub") {
    if (currentBalance < Number(amount)) throw new Error("لا يوجد رصيد كافٍ للسحب");
    newBalance = currentBalance - Number(amount);
  }
  await updateDoc(ref, { balance: newBalance });
}
