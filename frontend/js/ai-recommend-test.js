const API_BASE = "http://127.0.0.1:8000";

function getToken() {
  return document.getElementById("token").value.trim();
}

function collectCandidates() {
  const rows = document.querySelectorAll(".candidate-row");
  const candidates = [];

  rows.forEach((row) => {
    candidates.push({
      container_id: row.querySelector(".c-id").value.trim(),
      price_per_cbm: parseFloat(row.querySelector(".c-price").value),
      transit_days: parseFloat(row.querySelector(".c-days").value),
      trust_score: parseFloat(row.querySelector(".c-trust").value),
      available_space_cbm: parseFloat(row.querySelector(".c-space").value),
    });
  });

  return candidates;
}

async function getRecommendation() {
  const token = getToken();
  const currentChoiceId = document.getElementById("currentChoiceId").value.trim();
  const candidates = collectCandidates();

  if (!token || !currentChoiceId) {
    alert("Please enter access token and current choice container ID");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/ai/recommend`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidates: candidates,
        current_choice_id: currentChoiceId,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data.detail) || "Request failed");
    renderResult(data);
    log("Recommendation fetched successfully");
  } catch (err) {
    log(`Error: ${err.message}`);
  }
}

function renderResult(data) {
  const card = document.getElementById("resultCard");
  card.style.display = "block";

  document.getElementById("bestId").textContent = data.best_container_id;
  document.getElementById("valueScore").textContent = data.value_score;
  document.getElementById("savings").textContent = `\u20B9${data.savings_per_cbm}`;
  document.getElementById("fasterBy").textContent = `${data.faster_by_days} days`;
  document.getElementById("alreadyBest").textContent = data.is_current_already_best ? "Yes" : "No";
}

function log(message) {
  const logEl = document.getElementById("log");
  const entry = document.createElement("div");
  entry.textContent = message;
  logEl.appendChild(entry);
}