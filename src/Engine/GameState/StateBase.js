"use strict";
class StateBase {
  constructor(id, persistence, type, parentKeys, eventKeys, container, update, notify) {
    // The update parameter should be bound to this object already.
    this.id = id;
    this.persistence = persistence;
    this.type = type;
    this.parentKeys = parentKeys;
    this.container = container;
    
    this._update = update; // For updates from fixed sources
    this._notify = notify; // For events where the source doesn't matter
    
    this.childKeys = [];
    
    this.eventListenKeys = eventKeys;
    
    this.status = StateBase.STATUS.NO_STATUS;
    this.value = StateBase.VALUES.EMPTY_VALUE;
    this.mutable = this.persistence !== StateBase.PERSISTENCE.DATA; // Default value.
    this.connectedToParents = false;
  }
  
  // Message board is for events.
  connectToMessageBoard() {
    this.container.messageBoard.requestSignUp(this.id, this.eventListenKeys);
  }
  
  disconnectFromMessageBoard() {
    this.container.messageBoard.dropOutAll(this.id);
  }
  
  // Parents is for other states.
  connectToParents() {
    if (!this.connectedToParents) {
      for (parentKey of this.parentKeys) {
        this.container.getState(parentKey).requestConnection(this.id);
      }
    }
    this.connectedToParents = true;
    // OPTIMIZE: delete parentKeys?
  }
  
  disconnectFromParents() {
    if (this.connectedToParents) {
      for (parentKey of this.parentKeys) {
        this.container.getState(parentKey).deleteConnection(this.id);
      }
    }
    this.connectedToParents = false;
  }
  
  requestConnection(id) {
    this.childKeys[id] = id;
  }
  
  deleteConnection(id) {
    delete this.childKeys[id];
  }
  
  initializeStatus(status) {
    // TODO: verify status?
    this.status = status;
  }
  
  initializeValue(value) {
    this.value = value;
  }
  
  notifyChildren() {
    for (childKey of this.childKeys) {
      this.container.getState(childKey).update(this.id, this.status, this.value);
    }
  }
  
  update(id, status, value) {
    // id and status are of the parent node
    if (this.mutable && this._update(id, status, value)) {
      this.notifyChildren();
    }
  }
  
  notify(eventData) {
    if (this.mutable && this._notify(eventData)) {
      this.notifyChildren();
    }
  }
  
  onReady() {
    // A base method for what to do when everything has been loaded.
  }
}

StateBase.PERSISTENCE = {
  ACTIVE: "Active",
  PASSIVE: "Passive",
  DATA: "Data"
}

StateBase.TYPES = {
  // Data
  NPC_ATTRIBUTES: "Npc Attributes",
  MAP_DATA: "Map Data",
  
  // Passive
  STORY: "Story"
  ATTRIBUTE: "Player Attribute",
  DATA: "Game Data",
  MISC: "Miscellaneous",
  
  // Active
  QUEST_PLAYER: "Quest Player",
  QUEST_NPC: "Quest NPC",
  QUEST_DOODAD: "Quest Doodad"
  
  OTHER: "Other"
}

StateBase.STATUS = {
  NO_STATUS: "No status",
}

StateBase.VALUES = {
  NO_VALUE: Object.freeze({});
}

StateBase.ACTIVE = {
  FALSE: false,
  TRUE: true
}

StateBase.CALLBACKS = {
  IGNORE: function() {},
  MATCH_UPDATE: function(id, status, value) {
    return this._update[id].call(this, status, value);
  },
  MATCH_NOTIFY: function(eventData) {
    return this._notify[eventData.origin].call(this, eventData);
  }
}

// TODO: is this necessary?
const NullState = new StateBase("NULL_STATE", StateBase.PERSISTENCE.DATA, 
  StateBase.TYPES.OTHER, [], [], undefined, 
  StateBase.CALLBACKS.IGNORE, StateBase.CALLBACKS.IGNORE);
