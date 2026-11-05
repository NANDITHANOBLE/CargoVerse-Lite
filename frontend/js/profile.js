// FILE: frontend/js/profile.js
const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  injectIcons();
  loadProfile();

  document.getElementById("profileForm").addEventListener("submit", saveProfile);
  document.getElementById("cancelEditBtn").addEventListener("click", resetForm);
});

function injectIcons() {
  document.getElementById("avatarEditIcon").innerHTML = Icons.svg("user", { size: 14 });
  document.getElementById("metaJoinedIcon").innerHTML = Icons.svg("mail", { size: 14 });
  document.getElementById("metaRoleIcon").innerHTML = Icons.svg("shield", { size: 14 });
  document.getElementById("sectionDetailsIcon").innerHTML = Icons.svg("user", { size: 18 });
  document.getElementById("sectionProviderIcon").innerHTML = Icons.svg("truck", { size: 18 });

  document.getElementById("fullNameIcon").innerHTML = Icons.svg("user", { size: 16 });
  document.getElementById("emailFieldIcon").innerHTML = Icons.svg("mail", { size: 16 });

  document.getElementById("saveProfileBtn").innerHTML = `${Icons.svg("check", { size: 15 })} Save Changes`;
}

const ROLE_ICONS = { trader: "package", provider: "truck", admin: "shield" };

async function loadProfile() {
  const user = AuthState.getUser();
  if (!user) return;

  const initials = getInitials(user.full_name || "U");
  document.getElementById("avatarInitials").textContent = initials;
  document.getElementById("profileSummaryName").textContent = user.full_name || "Unknown User";
  document.getElementById("profileSummaryEmail").textContent = user.email || "-";

  const roleBadge = document.getElementById("profileRoleBadge");
  roleBadge.innerHTML = `${Icons.svg(ROLE_ICONS[user.role] || "user", { size: 13 })} ${user.role}`;

  document.getElementById("metaJoined").textContent = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "N/A";
  document.getElementById("metaRole").textContent = user.role;

  document.getElementById("fullNameInput").value = user.full_name || "";
  document.getElementById("emailInput").value = user.email || "";

  if (user.role === "provider") {
    loadProviderInfo();
  }
}

async function loadProviderInfo() {
  const block = document.getElementById("providerInfoBlock");

  try {
    const res = await AuthState.authFetch(`${API_BASE}/providers/me`);
    if (!res.ok) {
      block.style.display = "none";
      return;
    }
    const data = await res.json();

    block.style.display = "block";
    document.getElementById("providerInfoGrid").innerHTML = `
      <div class="provider-info-stat">
        <div class="label">Company Name</div>
        <div class="value">${data.company_name}</div>
      </div>
      <div class="provider-info-stat">
        <div class="label">GST Number</div>
        <div class="value">${data.gst_number}</div>
      </div>
      <div class="provider-info-stat">
        <div class="label">Fleet Size</div>
        <div class="value">${data.fleet_size} vehicles</div>
      </div>
      <div class="provider-info-stat">
        <div class="label">Status</div>
        <div class="value">${data.status.replace("_", " ")}</div>
      </div>
    `;
  } catch (err) {
    block.style.display = "none";
  }
}

async function saveProfile(e) {
  e.preventDefault();
  const btn = document.getElementById("saveProfileBtn");
  const fullName = document.getElementById("fullNameInput").value.trim();

  if (!fullName) {
    showToast("Full name cannot be empty", "danger");
    return;
  }

  setLoading(btn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/auth/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not update profile");

    const currentUser = AuthState.getUser();
    const updatedUser = { ...currentUser, full_name: fullName };
    localStorage.setItem("cv_user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("cv-auth-changed"));

    showToast("Profile updated successfully", "success");
    loadProfile();
  } catch (err) {
    showToast(err.message, "danger");
  } finally {
    setLoading(btn, false);
  }
}

function resetForm() {
  loadProfile();
  showToast("Changes discarded", "info");
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}