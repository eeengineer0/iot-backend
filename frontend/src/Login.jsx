import { useState } from "react";

const defaultUsers = {
  admin: { password: "admin123", role: "admin" },
  user: { password: "user123", role: "user" }
};

// Load users from storage OR fallback to defaults
const getUsers = () => {
  return JSON.parse(localStorage.getItem("users")) || defaultUsers;
};

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const users = getUsers(); // Load dynamic users

    if (!users[username] || users[username].password !== password) {
      setError("Invalid username or password");
      return;
    }

    const role = users[username].role;

    const userInfo = { username, role };
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);   // 🔥 triggers login
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
          cursor: "pointer"
        }}
      >
        Login
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
