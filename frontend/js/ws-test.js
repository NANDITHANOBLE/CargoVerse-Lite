let socket = null;

function log(message, className = "") {
    const logEl = document.getElementById("log");

    const entry = document.createElement("div");
    entry.className = `msg ${className}`;
    entry.textContent = message;

    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

function connect() {
    const containerId = document.getElementById("containerId").value.trim();

    if (!containerId) {
        alert("Please enter a container ID");
        return;
    }

    if (socket) {
        socket.close();
    }

    socket = new WebSocket(
        `ws://127.0.0.1:8000/containers/ws/${containerId}`
    );

    socket.onopen = () => {
        log(`✅ Connected to container: ${containerId}`, "success");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "capacity_update") {
            log(
                `📦 Update: available_space_cbm = ${data.available_space_cbm}`,
                "update"
            );
        } else {
            log(`ℹ️ ${JSON.stringify(data)}`);
        }
    };

    socket.onclose = () => {
        log("❌ Disconnected");
    };

    socket.onerror = (err) => {
        log(`⚠️ Error: ${err.message || "WebSocket error"}`);
    };
}