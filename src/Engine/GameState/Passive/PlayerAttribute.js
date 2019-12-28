class PlayerAttribute extends StateBase {
  constructor(id, container, attributeType, defaultValue, update, notify) {
    super(id, StateBase.PERSISTENCE.PASSIVE, StateBase.TYPES.ATTRIBUTE, 
      update.keys(), notify.keys(), container, 
      StateBase.CALLBACKS.MATCH_UPDATE.bind(this), 
      StateBase.CALLBACKS.MATCH_NOTIFY.bind(this)
    );
      
    this.value = defaultValue;
  }
  
  onReady() {
    // Override from StateBase.
    this.connectToParents();
    this.connectToMessageBoard();
    // Only certain traits can be changed by others. 
    // Should only be limited to actual values, but not rates? (e.g. health, but not health regen rate)
  }
}

PlayerAttribute.TYPES = {
  VITALS: "Vitals", // E.g. health (curr/max, regen rate (in/out quest), defense), attack (damage/rate, slow)
  EQUIPMENT: "Equipment", // Can be equipped. 
  // All nodes for the same location are connected to each other.
  // If something gets equipped, everything else for that slot is unequipped. 
  INVENTORY: "Inventory", // Includes items that persist once found (has a found boolean). Include spells.
  ITEMS: "Items", // Includes the things that can be used (e.g. potions)
  RESOURCE: "Resource", // E.g. chocolates, cookies (curr amount, max reached, increase rate, eaten)
}
