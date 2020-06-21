// rai = random array item
var rai = require('lodash.sample');

class Game {
  constructor()
  {
    this.players = {};
    this.acusations = [];
    this.all_characters = ["Colonol Mustard", "Professor Plumb", "Scarlet", "Mr. Green"];
    this.weapons = ["Wrench", "Pipe", "Rope", "Revolver"];
    this.rooms = ["Library", "Study", "Bathroom"];
    this.characters = ["Colonol Mustard", "Professor Plumb", "Scarlet"];
    this.used_characters = [];
    // test
    this.murder = {person: rai(this.all_characters)};
    console.log(this.murder);
  }
  // uses the index of the items
  accuse(person_i, place_i, thing_i)
  {
    let person = this.all_characters[person_i];
    let place = this.rooms[place_i];
    let thing = this.weapons[thing_i];
    let acc = {person: person, place: place, thing: thing};
    this.acusations.push(acc);
  }
  getAccusations()
  {
    return this.acusations;
  }
  getPlayers()
  {
    return this.players;
  }
  getPlayerNameById(id)
  {
    for (var k in this.players)
    {
      if (this.players.hasOwnProperty(k) && this.players[k].id == id)
      {
        return k;
      }
    }
    return undefined;
  }
  removePlayer(uid, name)
  {
    // move character back to cahracters from used_characters
    this.characters.push(this.used_characters[0]);
    this.used_characters.splice(0, 1);
    delete this.players[name];
  }
  addPlayer(uid, name)
  {
    this.players[name] = {id: uid, character: this.characters[0], roomid: 0};
    // move character from characters from used_characters
    this.used_characters.push(this.characters[0]);
    this.characters.splice(0, 1);
  }
  move(id, dir)
  {
    let pl = this.players[this.getPlayerNameById(id)];
    if (dir == "left")
    {
      pl.roomid -= 1;
    }
    else if (dir == "right")
    {
      pl.roomid += 1;
    }
  }


  getRooms()
  {
    return this.rooms;
  }
  getAllCharacters()
  {
    return this.all_characters;
  }
  getPlaces()
  {
    return this.places;
  }
  getThings()
  {
    return this.weapons;
  }
};

// export as Game
module.exports = { Game: Game };
