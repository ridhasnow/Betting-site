import React, { useState } from "react";

const ADMIN_ACCOUNT = {
  username: "ridhasnow",
  password: "azerty12345",
  role: "admin",
  balance: 999999999,
};

export default function AuthSystem({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // تحقق هل الأدمن
    if (
      username.trim() === ADMIN_ACCOUNT.username &&
      password === ADMIN_ACCOUNT.password
    ) {
      setLoading(false);
      onLogin({ ...ADMIN_ACCOUNT });
      return;
    }

    setLoading(false);
    onLogin({ username: username.trim(), password });
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
          <div className="input-pass-wrap" style={{display: "flex", alignItems: "center"}}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{flex: 1}}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="showpass-btn"
              tabIndex={-1}
              aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                marginLeft: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
