let socket = null;
let myUserId = null;
let otherUserId = null;
let typingTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

    renderParticles();
    renderHeader("chat.html");
    renderFooter();

    myUserId = AuthState.getUserId();
});

function connect() {
    otherUserId = document.getElementById("otherUserId").value.trim();

    if (!myUserId || !otherUserId) {
        alert("Please enter the other user's ID");
        return;
    }

    if (socket) socket.close();

    socket = new WebSocket(`ws://127.0.0.1:8000/chat/ws/${myUserId}`);

    socket.onopen = () => {
        addSystemMessage(`Connected as ${myUserId}`);
        loadHistory();
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "typing") {
            showTypingIndicator();
            return;
        }

        if (data.type === "message") {
            const isSentByMe = data.sender_id === myUserId;
            addBubble(data.message, isSentByMe, data.delivered);
        }
    };

    socket.onclose = () => addSystemMessage("Disconnected");
    socket.onerror = () => addSystemMessage("WebSocket error");
}

async function loadHistory() {
    try {
        const res = await fetch(
            `http://127.0.0.1:8000/chat/history/${otherUserId}`,
            {
                headers: {
                    Authorization: `Bearer ${AuthState.getToken()}`,
                },
            }
        );

        const messages = await res.json();

        messages.forEach((m) => {
            addBubble(m.message, m.sender_id === myUserId, true);
        });
    } catch (err) {
        console.warn("Could not load chat history:", err.message);
    }
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text || !socket) return;

    socket.send(
        JSON.stringify({
            type: "message",
            receiver_id: otherUserId,
            message: text,
        })
    );

    input.value = "";
}

function notifyTyping() {
    if (!socket) return;

    socket.send(
        JSON.stringify({
            type: "typing",
            receiver_id: otherUserId,
        })
    );
}

function showTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");

    indicator.textContent = `${otherUserId} is typing...`;

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        indicator.textContent = "";
    }, 2000);
}

function addBubble(text, isSentByMe, delivered) {
    const chatWindow = document.getElementById("chatWindow");
    const bubble = document.createElement("div");

    bubble.className = `bubble ${isSentByMe ? "sent" : "received"}`;
    bubble.textContent = text;

    if (isSentByMe) {
        const status = document.createElement("div");
        status.className = "status";
        status.textContent = delivered ? "Delivered" : "Sent";
        bubble.appendChild(status);
    }

    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addSystemMessage(text) {
    const chatWindow = document.getElementById("chatWindow");

    const div = document.createElement("div");
    div.style.color = "#888";
    div.style.fontSize = "12px";
    div.style.marginBottom = "8px";
    div.textContent = text;

    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}