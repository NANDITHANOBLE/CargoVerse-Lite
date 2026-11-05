// FILE: frontend/js/sidebar.js
// App-shell sidebar — used on dashboard, marketplace, bookings, etc.
const SIDEBAR_LINKS = [
  { href: "dashboard.html", label: "Dashboard", icon: "chart" },
  { href: "marketplace.html", label: "Marketplace", icon: "search" },
  { href: "my-containers.html", label: "My Containers", icon: "package", roles: ["provider"] },
  { href: "provider-onboarding.html", label: "Provider Profile", icon: "truck", roles: ["provider"] },
  { href: "providers-admin.html", label: "Provider Approvals", icon: "shield", roles: ["admin"] },
  { href: "tracking.html", label: "Tracking", icon: "mapPin" },
  { href: "analytics.html", label: "Analytics", icon: "chart" },
  { href: "ai-tools.html", label: "AI Tools", icon: "sparkle", roles: ["trader"] },
  { href: "notifications.html", label: "Notifications", icon: "bell" },
  { href: "chat.html", label: "Chat", icon: "chat" },
  { href: "profile.html", label: "Profile", icon: "user" },
  { href: "settings.html", label: "Settings", icon: "lock" },
];

function renderSidebar(targetId = "sidebar-root") {
  if (!AuthState.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const current = window.location.pathname.split("/").pop();
  const role = AuthState.getRole();

  const visibleLinks = SIDEBAR_LINKS.filter(
    (link) => !link.roles || link.roles.includes(role)
  );

  const links = visibleLinks
    .map(
      (link) => `
      <a href="${link.href}" class="sidebar-link ${current === link.href ? "active" : ""}">
        ${Icons.svg(link.icon, { size: 18 })}
        <span>${link.label}</span>
      </a>`
    )
    .join("");

  document.getElementById(targetId).innerHTML = `
    <aside class="sidebar">
      <a href="dashboard.html" class="logo">
        ${Icons.svg("logo", { size: 22, className: "logo-float" })}
        Cargo<span>Verse</span>
      </a>

      <nav class="sidebar-nav">${links}</nav>

      <div class="sidebar-logout">
        <button id="cv-sidebar-logout" class="sidebar-link sidebar-logout-btn">
          ${Icons.svg("arrowRight", { size: 18, className: "icon-flip" })}
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <button id="cv-sidebar-toggle" class="sidebar-mobile-toggle" aria-label="Toggle sidebar">
      ${Icons.svg("menu", { size: 22 })}
    </button>
  `;

  document
    .getElementById("cv-sidebar-logout")
    .addEventListener("click", () => openLogoutModal());

  const toggleBtn = document.getElementById("cv-sidebar-toggle");
  const sidebarEl = document.querySelector(".sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebarEl.classList.toggle("open");
  });

  // Close mobile sidebar when a link is clicked
  document.querySelectorAll(".sidebar-link:not(.sidebar-logout-btn)").forEach((link) => {
    link.addEventListener("click", () => sidebarEl.classList.remove("open"));
  });
}

document.addEventListener("DOMContentLoaded", () => renderSidebar());