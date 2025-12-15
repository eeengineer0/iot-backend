import { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import UserManager from "./UserManager";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  // Restore login on refresh
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  // NOT LOGGED IN
  if (!user) {
    return <Login setUser={setUser} />;
  }

  // LOGGED IN
  return (
    <div>
      <header style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>Welcome {user.username} ({user.role})</h2>

        <button onClick={() => setPage("dashboard")}>Dashboard</button>

        {user.role === "admin" && (
          <button onClick={() => setPage("users")}>User Manager</button>
        )}

        <button
          onClick={() => {
            localStorage.removeItem("user");
            setUser(null);
          }}
          style={{ marginLeft: "10px" }}
        >
          Logout
        </button>
      </header>

      <hr />

      {page === "dashboard" && <Dashboard />}
      {page === "users" && user.role === "admin" && (
        <UserManager goBack={() => setPage("dashboard")} />
      )}
    </div>
  );
}
