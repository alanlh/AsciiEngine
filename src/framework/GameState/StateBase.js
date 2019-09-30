"use strict";
class StateBase {
  constructor(id, persistence, type, parentKeys, container, update, notify) {
    // The update parameter should be bound to this object already.
    this.id = id;
    this.persistence = persistence;
    this.type = type;
    this.parentKeys = parentKeys;
    this.container = container;
    
    this._update = update; // For updates from fixed sources
    this._notify = notify; // For events where the source doesn't matter
    
    this.childKeys = [];
    
    this.status = StateBase.STATUS.NO_STATUS;
    this.value = StateBase.VALUES.EMPTY_VALUE;
    this.mutable = this.persistence !== StateBase.PERSISTENCE.DATA; // Default value.
  }
  
  connectToParents() {
    for (parentKey of this.parentKeys) {
      this.container.getState(parentKey).requestConnection(this.id);
    }
    // OPTIMIZE: delete parentKeys?
  }
  
  requestConnection(id) {
    this.childKeys[id] = id;
  }
  
  deleteConnection(id) {
    delete this.childKeys[id];
  }
  
  initializeStatus(status) {
    // TODO: verify status
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
}

StateBase.STATUS = {
  NO_STATUS: "No status"
}

StateBase.VALUES = {
  NO_VALUE: Object.freeze({});
}

StateBase.CALLBACKS = {
  IGNORE: function() {}
}
