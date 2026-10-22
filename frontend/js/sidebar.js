// App-shell sidebar — used on dashboard, marketplace, bookings, etc.
const SIDEBAR_LINKS = [
  { href: "dashboard.html", label: "Dashboard" },
  { href: "marketplace.html", label: "Marketplace" },
  { href: "my-containers.html", label: "My Containers" },
  { href: "tracking.html", label: "Tracking" },
  { href: "analytics.html", label: "Analytics" },
  { href: "ai-tools.html", label: "AI Tools" },
  { href: "notifications.html", label: "Notifications" },
  { href: "chat.html", label: "Chat" },
  { href: "profile.html", label: "Profile" },
  { href: "settings.html", label: "Settings" },
];

function renderSidebar(targetId = "sidebar-root") {
  if (!AuthState.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const current = window.location.pathname.split("/").pop();

  const links = SIDEBAR_LINKS.map(
    (link) => `
      <a href="${link.href}" class="sidebar-link ${current === link.href ? "active" : ""}">
        ${link.label}
      </a>`
  ).join("");

  document.getElementById(targetId).innerHTML = `
    <aside class="sidebar">
      <a href="dashboard.html" class="logo">Cargo<span>Verse</span></a>
      <nav class="sidebar-nav">${links}</nav>
      <div class="sidebar-logout">
        <button id="cv-sidebar-logout" class="sidebar-link" style="width:100%; text-align:left; background:none; border:none; cursor:pointer;">
          Logout
        </button>
      </div>
    </aside>
  `;

  document
    .getElementById("cv-sidebar-logout")
    .addEventListener("click", () => openLogoutModal());
}

document.addEventListener("DOMContentLoaded", () => renderSidebar());