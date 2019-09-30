class PlayerAttribute extends StateBase {
  constructor(id, container, attributeType, defaultValue, update, notify) {
    super(id, StateBase.PERSISTENCE.PASSIVE, StateBase.TYPES.ATTRIBUTE, 
      update.keys(), container, update, notify);
      
    this.value = defaultValue;
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

const healthAttribute = new PlayerAttribute(
  "CurrentHealth", /**container**/, PlayerAttribute.TYPES.VITALS, 100,
  {
    /** None????? **/
  },
  {
    "initialize": function(eventData) {
      // Query max health
    },
    "regenerate": function(eventData) {
      // Query MaxHealth, RegenRate, etc.
      
      if (this.value == maxHealth) {
        return false;
      }
    },
    "receiveDamage": function(eventData) {
      this.value -= eventData.value;
    }
  }
)

const maxHealthAttribute = new PlayerAttribute(
  "MaxHealth", /**container**/, PlayerAttribute.TYPES.VITALS, 100,
  {
    /** Various resource, inventory, equippable references **/
  },
  {
    // Maybe nothing here?
  }
)
