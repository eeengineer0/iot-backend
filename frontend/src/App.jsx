import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import UserManager from "./UserManager";

const API = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  // -----------------------------
  // AUTH STATE
  // -----------------------------
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  // -----------------------------
  // PAGE STATE
  // dashboard | users
  // -----------------------------
  const [page, setPage] = useState("dashboard");

  // -----------------------------
  // DEVICE DATA
  // -----------------------------
  const [data, setData] = useState({});
  const [history, setHistory] = useState({});

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setData({});
    setHistory({});
    setPage("dashboard");
  };

  // -----------------------------
  // FETCH DEVICE DATA WHEN LOGGED IN
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetch(`${API}/realtime`)
        .then((r) => r.json())
        .then((json) => {
          const now = Date.now();

          // Add timestamp to each device
          for (let node in json) {
            json[node]._timestamp = now;
          }

          setData(json);

          setHistory((prev) => {
            const updated = { ...prev };

            Object.keys(json).forEach((node) => {
              const d = json[node];

              if (!updated[node]) {
                updated[node] = { time: [], temp: [], gas: [] };
              }

              updated[node].time.push(now);
              updated[node].temp.push(d.t);
              updated[node].gas.push(d.ao_v);
            });

            return updated;
          });
        })
        .catch(() => {});
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  // -----------------------------
  // ADMIN COMMANDS
  // -----------------------------
  const sendCommand = (device, action) => {
    if (user.role !== "admin") return;

    fetch(`${API}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, action }),
    });
  };

  // -----------------------------
  // LIMIT UPDATE (ADMIN ONLY)
  // -----------------------------
  const updateLimits = (device) => {
    if (user.role !== "admin") return;

    const temp = parseFloat(
      document.getElementById(`${device}-temp-limit`).value
    );
    const gas = parseFloat(
      document.getElementById(`${device}-gas-limit`).value
    );

    fetch(`${API}/set_limits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, temp_th: temp, gas_th: gas }),
    });
  };

  // -----------------------------
  // CONDITIONAL RENDERING
  // -----------------------------
  if (!user)
    return <Login setUser={setUser} />;

  if (page === "users")
    return (
      <UserManager
        currentUser={user}
        goBack={() => setPage("dashboard")}
      />
    );

  return (
    <Dashboard
      user={user}
      logout={logout}
      data={data}
      history={history}
      sendCommand={sendCommand}
      updateLimits={updateLimits}
      goUsers={() => setPage("users")}
    />
  );
}

