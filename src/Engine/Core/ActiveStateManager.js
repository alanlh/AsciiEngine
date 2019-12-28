"use strict";
class ActiveStateManager {
  constructor(container) {
    this.states = {};
  }

  contains(id) {
    return (!this.get(id));
  }
  
  get(id) {
    // TODO: Will this work????
    for (let stateType in this.states) {
      if (id in this.states[stateType]) {
        return this.states[stateType][id];
      }
    }
    return false;
  }
  
  create(newState) {
    if (!(newState.type in this.states)) {
      this.states[newState.type] = {};
    }
    this.states[newState.type][newState.id] = newState;
  }
  
  remove(id) {
    for (let stateType in this.states) {
      if (id in this.states[stateType]) {
        delete this.states[stateType][id];
      }
    }
  }
  
  clear(type) {
    if (type in this.states) {
      delete this.states[type];
    } else {
      this.states = {};
    }
  }
}
