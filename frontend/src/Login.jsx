import { useState } from "react";

const defaultUsers = {
  admin: { password: "admin123", role: "admin" },
  user: { password: "user123", role: "user" },
};

// Synchronously load users and ensure defaults exist
const loadUsers = () => {
  try {
    const raw = localStorage.getItem("users");

    // If nothing stored → write defaults
    if (!raw) {
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      return { ...defaultUsers };
    }

    const parsed = JSON.parse(raw);

    // If parsed is not an object → reset to defaults
    if (!parsed || typeof parsed !== "object") {
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      return { ...defaultUsers };
    }

    // Ensure at least "admin" exists
    if (!parsed.admin) {
      parsed.admin = { password: "admin123", role: "admin" };
      localStorage.setItem("users", JSON.stringify(parsed));
    }

    return parsed;
  } catch (e) {
    // If JSON is corrupted → reset to defaults
    localStorage.setItem("users", JSON.stringify(defaultUsers));
    return { ...defaultUsers };
  }
};

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const users = loadUsers();  // ✅ always safe

    const record = users[username];

    if (!record || record.password !== password) {
      setError("Invalid username or password");
      return;
    }

    const userInfo = { username, role: record.role };
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>🔐 Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />

      <br />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          background: "#1e90ff",
          color: "white",
          borderRadius: "6px",
          border: "none",
          marginTop: "10px",
          cursor: "pointer",
        }}
      >
        Login
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
