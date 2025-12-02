import { useEffect, useState } from "react";
import GraphCard from "./GraphCard";

const API = import.meta.env.VITE_API_BASE_URL;   // ✅ ADDED THIS

function App() {
  const [data, setData] = useState({});
  const [history, setHistory] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API}/realtime`)     // ✅ FIXED
        .then((res) => res.json())
        .then((json) => {
          const now = Date.now();

          for (let node in json) {
            json[node]._timestamp = now;
          }

          setData(json);

          setHistory((prev) => {
            const updated = { ...prev };

            Object.keys(json).forEach((node) => {
              const d = json[node];

              if (!updated[node]) {
                updated[node] = {
                  time: [],
                  temp: [],
                  gas: []
                };
              }

              updated[node].time.push(now);
              updated[node].temp.push(d.t);
              updated[node].gas.push(d.ao_v);

              if (updated[node].time.length > 99999999) {
                updated[node].time.shift();
                updated[node].temp.shift();
                updated[node].gas.shift();
              }
            });

            return updated;
          });
        })
        .catch(() => {});
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendCommand = (device, action) => {
    fetch(`${API}/command`, {       // ✅ FIXED
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, action }),
    });
  };

  const updateLimits = (device) => {
    const temp = parseFloat(
      document.getElementById(`${device}-temp-limit`).value
    );
    const gas = parseFloat(
      document.getElementById(`${device}-gas-limit`).value
    );

    fetch(`${API}/set_limits`, {     // ✅ FIXED
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device: device,
        temp_th: temp,
        gas_th: gas,
      }),
    });
  };

