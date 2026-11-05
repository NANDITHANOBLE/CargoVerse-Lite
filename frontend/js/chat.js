// FILE: frontend/js/chat.js
const API_BASE = "http://127.0.0.1:8000";

let socket = null;
let myUserId = null;
let activeConversationId = null;
let typingTimeout = null;
let conversations = [];

document.addEventListener("DOMContentLoaded", () => {
  if (!AuthState.requireAuth(["trader", "provider", "admin"])) return;

  renderSidebar();
  injectIcons();

  myUserId = AuthState.getUserId();

  loadConversations();

  document.getElementById("newChatForm").addEventListener("submit", startNewConversation);
  document.getElementById("backToListBtn").addEventListener("click", showConversationList);
  document.getElementById("sendBtn").addEventListener("click", sendMessage);
  document.getElementById("conversationSearch").addEventListener("input", filterConversations);

  document.getElementById("messageInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  document.getElementById("messageInput").addEventListener("input", notifyTyping);
});

function injectIcons() {
  document.getElementById("conversationListIcon").innerHTML = Icons.svg("chat", { size: 18 });
  document.getElementById("conversationSearchIcon").innerHTML = Icons.svg("search", { size: 15 });
  document.getElementById("newChatIcon").innerHTML = Icons.svg("user", { size: 15 });
  document.getElementById("backToListBtn").innerHTML = Icons.svg("arrowRight", { size: 18, className: "icon-flip" });
  document.getElementById("sendBtn").innerHTML = Icons.svg("arrowRight", { size: 18 });
  document.getElementById("chatEmptyIcon").innerHTML = Icons.svg("chat", { size: 28 });
}

// Loads list of conversations by inspecting notification/chat history.
// Falls back to an empty list with a prompt to start a new chat.
async function loadConversations() {
  const list = document.getElementById("conversationList");
  list.innerHTML = `<div class="card skeleton" style="height:60px; margin:10px;"></div>`;

  try {
    const res = await AuthState.authFetch(`${API_BASE}/chat/conversations`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not load conversations");

    conversations = data;
    renderConversationList(conversations);
  } catch (err) {
    // Backend may not expose a conversations list endpoint yet —
    // show empty state with a way to start a new chat manually.
    conversations = [];
    renderConversationList([]);
  }
}

function renderConversationList(list) {
  const container = document.getElementById("conversationList");

  if (list.length === 0) {
    container.innerHTML = `
      <div class="chat-empty-state" style="padding:30px 20px;">
        <div class="icon-wrap">${Icons.svg("chat", { size: 24 })}</div>
        <p style="font-size:0.82rem;">No conversations yet. Start one below.</p>
      </div>`;
    return;
  }

  container.innerHTML = list
    .map(
      (c) => `
      <div class="conversation-item ${c.user_id === activeConversationId ? "active" : ""}" data-user-id="${c.user_id}">
        <div class="conversation-avatar">${getInitials(c.name || c.user_id)}</div>
        <div class="conversation-info">
          <div class="conversation-name">${c.name || c.user_id}</div>
          <div class="conversation-preview">${c.last_message || "No messages yet"}</div>
        </div>
      </div>`
    )
    .join("");

  container.querySelectorAll(".conversation-item").forEach((item) => {
    item.addEventListener("click", () => openConversation(item.dataset.userId));
  });
}

function filterConversations() {
  const query = document.getElementById("conversationSearch").value.toLowerCase();
  const filtered = conversations.filter((c) =>
    (c.name || c.user_id).toLowerCase().includes(query)
  );
  renderConversationList(filtered);
}

function startNewConversation(e) {
  e.preventDefault();
  const input = document.getElementById("newChatUserId");
  const userId = input.value.trim();

  if (!userId) {
    showToast("Please enter a user ID to start chatting", "danger");
    return;
  }

  input.value = "";
  openConversation(userId);
}

function openConversation(userId) {
  activeConversationId = userId;

  document.getElementById("activeChatName").textContent = userId;
  document.getElementById("activeChatAvatar").textContent = getInitials(userId);
  document.getElementById("chatWindow").innerHTML = "";

  document.querySelectorAll(".conversation-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.userId === userId);
  });

  document.querySelector(".chat-layout").classList.add("conversation-open");
  document.getElementById("activeChatPane").style.display = "flex";
  document.getElementById("chatEmptyPlaceholder").style.display = "none";
  document.getElementById("activeChatHeader").style.display = "flex"; // ADDED

  connect(userId);
}

function showConversationList() {
  document.querySelector(".chat-layout").classList.remove("conversation-open");
}

function connect(otherUserId) {
  if (socket) socket.close();

  socket = new WebSocket(`ws://127.0.0.1:8000/chat/ws/${myUserId}`);

  socket.onopen = () => {
    addSystemMessage(`Connected`);
    loadHistory(otherUserId);
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
  socket.onerror = () => addSystemMessage("Connection error");
}

async function loadHistory(otherUserId) {
  try {
    const res = await AuthState.authFetch(`${API_BASE}/chat/history/${otherUserId}`);
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

  if (!text || !socket || !activeConversationId) return;

  socket.send(
    JSON.stringify({
      type: "message",
      receiver_id: activeConversationId,
      message: text,
    })
  );

  input.value = "";
}

function notifyTyping() {
  if (!socket || !activeConversationId) return;

  socket.send(
    JSON.stringify({
      type: "typing",
      receiver_id: activeConversationId,
    })
  );
}

function showTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  indicator.innerHTML = `
    <span class="typing-dots"><span></span><span></span><span></span></span>
    ${activeConversationId} is typing...
  `;

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    indicator.innerHTML = "";
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
    status.innerHTML = delivered
      ? `${Icons.svg("check", { size: 11 })} Delivered`
      : "Sent";
    bubble.appendChild(status);
  }

  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addSystemMessage(text) {
  const chatWindow = document.getElementById("chatWindow");
  const div = document.createElement("div");
  div.className = "system-message";
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getInitials(name) {
  return name
    .split(/[\s_-]/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}