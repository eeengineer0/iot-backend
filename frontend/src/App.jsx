import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import UserManager from "./UserManager";   // 🔥 NEW IMPORT

const API = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [data, setData] = useState({});
  const [history, setHistory] = useState({});

  // 🔥 NEW: Page state ("dashboard" or "users")
  const [page, setPage] = useState("dashboard");

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setData({});
    setHistory({});
  };

  // Fetch realtime data only when logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetch(`${API}/realtime`)
        .then((r) => r.json())
        .then((json) => {
          const now = Date.now();

          for (let n in json) json[n]._timestamp = now;
          setData(json);

          setHistory((prev) => {
            const updated = { ...prev };
            Object.keys(json).forEach((n) => {
              const d = json[n];
              if (!updated[n]) updated[n] = { time: [], temp: [], gas: [] };

              updated[n].time.push(now);
              updated[n].temp.push(d.t);
              updated[n].gas.push(d.ao_v);
            });
            return updated;
          });
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const sendCommand = (device, action) => {
    if (user.role !== "admin") return;
    fetch(`${API}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, action }),
    });
  };

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

  // ---------------------------------------------------------
  // 🔥 PAGE SWITCHING LOGIC
  // ---------------------------------------------------------

  // If not logged in → show login page
  if (!user) return <Login setUser={setUser} />;

  // If admin selected "Manage Users"
  if (page === "users") {
    return <UserManager goBack={() => setPage("dashboard")} />;
  }

  // Default → show Dashboard
  return (
    <Dashboard
      user={user}
      logout={logout}
      data={data}
      history={history}
      sendCommand={sendCommand}
      updateLimits={updateLimits}
      goToUserManager={() => setPage("users")}   // 🔥 add this!
    />
  );
}
