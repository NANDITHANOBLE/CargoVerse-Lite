const API_BASE = "http://127.0.0.1:8000";

function getToken() {
  return document.getElementById("token").value.trim();
}

function getBookingId() {
  return document.getElementById("bookingId").value.trim();
}

async function fetchStatus() {
  const bookingId = getBookingId();
  const token = getToken();
  if (!bookingId || !token) {
    alert("Please enter both Booking ID and an access token");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/tracking/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");
    renderProgress(data.status, data.progress);
    log(`Fetched status: ${data.status} (${data.progress}%)`);
  } catch (err) {
    log(`Error: ${err.message}`);
  }
}

async function advanceStatus() {
  const bookingId = getBookingId();
  const token = getToken();
  if (!bookingId || !token) {
    alert("Please enter both Booking ID and an access token (provider or admin)");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/tracking/${bookingId}/advance`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");
    renderProgress(data.status, data.progress);
    log(`Advanced to: ${data.status} (${data.progress}%)`);
  } catch (err) {
    log(`Error: ${err.message}`);
  }
}

function renderProgress(status, progress) {
  document.getElementById("progressFill").style.width = `${progress}%`;
  document.getElementById("statusLabel").textContent = `Status: ${status.toUpperCase()} (${progress}%)`;

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