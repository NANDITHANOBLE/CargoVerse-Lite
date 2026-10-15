const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["provider"])) return;

  renderParticles();
  renderHeader("my-containers.html");
  renderFooter();

  loadContainers();

  document.getElementById("addContainerForm").addEventListener("submit", addContainer);
});

async function loadContainers() {
  const list = document.getElementById("containersList");
  list.innerHTML = `<div style="color:var(--text-dim); padding:20px 0;">Loading...</div>`;

  try {
    const res = await fetch(`${API_BASE}/containers/mine`, {
      headers: { Authorization: `Bearer ${AuthState.getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load containers");

    if (data.length === 0) {
      list.innerHTML = `<div style="color:var(--text-dim); padding:20px 0;">No containers listed yet. Add your first one above.</div>`;
      return;
    }

    list.innerHTML = data
      .map(
        (c) => `
      <div class="container-row">
        <div><div class="cid">${c.id}</div><div class="route">${c.origin} \u2192 ${c.destination}</div></div>
        <div>${c.mode.toUpperCase()}</div>
        <div>${c.available_space_cbm} / ${c.capacity_tons}t</div>
        <div>\u20B9${c.price_per_cbm}/CBM</div>
        <div>${c.transit_days}d</div>
        <button class="edit-space-btn" onclick="editSpace('${c.id}', ${c.available_space_cbm})">Edit Space</button>
      </div>
    `
      )
      .join("");
  } catch (err) {
    if (err.message.includes("Provider profile not found")) {
      list.innerHTML = `<div style="color:var(--text-dim); padding:20px 0;">Complete your <a href="provider-onboarding.html" style="text-decoration:underline;">provider profile</a> first.</div>`;
    } else {
      list.innerHTML = `<div style="color:#ff8080; padding:20px 0;">Error: ${err.message}</div>`;
    }
  }
}

async function addContainer(e) {
  e.preventDefault();
  const errorBox = document.getElementById("formError");
  errorBox.style.display = "none";

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

  try {
    const res = await fetch(`${API_BASE}/containers/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AuthState.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to add container");

    document.getElementById("addContainerForm").reset();
    loadContainers();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = "block";
  }
}

async function editSpace(containerId, currentSpace) {
  const newSpace = prompt(`Update available space (CBM) for ${containerId}:`, currentSpace);
  if (newSpace === null) return;

  try {
    const res = await fetch(`${API_BASE}/containers/${containerId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AuthState.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ available_space_cbm: parseFloat(newSpace) }),
    });
    if (!res.ok) throw new Error("Update failed");
    loadContainers();
  } catch (err) {
    alert(err.message);
  }
}