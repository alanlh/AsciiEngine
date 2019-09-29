class StateBase {
  constructor(id, persistence, type, childKeys, container, update, notify) {
    // Using bind because some of these callbacks may be used for multiple states. 
    this.traits = new StateTraits(id, persistence, type, childKeys, container, 
      update.bind(this), notify.bind(this));
    
    this.status = StateBase.STATUS.NO_STATUS;
  }
  
  notifyChildren() {
    for (childKey of this.traits.childKeys) {
      container.getState(childKey).update(this.traits.id, this.status);
    }
  }
  
  update(id, status) {
    if (this.traits.update(id, status)) {
      this.notifyChildren();
    }
  }
  
  notify(eventType) {
    if (this.traits.notify(eventType)) {
      this.notifyChildren();
    }
  }
}

StateBase.PERSISTENCE = {
  ACTIVE: "Active",
  PASSIVE: "Passive",
  DATA: "Data"
}

StateBase.PASSIVE_TYPES = {
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
