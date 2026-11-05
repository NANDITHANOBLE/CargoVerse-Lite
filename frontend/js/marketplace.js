// FILE: frontend/js/marketplace.js
const API_BASE = "http://127.0.0.1:8000";

const MODE_ICONS = {
  road: "truck",
  rail: "train",
  sea: "ship",
  air: "plane",
};

let activeMode = "";

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  injectIcons();
  bindEvents();
  runSearch();
});

function injectIcons() {
  document.getElementById("originIcon").innerHTML = Icons.svg("mapPin", { size: 16 });
  document.getElementById("destinationIcon").innerHTML = Icons.svg("mapPin", { size: 16 });
  document.getElementById("maxPriceIcon").innerHTML = Icons.svg("chart", { size: 16 });

  const modeRow = document.getElementById("modeFilterRow");
  modeRow.innerHTML = `
    <div class="mode-pill active" data-mode="">${Icons.svg("sparkle", { size: 14 })} All Modes</div>
    <div class="mode-pill" data-mode="road">${Icons.svg("truck", { size: 14 })} Road</div>
    <div class="mode-pill" data-mode="rail">${Icons.svg("train", { size: 14 })} Rail</div>
    <div class="mode-pill" data-mode="sea">${Icons.svg("ship", { size: 14 })} Sea</div>
    <div class="mode-pill" data-mode="air">${Icons.svg("plane", { size: 14 })} Air</div>
  `;
}

function bindEvents() {
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    runSearch();
  });

  document.getElementById("sortSelect").addEventListener("change", runSearch);

  document.querySelectorAll(".mode-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".mode-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeMode = pill.dataset.mode;
      runSearch();
    });
  });
}

async function runSearch() {
  const grid = document.getElementById("resultsGrid");
  const countLabel = document.getElementById("resultsCount");

  countLabel.innerHTML = `${Icons.svg("search", { size: 14 })} Searching...`;
  grid.innerHTML = Array.from({ length: 6 })
    .map(() => `<div class="card skeleton skeleton-result-card"></div>`)
    .join("");

  const params = new URLSearchParams();
  const origin = document.getElementById("origin").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const maxPrice = document.getElementById("maxPrice").value;
  const sortBy = document.getElementById("sortSelect").value;

  if (origin) params.append("origin", origin);
  if (destination) params.append("destination", destination);
  if (activeMode) params.append("mode", activeMode);
  if (maxPrice) params.append("max_price", maxPrice);
  params.append("sort_by", sortBy);

  try {
    const res = await fetch(`${API_BASE}/marketplace/search?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Search failed");

    countLabel.innerHTML = `${Icons.svg("check", { size: 14 })} ${data.length} result(s) found`;

    if (data.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="icon-wrap">${Icons.svg("search", { size: 28 })}</div>
          <h3>No cargo space found</h3>
          <p>Try widening your filters or searching a different route.</p>
        </div>`;
      return;
    }

    grid.innerHTML = data.map((c) => renderResultCard(c)).join("");

    grid.querySelectorAll(".result-card").forEach((card) => {
      card.addEventListener("click", () => goToDetail(card.dataset.containerId));
    });
  } catch (err) {
    countLabel.textContent = "";
    grid.innerHTML = `
      <div class="error-state">
        <div class="icon-wrap">${Icons.svg("bell", { size: 28 })}</div>
        <h3>Something went wrong</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

function renderResultCard(c) {
  const modeIcon = MODE_ICONS[c.mode] || "truck";
  const starCount = Math.round(c.trust_score / 2);
  const stars = Icons.svg("star", { size: 12 }).repeat(Math.max(starCount, 0));

  return `
    <div class="card result-card fade-up" data-container-id="${c.container_id}">
      <div class="mode-badge">${Icons.svg(modeIcon, { size: 12 })} ${c.mode}</div>

      <div class="result-route">
        ${Icons.svg("mapPin", { size: 16 })}
        ${c.route}
      </div>

      <div class="result-provider">
        by ${c.provider_name} &middot;
        <span class="trust-stars">${stars}</span>
      </div>

      <div class="result-row">
        <span class="label">${Icons.svg("truck", { size: 14 })} Departure</span>
        <span class="val">${new Date(c.departure_date).toLocaleDateString()}</span>
      </div>
      <div class="result-row">
        <span class="label">${Icons.svg("package", { size: 14 })} Available Space</span>
        <span class="val">${c.available_space_cbm} CBM</span>
      </div>
      <div class="result-row">
        <span class="label">${Icons.svg("chart", { size: 14 })} Price</span>
        <span class="val">\u20B9${c.price_per_cbm.toLocaleString()}/CBM</span>
      </div>
      <div class="result-row">
        <span class="label">${Icons.svg("mapPin", { size: 14 })} Transit Time</span>
        <span class="val">${c.transit_days} days</span>
      </div>

      <div class="result-card-footer">
        <span style="font-size:0.78rem; color:var(--text-muted);">Tap to view details</span>
        <span class="btn btn-outline">${Icons.svg("arrowRight", { size: 14 })}</span>
      </div>
    </div>
  `;
}

function goToDetail(containerId) {
  sessionStorage.setItem("cv_selected_container", containerId);
  window.location.href = `container-detail.html?id=${containerId}`;
}