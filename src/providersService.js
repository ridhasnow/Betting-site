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

// تحديث رصيد مزود (يقبل العملية: إضافة أو سحب)
export async function updateProviderBalance(id, amount, type = "add") {
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
