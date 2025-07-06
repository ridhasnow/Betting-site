import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

/* ========== مزودين ========== */

// إضافة مزود جديد
export async function addProvider(username, password) {
  await addDoc(collection(db, "providers"), {
    username,
    password,
    balance: 0,
    createdAt: Date.now(),
    suspended: false,
  });
}

// جلب كل المزودين
export async function getAllProviders() {
  const snapshot = await getDocs(collection(db, "providers"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// تحديث رصيد مزود (يقبل العملية: إضافة أو سحب)
export async function updateProviderBalance(id, amount, type = "add", adminId = "admin") {
  // type: "add" أو "sub"
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

  // سجل العملية في transactions (admin <-> provider)
  await addTransaction({
    from: type === "add" ? adminId : id,
    to: type === "add" ? id : adminId,
    amount: Number(amount),
    type: type,
    role: "admin-provider",
  });
}

// تعليق/إلغاء تعليق مزود
export async function suspendProvider(id, isSuspended) {
  const ref = doc(db, "providers", id);
  await updateDoc(ref, { suspended: isSuspended });
}

// جلب مزود حسب الاسم وكلمة السر (للدخول)
export async function getProviderByCredentials(username, password) {
  const q = query(
    collection(db, "providers"),
    where("username", "==", username),
    where("password", "==", password)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

/* ========== لاعبين ========== */

// إضافة لاعب جديد (لازم اسم المستخدم يكون فريد في كل النظام)
export async function addPlayer(username, password, providerId) {
  // تحقق هل الاسم مستخدم مسبقًا
  const q = query(collection(db, "players"), where("username", "==", username));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) throw new Error("اسم اللاعب مستخدم مسبقا");

  await addDoc(collection(db, "players"), {
    username,
    password,
    providerId,
    balance: 0,
    createdAt: Date.now(),
    suspended: false
  });
}

// جلب كل اللاعبين لمزود معيّن
export async function getPlayersByProvider(providerId) {
  const q = query(collection(db, "players"), where("providerId", "==", providerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// جلب لاعب حسب بيانات الدخول (للدخول)
export async function getPlayerByCredentials(username, password) {
  const q = query(
    collection(db, "players"),
    where("username", "==", username),
    where("password", "==", password)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

// تحديث رصيد لاعب (يجب أن يتم عبر مزود فقط)
export async function updatePlayerBalance(playerId, amount, type = "add", providerId) {
  // type: "add" أو "sub"
  const ref = doc(db, "players", playerId);
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

  // سجل العملية في transactions (provider <-> player)
  await addTransaction({
    from: type === "add" ? providerId : playerId,
    to: type === "add" ? playerId : providerId,
    amount: Number(amount),
    type: type,
    role: "provider-player",
  });
}

/* ========== المعاملات (Transactions) ========== */

// إضافة عملية جديدة
export async function addTransaction({ from, to, amount, type, role }) {
  await addDoc(collection(db, "transactions"), {
    from,
    to,
    amount,
    type, // add أو sub
    role, // admin-provider أو provider-player
    date: Date.now()
  });
}

// جلب كل العمليات بين طرفين (حسب الدور)
export async function getTransactions({ user1, user2, role }) {
  // جلب كل العمليات بين user1 و user2 (من أو إلى)
  const q = query(
    collection(db, "transactions"),
    where("role", "==", role),
    where("from", "in", [user1, user2]),
    where("to", "in", [user1, user2]),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(
      t => (t.from === user1 && t.to === user2) ||
           (t.from === user2 && t.to === user1)
    );
}

// جلب كل عمليات مزود مع الأدمن فقط
export async function getProviderAdminTransactions(providerId) {
  return getTransactions({ user1: providerId, user2: "admin", role: "admin-provider" });
}

// جلب كل عمليات مزود مع لاعب معيّن فقط
export async function getProviderPlayerTransactions(providerId, playerId) {
  return getTransactions({ user1: providerId, user2: playerId, role: "provider-player" });
}
