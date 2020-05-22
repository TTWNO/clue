var sock = io();

const writeLog = (text) => {
  const log = document.getElementById("statusbox");
  log.innerHTML += "<br>" + text;
  log.scrollTop = log.scrollHeight;
};

const list_rooms = (json_rooms) => {
  const rooms = JSON.parse(json_rooms);
  writeLog("Open rooms: ");
  for (x of Object.keys(rooms)){
    if (rooms.hasOwnProperty(x)){
      players = "";
      for (p of rooms[x].players){
        players += p.name + ", ";
      }
      writeLog(x + ": " + players);
    }
  }
};

sock.on("connected", writeLog);
sock.on("rooms_list", list_rooms);

const key_handler = (e) => {
  e.preventDefault();
  if (e.key === "n")
  {
    sock.emit("new_room");
  }
  else if (e.key === "l")
  {
    sock.emit("list_rooms");
  }
  else if (e.key === "j")
  {
    const jr_info = {"name": window.prompt("Name: "), "room_id": window.prompt("Which room to join: ")};
    sock.emit("join_room", JSON.stringify(jr_info));
  }
};

window.onload = () => {
  // TODO: 
  window.addEventListener("keyup", key_handler);
};
