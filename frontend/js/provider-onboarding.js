// FILE: frontend/js/provider-onboarding.js
const API_BASE = "http://127.0.0.1:8000";

const STATUS_ORDER = ["pending", "inspection_scheduled", "approved"];

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["provider"])) return;

  renderSidebar();
  injectIcons();
  checkExistingProfile();

  document.getElementById("onboardForm").addEventListener("submit", submitProfile);
});

function injectIcons() {
  document.getElementById("onboardHeadIcon").innerHTML = Icons.svg("truck", { size: 24 });
  document.getElementById("companyNameIcon").innerHTML = Icons.svg("user", { size: 16 });
  document.getElementById("gstIcon").innerHTML = Icons.svg("shield", { size: 16 });
  document.getElementById("panIcon").innerHTML = Icons.svg("shield", { size: 16 });
  document.getElementById("fleetSizeIcon").innerHTML = Icons.svg("truck", { size: 16 });

  document.getElementById("submitProfileBtn").innerHTML = `
    Submit for Review ${Icons.svg("arrowRight", { size: 16 })}
  `;
}

async function checkExistingProfile() {
  try {
    const res = await AuthState.authFetch(`${API_BASE}/providers/me`);
    if (res.ok) {
      const data = await res.json();
      showPendingView(data);
    }
  } catch (err) {
    console.warn("No existing profile yet");
  }
}

async function submitProfile(e) {
  e.preventDefault();
  const errorBox = document.getElementById("authError");
  errorBox.classList.remove("show");
  const submitBtn = document.getElementById("submitProfileBtn");

  const payload = {
    company_name: document.getElementById("companyName").value.trim(),
    gst_number: document.getElementById("gstNumber").value.trim(),
    pan_number: document.getElementById("panNumber").value.trim(),
    fleet_size: parseInt(document.getElementById("fleetSize").value, 10),
    transport_mode: document.getElementById("transportMode").value,
  };

  setLoading(submitBtn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/providers/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Submission failed");

    showPendingView(data);
    showToast("Profile submitted for review", "success");
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add("show");
  } finally {
    setLoading(submitBtn, false);
  }
}

function showPendingView(provider) {
  document.getElementById("onboardForm").style.display = "none";
  const view = document.getElementById("pendingView");
  view.style.display = "block";

  document.getElementById("pendingIconWrap").innerHTML = Icons.svg("truck", { size: 32 });
  document.getElementById("pendingCompanyName").textContent = provider.company_name;

  const badge = document.getElementById("statusBadge");
  const statusIcons = {
    pending: "lock",
    inspection_scheduled: "search",
    approved: "check",
    rejected: "bell",
  };
  badge.innerHTML = `
    ${Icons.svg(statusIcons[provider.status] || "lock", { size: 14 })}
    ${provider.status.replace("_", " ").toUpperCase()}
  `;
  badge.className = `pending-status-badge ${provider.status}`;

  renderTimeline(provider.status);

  const messageEl = document.getElementById("pendingMessage");
  const dashboardBtn = document.getElementById("goToDashboardBtn");

  if (provider.status === "approved") {
    messageEl.textContent = "You're approved! You can now list cargo space.";
    dashboardBtn.style.display = "inline-flex";
    dashboardBtn.innerHTML = `My Containers ${Icons.svg("arrowRight", { size: 14 })}`;
    dashboardBtn.href = "my-containers.html";
  } else if (provider.status === "rejected") {
    messageEl.textContent = "Unfortunately your application was not approved. Contact support for details.";
    dashboardBtn.style.display = "none";
  } else {
    messageEl.textContent = "Your profile is under review. We'll notify you once an admin completes the inspection.";
    dashboardBtn.style.display = "none";
  }
}

function renderTimeline(status) {
  const timeline = document.getElementById("statusTimeline");

  if (status === "rejected") {
    timeline.innerHTML = `
      <div class="timeline-step rejected">
        <div class="timeline-circle">${Icons.svg("bell", { size: 16 })}</div>
        <div class="timeline-label">Rejected</div>
      </div>`;
    return;
  }

  const currentIndex = STATUS_ORDER.indexOf(status);
  const labels = ["Submitted", "Inspection", "Approved"];

  timeline.innerHTML = STATUS_ORDER.map((step, idx) => {
    let stateClass = "";
    let iconName = "lock";

    if (idx < currentIndex) {
      stateClass = "done";
      iconName = "check";
    } else if (idx === currentIndex) {
      stateClass = "current";
      iconName = idx === 0 ? "lock" : idx === 1 ? "search" : "check";
    }

    return `
      <div class="timeline-step ${stateClass}">
        <div class="timeline-circle">${Icons.svg(iconName, { size: 16 })}</div>
        <div class="timeline-label">${labels[idx]}</div>
      </div>`;
  }).join("");
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}