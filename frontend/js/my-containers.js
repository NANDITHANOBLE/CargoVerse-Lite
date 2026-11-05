// FILE: frontend/js/my-containers.js
const API_BASE = "http://127.0.0.1:8000";
let editingContainerId = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["provider"])) return;

  renderSidebar();
  injectIcons();
  loadContainers();

  document.getElementById("addContainerForm").addEventListener("submit", addContainer);
});

function injectIcons() {
  document.getElementById("sectionAddIcon").innerHTML = Icons.svg("package", { size: 18 });
  document.getElementById("sectionListIcon").innerHTML = Icons.svg("truck", { size: 18 });
  document.getElementById("originIcon").innerHTML = Icons.svg("mapPin", { size: 16 });
  document.getElementById("destinationIcon").innerHTML = Icons.svg("mapPin", { size: 16 });
  document.getElementById("capacityIcon").innerHTML = Icons.svg("truck", { size: 16 });
  document.getElementById("availableSpaceIcon").innerHTML = Icons.svg("package", { size: 16 });
  document.getElementById("priceIcon").innerHTML = Icons.svg("chart", { size: 16 });
  document.getElementById("transitDaysIcon").innerHTML = Icons.svg("mapPin", { size: 16 });

  document.getElementById("addContainerBtn").innerHTML = `
    ${Icons.svg("package", { size: 16 })} Add Container
  `;
}

const MODE_ICONS = { road: "truck", rail: "train", sea: "ship", air: "plane" };

async function loadContainers() {
  const list = document.getElementById("containersList");
  list.innerHTML = Array.from({ length: 3 })
    .map(() => `<div class="card skeleton skeleton-container-row"></div>`)
    .join("");

  try {
    const res = await AuthState.authFetch(`${API_BASE}/containers/mine`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load containers");

    if (data.length === 0) {
      list.innerHTML = `
        <div class="my-containers-empty">
          <div class="icon-wrap">${Icons.svg("package", { size: 26 })}</div>
          <p>No containers listed yet. Add your first one above.</p>
        </div>`;
      return;
    }

    list.innerHTML = data.map((c) => renderContainerRow(c)).join("");

    document.querySelectorAll(".edit-space-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        openEditModal(btn.dataset.containerId, parseFloat(btn.dataset.currentSpace))
      );
    });
  } catch (err) {
    if (err.message.includes("Provider profile not found")) {
      list.innerHTML = `
        <div class="my-containers-empty">
          <div class="icon-wrap">${Icons.svg("shield", { size: 26 })}</div>
          <p>Complete your <a href="provider-onboarding.html">provider profile</a> first.</p>
        </div>`;
    } else {
      list.innerHTML = `
        <div class="my-containers-empty">
          <div class="icon-wrap" style="background:rgba(239,68,68,0.08); color:var(--danger);">
            ${Icons.svg("bell", { size: 26 })}
          </div>
          <p>Error: ${err.message}</p>
        </div>`;
    }
  }
}

function renderContainerRow(c) {
  const modeIcon = MODE_ICONS[c.mode] || "truck";

  return `
    <div class="container-row">
      <div>
        <div class="cid">${Icons.svg("package", { size: 11 })} ${c.id}</div>
        <div class="route">${Icons.svg("mapPin", { size: 13 })} ${c.origin} \u2192 ${c.destination}</div>
      </div>
      <div class="mode-cell">${Icons.svg(modeIcon, { size: 14 })} ${c.mode.toUpperCase()}</div>
      <div class="space-cell">${c.available_space_cbm} / ${c.capacity_tons}t</div>
      <div class="price-cell">\u20B9${c.price_per_cbm}/CBM</div>
      <div>${c.transit_days}d</div>
      <button class="edit-space-btn" data-container-id="${c.id}" data-current-space="${c.available_space_cbm}">
        ${Icons.svg("package", { size: 13 })} Edit Space
      </button>
    </div>
  `;
}

async function addContainer(e) {
  e.preventDefault();
  const errorBox = document.getElementById("formError");
  errorBox.classList.remove("show");
  const submitBtn = document.getElementById("addContainerBtn");

  const payload = {
    mode: document.getElementById("mode").value,
    origin: document.getElementById("origin").value.trim(),
    destination: document.getElementById("destination").value.trim(),
    departure_date: document.getElementById("departureDate").value,
    capacity_tons: parseFloat(document.getElementById("capacityTons").value),
    available_space_cbm: parseFloat(document.getElementById("availableSpace").value),
    price_per_cbm: parseFloat(document.getElementById("pricePerCbm").value),
    transit_days: parseFloat(document.getElementById("transitDays").value),
  };

  setLoading(submitBtn, true);

  try {
    const res = await AuthState.authFetch(`${API_BASE}/containers/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to add container");

    document.getElementById("addContainerForm").reset();
    showToast("Container added successfully", "success");
    loadContainers();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add("show");
  } finally {
    setLoading(submitBtn, false);
  }
}

// Replaces the old native prompt() with a proper modal dialog
function openEditModal(containerId, currentSpace) {
  editingContainerId = containerId;

  let modal = document.getElementById("edit-space-modal-root");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "edit-space-modal-root";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-overlay open edit-space-modal">
      <div class="modal-box">
        <h3>${Icons.svg("package", { size: 20 })} Update Available Space</h3>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">
          Container <strong>${containerId}</strong>
        </p>
        <div class="form-group">
          <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:6px;">
            Available Space (CBM)
          </label>
          <div class="input-with-icon">
            <span style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--text-muted);">
              ${Icons.svg("package", { size: 16 })}
            </span>
            <input type="number" id="editSpaceInput" value="${currentSpace}" min="0" step="0.5" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="cancelEditSpace">Cancel</button>
          <button class="btn btn-primary" id="confirmEditSpace">Save Changes</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("cancelEditSpace").addEventListener("click", () => {
    modal.innerHTML = "";
  });

  document.getElementById("confirmEditSpace").addEventListener("click", submitEditSpace);
}

async function submitEditSpace() {
  const newSpace = document.getElementById("editSpaceInput").value;
  const modal = document.getElementById("edit-space-modal-root");

  if (newSpace === "" || parseFloat(newSpace) < 0) {
    showToast("Please enter a valid space value", "danger");
    return;
  }

  try {
    const res = await AuthState.authFetch(`${API_BASE}/containers/${editingContainerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available_space_cbm: parseFloat(newSpace) }),
    });
    if (!res.ok) throw new Error("Update failed");

    modal.innerHTML = "";
    showToast("Available space updated", "success");
    loadContainers();
  } catch (err) {
    showToast(err.message, "danger");
  }
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}