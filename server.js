const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

let rooms = {};

function broadcastRoom(roomId) {
  if (!rooms[roomId]) return;
  io.to(roomId).emit("room-data", rooms[roomId]);
}

function removeUserFromRoom(socketId, roomId) {
  if (!rooms[roomId]) return false;
  const before = rooms[roomId].users.length;
  rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socketId);
  if (before === rooms[roomId].users.length) return false;

  if (rooms[roomId].owner === socketId) {
    rooms[roomId].owner = rooms[roomId].users[0]?.id || null;
  }

  if (rooms[roomId].users.length === 0) {
    delete rooms[roomId];
    console.log(`[DELETE] room "${roomId}" deleted (empty)`);
  } else {
    broadcastRoom(roomId);
  }
  return true;
}

io.on("connection", (socket) => {

  // CREATE ROOM
  socket.on("create-room", ({ roomId, name, password }) => {
    if (rooms[roomId]) {
      socket.emit("room-exists");
      return;
    }

    rooms[roomId] = {
      users: [{ id: socket.id, name }],
      video: null,
      password: password || null,
      owner: socket.id
    };

    socket.join(roomId);
    broadcastRoom(roomId);
    console.log(`[CREATE] ${name} created room "${roomId}"`);
  });

  // JOIN ROOM
  socket.on("join-room", ({ roomId, name, password }) => {
    if (!rooms[roomId]) {
      socket.emit("room-not-found");
      return;
    }

    if (rooms[roomId].password && rooms[roomId].password !== password) {
      socket.emit("wrong-password");
      return;
    }

    socket.join(roomId);

    const already = rooms[roomId].users.find(u => u.id === socket.id);
    if (!already) {
      rooms[roomId].users.push({ id: socket.id, name });
    }

    if (!rooms[roomId].owner) {
      rooms[roomId].owner = socket.id;
    }

    broadcastRoom(roomId);
    console.log(`[JOIN] ${name} joined room "${roomId}" (${rooms[roomId].users.length} users)`);

    if (rooms[roomId].video) {
      socket.emit("video-update", rooms[roomId].video);
    }
  });

  // LEAVE ROOM (ผู้ใช้กดออกเอง)
  socket.on("leave-room", ({ roomId }) => {
    if (!rooms[roomId]) return;
    socket.leave(roomId);
    const removed = removeUserFromRoom(socket.id, roomId);
    if (removed) {
      console.log(`[LEAVE] socket left room "${roomId}"`);
    }
    socket.emit("left-room");
  });

  // VIDEO
  socket.on("video-update", ({ roomId, video }) => {
    if (!rooms[roomId]) return;
    rooms[roomId].video = video;
    socket.to(roomId).emit("video-update", video);
  });

  socket.on("video-control", ({ roomId, action, time }) => {
    if (!rooms[roomId]) return;
    socket.to(roomId).emit("video-control", { action, time });
  });

  socket.on("time-sync", ({ roomId, time, isPlaying }) => {
    if (!rooms[roomId]) return;
    if (rooms[roomId].owner !== socket.id) return;
    socket.to(roomId).emit("time-sync", { time, isPlaying });
  });

  // CHAT
  socket.on("chat-message", ({ roomId, name, message }) => {
    if (!rooms[roomId]) return;
    io.to(roomId).emit("chat-message", {
      name,
      message,
      time: new Date().toLocaleTimeString()
    });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    for (let roomId in rooms) {
      removeUserFromRoom(socket.id, roomId);
    }
  });

});

// HEARTBEAT
setInterval(() => {
  for (const roomId in rooms) {
    broadcastRoom(roomId);
  }
}, 5000);

server.listen(3001, "0.0.0.0", () => {
  console.log("Server running on http://localhost:3001");
});
