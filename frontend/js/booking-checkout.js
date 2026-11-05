// FILE: frontend/js/booking-checkout.js
const API_BASE = "http://127.0.0.1:8000";
let bookingData = {};

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader"])) return;

  renderSidebar();
  injectIcons();

  const containerId = sessionStorage.getItem("cv_booking_container_id");
  const volume = sessionStorage.getItem("cv_booking_volume");

  if (!containerId || !volume) {
    window.location.href = "marketplace.html";
    return;
  }

  bookingData.containerId = containerId;
  bookingData.volume = parseFloat(volume);

  loadQuote();

  document.getElementById("weightIcon").innerHTML = Icons.svg("package", { size: 16 });
  document.getElementById("confirmBookingBtn").addEventListener("click", confirmBooking);
  document.getElementById("payNowBtn").addEventListener("click", payNow);
  document.getElementById("goToTrackingBtn").addEventListener("click", goToTracking);
});

function injectIcons() {
  document.getElementById("step1Icon").innerHTML = Icons.svg("package", { size: 20 });
  document.getElementById("step2Icon").innerHTML = Icons.svg("lock", { size: 20 });
  document.getElementById("step3Icon").innerHTML = Icons.svg("check", { size: 20 });

  document.getElementById("paymentMethodIcon").innerHTML = Icons.svg("shield", { size: 20 });
  document.getElementById("securityNoteIcon").innerHTML = Icons.svg("lock", { size: 14 });
  document.getElementById("successIcon").innerHTML = Icons.svg("check", { size: 36 });

  document.getElementById("confirmBookingBtn").innerHTML = `
    Confirm Booking ${Icons.svg("arrowRight", { size: 16 })}
  `;
  document.getElementById("payNowBtn").innerHTML = `
    ${Icons.svg("lock", { size: 16 })} Pay Now
  `;
  document.getElementById("goToTrackingBtn").innerHTML = `
    ${Icons.svg("mapPin", { size: 16 })} Track Shipment
  `;
}

async function loadQuote() {
  try {
    const res = await fetch(
      `${API_BASE}/bookings/quote/${bookingData.containerId}?volume_cbm=${bookingData.volume}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not fetch quote");

    document.getElementById("sumVolume").textContent = `${bookingData.volume} CBM`;
    document.getElementById("sumBase").textContent = `\u20B9${data.base_amount.toLocaleString()}`;
    document.getElementById("sumGst").textContent = `\u20B9${data.gst.toLocaleString()}`;
    document.getElementById("sumInsurance").textContent = `\u20B9${data.insurance_fee.toLocaleString()}`;
    document.getElementById("sumDocFee").textContent = `\u20B9${data.documentation_fee.toLocaleString()}`;
    document.getElementById("sumTotal").textContent = `\u20B9${data.total_amount.toLocaleString()}`;
  } catch (err) {
    showToast(`Error loading quote: ${err.message}`, "danger");
    setTimeout(() => (window.location.href = "marketplace.html"), 1500);
  }
}

async function confirmBooking() {
  const weightInput = document.getElementById("weightInput").value;
  const btn = document.getElementById("confirmBookingBtn");

  if (!weightInput || parseFloat(weightInput) <= 0) {
    showToast("Please enter cargo weight in tons", "danger");
    return;
  }

  setLoading(btn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/bookings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        container_id: bookingData.containerId,
        volume_cbm: bookingData.volume,
        weight_tons: parseFloat(weightInput),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Booking failed");

    bookingData.bookingId = data.id;
    bookingData.totalAmount = data.total_amount;

    goToStep(2);
  } catch (err) {
    showToast(`Error: ${err.message}`, "danger");
  } finally {
    setLoading(btn, false);
  }
}

async function payNow() {
  const btn = document.getElementById("payNowBtn");
  setLoading(btn, true);

  try {
    const initRes = await AuthState.authFetch(`${API_BASE}/payments/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingData.bookingId, method: "mock_gateway" }),
    });
    const initData = await initRes.json();
    if (!initRes.ok) throw new Error(initData.detail || "Payment initiation failed");

    const confirmRes = await AuthState.authFetch(`${API_BASE}/payments/${initData.id}/confirm`, {
      method: "POST",
    });
    const confirmData = await confirmRes.json();
    if (!confirmRes.ok) throw new Error(confirmData.detail || "Payment confirmation failed");

    document.getElementById("txnRef").textContent = confirmData.transaction_ref;
    sessionStorage.setItem("cv_last_booking_id", bookingData.bookingId);
    goToStep(3);
  } catch (err) {
    showToast(`Payment error: ${err.message}`, "danger");
  } finally {
    setLoading(btn, false);
  }
}

function goToStep(step) {
  document.querySelectorAll(".checkout-step").forEach((el) => el.classList.remove("active"));
  document.getElementById(`step${step}`).classList.add("active");

  document.querySelectorAll(".stepper-item").forEach((item, idx) => {
    const stepNum = idx + 1;
    item.classList.remove("active", "completed");
    if (stepNum < step) item.classList.add("completed");
    else if (stepNum === step) item.classList.add("active");
  });

  document.querySelectorAll(".stepper-connector").forEach((conn, idx) => {
    conn.classList.toggle("completed", idx + 1 < step);
  });
}

function goToTracking() {
  window.location.href = `tracking.html?booking_id=${bookingData.bookingId}`;
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}