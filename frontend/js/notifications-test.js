const API_BASE = "http://127.0.0.1:8000";
let liveSocket = null;

function getToken() {
  return document.getElementById("token").value.trim();
}

function getUserId() {
  return document.getElementById("userId").value.trim();
}

async function loadNotifications() {
  const token = getToken();
  if (!token) {
    alert("Please enter an access token");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/notifications/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");
    renderList(data);
    await refreshBadge();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function refreshBadge() {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    document.getElementById("badge").textContent = data.unread_count;
    document.getElementById("badge").style.display = data.unread_count > 0 ? "inline-block" : "none";
  } catch (err) {
    console.error(err);
  }
}

async function markAsRead(notificationId) {
  const token = getToken();
  await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadNotifications();
}

function renderList(notifications) {
  const list = document.getElementById("notificationList");
  list.innerHTML = "";

  if (notifications.length === 0) {
    list.innerHTML = "<p>No notifications yet.</p>";
    return;
  }

  notifications.forEach((n) => {
    const item = document.createElement("div");
    item.className = `notification-item ${n.is_read ? "read" : "unread"}`;
    item.onclick = () => markAsRead(n.id);

    const msg = document.createElement("div");
    msg.textContent = n.message;

    const timestamp = document.createElement("div");
    timestamp.className = "timestamp";
    timestamp.textContent = new Date(n.created_at).toLocaleString();

    item.appendChild(msg);
    item.appendChild(timestamp);
    list.appendChild(item);
  });
}

function connectLive() {
  const userId = getUserId();
  if (!userId) {
    alert("Please enter your User ID to connect live");
    return;
  }

  if (liveSocket) liveSocket.close();

  liveSocket = new WebSocket(`ws://127.0.0.1:8000/chat/ws/${userId}`);

  liveSocket.onopen = () => {
    console.log("Live notification channel connected");
  };

  liveSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "notification") {
      refreshBadge();
      loadNotifications();
    }
  };
}