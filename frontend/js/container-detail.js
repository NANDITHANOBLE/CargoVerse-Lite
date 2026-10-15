const API_BASE = "http://127.0.0.1:8000";
let currentContainer = null;

document.addEventListener("DOMContentLoaded", () => {
  renderParticles();
  renderHeader("marketplace.html");
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  const containerId = params.get("id") || sessionStorage.getItem("cv_selected_container");

  if (!containerId) {
    window.location.href = "marketplace.html";
    return;
  }

  loadContainer(containerId);

  document.getElementById("volumeInput").addEventListener("input", updatePricePreview);
  document.getElementById("getAiRecommendBtn").addEventListener("click", getAiRecommendation);
  document.getElementById("bookNowBtn").addEventListener("click", goToCheckout);
});

async function loadContainer(containerId) {
  try {
    const res = await fetch(`${API_BASE}/containers/${containerId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Container not found");

    currentContainer = data;

    document.getElementById("detailTitle").textContent = `${data.origin} \u2192 ${data.destination}`;
    document.getElementById("detailMode").textContent = data.mode.toUpperCase();
    document.getElementById("statCapacity").textContent = `${data.capacity_tons} tons`;
    document.getElementById("statAvailable").textContent = `${data.available_space_cbm} CBM`;
    document.getElementById("statPrice").textContent = `\u20B9${data.price_per_cbm.toLocaleString()}/CBM`;
    document.getElementById("statTransit").textContent = `${data.transit_days} days`;
    document.getElementById("statDeparture").textContent = new Date(data.departure_date).toLocaleDateString();
    document.getElementById("volumeInput").max = data.available_space_cbm;

    updatePricePreview();
  } catch (err) {
    document.getElementById("detailTitle").textContent = "Error loading container";
    console.error(err);
  }
}

function updatePricePreview() {
  if (!currentContainer) return;
  const volume = parseFloat(document.getElementById("volumeInput").value) || 0;
  const base = volume * currentContainer.price_per_cbm;
  const gst = base * 0.18;
  const insurance = base * 0.02;
  const docFee = 250;
  const total = base + gst + insurance + docFee;

  document.getElementById("previewBase").textContent = `\u20B9${base.toLocaleString(undefined, {maximumFractionDigits:2})}`;
  document.getElementById("previewGst").textContent = `\u20B9${gst.toLocaleString(undefined, {maximumFractionDigits:2})}`;
  document.getElementById("previewInsurance").textContent = `\u20B9${insurance.toLocaleString(undefined, {maximumFractionDigits:2})}`;
  document.getElementById("previewTotal").textContent = `\u20B9${total.toLocaleString(undefined, {maximumFractionDigits:2})}`;
}

async function getAiRecommendation() {
  if (!AuthState.requireAuth(["trader"])) return;

  const box = document.getElementById("aiResultBox");
  box.classList.add("show");
  box.textContent = "Analyzing alternatives...";

  try {
    const res = await fetch(
      `${API_BASE}/ai/recommend/by-route?origin=${currentContainer.origin}&destination=${currentContainer.destination}&current_choice_id=${currentContainer.id}`,
      { headers: { Authorization: `Bearer ${AuthState.getToken()}` } }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not fetch recommendation");

    if (data.is_current_already_best) {
      box.innerHTML = `This is already the best option on this route!`;
    } else {
      box.innerHTML = `
        Container <strong>${data.best_container_id}</strong> may be a better choice:<br/>
        Savings: \u20B9${data.savings_per_cbm}/CBM &middot; Faster by ${data.faster_by_days} day(s)
        <br/><a href="container-detail.html?id=${data.best_container_id}" style="text-decoration:underline;">View it</a>
      `;
    }
  } catch (err) {
    box.textContent = `Could not load AI recommendation: ${err.message}`;
  }
}

function goToCheckout() {
  if (!AuthState.requireAuth(["trader"])) return;

  const volume = parseFloat(document.getElementById("volumeInput").value) || 0;
  if (volume <= 0 || volume > currentContainer.available_space_cbm) {
    alert("Please enter a valid volume within available space.");
    return;
  }

  sessionStorage.setItem("cv_booking_container_id", currentContainer.id);
  sessionStorage.setItem("cv_booking_volume", volume);
  window.location.href = "booking-checkout.html";
}