const API_BASE = "http://127.0.0.1:8000";
let activeTab = "pending";
let scoringProviderId = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["admin"])) return;

  renderParticles();
  renderHeader("providers-admin.html");
  renderFooter();

  document.querySelectorAll(".provider-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  ["docScore", "infraScore", "complianceScore", "fleetScore"].forEach((id) => {
    document.getElementById(id).addEventListener("input", (e) => {
      document.getElementById(`${id}Val`).textContent = e.target.value;
    });
  });

  document.getElementById("submitScoreBtn").addEventListener("click", submitScore);
  document.getElementById("closeModalBtn").addEventListener("click", closeModal);

  loadProviders();
});

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".provider-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  loadProviders();
}

async function loadProviders() {
  const list = document.getElementById("providersList");
  list.innerHTML = `<div style="color:var(--text-dim); padding:20px 0;">Loading...</div>`;

  const endpoint = activeTab === "pending" ? "/providers/pending" : "/providers/";

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${AuthState.getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load providers");

    const filtered = activeTab === "all" ? data : data.filter((p) => p.status === activeTab);

    if (filtered.length === 0) {
      list.innerHTML = `<div style="color:var(--text-dim); padding:20px 0;">No providers in this category.</div>`;
      return;
    }

    list.innerHTML = filtered
      .map(
        (p) => `
      <div class="provider-row">
        <div>
          <div class="pname">${p.company_name}</div>
          <div class="pmeta">GST: ${p.gst_number} &middot; Mode: ${p.transport_mode}</div>
        </div>
        <div><span class="status-pill ${p.status}">${p.status.replace("_", " ")}</span></div>
        <div>Score: ${p.final_score || 0}/100</div>
        <div>
          ${
            p.status === "pending"
              ? `<button class="btn btn-ghost" onclick="scheduleInspection('${p.id}')">Schedule Inspection</button>`
              : p.status === "inspection_scheduled"
              ? `<button class="btn btn-primary" onclick="openScoreModal('${p.id}')">Submit Score</button>`
              : "-"
          }
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    list.innerHTML = `<div style="color:#ff8080; padding:20px 0;">Error: ${err.message}</div>`;
  }
}

async function scheduleInspection(providerId) {
  try {
    const res = await fetch(`${API_BASE}/providers/${providerId}/schedule-inspection`, {
      method: "POST",
      headers: { Authorization: `Bearer ${AuthState.getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to schedule inspection");
    loadProviders();
  } catch (err) {
    alert(err.message);
  }
}

function openScoreModal(providerId) {
  scoringProviderId = providerId;
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

  try {
    const res = await fetch(`${API_BASE}/providers/${scoringProviderId}/score`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AuthState.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Scoring failed");

    closeModal();
    alert(`Provider ${data.status.toUpperCase()} with final score ${data.final_score}`);
    loadProviders();
  } catch (err) {
    alert(err.message);
  }
}