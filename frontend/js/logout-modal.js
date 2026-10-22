// Shared logout modal — relies on a <div id="logout-modal-root"></div> on each page
function openLogoutModal() {
  let modal = document.getElementById("logout-modal-root");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "logout-modal-root";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-overlay open">
      <div class="modal-box">
        <h3>Log out of CargoVerse?</h3>
        <p style="margin-top:8px;">You'll need to sign in again to access your dashboard.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="cancel-logout">Cancel</button>
          <button class="btn btn-danger" id="confirm-logout">Logout</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("cancel-logout").addEventListener("click", () => {
    modal.innerHTML = "";
  });
  document.getElementById("confirm-logout").addEventListener("click", () => {
    AuthState.logout();
  });
}