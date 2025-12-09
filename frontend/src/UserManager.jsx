import { useState } from "react";

export default function UserManager({ goBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const saveUser = () => {
    if (!username || !password) {
      setMessage("Username and password required.");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || {};

    users[username] = {
      password,
      role
    };

    localStorage.setItem("users", JSON.stringify(users));
    setMessage(`User "${username}" created successfully!`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>Create New User</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />

      <br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />

      <br />

      <label>Role: </label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      >
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>

      <br />

      <button
        onClick={saveUser}
        style={{
          padding: "10px 20px",
          background: "green",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginRight: "20px"
        }}
      >
        Save User
      </button>

      <button
        onClick={goBack}
        style={{
          padding: "10px 20px",
          background: "#1e90ff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
