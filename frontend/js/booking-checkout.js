const API_BASE = "http://127.0.0.1:8000";
let bookingData = {};

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader"])) return;

  renderParticles();
  renderHeader("marketplace.html");
  renderFooter();

  const containerId = sessionStorage.getItem("cv_booking_container_id");
  const volume = sessionStorage.getItem("cv_booking_volume");

  if (!containerId || !volume) {
    window.location.href = "marketplace.html";
    return;
  }

  bookingData.containerId = containerId;
  bookingData.volume = parseFloat(volume);

  loadQuote();

  document.getElementById("confirmBookingBtn").addEventListener("click", confirmBooking);
  document.getElementById("payNowBtn").addEventListener("click", payNow);
});

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
    alert(`Error loading quote: ${err.message}`);
    window.location.href = "marketplace.html";
  }
}

async function confirmBooking() {
  const weightInput = document.getElementById("weightInput").value;
  if (!weightInput || parseFloat(weightInput) <= 0) {
    alert("Please enter cargo weight in tons");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/bookings/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AuthState.getToken()}`,
        "Content-Type": "application/json",
      },
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
    alert(`Error: ${err.message}`);
  }
}

async function payNow() {
  try {
    const initRes = await fetch(`${API_BASE}/payments/initiate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AuthState.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ booking_id: bookingData.bookingId, method: "mock_gateway" }),
    });
    const initData = await initRes.json();
    if (!initRes.ok) throw new Error(initData.detail || "Payment initiation failed");

    const confirmRes = await fetch(`${API_BASE}/payments/${initData.id}/confirm`, {
      method: "POST",
      headers: { Authorization: `Bearer ${AuthState.getToken()}` },
    });
    const confirmData = await confirmRes.json();
    if (!confirmRes.ok) throw new Error(confirmData.detail || "Payment confirmation failed");

    document.getElementById("txnRef").textContent = confirmData.transaction_ref;
    sessionStorage.setItem("cv_last_booking_id", bookingData.bookingId);
    goToStep(3);
  } catch (err) {
    alert(`Payment error: ${err.message}`);
  }
}

function goToStep(step) {
  document.querySelectorAll(".checkout-step").forEach((el) => el.classList.remove("active"));
  document.getElementById(`step${step}`).classList.add("active");
}

function goToTracking() {
  window.location.href = `tracking-test.html?booking_id=${bookingData.bookingId}`;
}