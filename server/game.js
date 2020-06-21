// rai = random array item
var rai = require('lodash.sample'); // lazy bastard wrote this.
var object_equals = require('lodash.isequal'); // very lazy bastard wrote this

class Game {
  constructor()
  {
    // players indexed by name they connected with; no two players may have the same name. Possible issues with this approach.
    this.players = {};
    // list of accusations {person: , place:, thing};
    this.acusations = [];
    // all characters; never changes
    this.all_characters = ["Colonol Mustard", "Professor Plumb", "Scarlet", "Mr. Green"];
    this.weapons = ["Wrench", "Pipe", "Rope", "Revolver"];
    this.rooms = ["Library", "Study", "Bathroom"];
    // characters not used by currently connected players
    this.characters = ["Colonol Mustard", "Professor Plumb", "Scarlet"];
    // characters used by currently conencted players
    this.used_characters = [];
    // set murder object to contain a random element from each of the arrays
    this.murder = {person: rai(this.all_characters), place: rai(this.rooms), thing: rai(this.weapons)};
    console.log("[MURDER]: " + JSON.stringify(this.murder));
  }

  // is the murder guessed based on current accusations
  is_murder_guessed()
  {
    for (var acc of this.acusations)
    {
      if (object_equals(acc, this.murder))
      {
        return true;
      }
    }
    return false;
  }

  // uses the index of the items
  // return 1 if murder guessed; 0 otherwise
  accuse(person_i, place_i, thing_i) 
  {
    let person = this.all_characters[person_i];
    let place = this.rooms[place_i];
    let thing = this.weapons[thing_i];
    let acc = {person: person, place: place, thing: thing};
    this.acusations.push(acc);
    return this.is_murder_guessed();
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
      // if players has id passed in by the variable `id`
      if (this.players.hasOwnProperty(k) && this.players[k].id == id)
      {
        // return name of player
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
