const API_BASE = "http://127.0.0.1:8000";

function getToken() {
  return document.getElementById("token").value.trim();
}

async function getForecast() {
  const token = getToken();
  if (!token) {
    alert("Please enter an access token");
    return;
  }

  const payload = {
    demand_index: parseFloat(document.getElementById("demandIndex").value),
    season_factor: parseFloat(document.getElementById("seasonFactor").value),
    distance_km: parseFloat(document.getElementById("distanceKm").value),
    days_to_departure: parseFloat(document.getElementById("daysToDeparture").value),
  };

  try {
    const res = await fetch(`${API_BASE}/ai/pricing-forecast`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data.detail) || "Request failed");
    renderResult(data);
    log("Forecast fetched successfully");
  } catch (err) {
    log(`Error: ${err.message}`);
  }
}

function renderResult(data) {
  const card = document.getElementById("resultCard");
  card.style.display = "block";

  const badge = document.getElementById("trendBadge");
  badge.textContent = data.trend.toUpperCase();
  badge.className = `trend-badge ${data.trend}`;

  document.getElementById("recommendationText").textContent = data.recommendation;
  document.getElementById("confidenceText").textContent = `Confidence: ${(data.confidence * 100).toFixed(0)}%`;
}

function log(message) {
  const logEl = document.getElementById("log");
  const entry = document.createElement("div");
  entry.textContent = message;
  logEl.appendChild(entry);
}