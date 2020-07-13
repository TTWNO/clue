// Setup
const logic = require("./game.js");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
// serve files from client
const clientPath = `${__dirname}/../client`;
console.log(`Serving static files from ${clientPath}"`);
const server = http.createServer(app);
app.use(express.static(clientPath));
// create socket.io sockets
const io = socketio(server);

const Game = logic.Game;

let thegame = new Game(io);

io.on("connection", (sock) => {
  // setup connection
  console.log("Welcome, " + sock.id);
  thegame.addPlayer(sock, "Test");
  console.log(thegame.getPlayers());

  // disconnect
  sock.on("disconnect", () => {
    thegame.removePlayer(sock.id, "Test");
    console.log("Goodbye, " + sock.id);
  });

  // acuse a person in a place with a thing
  sock.on("accuse", (text) => {
    const jtext = JSON.parse(text);
    thegame.accuse(sock, jtext);

    if (thegame.is_murder_guessed())
    {
      thegame.winner(sock);
    }
  });
  // move left/right
  sock.on("move", (text) => {
    const jtext = JSON.parse(text);
    thegame.move(sock, jtext);
  });

  // client requests data
  sock.on("people-req", () => {
    sock.emit("people-res", JSON.stringify(thegame.getAllCharacters()));
  });
  sock.on("places-req", () => {
    sock.emit("places-res", JSON.stringify(thegame.getRooms()));
  });
  sock.on("things-req", () => {
    sock.emit("things-res", JSON.stringify(thegame.getThings()));
  });
  
  sock.on("start-game", () => {
    thegame.assign_cards_to_players();
    thegame.send_card_info_to_players();
  });

  sock.on("reveal", (text) => {
    console.log(JSON.parse(text));
    thegame.reveal_secret(sock, JSON.parse(text));
  });

});

server.on("error", (err) => {
  console.error("Server error: ", err);
});

server.listen(8080, () => {
  console.log("RPS started!");
});
