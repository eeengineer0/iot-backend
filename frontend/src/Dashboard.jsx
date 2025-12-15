import GraphCard from "./GraphCard";

export default function Dashboard({
  user,
  data = {},
  history = {},
  logout,
  sendCommand,
  updateLimits,
  goUsers
}) {
  console.log("DASHBOARD DEBUG: User object is", user);

  // 1. Loading State
  if (!user) {
    return <div style={{padding: "50px"}}>Loading...</div>;
  }

  // 2. Card Style Helper
  const cardStyle = (device) => {
    if (!device) return {};
    return {
      width: "300px",
      padding: "20px",
      margin: "20px",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
    };
  };

  // 3. UI - WITH NO USERNAME TEXT
  return (
    <div style={{ fontFamily: "Arial", padding: "40px", background: "#f4f4f4", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
        {/* If you see V5, we know this file is active */}
        <h1 style={{ color: "red" }}>🌐 SYSTEM REBOOT (V5)</h1>
        
        <div>
          {/* STATIC TEXT ONLY - NO VARIABLES */}
          <p>USER SYSTEM OFFLINE</p>
          <button onClick={logout} style={{ padding: "10px", background: "red", color: "white" }}>
            Force Logout
          </button>
        </div>
      </div>

      {/* DEVICES */}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {(!data || Object.keys(data).length === 0) && <p>No device data...</p>}
        
        {data && Object.keys(data).map((node) => {
          const d = data[node];
          if (!d) return null;
          return (
             <div key={node} style={cardStyle(d)}>
               <h2>{node}</h2>
               <p>Temp: {d.t}</p>
             </div>
          );
        })}
      </div>
    </div>
  );
}
