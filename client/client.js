const MOVING_KEYS = [
  {"keys": ["w", "ArrowUp"], val: "north"},
  {"keys": ["d", "ArrowRight"], val: "east"},
  {"keys": ["s", "ArrowDown"], val: "south"},
  {"keys": ["a", "ArrowLeft"], val: "west"},
];

var Modes = {
    NORMAL: "Normal",
    MOVE: "Move",
    LOOK: "Look"
};
var mode = Modes.NORMAL;
var myname = window.prompt("What is your name: ", "Joe Blow");
var sock = io();
var sockid;
// if unsucessful
if (myname == null || myname == "") {
    alert("This may not work.... You must reload and specify a name.");
}
else {
    // if successful
}
const writeLog = (res) => {
    var log = document.getElementById("statusbox");
    log.innerHTML += res + "<br>";
    log.scrollTop = log.scrollHeight;
};
const printLog = (res) => {
    var log = document.getElementById("statusbox");
    log.innerHTML += res;
    log.scrollTop = log.scrollHeight;
};
const move_me = (text) => {
    console.log(text);
    writeLog(text);
};
const update_other = (text) => {
    writeLog(text);
};
const debug = (text) => {
    console.log(text);
};
const set_users = (text) => {
    writeLog(text);
};
const add_new_user = (text) => {
    writeLog(text + " has joined the game");
};
const rem_disco_user = (text) => {
    writeLog(text + " has left the game");
};
const setid = (text) => {
    sockid = text;
};
const key_to_direction = (key) => {
  for (kv_pair of MOVING_KEYS){
    if (kv_pair.keys.includes(key)){
      return kv_pair.val;
    }
  }
};

const key_handler = (e) => {
    e.preventDefault();
    console.log(e.key);
    if (e.key === "F1" || e.key === "F2") {
        writeLog("escape to return to normal mode");
        writeLog("c to view current coordinates");
        writeLog("m to go into move mode");
        writeLog(">a to move left");
        writeLog(">d to move right");
        writeLog(">w to move up");
        writeLog(">s to move down");
        writeLog("");
    }
    if (e.key === "escape") {
        mode = Modes.NORMAL;
        writeLog("You are in normal mode.");
        return;
    }
    if (e.key === "r") {
        sock.emit("roll", "");
        return;
    }
    if (e.key === "c") {
        sock.emit("request-location");
        return;
    }
    if (e.key === "l") {
      mode = Modes.LOOK;
      writeLog("You are in look-around mode.");
      return;
    }
    if (e.key === "m") {
        mode = Modes.MOVE;
        writeLog("You are in moving mode");
        return;
    }
    if (mode === Modes.LOOK) {
      const kd = key_to_direction(e.key);
      if (kd){
        sock.emit("look", JSON.stringify({"name": myname, "id": sockid,"direction": kd}));
      }
    }
    if (mode === Modes.MOVE) {
      const kd = key_to_direction(e.key);
      if (kd){
        sock.emit("move", JSON.stringify({"name": myname, "id": sockid, "direction": kd}));
      }
    }
};
const move_failed = (resp) => {
    writeLog(resp);
};
sock.on("request-location-suc", writeLog);
sock.on("welcome", writeLog);
sock.on("update", update_other);
sock.on("self-update", move_me);
sock.on("debug", debug);
sock.on("new-player", add_new_user);
sock.on("already-active-users", set_users);
sock.on("user-left", rem_disco_user);
sock.on("joined", setid);
sock.on("move-failed", move_failed);
sock.on("client-error", writeLog);
sock.on("location-info", writeLog);
sock.on("your-move", writeLog);
sock.on("roll-res", writeLog);

window.onload = () => {
    sock.emit("register-user", myname);
    window.addEventListener("keyup", key_handler);
};
