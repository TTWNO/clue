// Setup
require("./game.js");
const map = require("./map.js");
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

// variables necessary for the functions to run
var players = {};
let player_uid = 1;
let player_turn = 1;

var entities = {
  "e-1": {x: 5, y: 5}
};

const next_turn = () => {
  if (player_turn < player_uid-1){
    player_turn++;
  } else {
    player_turn = 1;
  }
};

const alert_player_is_turn = () => {
  for (var k in players){
    if (players.hasOwnProperty(k) && players[k].player_num === player_turn){
      io.to(k).emit("your-move", "It is your turn");
      //io.to(k).broadcast.emit("other-move", "It is " + players[k].name + "'s turn");
    }
  }
};

const full_string_pos = (pos) => {
  const room = get_room_of_pos(pos);
  if (room){
    return room + ":" + pos.x + "," + pos.y;
  } else {
    return pos.x + "," + pos.y;
  }
};

const get_relative_room_cords = (room_id, pos) => {
  for (sq of map.map){
    if (sq.room === room_id){
      return non_abs_xy_diff(pos, sq);
    }
  }
};

const non_abs_xy_diff = (pos1, pos2) => {
  return {x: pos1.x - pos2.x, y: pos1.y - pos2.y};
};

const get_player_with_sockid = (sockid) => {
  if (players.hasOwnProperty(sockid)){
    return players[sockid];
  }
  return null;
};

const update_socks_pos = (sockid, newpos) => {
  players[sockid].pos = newpos;
  players[sockid].looking_at = newpos;
};

const valid_position = (pos) => {
  for (sq of map.map){
    if (pos.x === sq.x && pos.y === sq.y){
      return true;
    }
  }
  return false;
};

const get_entities_on = (pos) => {
  entities_on = [];
  for (var k in players){
    if (players.hasOwnProperty(k)){
      if (players[k].x === pos.x && players[k].y === pos.y){
        entities_on.push(p);
      }
    }
  }
  return entities_on;
};

const get_room_of_pos = (pos) => {
  for (sq of map.map){
    if (sq.x === pos.x && sq.y === pos.y){
      console.log(JSON.stringify(sq));
      console.log(pos.x + "," + pos.y + " = " + sq.room);
      return sq.room;
    }
  }
};

// Returns {availabe: t|f, message: "Error or success message"}
const is_requested_position_available = (pos) => {
  let available, message;

  if (!valid_position(pos)){
    available = false;
    message = "there is a wall";
  } else {
    // if the square is not empty
    var all_data_on_cord = get_entities_on(pos);
    if (all_data_on_cord.length !== 0){
      available = false;
      message = all_data_on_cord[0].name + " is already there";
    // if all req.s satisfied
    } else {
      available = true;
      // relative position in room :)
      const room = get_room_of_pos(pos);
      const rel_pos = get_relative_room_cords(room, pos); 
      message = room + ":" + rel_pos.x + "," + rel_pos.y;
    }
  }
  return {"available": available, "message": message};
};

const direction_to_cord_diff = (dir) => {
  if (dir === "north"){
    return {x: 0, y: 1};
  } else if (dir === "northeast"){
    return {x: 1, y: 1};
  } else if (dir === "east"){
    return {x: 1, y: 0};
  } else if (dir === "southeast"){
    return {x: 1, y: -1};
  } else if (dir === "south"){
    return {x: 0, y: -1};
  } else if (dir === "southwest"){
    return {x: -1, y: -1};
  } else if (dir === "west"){
    return {x: -1, y: 0};
  } else if (dir === "northwest"){
    return {x: -1, y: 1};
  }
};

const xy_diff = (pos1, pos2) => {
  return {x: Math.abs(pos1.x - pos2.x), y: Math.abs(pos1.y - pos2.y)};
};
const xy_add = (pos1, pos2) => {
  return {x: pos1.x + pos2.x, y: pos1.y + pos2.y};
};

const has_door = (pos, dir) => {
  for (door of map.doors){
    if (door.from.x === pos.x && door.from.y === pos.y && door.direction === dir){
      return true;
    }
  }
  return false;
};

const use_door = (sockid, pos, dir) => {
  for (door of map.doors){
    if (door.from.x === pos.x && door.from.y === pos.y && door.direction === dir){
      update_socks_pos(sockid, door.to);
    }
  }
};

const peek = (sock, json_text) => {
  
};

io.on("connection", (sock) => {
  console.log("Client conencted");
  sock.emit("welcome", "Welcome to ttrpg.co");

  sock.on("disconnect", () => {
    console.log("Disconnection!");
    
    if (players[sock.id] !== undefined){

      sock.broadcast.emit("user-left", {"id": sock.id, "name": players[sock.id].name});
      delete players[sock.id];
    }
  });

  sock.on("cmd", (text) => {
    console.log("[DEBUG-cmd]: '" + text + "'");
    sock.broadcast.emit("update", text);
    sock.emit("self-update", text);
  });
  sock.on("request-location", (text) => {
    console.log("[R-LOC]: '" + text + "'");
    sock.emit("request-location-suc", full_string_pos(get_player_with_sockid(sock.id).pos));
  });
  sock.on("peek", (text) => {
    const jtext = JSON.parse(text);
    peek(sock, text);
  });
  sock.on("roll", (text) => {
    sock.emit("roll-res", JSON.stringify(Math.floor((Math.random() * 12) + 1)));
  });
  sock.on("look", (text) => {
    console.log("[LOOK]: '" + text + "'");
    const jtext = JSON.parse(text);
    const this_player = get_player_with_sockid(sock.id);
    if (!this_player){
      sock.emit("client-error", "You must reconnect");
      return;
    }
    const diff_pos = direction_to_cord_diff(jtext.direction);
    if (!diff_pos){
      sock.emit("client-error", "Invalid move type");
    }
    console.log(diff_pos);
    const requested_pos = xy_add(this_player.looking_at, diff_pos);
    if (!valid_position(requested_pos)){
      sock.emit("location-info", "Wall @ " + full_string_pos(requested_pos));
      return;
    }
    const req_room = get_room_of_pos(requested_pos);
    const p_room = get_room_of_pos(this_player.pos);
    if (req_room !== p_room){
      sock.emit("location-info", "This tile is in another room.");
      return;
    }
    const entities_at = get_entities_on(requested_pos);
    this_player.looking_at = requested_pos;
    console.log(requested_pos);
    sock.emit("location-info", JSON.stringify(entities_at) + "@" + full_string_pos(requested_pos));
  });
  sock.on("move", (text) => {
    const jtext = JSON.parse(text);
    console.log("[MOVE]: '" + text + "'");
    const this_player = get_player_with_sockid(sock.id);
    if (!this_player){
      sock.emit("client-error", "You must reconnect.");
      return;
    }
    if (this_player.player_num !== player_turn){
      sock.emit("client-error", "It is not your turn.");
      return;
    }
    const diff_pos = direction_to_cord_diff(jtext.direction);
    if (!diff_pos){
      sock.emit("client-error", "Invalid move type");
      return;
    }
    if (has_door(this_player.pos, jtext.direction)){
      use_door(sock.id, this_player.pos, jtext.direction);
      sock.emit("self-update", "You have moved to " + "a place");
      sock.broadcast.emit("update", jtext.name + " moved to " + "a place");
      return;
    }
    const requested_pos = {x: this_player.pos.x + diff_pos.x, y: this_player.pos.y + diff_pos.y};
    const pos_info = is_requested_position_available(requested_pos);
    if (pos_info.available){
      update_socks_pos(sock.id, requested_pos);
      sock.emit("self-update", "You have moved to " + pos_info.message);
      sock.broadcast.emit("update", jtext.name + " moved to " + pos_info.message);
      next_turn();
      alert_player_is_turn();
    } else {
      sock.emit("move-failed", "You cannot move there because " + pos_info.message);
    }
  });
  sock.on("register-user", (text) => {
    console.log("[DEBUG]: '" + text + "' has joined as '" + sock.id + "'!");
    sock.broadcast.emit("debug", "A new user has joined! Welcome, " + text);
    console.log("Players: " + Object.keys(players).map((k, i) => {
      players[k].name;
    }));
    players[sock.id] = {
      id: sock.id,
      name: text,
      pos: {x: 0, y: 0},
      player_num: player_uid,
      view_distance: {x: 2, y: 2},
      looking_at: {x: 0, y: 0}
    };
    player_uid++;
    sock.emit("already-active-users", Object.keys(players).map((k, i) => {
      players[k].name;
  }));
    sock.broadcast.emit("new-player", players[sock.id].name);
    console.log(JSON.stringify(players[sock.id]));
  });
});

server.on("error", (err) => {
  console.error("Server error: ", err);
});

server.listen(8080, () => {
  console.log("RPS started!");
});
