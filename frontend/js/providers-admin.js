// FILE: frontend/js/providers-admin.js
const API_BASE = "http://127.0.0.1:8000";
const APPROVAL_THRESHOLD = 70;
let activeTab = "pending";
let scoringProviderId = null;

const SCORE_WEIGHTS = {
  docScore: 0.3,
  infraScore: 0.3,
  complianceScore: 0.2,
  fleetScore: 0.2,
};

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["admin"])) return;

  renderSidebar();
  injectIcons();

  document.querySelectorAll(".provider-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  ["docScore", "infraScore", "complianceScore", "fleetScore"].forEach((id) => {
    document.getElementById(id).addEventListener("input", (e) => {
      document.getElementById(`${id}Val`).textContent = e.target.value;
      updateScoreTotalPreview();
    });
  });

  document.getElementById("submitScoreBtn").addEventListener("click", submitScore);
  document.getElementById("closeModalBtn").addEventListener("click", closeModal);

  loadProviders();
});

function injectIcons() {
  document.getElementById("scoreModalIcon").innerHTML = Icons.svg("shield", { size: 20 });
  document.getElementById("docScoreIcon").innerHTML = Icons.svg("package", { size: 14 });
  document.getElementById("infraScoreIcon").innerHTML = Icons.svg("truck", { size: 14 });
  document.getElementById("complianceScoreIcon").innerHTML = Icons.svg("shield", { size: 14 });
  document.getElementById("fleetScoreIcon").innerHTML = Icons.svg("truck", { size: 14 });

  document.getElementById("submitScoreBtn").innerHTML = `${Icons.svg("check", { size: 15 })} Submit Score`;

  updateScoreTotalPreview();
}

function updateScoreTotalPreview() {
  const doc = parseFloat(document.getElementById("docScore").value);
  const infra = parseFloat(document.getElementById("infraScore").value);
  const compliance = parseFloat(document.getElementById("complianceScore").value);
  const fleet = parseFloat(document.getElementById("fleetScore").value);

  const total =
    doc * SCORE_WEIGHTS.docScore +
    infra * SCORE_WEIGHTS.infraScore +
    compliance * SCORE_WEIGHTS.complianceScore +
    fleet * SCORE_WEIGHTS.fleetScore;

  const roundedTotal = Math.round(total);
  const valueEl = document.getElementById("scoreTotalValue");
  const hintEl = document.getElementById("scoreTotalHint");

  valueEl.textContent = `${roundedTotal} / 100`;
  valueEl.className = `total-value ${roundedTotal >= APPROVAL_THRESHOLD ? "pass" : "fail"}`;

  hintEl.innerHTML =
    roundedTotal >= APPROVAL_THRESHOLD
      ? `${Icons.svg("check", { size: 12 })} Meets approval threshold (${APPROVAL_THRESHOLD}+)`
      : `${Icons.svg("bell", { size: 12 })} Below approval threshold (${APPROVAL_THRESHOLD}+)`;
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".provider-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  loadProviders();
}

const STATUS_ICONS = {
  pending: "lock",
  inspection_scheduled: "search",
  approved: "check",
  rejected: "bell",
};

async function loadProviders() {
  const list = document.getElementById("providersList");
  list.innerHTML = Array.from({ length: 3 })
    .map(() => `<div class="card skeleton skeleton-provider-row"></div>`)
    .join("");

  const endpoint = activeTab === "pending" ? "/providers/pending" : "/providers/";

  try {
    const res = await AuthState.authFetch(`${API_BASE}${endpoint}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load providers");

    const filtered = activeTab === "all" ? data : data.filter((p) => p.status === activeTab);
    updateTabCounts(data);

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="providers-empty">
          <div class="icon-wrap">${Icons.svg("shield", { size: 26 })}</div>
          <p>No providers in this category.</p>
        </div>`;
      return;
    }

    list.innerHTML = filtered.map((p) => renderProviderRow(p)).join("");

    document.querySelectorAll("[data-action='schedule']").forEach((btn) => {
      btn.addEventListener("click", () => scheduleInspection(btn.dataset.providerId));
    });
    document.querySelectorAll("[data-action='score']").forEach((btn) => {
      btn.addEventListener("click", () => openScoreModal(btn.dataset.providerId));
    });
  } catch (err) {
    list.innerHTML = `
      <div class="providers-empty">
        <div class="icon-wrap" style="background:rgba(239,68,68,0.08); color:var(--danger);">
          ${Icons.svg("bell", { size: 26 })}
        </div>
        <p>Error: ${err.message}</p>
      </div>`;
  }
}

function updateTabCounts(allProviders) {
  const counts = {
    pending: allProviders.filter((p) => p.status === "pending").length,
    inspection_scheduled: allProviders.filter((p) => p.status === "inspection_scheduled").length,
    approved: allProviders.filter((p) => p.status === "approved").length,
    rejected: allProviders.filter((p) => p.status === "rejected").length,
    all: allProviders.length,
  };

  Object.entries(counts).forEach(([key, count]) => {
    const tag = document.getElementById(`count-${key}`);
    if (tag) tag.textContent = count;
  });
}

function renderProviderRow(p) {
  return `
    <div class="provider-row">
      <div>
        <div class="pname">${Icons.svg("user", { size: 14 })} ${p.company_name}</div>
        <div class="pmeta">${Icons.svg("shield", { size: 11 })} GST: ${p.gst_number} &middot; Mode: ${p.transport_mode}</div>
      </div>
      <div>
        <span class="status-pill ${p.status}">
          ${Icons.svg(STATUS_ICONS[p.status] || "lock", { size: 11 })} ${p.status.replace("_", " ")}
        </span>
      </div>
      <div class="score-cell">
        ${Icons.svg("chart", { size: 14 })} ${p.final_score || 0}/100
      </div>
      <div>
        ${
          p.status === "pending"
            ? `<button class="btn btn-ghost row-action-btn" data-action="schedule" data-provider-id="${p.id}">
                 ${Icons.svg("search", { size: 13 })} Schedule Inspection
               </button>`
            : p.status === "inspection_scheduled"
            ? `<button class="btn btn-primary row-action-btn" data-action="score" data-provider-id="${p.id}">
                 ${Icons.svg("shield", { size: 13 })} Submit Score
               </button>`
            : `<span style="color:var(--text-muted); font-size:0.8rem;">\u2014</span>`
        }
      </div>
    </div>
  `;
}

async function scheduleInspection(providerId) {
  try {
    const res = await AuthState.authFetch(`${API_BASE}/providers/${providerId}/schedule-inspection`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to schedule inspection");

    showToast("Inspection scheduled", "success");
    loadProviders();
  } catch (err) {
    showToast(err.message, "danger");
  }
}

function openScoreModal(providerId) {
  scoringProviderId = providerId;

  ["docScore", "infraScore", "complianceScore", "fleetScore"].forEach((id) => {
    document.getElementById(id).value = 70;
    document.getElementById(`${id}Val`).textContent = 70;
  });
  updateScoreTotalPreview();

  document.getElementById("scoreModalOverlay").classList.add("show");
}

function closeModal() {
  document.getElementById("scoreModalOverlay").classList.remove("show");
}

async function submitScore() {
  const payload = {
    doc_score: parseFloat(document.getElementById("docScore").value),
    infra_score: parseFloat(document.getElementById("infraScore").value),
    compliance_score: parseFloat(document.getElementById("complianceScore").value),
    fleet_score: parseFloat(document.getElementById("fleetScore").value),
  };

  const btn = document.getElementById("submitScoreBtn");
  setLoading(btn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/providers/${scoringProviderId}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Scoring failed");

    closeModal();
    showToast(`Provider ${data.status.toUpperCase()} with final score ${data.final_score}`, "success");
    loadProviders();
  } catch (err) {
    showToast(err.message, "danger");
  } finally {
    setLoading(btn, false);
  }
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}