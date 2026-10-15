const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["provider"])) return;

  renderParticles();
  renderHeader("provider-onboarding.html");
  renderFooter();

  checkExistingProfile();

  document.getElementById("onboardForm").addEventListener("submit", submitProfile);
});

async function checkExistingProfile() {
  try {
    const res = await fetch(`${API_BASE}/providers/me`, {
      headers: { Authorization: `Bearer ${AuthState.getToken()}` },
    });
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
  errorBox.style.display = "none";

  const payload = {
    company_name: document.getElementById("companyName").value.trim(),
    gst_number: document.getElementById("gstNumber").value.trim(),
    pan_number: document.getElementById("panNumber").value.trim(),
    fleet_size: parseInt(document.getElementById("fleetSize").value, 10),
    transport_mode: document.getElementById("transportMode").value,
  };

  try {
    const res = await fetch(`${API_BASE}/providers/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AuthState.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Submission failed");

    showPendingView(data);
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = "block";
  }
}

function showPendingView(provider) {
  document.getElementById("onboardForm").style.display = "none";
  const view = document.getElementById("pendingView");
  view.style.display = "block";

  document.getElementById("pendingCompanyName").textContent = provider.company_name;

  const badge = document.getElementById("statusBadge");
  badge.textContent = provider.status.replace("_", " ").toUpperCase();
  badge.className = `pending-status-badge ${provider.status}`;

  if (provider.status === "approved") {
    document.getElementById("pendingMessage").textContent =
      "You're approved! You can now list cargo space.";
    document.getElementById("goToDashboardBtn").style.display = "inline-block";
  } else if (provider.status === "rejected") {
    document.getElementById("pendingMessage").textContent =
      "Unfortunately your application was not approved. Contact support for details.";
  } else {
    document.getElementById("pendingMessage").textContent =
      "Your profile is under review. We'll notify you once an admin completes the inspection.";
  }
}