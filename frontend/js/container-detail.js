// FILE: frontend/js/container-detail.js
const API_BASE = "http://127.0.0.1:8000";
let currentContainer = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  injectIcons();

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

function injectIcons() {
  document.getElementById("backIcon").innerHTML = Icons.svg("arrowRight", { size: 14, className: "icon-flip" });
  document.getElementById("aiWidgetIcon").innerHTML = Icons.svg("sparkle", { size: 16 });
  document.getElementById("bookingSidebarIcon").innerHTML = Icons.svg("package", { size: 18 });
  document.getElementById("volumeIcon").innerHTML = Icons.svg("package", { size: 16 });

  document.getElementById("statCapacityIcon").innerHTML = Icons.svg("truck", { size: 18 });
  document.getElementById("statAvailableIcon").innerHTML = Icons.svg("package", { size: 18 });
  document.getElementById("statPriceIcon").innerHTML = Icons.svg("chart", { size: 18 });
  document.getElementById("statTransitIcon").innerHTML = Icons.svg("mapPin", { size: 18 });
  document.getElementById("statDepartureIcon").innerHTML = Icons.svg("mail", { size: 18 });

  document.getElementById("getAiRecommendBtn").innerHTML = `
    ${Icons.svg("sparkle", { size: 16 })} Check if this is the best option on this route
  `;

  document.getElementById("bookNowBtn").innerHTML = `
    Proceed to Checkout ${Icons.svg("arrowRight", { size: 16 })}
  `;
}

async function loadContainer(containerId) {
  const titleEl = document.getElementById("detailTitle");
  titleEl.className = "detail-title skeleton skeleton-detail-title";
  titleEl.textContent = "";

  const statsGrid = document.getElementById("detailStatsGrid");
  statsGrid.innerHTML = Array.from({ length: 5 })
    .map(() => `<div class="detail-stat-box skeleton skeleton-detail-stat"></div>`)
    .join("");

  try {
    const res = await fetch(`${API_BASE}/containers/${containerId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Container not found");

    currentContainer = data;
    renderContainer(data);
  } catch (err) {
    titleEl.className = "detail-title";
    titleEl.textContent = "Error loading container";
    console.error(err);
    showToast(`Could not load container: ${err.message}`, "danger");
  }
}

const MODE_ICONS = { road: "truck", rail: "train", sea: "ship", air: "plane" };

function renderContainer(data) {
  const modeIcon = MODE_ICONS[data.mode] || "truck";

  document.getElementById("detailModeBadge").innerHTML = `
    ${Icons.svg(modeIcon, { size: 13 })} ${data.mode.toUpperCase()}
  `;

  const titleEl = document.getElementById("detailTitle");
  titleEl.className = "detail-title";
  titleEl.innerHTML = `${Icons.svg("mapPin", { size: 22 })} ${data.origin} \u2192 ${data.destination}`;

  document.getElementById("statCapacity").textContent = `${data.capacity_tons} tons`;
  document.getElementById("statAvailable").textContent = `${data.available_space_cbm} CBM`;
  document.getElementById("statPrice").textContent = `\u20B9${data.price_per_cbm.toLocaleString()}/CBM`;
  document.getElementById("statTransit").textContent = `${data.transit_days} days`;
  document.getElementById("statDeparture").textContent = new Date(data.departure_date).toLocaleDateString();

  document.getElementById("detailStatsGrid").innerHTML = document.getElementById("detailStatsTemplate").innerHTML;

  document.getElementById("volumeInput").max = data.available_space_cbm;

  updatePricePreview();
}

function updatePricePreview() {
  if (!currentContainer) return;

  const volume = parseFloat(document.getElementById("volumeInput").value) || 0;
  const base = volume * currentContainer.price_per_cbm;
  const gst = base * 0.18;
  const insurance = base * 0.02;
  const docFee = 250;
  const total = base + gst + insurance + docFee;

  document.getElementById("previewBase").textContent = `\u20B9${base.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  document.getElementById("previewGst").textContent = `\u20B9${gst.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  document.getElementById("previewInsurance").textContent = `\u20B9${insurance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  document.getElementById("previewTotal").textContent = `\u20B9${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

async function getAiRecommendation() {
  if (!AuthState.requireAuth(["trader"])) return;

  const box = document.getElementById("aiResultBox");
  box.classList.add("show");
  box.innerHTML = `
    <span class="ai-loading-dots"><span></span><span></span><span></span></span>
    Analyzing alternatives on this route...
  `;

  try {
    const res = await AuthState.authFetch(
      `${API_BASE}/ai/recommend/by-route?origin=${currentContainer.origin}&destination=${currentContainer.destination}&current_choice_id=${currentContainer.id}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not fetch recommendation");

    if (data.is_current_already_best) {
      box.innerHTML = `
        ${Icons.svg("check", { size: 16 })} This is already the best option on this route!
      `;
    } else {
      box.innerHTML = `
        ${Icons.svg("sparkle", { size: 16 })} Container <strong>${data.best_container_id}</strong> may be a better choice:<br/>
        Savings: \u20B9${data.savings_per_cbm}/CBM &middot; Faster by ${data.faster_by_days} day(s)
        <br/><a href="container-detail.html?id=${data.best_container_id}">
          View it ${Icons.svg("arrowRight", { size: 14 })}
        </a>
      `;
    }
  } catch (err) {
    box.innerHTML = `${Icons.svg("bell", { size: 16 })} Could not load AI recommendation: ${err.message}`;
  }
}

function goToCheckout() {
  if (!AuthState.requireAuth(["trader"])) return;

  const volume = parseFloat(document.getElementById("volumeInput").value) || 0;
  if (volume <= 0 || volume > currentContainer.available_space_cbm) {
    showToast("Please enter a valid volume within available space.", "danger");
    return;
  }

  sessionStorage.setItem("cv_booking_container_id", currentContainer.id);
  sessionStorage.setItem("cv_booking_volume", volume);
  window.location.href = "booking-checkout.html";
}