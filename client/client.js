var sock = io();
var sockid;

var accuse_info = {};

var Modes = {
  NORMAL: 0,
  PERSON: 1,
  PLACE: 2,
  THING: 3
};
var mode = Modes.NORMAL;

const accuse = () => {
  sock.emit("accuse", JSON.stringify({person: accuse_info.person, place: accuse_info.place, thing: accuse_info.thing}));
};

const move = (dir) => {
  sock.emit("move", JSON.stringify({direction: dir}));
};

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

const nMode = (e) => {
  switch (e.key)
  {
    case "a":
    case "A":
      move("left");
      break;
    case "d":
    case "D":
      move("right");
      break;
    case "c":
    case "C":
      mode = Modes.PERSON;
      sock.emit("people-req", {});
      break;
    default:
      break;
  }
};

const personMode = (e) => {
  accuse_info.person = e.key;
  console.log("Person: " + e.key);
  sock.emit("places-req", {});
  mode = Modes.PLACE;
};

const placeMode = (e) => {
  accuse_info.place = e.key;
  console.log("Place: " + e.key);
  sock.emit("things-req", {});
  mode = Modes.THING;
};

const thingMode = (e) => {
  accuse_info.thing = e.key;
  mode = Modes.NORMAL;
  console.log("Thing: " + e.key);
  accuse();
};

const keyHandle = (e) => {
  switch (mode)
  {
    case Modes.NORMAL:
      nMode(e);
      break;
    case Modes.PERSON:
      personMode(e);
      break;
    case Modes.PLACE:
      placeMode(e);
      break;
    case Modes.THING:
      thingMode(e);
      break;
  }
};

const print_options_set_valid = (l) => {
  let jl = JSON.parse(l);
  console.log(jl);
  for (var i = 0; i < jl.length; i++)
  {
    writeLog(i + ": " + jl[i]);
  }
};

sock.on("people-res", print_options_set_valid);
sock.on("places-res", print_options_set_valid);
sock.on("things-res", print_options_set_valid);
sock.on("print", writeLog);

window.onload = () => {
  writeLog("Hello");
  window.addEventListener("keydown", keyHandle);
};
