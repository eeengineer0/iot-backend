import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "error") {
          setError(data.msg);
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }
      });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>🔐 Login</h2>

      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <br />
      <input value={password} type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <br /><br />

      <button onClick={handleLogin}>Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
