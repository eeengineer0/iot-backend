import GraphCard from "./GraphCard";

export default function Dashboard({
  user,
  data = {},
  history = {},
  logout,
  sendCommand,
  updateLimits,
  goUsers,
}) {
  // -----------------------------
  // SAFE CHECK
  // -----------------------------
  const nodes = Object.keys(data || {});

  // -----------------------------
  // CARD STYLE
  // -----------------------------
  const cardStyle = (d) => {
    const now = Date.now();
    const age = now - (d?._timestamp || 0);

    let bg = "#ffffff";
    if (age > 5000) bg = "#e8e8e8";
    if ((d?.ao_v ?? 0) > (d?.gas_th ?? Infinity)) bg = "#ffe0e0";
    if ((d?.t ?? 0) > (d?.temp_th ?? Infinity)) bg = "#ffe9d6";

    return {
      width: "360px",
      background: bg,
      borderRadius: "18px",
      padding: "22px",
      margin: "20px",
      boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
    };
  };

  // -----------------------------
  // EMPTY STATE (CRITICAL)
  // -----------------------------
  if (!nodes.length) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>📡 Waiting for device data…</h2>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div
      style={{
        padding: "40px",
        background: "#f5f5f7",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ color: "#1e90ff" }}>🌐 Smart IoT Dashboard</h1>

        <div>
          <p>
            Logged in as <strong>{user.username}</strong> ({user.role})
          </p>

          {user.role === "admin" && (
            <button onClick={goUsers} style={{ marginRight: "10px" }}>
              Manage Users
            </button>
          )}

          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* DEVICES */}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {nodes.map((node) => {
          const d = data[node] || {};

          return (
            <div key={node}>
              <div style={cardStyle(d)}>
                <h2>{node}</h2>

                <p><strong>Temp:</strong> {d.t ?? "--"} °C</p>
                <p><strong>Humidity:</strong> {d.h ?? "--"} %</p>
                <p><strong>Gas:</strong> {d.ao_v ?? "--"} V</p>

                <p><strong>LED:</strong> {d.led ?? "?"}</p>
                <p><strong>Fan:</strong> {d.fan ?? "?"}</p>

                <hr />

                <p><strong>Temp Limit:</strong> {d.temp_th ?? "--"}</p>
                <p><strong>Gas Limit:</strong> {d.gas_th ?? "--"}</p>

                {user.role === "admin" && (
                  <>
                    <input
                      id={`${node}-temp-limit`}
                      type="number"
                      defaultValue={d.temp_th ?? 30}
                    />
                    <input
                      id={`${node}-gas-limit`}
                      type="number"
                      defaultValue={d.gas_th ?? 1.2}
                    />

                    <button onClick={() => updateLimits(node)}>
                      Save Limits
                    </button>

                    <hr />

                    <button onClick={() => sendCommand(node, "LED_ON")}>
                      LED ON
                    </button>
                    <button onClick={() => sendCommand(node, "LED_OFF")}>
                      LED OFF
                    </button>
                  </>
                )}
              </div>

              {history[node] && (
                <GraphCard
                  title="Temperature"
                  labels={history[node].time}
                  data={history[node].temp}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
