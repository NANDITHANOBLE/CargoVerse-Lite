// FILE: frontend/js/settings.js
const API_BASE = "http://127.0.0.1:8000";
const NOTIF_PREFS_KEY = "cv_notification_prefs";

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  injectIcons();
  loadNotificationPrefs();

  document.getElementById("changePasswordForm").addEventListener("submit", changePassword);
  document.getElementById("deactivateAccountBtn").addEventListener("click", openDeactivateModal);

  document.querySelectorAll(".notif-toggle").forEach((toggle) => {
    toggle.addEventListener("change", saveNotificationPrefs);
  });
});

function injectIcons() {
  document.getElementById("sectionNotifIcon").innerHTML = Icons.svg("bell", { size: 20 });
  document.getElementById("sectionPasswordIcon").innerHTML = Icons.svg("lock", { size: 20 });
  document.getElementById("sectionDangerIcon").innerHTML = Icons.svg("shield", { size: 20 });

  document.getElementById("currentPasswordIcon").innerHTML = Icons.svg("lock", { size: 16 });
  document.getElementById("newPasswordIcon").innerHTML = Icons.svg("lock", { size: 16 });
  document.getElementById("confirmNewPasswordIcon").innerHTML = Icons.svg("lock", { size: 16 });

  document.getElementById("updatePasswordBtn").innerHTML = `${Icons.svg("lock", { size: 15 })} Update Password`;
  document.getElementById("deactivateAccountBtn").innerHTML = `${Icons.svg("bell", { size: 14 })} Deactivate Account`;
}

/* ===== Notification Preferences (stored client-side; wire to backend when endpoint exists) ===== */
function loadNotificationPrefs() {
  const saved = JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) || "{}");

  document.querySelectorAll(".notif-toggle").forEach((toggle) => {
    const key = toggle.dataset.prefKey;
    toggle.checked = saved[key] !== undefined ? saved[key] : true;
  });
}

function saveNotificationPrefs() {
  const prefs = {};
  document.querySelectorAll(".notif-toggle").forEach((toggle) => {
    prefs[toggle.dataset.prefKey] = toggle.checked;
  });

  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
  showToast("Notification preferences saved", "success");
}

/* ===== Change Password ===== */
async function changePassword(e) {
  e.preventDefault();
  const btn = document.getElementById("updatePasswordBtn");
  const errorBox = document.getElementById("passwordError");
  errorBox.classList.remove("show");

  const currentPassword = document.getElementById("currentPasswordInput").value;
  const newPassword = document.getElementById("newPasswordInput").value;
  const confirmNewPassword = document.getElementById("confirmNewPasswordInput").value;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showError("Please fill in all password fields.");
    return;
  }

  if (newPassword.length < 8) {
    showError("New password must be at least 8 characters long.");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showError("New passwords do not match.");
    return;
  }

  setLoading(btn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not update password");

    showToast("Password updated successfully", "success");
    document.getElementById("changePasswordForm").reset();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(btn, false);
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.add("show");
  }
}

/* ===== Danger Zone: Deactivate Account ===== */
function openDeactivateModal() {
  let modal = document.getElementById("deactivate-modal-root");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "deactivate-modal-root";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-overlay open deactivate-modal">
      <div class="modal-box">
        <div class="icon-wrap">${Icons.svg("shield", { size: 22 })}</div>
        <h3>Deactivate your account?</h3>
        <p style="margin-top:8px; font-size:0.85rem;">
          This will disable your access to CargoVerse Lite. You can contact support to reactivate later.
          Type <strong>DEACTIVATE</strong> below to confirm.
        </p>
        <input type="text" id="deactivateConfirmInput" class="deactivate-confirm-input" placeholder="Type DEACTIVATE to confirm" />
        <div class="modal-actions">
          <button class="btn btn-ghost" id="cancelDeactivate">Cancel</button>
          <button class="btn btn-danger" id="confirmDeactivate">Deactivate</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("cancelDeactivate").addEventListener("click", () => {
    modal.innerHTML = "";
  });

  document.getElementById("confirmDeactivate").addEventListener("click", () => {
    const confirmText = document.getElementById("deactivateConfirmInput").value.trim();
    if (confirmText !== "DEACTIVATE") {
      showToast("Please type DEACTIVATE to confirm", "danger");
      return;
    }

    // NOTE: No backend endpoint currently exists for account deactivation.
    // This UI is ready to wire up once a DELETE/POST /auth/deactivate endpoint is available.
    showToast("Account deactivation requires backend support — not yet implemented", "info");
    modal.innerHTML = "";
  });
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}