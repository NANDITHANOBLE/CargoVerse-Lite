const API_BASE = "http://127.0.0.1:8000";
let liveSocket = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

    renderParticles();
    renderHeader("notifications.html");
    renderFooter();

    loadNotifications();
    connectLive();
});

function getToken() {
    return AuthState.getToken();
}

async function loadNotifications() {
    try {
        const res = await fetch(
            `${API_BASE}/notifications/`,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || "Request failed");
        }

        renderList(data);
        await refreshBadge();
    } catch (err) {
        console.warn(err.message);
    }
}

async function refreshBadge() {
    try {
        const res = await fetch(
            `${API_BASE}/notifications/unread-count`,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );

        const data = await res.json();

        const badge = document.getElementById("badge");

        if (badge) {
            badge.textContent = data.unread_count;
            badge.style.display =
                data.unread_count > 0 ? "inline-block" : "none";
        }
    } catch (err) {
        console.error(err);
    }
}

async function markAsRead(notificationId) {
    await fetch(
        `${API_BASE}/notifications/${notificationId}/read`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );

    loadNotifications();
}

function renderList(notifications) {
    const list = document.getElementById("notificationList");
    list.innerHTML = "";

    if (notifications.length === 0) {
        list.innerHTML = "No notifications yet.";
        return;
    }

    notifications.forEach((n) => {
        const item = document.createElement("div");

        item.className = `notification-item ${
            n.is_read ? "read" : "unread"
        }`;

        item.onclick = () => markAsRead(n.id);

        const msg = document.createElement("div");
        msg.textContent = n.message;

        const timestamp = document.createElement("div");
        timestamp.className = "timestamp";
        timestamp.textContent = new Date(
            n.created_at
        ).toLocaleString();

        item.appendChild(msg);
        item.appendChild(timestamp);

        list.appendChild(item);
    });
}

function connectLive() {
    const userId = AuthState.getUserId();

    if (!userId) return;

    if (liveSocket) {
        liveSocket.close();
    }

    liveSocket = new WebSocket(
        `ws://127.0.0.1:8000/chat/ws/${userId}`
    );

    liveSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "notification") {
            refreshBadge();
            loadNotifications();
        }
    };
}