import { useState } from "react";

// 1. HARDCODED USERS FOR DEMO
// Since backend resets, we keep the "Master Keys" here.
const DEMO_USERS = {
  admin: { password: "admin123", role: "admin" },
  user: { password: "user123", role: "user" },
  student: { password: "pass123", role: "admin" }
};

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // 2. CHECK CREDENTIALS LOCALLY (No Fetch)
    const validUser = DEMO_USERS[username];

    // Check if user exists AND password matches
    if (validUser && validUser.password === password) {
      
      // Create the user object
      const userData = { 
        username: username, 
        role: validUser.role 
      };

      // Save to Browser Memory (Persistence)
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Update App State
      setUser(userData);
      
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "Arial" }}>
      <h2>🔐 Smart IoT Login (Frontend Mode)</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px", margin: "10px", display: "block", margin: "10px auto" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", margin: "10px", display: "block", margin: "10px auto" }}
      />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          background: "#1e90ff",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          border: "none"
        }}
      >
        Login
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      
      <p style={{color: "#888", fontSize: "12px", marginTop: "20px"}}>
        Demo Tip: Use <b>admin</b> / <b>admin123</b>
      </p>
    </div>
  );
}
