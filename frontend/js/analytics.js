// FILE: frontend/js/analytics.js
const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  loadDashboard();
});

async function loadDashboard() {
  const role = AuthState.getRole();
  const grid = document.getElementById("statsGrid");
  const chartCard = document.getElementById("chartCard");
  const insightRow = document.getElementById("insightRow");

  grid.innerHTML = Array.from({ length: 4 })
    .map(() => `<div class="card skeleton skeleton-analytics-stat"></div>`)
    .join("");
  chartCard.innerHTML = `<div class="card skeleton skeleton-chart"></div>`;

  try {
    const res = await AuthState.authFetch(`${API_BASE}/analytics/${role}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");

    renderStats(role, data);
    renderChart(role, data);
    renderInsights(role, data);
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state-dashboard" style="grid-column: 1 / -1;">
        <div class="icon-wrap">${Icons.svg("chart", { size: 28 })}</div>
        <p>Could not load analytics: ${err.message}</p>
      </div>`;
    chartCard.innerHTML = "";
    insightRow.innerHTML = "";
  }
}

const STAT_CONFIGS = {
  admin: [
    { label: "Total Revenue", key: "total_revenue", format: "currency", icon: "chart", color: "blue" },
    { label: "Approved Providers", key: "providers", format: "number", icon: "shield", color: "green" },
    { label: "Total Bookings", key: "bookings", format: "number", icon: "package", color: "cyan" },
    { label: "Pending Approvals", key: "pending_approvals", format: "number", icon: "bell", color: "amber" },
  ],
  provider: [
    { label: "Revenue", key: "revenue", format: "currency", icon: "chart", color: "blue" },
    { label: "Available Capacity", key: "available_capacity_cbm", format: "cbm", icon: "package", color: "cyan" },
    { label: "Total Bookings", key: "total_bookings", format: "number", icon: "truck", color: "green" },
    { label: "Customer Rating", key: "customer_rating", format: "rating", icon: "star", color: "amber" },
  ],
  trader: [
    { label: "Total Bookings", key: "bookings", format: "number", icon: "package", color: "blue" },
    { label: "Total Expenses", key: "expenses", format: "currency", icon: "chart", color: "cyan" },
    { label: "Active Shipments", key: "active_shipments", format: "number", icon: "truck", color: "green" },
    { label: "Estimated Savings", key: "saved_cost_estimate", format: "currency", icon: "sparkle", color: "amber" },
  ],
};

function formatValue(value, format) {
  if (format === "currency") return `\u20B9${value.toLocaleString()}`;
  if (format === "cbm") return `${value} CBM`;
  if (format === "rating") return `${value} / 10`;
  return value;
}

function renderStats(role, data) {
  const grid = document.getElementById("statsGrid");
  const configs = STAT_CONFIGS[role];

  const maxValue = Math.max(...configs.map((c) => (typeof data[c.key] === "number" ? data[c.key] : 0)));

  grid.innerHTML = configs
    .map((stat) => {
      const rawValue = data[stat.key];
      const barPct = maxValue > 0 ? Math.min((rawValue / maxValue) * 100, 100) : 0;

      return `
        <div class="card analytics-stat-card">
          <div class="icon-wrap ${stat.color}">${Icons.svg(stat.icon, { size: 22 })}</div>
          <div>
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${formatValue(rawValue, stat.format)}</div>
          </div>
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width:${barPct}%;"></div>
          </div>
        </div>`;
    })
    .join("");

  // Animate bars in after insertion
  requestAnimationFrame(() => {
    document.querySelectorAll(".mini-bar-fill").forEach((el) => {
      el.style.width = el.style.width; // triggers transition since already set
    });
  });
}

function renderChart(role, data) {
  const chartCard = document.getElementById("chartCard");
  const configs = STAT_CONFIGS[role].filter((c) => c.format !== "rating");
  const maxValue = Math.max(...configs.map((c) => data[c.key] || 0));

  chartCard.innerHTML = `
    <div class="chart-card-header">
      <h3>${Icons.svg("chart", { size: 18 })} Performance Overview</h3>
    </div>
    <div class="bar-chart">
      ${configs
        .map((c) => {
          const value = data[c.key] || 0;
          const heightPct = maxValue > 0 ? Math.max((value / maxValue) * 100, 4) : 4;
          return `
            <div class="bar-chart-col">
              <div class="bar-chart-value">${formatValue(value, c.format)}</div>
              <div class="bar-chart-bar" style="height:${heightPct}%;"></div>
              <div class="bar-chart-label">${c.label}</div>
            </div>`;
        })
        .join("")}
    </div>
  `;
}

const INSIGHTS_BY_ROLE = {
  admin: [
    { icon: "shield", title: "Provider Health", text: "Approved providers are maintaining strong service levels across all transport modes." },
    { icon: "bell", title: "Action Needed", text: "Review pending provider approvals to keep onboarding times low." },
  ],
  provider: [
    { icon: "truck", title: "Capacity Utilization", text: "Keep your available space updated to maximize booking matches from traders." },
    { icon: "star", title: "Customer Satisfaction", text: "Your rating reflects delivery reliability — consistent on-time performance helps it grow." },
  ],
  trader: [
    { icon: "sparkle", title: "AI Savings", text: "Use AI Tools before booking to compare alternatives and maximize your estimated savings." },
    { icon: "mapPin", title: "Active Shipments", text: "Track your active shipments in real time from the Tracking page." },
  ],
};

function renderInsights(role) {
  const insightRow = document.getElementById("insightRow");
  const insights = INSIGHTS_BY_ROLE[role] || [];

  insightRow.innerHTML = insights
    .map(
      (i) => `
      <div class="card insight-card">
        <div class="icon-wrap">${Icons.svg(i.icon, { size: 18 })}</div>
        <div>
          <h4>${i.title}</h4>
          <p>${i.text}</p>
        </div>
      </div>`
    )
    .join("");
}