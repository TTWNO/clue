// requires; libraries
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();

const clientPath = `${__dirname}/../client`;
console.log("Serving static files from ${clientPath}");
app.use(express.static(clientPath));
const server = http.createServer(app);

const io = socketio(server);

// Actual app

rooms = {};

io.on("connection", (sock) => {
  sock.join("lobby");
  console.log("Client connected on: " + sock.id);
  io.to("lobby").emit("connected", "Welcome to Clue!");

  sock.on("list_rooms", () => {
    sock.emit("rooms_list", JSON.stringify(rooms));
  });

  sock.on("new_room", () => {
    const room_id = "room-" + Object.keys(rooms).length;
    rooms[room_id] = {};
    rooms[room_id].players = [];
    console.log(rooms);
  });

  sock.on("join_room", (text) => {
    const jtext = JSON.parse(text);
    rooms["room-" + jtext.room_id].players.push({
      sockid: sock.id,
      name: jtext.name
    });
  });
});

server.listen(8080, () => {
  console.log("RPS Started!");
});
