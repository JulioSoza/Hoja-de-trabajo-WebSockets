const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public"))); // static

const users = new Map(); // socket.id -> username
const history = []; // last 10 messages

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("user:join", (username) => {
    const name = (username || "Anonimo").toString().slice(0, 30).trim() || "Anonimo";
    users.set(socket.id, name);
    socket.emit("chat:history", history.slice()); // enviar siempre
    socket.broadcast.emit("server:notification", `${name} se ha conectado`);
  });

  socket.on("chat:message", (text) => {
    const user = users.get(socket.id) || "Anonimo";
    const msg = (text || "").toString().slice(0, 500);
    if (!msg) return;
    const payload = {
      id: Date.now().toString(36) + Math.random().toString(16).slice(2),
      user, msg, ts: Date.now()
    };
    history.push(payload);
    if (history.length > 10) history.shift();
    console.log("historial len:", history.length);
    io.emit("chat:message", payload); // a todos
  });

  socket.on("disconnect", () => {
    const name = users.get(socket.id) || "Alguien";
    users.delete(socket.id);
    socket.broadcast.emit("server:notification", `${name} se ha desconectado`);
    console.log("Cliente desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor listo: http://localhost:${PORT}`);
});
