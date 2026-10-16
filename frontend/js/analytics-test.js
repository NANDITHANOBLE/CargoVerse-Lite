const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

    renderParticles();
    renderHeader("analytics.html");
    renderFooter();

    loadDashboard();
});

async function loadDashboard() {
    const role = AuthState.getRole();
    const token = AuthState.getToken();

    try {
        const res = await fetch(
            `${API_BASE}/analytics/${role}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || "Request failed");
        }

        renderStats(role, data);
        log(`Loaded ${role} dashboard successfully`);
    } catch (err) {
        log(`Error: ${err.message}`);
    }
}

function renderStats(role, data) {
    const grid = document.getElementById("statsGrid");
    grid.innerHTML = "";

    const labels = {
        admin: [
            ["Total Revenue", `₹${data.total_revenue.toLocaleString()}`],
            ["Approved Providers", data.providers],
            ["Total Bookings", data.bookings],
            ["Pending Approvals", data.pending_approvals],
            ["Occupancy Rate", `${data.occupancy_rate}%`],
        ],

        provider: [
            ["Revenue", `₹${data.revenue.toLocaleString()}`],
            ["Available Capacity", `${data.available_capacity_cbm} CBM`],
            ["Total Bookings", data.total_bookings],
            ["Customer Rating", `${data.customer_rating} / 10`],
        ],

        trader: [
            ["Total Bookings", data.bookings],
            ["Total Expenses", `₹${data.expenses.toLocaleString()}`],
            ["Active Shipments", data.active_shipments],
            ["Estimated Savings", `₹${data.saved_cost_estimate.toLocaleString()}`],
        ],
    };

    labels[role].forEach(([label, value], idx) => {
        const card = document.createElement("div");
        card.className = "stat-card";

        const labelEl = document.createElement("div");
        labelEl.className = "stat-label";
        labelEl.textContent = label;

        const valueEl = document.createElement("div");
        valueEl.className = `stat-value ${idx % 2 === 1 ? "purple" : ""}`;
        valueEl.textContent = value;

        card.appendChild(labelEl);
        card.appendChild(valueEl);

        grid.appendChild(card);
    });
}

function log(message) {
    const logEl = document.getElementById("log");

    if (!logEl) return;

    const entry = document.createElement("div");
    entry.textContent = message;

    logEl.appendChild(entry);
}