import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

// إضافة مزود جديد (username, password)
export async function addProvider(username, password) {
  // تحقق عدم التكرار
  const q = query(collection(db, "providers"), where("username", "==", username));
  const snapshot = await getDocs(q);
  if (!username || !password) throw new Error("يجب إدخال اسم وكلمة مرور");
  if (password.length < 6) throw new Error("كلمة المرور يجب أن تكون 6 أحرف أو أكثر");
  if (!/^[a-zA-Z0-9]+$/.test(username)) throw new Error("اسم المستخدم يجب أن يكون أرقام أو حروف فقط");
  if (!snapshot.empty) throw new Error("اسم المستخدم مستعمل بالفعل!");
  // إذا كل شيء صحيح، أضف المزود وجعل رصيده 0
  await addDoc(collection(db, "providers"), {
    username,
    password,
    balance: 0,
    createdAt: Date.now()
  });
}
