import React, { useState } from "react";

// بيانات الدخول التجريبية (بدون backend)، يمكنك إضافة لاعبين أو مزودين آخرين هنا
const ADMIN_ACCOUNT = {
  username: "ridhasnow",
  password: "azerty12345",
  role: "admin",
  balance: 999999999,
};

const PROVIDERS = [
  // مثال: يمكنك إضافة مزودين هنا
  // { username: "provider1", password: "providerpass", role: "provider", balance: 5000 }
];

const PLAYERS = [
  // مثال: يمكنك إضافة لاعبين هنا
  // { username: "player1", password: "playerpass", role: "player", balance: 200 }
];

// helper للبحث عن الحساب المناسب
function findAccount(username, password) {
  if (
    username === ADMIN_ACCOUNT.username &&
    password === ADMIN_ACCOUNT.password
  )
    return { ...ADMIN_ACCOUNT };
  const provider = PROVIDERS.find(
    (u) => u.username === username && u.password === password
  );
  if (provider) return { ...provider };
  const player = PLAYERS.find(
    (u) => u.username === username && u.password === password
  );
  if (player) return { ...player };
  return null;
}

export default function AuthSystem({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const account = findAccount(username.trim(), password);
    if (account) {
      setError("");
      onLogin(account);
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="modal-bg">
      <div className="modal-login">
        <h3>تسجيل الدخول</h3>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
          <div className="input-pass-wrap">
            <input
              type={showPass ? "text" : "password"}
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="showpass-btn"
              tabIndex={-1}
              aria-label="إظهار كلمة المرور"
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" type="submit">
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
