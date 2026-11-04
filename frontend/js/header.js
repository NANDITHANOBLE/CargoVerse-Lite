// FILE: frontend/js/header.js
const NAV_LINKS = [
  { href: "index.html", label: "Home" },
  { href: "marketplace.html", label: "Marketplace" },
  { href: "ai-tools.html", label: "AI Tools" },
  { href: "tracking.html", label: "Tracking" },
  { href: "index.html#about", label: "About" },
  { href: "index.html#contact", label: "Contact" },
];

function renderHeader(targetId = "header-root") {
  const loggedIn = AuthState.isLoggedIn();
  const current = window.location.pathname.split("/").pop() || "index.html";

  const navHtml = NAV_LINKS.map(
    (l) =>
      `<a href="${l.href}" class="navbar-link ${
        current === l.href.split("#")[0] ? "active" : ""
      }">${l.label}</a>`
  ).join("");

  const authSection = loggedIn
    ? `<a href="dashboard.html" class="btn btn-ghost btn-icon">${Icons.svg("user", { size: 18 })}<span>Dashboard</span></a>
       <button id="cv-logout-btn" class="btn btn-outline">Logout</button>`
    : `<a href="login.html" class="btn btn-ghost">Login</a>
       <a href="register.html" class="btn btn-primary btn-icon">Get Started ${Icons.svg("arrowRight", { size: 16 })}</a>`;

  document.getElementById(targetId).innerHTML = `
    <nav class="navbar">
      <a href="index.html" class="logo">
        <span class="logo-icon">${Icons.svg("logo", { size: 24, className: "logo-float" })}</span>
        Cargo<span>Verse</span>
      </a>

      <button id="cv-nav-toggle" class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
        ${Icons.svg("menu", { size: 24, className: "icon-menu" })}
        ${Icons.svg("close", { size: 24, className: "icon-close" })}
      </button>

      <div class="navbar-links" id="cv-navbar-links">${navHtml}</div>
      <div class="navbar-actions">${authSection}</div>
    </nav>
  `;

  const logoutBtn = document.getElementById("cv-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => openLogoutModal());
  }

  const toggle = document.getElementById("cv-nav-toggle");
  const links = document.getElementById("cv-navbar-links");

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
    })
  );
}

window.addEventListener("cv-auth-changed", () => renderHeader());
document.addEventListener("DOMContentLoaded", () => renderHeader());