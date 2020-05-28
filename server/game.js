"use strict";

class Player {
  constructor(n_socketid){
    this._socketid = n_socketid;
    this._name = "Unknown";
    this._health = 10;
  }
  get name(){
    return this._name;
  }
  set name(n_name){
    this._name = n_name;
  }

  get socketid(){
    return this._socketid;
  }
  set socketid(n_sockid){
    this._socketid = n_sockid;
  }

  get health(){
    return this.health;
  }
  set health(n_health){
    this._health = n_health;
  }
};

class Game {
  constructor(){
    
  }
};
