// rai = random array item
var rai = require('lodash.sample'); // lazy bastard wrote this.
var object_equals = require('lodash.isequal'); // very lazy bastard wrote this

class Game {
  constructor()
  {
    // list of objects of players
    // players have .id, .name, .character, and .cards which is a list of cards they have in their hand
    this.players = [];
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
    // set cards to empty array
    this.cards = [];
    // set available cards to only those not representing aspects of the murder
    this.cards = this.cards.concat(this.all_characters.filter(item => item !== this.murder.person));
    this.cards = this.cards.concat(this.rooms.filter(item => item !== this.murder.place));
    this.cards = this.cards.concat(this.weapons.filter(item => item !== this.murder.thing));
    console.log("[MURDER]: " + JSON.stringify(this.murder));
  }

  // assign cards to players
  assign_cards_to_players()
  {
    for (var i = 0; i < this.cards.length; i++)
    {
      this.players[i%this.players.length].cards.push(this.cards[i]);
    }
  }

  send_card_info_to_players(io)
  {
    for (var player of this.players)
    {
      io.to(player.id).emit("print", "Your cards are: " + JSON.stringify(player.cards));
    }
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
    for (var player of this.players)
    {
      if (player.id == id)
      {
        return player.name;
      }
    }
    return undefined;
  }
  getPlayerById(id)
  {
    return this.players.filter(item => item.id === id);
  }
  getPlayerIndexById(id)
  {
    for (var i = 0; i < this.players.length; i++)
    {
      if (this.players[i].id === id)
      {
        return i;
      }
    }
    return undefined;
  }
  removePlayer(uid)
  {
    const removal_index = this.getPlayerIndexById(uid);
    const used_characters_index = this.used_characters.findIndex(item => item === this.players[removal_index].character);

    // move character back to cahracters from used_characters
    this.characters.push(this.players[removal_index].character);
    this.used_characters.splice(used_characters_index, 1);
    this.players.splice(removal_index, 1);
  }
  addPlayer(uid, name)
  {
    this.players.push({id: uid, character: this.characters[0], roomid: 0, cards: [], name: name});
    // move character from characters from used_characters
    this.used_characters.push(this.characters[0]);
    this.characters.splice(0, 1);
  }
  // move player `id` in direction `dir` to new room
  move(id, dir)
  {
    let pl = this.players[this.getPlayerIndexById(id)];
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
