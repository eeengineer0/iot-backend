import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Connects to your Python Backend
    fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "error") {
          setError(data.msg);
          return;
        }

        // Saves user to browser memory so they stay logged in
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch(() => {
        setError("Login failed: Cannot reach server");
      });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "Arial" }}>
      <h2>🔐 Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          background: "#1e90ff",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          border: "none",
        }}
      >
        Login
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
