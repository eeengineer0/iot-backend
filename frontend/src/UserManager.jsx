import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

export default function UserManager({ goBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState({});

  // Load users on page start
  useEffect(() => {
    fetch(`${API}/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  // -----------------------------
  // CREATE USER
  // -----------------------------
  const saveUser = () => {
    fetch(`${API}/add_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.msg);

        // Refresh users list
        fetch(`${API}/users`)
          .then((res) => res.json())
          .then((data) => setUsers(data));
      });
  };

  // -----------------------------
  // DELETE USER
  // -----------------------------
  const deleteUser = (username) => {
    if (!confirm(`Delete user "${username}"?`)) return;

    fetch(`${API}/delete_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.msg);

        // Refresh users list
        fetch(`${API}/users`)
          .then((res) => res.json())
          .then((data) => setUsers(data));
      });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>User Management</h2>

      {/* --- Add User Form --- */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Create New User</h3>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <br />
        <button onClick={saveUser} style={{ marginTop: "10px" }}>
          Save User
        </button>
      </div>

      {/* --- List Users --- */}
      <h3>Existing Users</h3>
      <div
        style={{
          width: "60%",
          margin: "auto",
          textAlign: "left",
          background: "#fafafa",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        {Object.keys(users).map((u) => (
          <div
            key={u}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div>
              <strong>{u}</strong> — ({users[u].role})
            </div>

            {u !== "admin" && (
              <button
                onClick={() => deleteUser(u)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <button onClick={goBack} style={{ marginTop: "20px" }}>
        Back to Dashboard
      </button>
    </div>
  );
}
