const API_BASE = "http://127.0.0.1:8000";

function getToken() {
  return document.getElementById("token").value.trim();
}

async function optimizeRoute() {
  const token = getToken();
  if (!token) {
    alert("Please enter an access token");
    return;
  }

  const payload = {
    distance_km: parseFloat(document.getElementById("distanceKm").value),
    current_mode: document.getElementById("currentMode").value,
  };

  try {
    const res = await fetch(`${API_BASE}/ai/optimize-route`, {
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
    log("Route optimization fetched successfully");
  } catch (err) {
    log(`Error: ${err.message}`);
  }
}

function renderResult(data) {
  const card = document.getElementById("resultCard");
  card.style.display = "block";

  document.getElementById("bestRouteBanner").textContent =
    `Best Route: ${formatRouteName(data.best_route)}`;

  document.getElementById("costReduced").textContent = `${data.cost_reduced_pct}%`;

  const timeEl = document.getElementById("timeDelta");
  if (data.delivery_faster_days > 0) {
    timeEl.textContent = `${data.delivery_faster_days}d faster`;
  } else if (data.delivery_slower_days > 0) {
    timeEl.textContent = `${data.delivery_slower_days}d slower`;
  } else {
    timeEl.textContent = "Same speed";
  }

  document.getElementById("currentCost").textContent = `\u20B9${data.current_cost_per_kg}/kg`;

  const tbody = document.getElementById("optionsBody");
  tbody.innerHTML = "";

  data.all_options.forEach((opt) => {
    const row = document.createElement("tr");
    if (opt.route === data.best_route) {
      row.className = "best-row";
    }

    row.innerHTML = `
      <td>${formatRouteName(opt.route)}</td>
      <td>\u20B9${opt.cost_per_kg}/kg</td>
      <td>${opt.transit_days} days</td>
    `;
    tbody.appendChild(row);
  });
}

function formatRouteName(route) {
  return route
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" \u2192 ");
}

function log(message) {
  const logEl = document.getElementById("log");
  const entry = document.createElement("div");
  entry.textContent = message;
  logEl.appendChild(entry);
}