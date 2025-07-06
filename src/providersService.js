import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// إضافة مزود جديد
export async function addProvider(username, password) {
  await addDoc(collection(db, "providers"), {
    username,
    password,
    balance: 0,
    createdAt: Date.now(),
    suspended: false
  });
}

// جلب كل المزودين
export async function getAllProviders() {
  const snapshot = await getDocs(collection(db, "providers"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// تحديث رصيد مزود (إضافة أو سحب)
export async function updateProviderBalance(id, amount, type = "add") {
  const ref = doc(db, "providers", id);
  const providerSnap = await getDoc(ref);
  if (!providerSnap.exists()) throw new Error("Provider not found");
  const currentBalance = providerSnap.data().balance || 0;
  let newBalance = currentBalance;
  if (type === "add") {
    newBalance = currentBalance + Number(amount);
  } else if (type === "sub") {
    if (currentBalance < Number(amount)) throw new Error("لا يوجد رصيد كافٍ للسحب");
    newBalance = currentBalance - Number(amount);
  }
  await updateDoc(ref, { balance: newBalance });
}

// تعليق/إلغاء تعليق مزود
export async function suspendProvider(id, isSuspended) {
  const ref = doc(db, "providers", id);
  await updateDoc(ref, { suspended: isSuspended });
}

// جلب مزود حسب الاسم وكلمة السر (للدخول)
export async function getProviderByCredentials(username, password) {
  const q = query(collection(db, "providers"), where("username", "==", username), where("password", "==", password));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

// إضافة لاعب جديد لمزود (لنظام اللاعبين)
export async function addPlayerToProvider(providerId, username, password) {
  // تحقق عدم تكرار اسم اللاعب عالميًا:
  const allPlayers = await getDocs(collection(db, "players"));
  let exists = false;
  allPlayers.forEach(doc => {
    if (doc.data().username.toLowerCase() === username.toLowerCase()) {
      exists = true;
    }
  });
  if (exists) throw new Error("اسم المستخدم موجود بالفعل عند مزود آخر");

  await addDoc(collection(db, "players"), {
    providerId,
    username,
    password,
    balance: 0,
    createdAt: Date.now()
  });
}

// جلب لاعبين مزود معين
export async function getProviderPlayers(providerId) {
  const q = query(collection(db, "players"), where("providerId", "==", providerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// تحديث رصيد لاعب
export async function updatePlayerBalance(playerId, amount, type = "add") {
  const ref = doc(db, "players", playerId);
  const playerSnap = await getDoc(ref);
  if (!playerSnap.exists()) throw new Error("لاعب غير موجود");
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

// جلب لاعب حسب الاسم وكلمة السر
export async function getPlayerByCredentials(username, password) {
  const q = query(collection(db, "players"), where("username", "==", username), where("password", "==", password));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}
