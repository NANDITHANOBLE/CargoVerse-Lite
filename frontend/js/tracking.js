// FILE: frontend/js/tracking.js
const API_BASE = "http://127.0.0.1:8000";

const STEP_ORDER = ["booked", "confirmed", "in_transit", "arrived", "delivered"];
const STEP_ICONS = {
  booked: "package",
  confirmed: "check",
  in_transit: "truck",
  arrived: "mapPin",
  delivered: "shield",
};

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  injectIcons();
  buildStepsRow();

  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("booking_id");

  const role = AuthState.getRole();
  const advanceBtn = document.getElementById("advanceStatusBtn");
  advanceBtn.style.display = role === "provider" || role === "admin" ? "inline-flex" : "none";

  if (bookingId) {
    document.getElementById("bookingId").value = bookingId;
    fetchStatus();
  }

  document.getElementById("bookingIdIcon").innerHTML = Icons.svg("package", { size: 16 });
  document.getElementById("refreshBtn").addEventListener("click", fetchStatus);
  document.getElementById("advanceStatusBtn").addEventListener("click", advanceStatus);

  document.getElementById("refreshBtn").innerHTML = `${Icons.svg("search", { size: 15 })} Refresh Status`;
  document.getElementById("advanceStatusBtn").innerHTML = `${Icons.svg("arrowRight", { size: 15 })} Advance Status`;
});

function buildStepsRow() {
  const row = document.getElementById("stepsRow");
  row.innerHTML = STEP_ORDER.map(
    (step) => `
      <div class="step" data-step="${step}">
        <div class="step-circle">${Icons.svg(STEP_ICONS[step], { size: 16 })}</div>
        <div class="step-label">${step.replace("_", " ")}</div>
      </div>`
  ).join("");
}

function injectIcons() {
  document.getElementById("statusLabelIcon").innerHTML = Icons.svg("truck", { size: 18 });
}

function getBookingId() {
  return document.getElementById("bookingId").value.trim();
}

async function fetchStatus() {
  const bookingId = getBookingId();
  const container = document.getElementById("progressContainer");

  if (!bookingId) {
    showToast("Please enter a Booking ID", "danger");
    return;
  }

  container.style.opacity = "0.5";

  try {
    const res = await AuthState.authFetch(`${API_BASE}/tracking/${bookingId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");

    renderProgress(data.status, data.progress, bookingId);
  } catch (err) {
    showToast(`Error: ${err.message}`, "danger");
  } finally {
    container.style.opacity = "1";
  }
}

async function advanceStatus() {
  const bookingId = getBookingId();
  if (!bookingId) {
    showToast("Please enter a Booking ID", "danger");
    return;
  }

  const btn = document.getElementById("advanceStatusBtn");
  setLoading(btn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/tracking/${bookingId}/advance`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");

    renderProgress(data.status, data.progress, bookingId);
    showToast(`Advanced to: ${data.status.replace("_", " ")}`, "success");
  } catch (err) {
    showToast(`Error: ${err.message}`, "danger");
  } finally {
    setLoading(btn, false);
  }
}

function renderProgress(status, progress, bookingId) {
  document.getElementById("progressFill").style.width = `${progress}%`;

  document.getElementById("bookingIdTag").textContent = `ID: ${bookingId}`;
  document.getElementById("statusLabelText").textContent = `${status.replace("_", " ").toUpperCase()} (${progress}%)`;

  const currentIndex = STEP_ORDER.indexOf(status);

  document.querySelectorAll(".step").forEach((el) => {
    const stepIndex = STEP_ORDER.indexOf(el.dataset.step);
    el.classList.remove("done", "active");
    if (stepIndex < currentIndex) el.classList.add("done");
    else if (stepIndex === currentIndex) el.classList.add("active");
  });
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}