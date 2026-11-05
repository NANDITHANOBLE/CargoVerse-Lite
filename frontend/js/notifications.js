// FILE: frontend/js/notifications.js
const API_BASE = "http://127.0.0.1:8000";
let liveSocket = null;
let allNotifications = [];

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  injectIcons();
  loadNotifications();
  connectLive();

  document.getElementById("refreshBtn").addEventListener("click", loadNotifications);
  document.getElementById("markAllReadBtn").addEventListener("click", markAllAsRead);
});

function injectIcons() {
  document.getElementById("bellIcon").innerHTML = Icons.svg("bell", { size: 22 });
  document.getElementById("refreshBtn").innerHTML = `${Icons.svg("search", { size: 14 })} Refresh`;
  document.getElementById("markAllReadBtn").innerHTML = `${Icons.svg("check", { size: 14 })} Mark all as read`;
}

async function loadNotifications() {
  const list = document.getElementById("notificationList");
  list.innerHTML = Array.from({ length: 4 })
    .map(() => `<div class="card skeleton skeleton-notif-row"></div>`)
    .join("");

  try {
    const res = await AuthState.authFetch(`${API_BASE}/notifications/`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");

    allNotifications = data;
    renderGroupedList(data);
    await refreshBadge();
  } catch (err) {
    list.innerHTML = `
      <div class="notif-empty">
        <div class="icon-wrap">${Icons.svg("bell", { size: 26 })}</div>
        <p>Could not load notifications: ${err.message}</p>
      </div>`;
  }
}

async function refreshBadge() {
  try {
    const res = await AuthState.authFetch(`${API_BASE}/notifications/unread-count`);
    const data = await res.json();

    const badge = document.getElementById("badge");
    if (res.ok && data.unread_count > 0) {
      badge.textContent = data.unread_count > 9 ? "9+" : data.unread_count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  } catch (err) {
    console.error(err);
  }
}

async function markAsRead(notificationId) {
  await AuthState.authFetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "POST",
  });
  loadNotifications();
}

async function markAllAsRead() {
  const unread = allNotifications.filter((n) => !n.is_read);
  if (unread.length === 0) {
    showToast("No unread notifications", "info");
    return;
  }

  try {
    await Promise.all(
      unread.map((n) =>
        AuthState.authFetch(`${API_BASE}/notifications/${n.id}/read`, { method: "POST" })
      )
    );
    showToast("All notifications marked as read", "success");
    loadNotifications();
  } catch (err) {
    showToast("Could not mark all as read", "danger");
  }
}

function groupByDate(notifications) {
  const groups = {};
  const now = new Date();

  notifications.forEach((n) => {
    const date = new Date(n.created_at);
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    let label;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else if (diffDays < 7) label = "This Week";
    else label = "Earlier";

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  return groups;
}

function renderGroupedList(notifications) {
  const list = document.getElementById("notificationList");

  if (notifications.length === 0) {
    list.innerHTML = `
      <div class="notif-empty">
        <div class="icon-wrap">${Icons.svg("bell", { size: 26 })}</div>
        <p>No notifications yet. We'll let you know when something happens.</p>
      </div>`;
    return;
  }

  const groups = groupByDate(notifications);
  const order = ["Today", "Yesterday", "This Week", "Earlier"];

  list.innerHTML = order
    .filter((label) => groups[label])
    .map(
      (label) => `
      <div class="notif-date-group">
        <div class="notif-date-label">${label}</div>
        ${groups[label].map((n) => renderNotificationItem(n)).join("")}
      </div>`
    )
    .join("");

  document.querySelectorAll(".notification-item").forEach((item) => {
    item.addEventListener("click", () => markAsRead(item.dataset.notifId));
  });
}

function renderNotificationItem(n) {
  return `
    <div class="notification-item ${n.is_read ? "read" : "unread"}" data-notif-id="${n.id}">
      <div class="icon-wrap">${Icons.svg("bell", { size: 17 })}</div>
      <div class="notif-content">
        <div class="notif-message">${n.message}</div>
        <div class="notif-timestamp">${Icons.svg("mapPin", { size: 11 })} ${new Date(n.created_at).toLocaleString()}</div>
      </div>
    </div>
  `;
}

function connectLive() {
  const userId = AuthState.getUserId();
  if (!userId) return;

  if (liveSocket) liveSocket.close();

  liveSocket = new WebSocket(`ws://127.0.0.1:8000/chat/ws/${userId}`);

  liveSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "notification") {
      refreshBadge();
      loadNotifications();
    }
  };
}