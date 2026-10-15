const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  renderParticles();
  renderHeader("marketplace.html");
  renderFooter();

  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    runSearch();
  });
  document.getElementById("sortSelect").addEventListener("change", runSearch);

  runSearch();
});

async function runSearch() {
  const grid = document.getElementById("resultsGrid");
  grid.innerHTML = `<div class="loading-state">Searching marketplace...</div>`;

  const params = new URLSearchParams();
  const origin = document.getElementById("origin").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const mode = document.getElementById("mode").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const sortBy = document.getElementById("sortSelect").value;

  if (origin) params.append("origin", origin);
  if (destination) params.append("destination", destination);
  if (mode) params.append("mode", mode);
  if (maxPrice) params.append("max_price", maxPrice);
  params.append("sort_by", sortBy);

  try {
    const res = await fetch(`${API_BASE}/marketplace/search?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Search failed");

    document.getElementById("resultsCount").textContent = `${data.length} result(s) found`;

    if (data.length === 0) {
      grid.innerHTML = `<div class="empty-state">No cargo space matches your search. Try widening your filters.</div>`;
      return;
    }

    grid.innerHTML = data
      .map(
        (c) => `
      <div class="glass-card result-card fade-up" onclick="goToDetail('${c.container_id}')">
        <div class="mode-badge">${c.mode}</div>
        <div class="result-route">${c.route}</div>
        <div class="result-provider">by ${c.provider_name} · <span class="trust-stars">${"★".repeat(Math.round(c.trust_score / 2))}</span></div>
        <div class="result-row"><span class="label">Departure</span><span class="val">${new Date(c.departure_date).toLocaleDateString()}</span></div>
        <div class="result-row"><span class="label">Available Space</span><span class="val">${c.available_space_cbm} CBM</span></div>
        <div class="result-row"><span class="label">Price</span><span class="val">\u20B9${c.price_per_cbm.toLocaleString()}/CBM</span></div>
        <div class="result-row"><span class="label">Transit Time</span><span class="val">${c.transit_days} days</span></div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
}

function goToDetail(containerId) {
  sessionStorage.setItem("cv_selected_container", containerId);
  window.location.href = `container-detail.html?id=${containerId}`;
}
