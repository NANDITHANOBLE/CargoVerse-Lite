const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

    renderParticles();
    renderHeader("tracking.html");
    renderFooter();

    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("booking_id");

    if (bookingId) {
        document.getElementById("bookingId").value = bookingId;
        fetchStatus();
    }
});

function getToken() {
    return AuthState.getToken();
}

function getBookingId() {
    return document.getElementById("bookingId").value.trim();
}

async function fetchStatus() {
    const bookingId = getBookingId();

    if (!bookingId) {
        alert("Please enter a Booking ID");
        return;
    }

    try {
        const res = await fetch(
            `${API_BASE}/tracking/${bookingId}`,
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

        renderProgress(data.status, data.progress);
        log(`Fetched status: ${data.status} (${data.progress}%)`);
    } catch (err) {
        log(`Error: ${err.message}`);
    }
}

async function advanceStatus() {
    const bookingId = getBookingId();

    if (!bookingId) {
        alert("Please enter a Booking ID");
        return;
    }

    try {
        const res = await fetch(
            `${API_BASE}/tracking/${bookingId}/advance`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || "Request failed");
        }

        renderProgress(data.status, data.progress);
        log(`Advanced to: ${data.status} (${data.progress}%)`);
    } catch (err) {
        log(`Error: ${err.message}`);
    }
}

function renderProgress(status, progress) {
    document.getElementById("progressFill").style.width = `${progress}%`;

    document.getElementById(
        "statusLabel"
    ).textContent = `Status: ${status.toUpperCase()} (${progress}%)`;

    document.querySelectorAll(".step").forEach((el) => {
        el.classList.toggle("active", el.dataset.step === status);
    });
}

function log(message) {
    const logEl = document.getElementById("log");

    const entry = document.createElement("div");
    entry.textContent = message;

    logEl.appendChild(entry);
}