// rai = random array item
var rai = require('lodash.sample'); // lazy bastard wrote this.
var object_equals = require('lodash.isequal'); // very lazy bastard wrote this

const print = (io, id, msg) =>
{
  io.to(id).emit("print", msg);
}
// socket broadcast; show all but the current sock
const print_sb = (sock, msg) =>
{
  sock.broadcast.emit("print", msg);
}
const report_not_turn = (io, id) =>
{
  print(io, id, "It is not your turn");
}

class Game {
  constructor(io)
  {
    this.io = io;
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

    // make an empty player queue for those who need to send info about their cards during a round-table turn after an accusation
    this.playerqueue = [];
    // socket to send card reveals to.
    this.secret_sock;
  }

  is_player_ids_turn(id)
  {
    for (var i = 0; i < this.players.length; i++)
    {
      if (this.players[i].id == id && this.players[i].turn == true)
      {
        return true;
      }
    }
    return false;
  }

  next_turn()
  {
    var index = 0;
    for (index = 0; index < this.players.length; index++)
    {
      if (this.players[index].turn == true)
      {
        this.players[index].turn = false;
        index++;
        index = index % this.players.length;
        this.players[index].turn = true;
      }
    }
  }

  // assign cards to players
  assign_cards_to_players()
  {
    for (var i = 0; i < this.cards.length; i++)
    {
      this.players[i%this.players.length].cards.push(this.cards[i]);
    }
  }

  send_card_info_to_players()
  {
    for (var player of this.players)
    {
      this.io.to(player.id).emit("print", "Your cards are: " + JSON.stringify(player.cards));
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

  show_card(sock, jtext)
  {
    var player;
    for (var i = 0; i < this.playerqueue; i++)
    {
      if (sock.id === this.playerqueue[i].id)
      {
        player = this.playerqueue[i];
      }
    }
    
    // if found
    if (player)
    {
      this.playerqueue.splice(i, 1);
    }
    else
    {
      sock.emit("print", "You have already submitted your guess.");
      return;
    }

    // 
    // if is empty playerqueue
    //    this.next_turn();
  }

  reveal_secret(sock, jtext)
  {
    if (!isNaN(jtext['reveal-index']))
    {
      var player = this.getPlayerById(sock.id);
      this.secret_socket.emit("print", player.name + " has revealed " + player.cards[jtext['reveal-index']] + " to you.");
      this.secret_socket.broadcast.emit("print", player.name + " has revealed a secret card to " + this.getPlayerNameById(this.secret_socket.id) );
    }
  }

  // uses the index of the items
  // return 1 if murder guessed; 0 otherwise
  accuse(sock, jtext) 
  {
    const id = sock.id;
    var person_i = jtext.person;
    var place_i = jtext.place; 
    var thing_i = jtext.thing;
    console.log(person_i, place_i, thing_i);
    if (!this.is_player_ids_turn(id))
    {
      this.not_your_turn(id);
      return;
    }

    this.secret_socket = sock;

    // prep accusation
    let person = this.all_characters[Number(person_i)];
    let place = this.rooms[Number(place_i)];
    let thing = this.weapons[Number(thing_i)];
    let acc = {person: person, place: place, thing: thing};
    // add accusation
    this.acusations.push(acc);

    console.log(acc);

    print(this.io, id, "You have accused " + person + " in the " + place + " with the " + thing);
    print_sb(sock, this.getPlayerNameById(id) + " has accused " + person + " with the " + thing + " in the " + place);


    var cards = [];
    for (var i = 0; i < this.players.length; i++)
    {
      print(this.io, this.players[i].id, "Secretly show " + this.getPlayerNameById(id) + " one of the following cards:");
      this.playerqueue.push(this.players[i]);
      if (this.players[i].id != sock.id)
      {
        for (var j = 0; j < this.players[i].cards.length; j++)
        {
          var card = this.players[i].cards[j];
          if (card === acc.person || card === acc.place || card === acc.thing)
          {
            print(this.io, this.players[i].id, "[" + j + "]: " + " " + card);
          }
          this.io.to(this.players[i].id).emit("card-req", {});
        }
      }
    }
    this.next_turn();
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
    for (var player of this.players)
    {
      if (player.id == id)
      {
        return player;
      }
    }
    return undefined;
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
  getPlayerRoomById(id)
  {
    return this.rooms[this.players.filter(item => item.id == id)[0].roomid];
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
  addPlayer(sock, name)
  {
    const uid = sock.id;

    this.players.push({id: uid, character: this.characters[0], roomid: 0, cards: [], name: name, turn: false});
    // assign first person to join as the one with the first turn
    if (this.players.length === 1)
    {
      this.players[0].turn = true;
    }
    // move character from characters from used_characters
    this.used_characters.push(this.characters[0]);
    this.characters.splice(0, 1);

    print_sb(sock, name + " has joined the game");
  }

  // move player `id` in direction `dir` to new room
  move(sock, params)
  {
    const id = sock.id;
    const dir = params.direction;

    let pl = this.players[this.getPlayerIndexById(id)];
    // if not users turn
    if (!pl.turn)
    {
      this.not_your_turn(id);
      return;
    }

    if (dir == "left")
    {
      pl.roomid -= 1;
    }
    else if (dir == "right")
    {
      pl.roomid += 1;
    }
    // handle over/under flow of the roomid
    if (pl.roomid < 0)
    {
      pl.roomid = this.rooms.length-1;
    }
    if (pl.roomid > this.rooms.length-1)
    {
      pl.roomid = 0;
    }

    print(this.io, id, "You have moved to the " + this.rooms[pl.roomid]);
    print_sb(sock, pl.name + " has move to the " + this.rooms[pl.roomid]);

    this.next_turn();
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

  not_your_turn(id)
  {
    report_not_turn(this.io, id);
  }

  setPlayerIdsName(id, jtext)
  {
    for (var player of this.players)
    {
      if (player.id === id)
      {
        player.name = jtext.name;
      }
    }
  }
};

// export as Game
module.exports = { Game: Game };
