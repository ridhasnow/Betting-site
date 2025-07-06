import React, { useState, useEffect } from "react";
import {
  addProvider,
  getAllProviders,
  updateProviderBalance,
  suspendProvider,
  getProviderByCredentials,
  addPlayer,
  getPlayersByProvider,
  getPlayerByCredentials,
  updatePlayerBalance,
  getProviderAdminTransactions,
  getProviderPlayerTransactions,
  getTransactions,
} from "./providersService";

const CURRENCY = "TND";

// ============ COMPONENTS ============

// زر الإغلاق للـ popup
function CloseButton({ onClick }) {
  return (
    <button
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        fontWeight: "bold",
        fontSize: 20,
        background: "none",
        border: "none",
        cursor: "pointer",
        zIndex: 2,
      }}
      onClick={onClick}
      aria-label="إغلاق"
    >
      ×
    </button>
  );
}

// نافذة عامة منبثقة
function Popup({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: 8,
          padding: 30,
          minWidth: 340,
          minHeight: 120,
        }}
      >
        <CloseButton onClick={onClose} />
        {children}
      </div>
    </div>
  );
}

// ========== واجهات الأدمن ==========

function AdminView({ onLogout }) {
  const [providers, setProviders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getAllProviders().then(setProviders);
  }, []);

  // عند اختيار مزود لعرض سجل العمليات
  async function handleSeeProviderHistory(provider) {
    setSelectedProvider(provider);
    setShowHistory(true);
    const txs = await getProviderAdminTransactions(provider.id);
    setTransactions(txs);
  }

  return (
    <div>
      <div style={{ background: "#222", color: "#fff", padding: 16, fontWeight: "bold", fontSize: 18 }}>
        الأدمن — لوحة التحكم
        <button style={{ float: "left" }} onClick={onLogout}>Logout</button>
      </div>
      <h2>سجل التحويلات بين الأدمن والمزودين</h2>
      <table border="1" cellPadding={8}>
        <thead>
          <tr>
            <th>اسم المزود</th>
            <th>الرصيد ({CURRENCY})</th>
            <th>سجل التحويلات</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.id}>
              <td>{p.username}</td>
              <td>{p.balance}</td>
              <td>
                <button onClick={() => handleSeeProviderHistory(p)}>voir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showHistory && (
        <Popup onClose={() => setShowHistory(false)}>
          <h3>سجل العمليات مع المزود: {selectedProvider.username}</h3>
          <table border="1" cellPadding={6}>
            <thead>
              <tr>
                <th>نوع</th>
                <th>المبلغ</th>
                <th>تاريخ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ color: tx.type === "add" ? "green" : "red" }}>
                    {tx.type === "add" ? "+" : "-"}
                  </td>
                  <td>{tx.amount} {CURRENCY}</td>
                  <td>{new Date(tx.date).toLocaleString("ar-DZ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Popup>
      )}

      {message && (
        <Popup onClose={() => setMessage("")}>
          <div>{message}</div>
        </Popup>
      )}
    </div>
  );
}

// ========== واجهة المزود ==========

function ProviderView({ provider, onLogout }) {
  const [tab, setTab] = useState("players");
  const [players, setPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [showTxPlayer, setShowTxPlayer] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerTransactions, setPlayerTransactions] = useState([]);
  const [showAdminTx, setShowAdminTx] = useState(false);
  const [adminTransactions, setAdminTransactions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    refreshPlayers();
    // eslint-disable-next-line
  }, []);

  function refreshPlayers() {
    getPlayersByProvider(provider.id).then(setPlayers);
  }

  // تسجيل لاعب جديد
  async function handleAddPlayer(username, password) {
    try {
      await addPlayer(username, password, provider.id);
      setShowAddUser(false);
      setMessage("تم التسجيل بنجاح!");
      refreshPlayers();
    } catch (e) {
      setMessage(e.message || "لم يتم التسجيل");
    }
  }

  // سجل العمليات مع لاعب معيّن
  async function handleSeePlayerTransactions(player) {
    setSelectedPlayer(player);
    setShowTxPlayer(true);
    const txs = await getProviderPlayerTransactions(provider.id, player.id);
    setPlayerTransactions(txs);
  }

  // سجل العمليات مع الأدمن
  async function handleSeeAdminTransactions() {
    setShowAdminTx(true);
    const txs = await getProviderAdminTransactions(provider.id);
    setAdminTransactions(txs);
  }

  // إضافة/سحب رصيد للاعب
  async function handleBalanceChange(player, amount, type) {
    try {
      await updatePlayerBalance(player.id, amount, type, provider.id);
      setMessage("تمت العملية بنجاح!");
      refreshPlayers();
    } catch (e) {
      setMessage(e.message || "خطأ في العملية");
    }
  }

  // تصفية بحث اللاعبين
  const filteredPlayers = players.filter((p) =>
    p.username.toLowerCase().includes(playerSearch.toLowerCase())
  );

  return (
    <div>
      <div style={{ background: "#222", color: "#fff", padding: 16, fontWeight: "bold", fontSize: 18 }}>
        المزود: {provider.username} — رصيدك: {provider.balance} {CURRENCY}
        <button style={{ float: "left" }} onClick={onLogout}>Logout</button>
      </div>
      <div style={{ margin: "12px 0" }}>
        <button onClick={() => setShowAddUser(true)}>New User Registration</button>
        <button onClick={() => setTab("players")}>Liste of Users</button>
        <button onClick={() => setTab("balance")}>Add/Withdraw Balance</button>
        <button onClick={() => setTab("historyPlayers")}>Transaction History Players</button>
        <button onClick={handleSeeAdminTransactions}>Transaction History Admin</button>
      </div>

      {/* --- New User Registration --- */}
      {showAddUser && (
        <Popup onClose={() => setShowAddUser(false)}>
          <h3>تسجيل لاعب جديد</h3>
          <input placeholder="Username" id="username" />
          <input placeholder="Password" id="password" type="password" />
          <button
            onClick={() =>
              handleAddPlayer(
                document.getElementById("username").value,
                document.getElementById("password").value
              )
            }
          >
            Add
          </button>
        </Popup>
      )}

      {/* --- Liste of Users --- */}
      {tab === "players" && (
        <>
          <h3>قائمة اللاعبين</h3>
          <input
            placeholder="بحث عن لاعب"
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <table border="1" cellPadding={8}>
            <thead>
              <tr>
                <th>اسم اللاعب</th>
                <th>الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td>{player.username}</td>
                  <td>{player.balance} {CURRENCY}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* --- Add/Withdraw Balance --- */}
      {tab === "balance" && (
        <>
          <h3>إدارة رصيد اللاعبين</h3>
          <table border="1" cellPadding={8}>
            <thead>
              <tr>
                <th>اسم اللاعب</th>
                <th>الرصيد الحالي</th>
                <th colSpan={2}>عمليات</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td>{player.username}</td>
                  <td>{player.balance} {CURRENCY}</td>
                  <td>
                    <button
                      onClick={() => {
                        const amount = Number(prompt("كم تريد إضافة؟"));
                        if (!isNaN(amount) && amount > 0)
                          handleBalanceChange(player, amount, "add");
                      }}
                    >
                      +
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        const amount = Number(prompt("كم تريد سحب؟"));
                        if (!isNaN(amount) && amount > 0)
                          handleBalanceChange(player, amount, "sub");
                      }}
                    >
                      -
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* --- Transaction History Players --- */}
      {tab === "historyPlayers" && (
        <>
          <h3>سجل معاملات اللاعبين</h3>
          <input
            placeholder="بحث عن لاعب"
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <table border="1" cellPadding={8}>
            <thead>
              <tr>
                <th>اسم اللاعب</th>
                <th>سجل المعاملات</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td>{player.username}</td>
                  <td>
                    <button onClick={() => handleSeePlayerTransactions(player)}>voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* --- Popup سجل معاملات لاعب --- */}
      {showTxPlayer && (
        <Popup onClose={() => setShowTxPlayer(false)}>
          <h3>سجل المعاملات مع اللاعب: {selectedPlayer?.username}</h3>
          <table border="1" cellPadding={6}>
            <thead>
              <tr>
                <th>نوع</th>
                <th>المبلغ</th>
                <th>تاريخ</th>
              </tr>
            </thead>
            <tbody>
              {playerTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ color: tx.type === "add" ? "green" : "red" }}>
                    {tx.type === "add" ? "+" : "-"}
                  </td>
                  <td>{tx.amount} {CURRENCY}</td>
                  <td>{new Date(tx.date).toLocaleString("ar-DZ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Popup>
      )}

      {/* --- Popup سجل معاملات الأدمن --- */}
      {showAdminTx && (
        <Popup onClose={() => setShowAdminTx(false)}>
          <h3>سجل المعاملات مع الأدمن</h3>
          <table border="1" cellPadding={6}>
            <thead>
              <tr>
                <th>نوع</th>
                <th>المبلغ</th>
                <th>تاريخ</th>
              </tr>
            </thead>
            <tbody>
              {adminTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ color: tx.type === "add" ? "green" : "red" }}>
                    {tx.type === "add" ? "+" : "-"}
                  </td>
                  <td>{tx.amount} {CURRENCY}</td>
                  <td>{new Date(tx.date).toLocaleString("ar-DZ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Popup>
      )}

      {message && (
        <Popup onClose={() => setMessage("")}>
          <div>{message}</div>
        </Popup>
      )}
    </div>
  );
}

// ========== واجهة اللاعب ==========

function PlayerView({ player, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div>
      <div style={{ background: "#222", color: "#fff", padding: 16, fontWeight: "bold", fontSize: 18 }}>
        <span style={{ float: "right" }}>
          <button style={{
            color: "#fff",
            background: "#222",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
          }} onClick={() => setShowProfile((v) => !v)}>
            {player.username}
          </button>
          <button style={{ marginRight: 8 }} onClick={onLogout}>Logout</button>
        </span>
        مرحبًا بك في منصة اللاعبين
      </div>
      {showProfile && (
        <Popup onClose={() => setShowProfile(false)}>
          <h3>حسابك</h3>
          <div>اسم المستخدم: {player.username}</div>
          <div>رصيدك: {player.balance} {CURRENCY}</div>
        </Popup>
      )}
      <div style={{margin: "30px auto", maxWidth: 540}}>
        <div style={{background:"#f6f6f6",padding:24,borderRadius: 10, minHeight: 180}}>
          <h2>الرئيسية</h2>
          <div>يمكنك لاحقًا استخدام الأقسام: Live / Paris Sportive / Casino</div>
          <div>قريبًا سيتم دمج الـ APIs الرياضية وألعاب الكازينو.</div>
        </div>
      </div>
    </div>
  );
}

// ========== واجهة الدخول ==========

function LoginView({ onAdmin, onProvider, onPlayer }) {
  const [tab, setTab] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    if (tab === "admin") {
      // دخول الأدمن
      if (username === "admin" && password === "admin") {
        onAdmin();
      } else {
        setMessage("بيانات الأدمن غير صحيحة");
      }
    } else if (tab === "provider") {
      const provider = await getProviderByCredentials(username, password);
      if (provider) {
        onProvider(provider);
      } else {
        setMessage("بيانات المزود غير صحيحة");
      }
    } else if (tab === "player") {
      const player = await getPlayerByCredentials(username, password);
      if (player) {
        onPlayer(player);
      } else {
        setMessage("بيانات اللاعب غير صحيحة");
      }
    }
  }

  return (
    <div style={{
      background: "#fff",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form style={{
        minWidth: 320, padding: 28, borderRadius: 8, boxShadow: "0 0 18px #eee",
        background: "#fafafa", position: "relative"
      }} onSubmit={handleLogin}>
        <h2>تسجيل الدخول</h2>
        <div style={{marginBottom: 10}}>
          <button type="button" onClick={() => setTab("admin")} style={{fontWeight: tab === "admin" ? "bold" : ""}}>أدمن</button>
          <button type="button" onClick={() => setTab("provider")} style={{fontWeight: tab === "provider" ? "bold" : ""}}>مزود</button>
          <button type="button" onClick={() => setTab("player")} style={{fontWeight: tab === "player" ? "bold" : ""}}>لاعب</button>
        </div>
        <input
          placeholder={tab === "admin" ? "اسم الأدمن" : "اسم المستخدم"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button type="submit" style={{ width: "100%" }}>دخول</button>
        {message && <div style={{ color: "red", marginTop: 10 }}>{message}</div>}
      </form>
    </div>
  );
}

// ========== التطبيق الرئيسي ==========

export default function App() {
  const [session, setSession] = useState({ type: null, user: null });

  // لا localStorage — الجلسة تبقى فقط طالما الصفحة مفتوحة، إذا حدث refresh يرجع للدخول

  function handleLogout() {
    setSession({ type: null, user: null });
  }

  if (!session.type) {
    return (
      <LoginView
        onAdmin={() => setSession({ type: "admin", user: { username: "admin" } })}
        onProvider={(provider) => setSession({ type: "provider", user: provider })}
        onPlayer={(player) => setSession({ type: "player", user: player })}
      />
    );
  }

  if (session.type === "admin") {
    return <AdminView onLogout={handleLogout} />;
  }
  if (session.type === "provider") {
    return <ProviderView provider={session.user} onLogout={handleLogout} />;
  }
  if (session.type === "player") {
    return <PlayerView player={session.user} onLogout={handleLogout} />;
  }

  return null;
}
