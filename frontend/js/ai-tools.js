// FILE: frontend/js/ai-tools.js
const API_BASE = "http://127.0.0.1:8000";
let candidateCount = 1;

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader"])) return;

  renderSidebar();
  injectIcons();
  bindTabs();
  bindRecommendTool();
  bindPricingTool();
  bindRouteTool();
});

function injectIcons() {
  document.querySelectorAll(".ai-tool-tab").forEach((tab) => {
    const icon = tab.dataset.icon;
    tab.innerHTML = `${Icons.svg(icon, { size: 16 })} <span>${tab.dataset.label}</span>`;
  });

  document.getElementById("recommendPanelIcon").innerHTML = Icons.svg("sparkle", { size: 22 });
  document.getElementById("pricingPanelIcon").innerHTML = Icons.svg("chart", { size: 22 });
  document.getElementById("routePanelIcon").innerHTML = Icons.svg("mapPin", { size: 22 });

  document.getElementById("getRecommendBtn").innerHTML = `${Icons.svg("sparkle", { size: 16 })} Get AI Recommendation`;
  document.getElementById("getForecastBtn").innerHTML = `${Icons.svg("chart", { size: 16 })} Get Pricing Forecast`;
  document.getElementById("optimizeRouteBtn").innerHTML = `${Icons.svg("mapPin", { size: 16 })} Optimize Route`;
  document.getElementById("addCandidateBtn").innerHTML = `${Icons.svg("package", { size: 14 })} Add Another Candidate`;
}

/* ===== Tab Switching ===== */
function bindTabs() {
  document.querySelectorAll(".ai-tool-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ai-tool-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".ai-tool-panel").forEach((p) => p.classList.remove("active"));
      document.getElementById(tab.dataset.panel).classList.add("active");
    });
  });
}

/* ===================================================================
   TOOL 1: AI Container Recommendation
=================================================================== */
function bindRecommendTool() {
  document.getElementById("addCandidateBtn").addEventListener("click", addCandidateRow);
  document.getElementById("getRecommendBtn").addEventListener("click", getRecommendation);
}

function addCandidateRow() {
  candidateCount++;
  const container = document.getElementById("candidatesContainer");

  const card = document.createElement("div");
  card.className = "candidate-card";
  card.innerHTML = `
    <div class="candidate-card-title">
      ${Icons.svg("package", { size: 14 })} Candidate ${candidateCount}
    </div>
    <div class="candidate-fields-grid">
      <input class="c-id" placeholder="Container ID" />
      <input class="c-price" type="number" placeholder="Price/CBM" />
      <input class="c-days" type="number" placeholder="Transit Days" />
      <input class="c-trust" type="number" placeholder="Trust Score (0-10)" />
      <input class="c-space" type="number" placeholder="Available CBM" />
    </div>
  `;
  container.appendChild(card);
}

function collectCandidates() {
  const rows = document.querySelectorAll(".candidate-card");
  return Array.from(rows).map((row) => ({
    container_id: row.querySelector(".c-id").value.trim(),
    price_per_cbm: parseFloat(row.querySelector(".c-price").value),
    transit_days: parseFloat(row.querySelector(".c-days").value),
    trust_score: parseFloat(row.querySelector(".c-trust").value),
    available_space_cbm: parseFloat(row.querySelector(".c-space").value),
  }));
}

async function getRecommendation() {
  const currentChoiceId = document.getElementById("currentChoiceId").value.trim();
  const candidates = collectCandidates();
  const btn = document.getElementById("getRecommendBtn");

  if (!currentChoiceId) {
    showToast("Please enter your current choice container ID", "danger");
    return;
  }

  setLoading(btn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/ai/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates, current_choice_id: currentChoiceId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");

    renderRecommendResult(data);
  } catch (err) {
    showToast(`Error: ${err.message}`, "danger");
  } finally {
    setLoading(btn, false);
  }
}

function renderRecommendResult(data) {
  const card = document.getElementById("recommendResultCard");
  card.classList.add("show");
  card.innerHTML = `
    <div class="ai-result-title">${Icons.svg("sparkle", { size: 18 })} AI Recommendation Result</div>
    <div class="ai-result-row">
      <span class="result-label">${Icons.svg("package", { size: 14 })} Best Container</span>
      <span class="result-value">${data.best_container_id}</span>
    </div>
    <div class="ai-result-row">
      <span class="result-label">${Icons.svg("chart", { size: 14 })} Value Score</span>
      <span class="result-value">${data.value_score}</span>
    </div>
    <div class="ai-result-row">
      <span class="result-label">${Icons.svg("chart", { size: 14 })} Potential Savings (per CBM)</span>
      <span class="result-value">\u20B9${data.savings_per_cbm}</span>
    </div>
    <div class="ai-result-row">
      <span class="result-label">${Icons.svg("truck", { size: 14 })} Faster By</span>
      <span class="result-value">${data.faster_by_days} days</span>
    </div>
    <div class="ai-result-row">
      <span class="result-label">${Icons.svg("check", { size: 14 })} Already Best Choice?</span>
      <span class="result-value">${data.is_current_already_best ? "Yes" : "No"}</span>
    </div>
  `;
}

/* ===================================================================
   TOOL 2: Dynamic Pricing Forecast
=================================================================== */
function bindPricingTool() {
  document.getElementById("getForecastBtn").addEventListener("click", getForecast);
}

async function getForecast() {
  const btn = document.getElementById("getForecastBtn");

  const payload = {
    demand_index: parseFloat(document.getElementById("demandIndex").value),
    season_factor: parseFloat(document.getElementById("seasonFactor").value),
    distance_km: parseFloat(document.getElementById("pricingDistanceKm").value),
    days_to_departure: parseFloat(document.getElementById("daysToDeparture").value),
  };

  setLoading(btn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/ai/pricing-forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");

    renderForecastResult(data);
  } catch (err) {
    showToast(`Error: ${err.message}`, "danger");
  } finally {
    setLoading(btn, false);
  }
}

const TREND_ICONS = { rise: "chart", fall: "chart", stable: "check" };

function renderForecastResult(data) {
  const card = document.getElementById("pricingResultCard");
  card.classList.add("show");

  const confidencePct = Math.round(data.confidence * 100);

  card.innerHTML = `
    <div class="trend-badge ${data.trend}">
      ${Icons.svg(TREND_ICONS[data.trend] || "chart", { size: 18 })} ${data.trend.toUpperCase()}
    </div>
    <div class="recommendation-text">${data.recommendation}</div>
    <div class="confidence-bar-wrap">
      <div class="confidence-text">Confidence: ${confidencePct}%</div>
      <div class="confidence-bar-track">
        <div class="confidence-bar-fill" style="width:${confidencePct}%;"></div>
      </div>
    </div>
  `;
}

/* ===================================================================
   TOOL 3: Route Optimizer
=================================================================== */
function bindRouteTool() {
  document.getElementById("optimizeRouteBtn").addEventListener("click", optimizeRoute);
}

async function optimizeRoute() {
  const btn = document.getElementById("optimizeRouteBtn");

  const payload = {
    distance_km: parseFloat(document.getElementById("routeDistanceKm").value),
    current_mode: document.getElementById("currentMode").value,
  };

  setLoading(btn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/ai/optimize-route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");

    renderRouteResult(data);
  } catch (err) {
    showToast(`Error: ${err.message}`, "danger");
  } finally {
    setLoading(btn, false);
  }
}

function renderRouteResult(data) {
  const card = document.getElementById("routeResultCard");
  card.classList.add("show");

  let timeLabel = "Same speed";
  if (data.delivery_faster_days > 0) timeLabel = `${data.delivery_faster_days}d faster`;
  else if (data.delivery_slower_days > 0) timeLabel = `${data.delivery_slower_days}d slower`;

  const rows = data.all_options
    .map(
      (opt) => `
      <tr class="${opt.route === data.best_route ? "best-row" : ""}">
        <td>${formatRouteName(opt.route)}</td>
        <td>\u20B9${opt.cost_per_kg}/kg</td>
        <td>${opt.transit_days} days</td>
      </tr>`
    )
    .join("");

  card.innerHTML = `
    <div class="best-route-banner">${Icons.svg("sparkle", { size: 18 })} Best Route: ${formatRouteName(data.best_route)}</div>

    <div class="route-summary-row">
      <div class="route-summary-stat">
        <div class="value">${data.cost_reduced_pct}%</div>
        <div class="label">Cost Reduced</div>
      </div>
      <div class="route-summary-stat">
        <div class="value">${timeLabel}</div>
        <div class="label">Delivery Time</div>
      </div>
      <div class="route-summary-stat">
        <div class="value">\u20B9${data.current_cost_per_kg}/kg</div>
        <div class="label">Your Current Cost</div>
      </div>
    </div>

    <table class="ai-tools-table">
      <thead>
        <tr><th>Route</th><th>Cost/kg</th><th>Transit Days</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function formatRouteName(route) {
  return route
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" \u2192 ");
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}