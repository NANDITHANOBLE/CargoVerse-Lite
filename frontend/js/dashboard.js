// FILE: frontend/js/dashboard.js
const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  renderGreeting();
  renderQuickActions();
  loadDashboardData();
  loadRecentActivity();

  document.getElementById("notifBtn").addEventListener("click", () => {
    window.location.href = "notifications.html";
  });

  document.getElementById("chatBtn").addEventListener("click", () => {
    window.location.href = "chat.html";
  });
});

function renderGreeting() {
  const user = AuthState.getUser();
  const role = AuthState.getRole();
  const name = user?.full_name || "there";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const roleLabels = {
    trader: "Trader Account",
    provider: "Provider Account",
    admin: "Admin Account",
  };

  document.getElementById("avatarInitials").textContent = initials;
  document.getElementById("greetingTitle").textContent = `${timeGreeting}, ${name.split(" ")[0]}`;
  document.getElementById("greetingSubtitle").innerHTML = `
    ${Icons.svg("shield", { size: 14 })} ${roleLabels[role] || "Account"}
  `;

  document.getElementById("notifIcon").innerHTML = Icons.svg("bell", { size: 20 });
  document.getElementById("chatIcon").innerHTML = Icons.svg("chat", { size: 20 });

  refreshNotifBadge();
}

async function refreshNotifBadge() {
  try {
    const res = await AuthState.authFetch(`${API_BASE}/notifications/unread-count`);
    const data = await res.json();
    const badge = document.getElementById("notifBadge");
    if (res.ok && data.unread_count > 0) {
      badge.textContent = data.unread_count > 9 ? "9+" : data.unread_count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  } catch (err) {
    console.warn("Could not load notification count:", err.message);
  }
}

const QUICK_ACTIONS_BY_ROLE = {
  trader: [
    { icon: "search", title: "Browse Marketplace", desc: "Find cargo space", href: "marketplace.html" },
    { icon: "sparkle", title: "AI Tools", desc: "Get smart recommendations", href: "ai-tools.html" },
    { icon: "mapPin", title: "Track Shipment", desc: "Live booking status", href: "tracking.html" },
    { icon: "chat", title: "Messages", desc: "Chat with providers", href: "chat.html" },
  ],
  provider: [
    { icon: "package", title: "My Containers", desc: "Manage listed space", href: "my-containers.html" },
    { icon: "truck", title: "Provider Profile", desc: "View verification status", href: "provider-onboarding.html" },
    { icon: "chart", title: "Analytics", desc: "Revenue & performance", href: "analytics.html" },
    { icon: "chat", title: "Messages", desc: "Chat with traders", href: "chat.html" },
  ],
  admin: [
    { icon: "shield", title: "Provider Approvals", desc: "Review pending applications", href: "providers-admin.html" },
    { icon: "chart", title: "Platform Analytics", desc: "Revenue & occupancy", href: "analytics.html" },
    { icon: "search", title: "Marketplace", desc: "View all listings", href: "marketplace.html" },
    { icon: "bell", title: "Notifications", desc: "System alerts", href: "notifications.html" },
  ],
};

function renderQuickActions() {
  const role = AuthState.getRole();
  const actions = QUICK_ACTIONS_BY_ROLE[role] || [];
  const grid = document.getElementById("quickActionsGrid");

  grid.innerHTML = actions
    .map(
      (a) => `
      <a href="${a.href}" class="quick-action-card card">
        <div class="icon-wrap">${Icons.svg(a.icon, { size: 24 })}</div>
        <h3>${a.title}</h3>
        <p>${a.desc}</p>
      </a>`
    )
    .join("");
}

async function loadDashboardData() {
  const role = AuthState.getRole();
  const grid = document.getElementById("statsGrid");

  grid.innerHTML = Array.from({ length: 4 })
    .map(() => `<div class="card skeleton skeleton-stat"></div>`)
    .join("");

  try {
    const res = await AuthState.authFetch(`${API_BASE}/analytics/${role}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load dashboard");

    renderStats(role, data);
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state-dashboard" style="grid-column: 1 / -1;">
        <div class="icon-wrap">${Icons.svg("chart", { size: 28 })}</div>
        <p>Could not load stats: ${err.message}</p>
      </div>`;
  }
}

function renderStats(role, data) {
  const grid = document.getElementById("statsGrid");

  const configs = {
    admin: [
      { label: "Total Revenue", value: `₹${data.total_revenue.toLocaleString()}`, icon: "chart", color: "blue" },
      { label: "Approved Providers", value: data.providers, icon: "shield", color: "green" },
      { label: "Total Bookings", value: data.bookings, icon: "package", color: "cyan" },
      { label: "Pending Approvals", value: data.pending_approvals, icon: "bell", color: "amber" },
    ],
    provider: [
      { label: "Revenue", value: `₹${data.revenue.toLocaleString()}`, icon: "chart", color: "blue" },
      { label: "Available Capacity", value: `${data.available_capacity_cbm} CBM`, icon: "package", color: "cyan" },
      { label: "Total Bookings", value: data.total_bookings, icon: "truck", color: "green" },
      { label: "Customer Rating", value: `${data.customer_rating} / 10`, icon: "star", color: "amber" },
    ],
    trader: [
      { label: "Total Bookings", value: data.bookings, icon: "package", color: "blue" },
      { label: "Total Expenses", value: `₹${data.expenses.toLocaleString()}`, icon: "chart", color: "cyan" },
      { label: "Active Shipments", value: data.active_shipments, icon: "truck", color: "green" },
      { label: "Estimated Savings", value: `₹${data.saved_cost_estimate.toLocaleString()}`, icon: "sparkle", color: "amber" },
    ],
  };

  grid.innerHTML = configs[role]
    .map(
      (stat) => `
      <div class="card stat-card">
        <div class="icon-wrap ${stat.color}">${Icons.svg(stat.icon, { size: 22 })}</div>
        <div>
          <div class="stat-label">${stat.label}</div>
          <div class="stat-value">${stat.value}</div>
        </div>
      </div>`
    )
    .join("");
}

async function loadRecentActivity() {
  const list = document.getElementById("activityList");
  list.innerHTML = Array.from({ length: 3 })
    .map(() => `<div class="card skeleton skeleton-row"></div>`)
    .join("");

  try {
    const res = await AuthState.authFetch(`${API_BASE}/notifications/?limit=5`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load activity");

    if (data.length === 0) {
      list.innerHTML = `
        <div class="empty-state-dashboard">
          <div class="icon-wrap">${Icons.svg("bell", { size: 26 })}</div>
          <p>No recent activity yet. New updates will appear here.</p>
        </div>`;
      return;
    }

    list.innerHTML = data
      .map(
        (n) => `
        <div class="activity-item">
          <div class="icon-wrap" style="background:rgba(37,99,235,0.1); color:var(--primary);">
            ${Icons.svg("bell", { size: 18 })}
          </div>
          <div class="activity-text">${n.message}</div>
          <div class="activity-time">${new Date(n.created_at).toLocaleDateString()}</div>
        </div>`
      )
      .join("");
  } catch (err) {
    list.innerHTML = `
      <div class="empty-state-dashboard">
        <div class="icon-wrap">${Icons.svg("bell", { size: 26 })}</div>
        <p>Could not load recent activity.</p>
      </div>`;
  }
}