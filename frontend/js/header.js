// Public top navbar — used on landing, pricing, about-style pages
function renderHeader(targetId = "header-root") {
  const user = AuthState.getUser();
  const loggedIn = AuthState.isLoggedIn();

  const authSection = loggedIn
    ? `<a href="dashboard.html" class="btn btn-ghost">Dashboard</a>
       <button id="cv-logout-btn" class="btn btn-outline">Logout</button>`
    : `<a href="login.html" class="btn btn-ghost">Login</a>
       <a href="register.html" class="btn btn-primary">Get Started</a>`;

  document.getElementById(targetId).innerHTML = `
    <nav class="navbar">
      <a href="index.html" class="logo">Cargo<span>Verse</span></a>
      <div class="navbar-links">
        <a href="marketplace.html">Marketplace</a>
        <a href="ai-tools.html">AI Tools</a>
        <a href="index.html#pricing">Pricing</a>
        <a href="tracking.html">Tracking</a>
        <a href="index.html#about">About</a>
        <a href="index.html#contact">Contact</a>
      </div>
      <div class="navbar-actions">${authSection}</div>
    </nav>
  `;

  const logoutBtn = document.getElementById("cv-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => openLogoutModal());
  }
}

window.addEventListener("cv-auth-changed", () => renderHeader());
document.addEventListener("DOMContentLoaded", () => renderHeader());