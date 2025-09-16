document.addEventListener("DOMContentLoaded", () => {
  const logEl = document.getElementById("log");
  const input = document.getElementById("input");
  const form = document.getElementById("form");
  const usernameEl = document.getElementById("username");
  const btnJoin = document.getElementById("btnJoin");

  const socket = io(); // connect

  function appendServer(text) {
    const el = document.createElement("div");
    el.className = "server";
    el.textContent = text;
    logEl.appendChild(el);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function appendMessage({ user, msg, ts }) {
    const box = document.createElement("div");
    box.className = "msg";
    const time = new Date(ts).toLocaleTimeString();
    box.innerHTML = `<div class="meta"><strong>${escapeHtml(user)}</strong> · ${time}</div>
                     <div>${escapeHtml(msg)}</div>`;
    logEl.appendChild(box);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  btnJoin.addEventListener("click", () => {
    const name = (usernameEl.value || "").trim();
    if (!name) { usernameEl.focus(); return; }
    socket.emit("user:join", name);
    input.disabled = false;
    form.querySelector("button").disabled = false;
    usernameEl.disabled = true;
    btnJoin.disabled = true;
    appendServer(`Conectado como "${escapeHtml(name)}"`);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    socket.emit("chat:message", text);
    input.value = "";
    input.focus();
  });

  socket.on("chat:history", (items) => {
    if (items.length) appendServer(`Se cargaron ${items.length} mensajes previos`);
    items.forEach(appendMessage);
  });

  socket.on("chat:message", (payload) => {
    appendMessage(payload);
  });

  socket.on("server:notification", (text) => {
    appendServer(text);
  });
});
