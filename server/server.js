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

let thegame = new Game();

io.on("connection", (sock) => {
  // setup connection
  console.log("Welcome, " + sock.id);
  thegame.addPlayer(sock.id, "Test");
  console.log(thegame.getPlayers());

  // disconnect
  sock.on("disconnect", () => {
    thegame.removePlayer(sock.id, "Test");
    console.log("Goodbye, " + sock.id);
  });

  // acuse a person in a place with a thing
  sock.on("accuse", (text) => {
    const jtext = JSON.parse(text);
    // is game won?
    const gamewon = thegame.accuse(jtext.person, jtext.place, jtext.thing);
    const acc = thegame.getAccusations();
    const len = acc.length-1;
    // set some strings
    const sendback = "You have accused " + acc[len].person + " in the " + acc[len].place + " with the " + acc[len].thing; 
    const announce = thegame.getPlayerNameById(sock.id) + " has accused " + acc[len].person + " in the " + acc[len].place + " with the " + acc[len].thing;
    // send the strings
    sock.emit("print", sendback);
    sock.broadcast.emit("print", announce);

    if (thegame.is_murder_guessed())
    {
      sock.emit("print", "You win");
      sock.broadcast.emit("print", thegame.getPlayerNameById(sock.id) + " has won the game!");
    }
  });
  // move left/right
  sock.on("move", (text) => {
    const jtext = JSON.parse(text);
    thegame.move(sock.id, jtext.direction);
    console.log(thegame.getPlayers());
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

});

server.on("error", (err) => {
  console.error("Server error: ", err);
});

server.listen(8080, () => {
  console.log("RPS started!");
});
