"use strict";
const generatePlayerAttributes = function(container) {
  const PlayerAttributes = {};
  
  function insertPlayerAttribute(id, attributeType, defaultValue, update, notify) {
    PlayerAttributes[id] = new PlayerAttributes(id, container, attributeType, defaultValue, update, notify);
  };
  
  // id, container, attributeType, defaultValue, update, notify
  insertPlayerAttribute(
    "CurrentHealth", PlayerAttribute.TYPES.VITALS, 100,
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
    "MaxHealth", PlayerAttribute.TYPES.VITALS, 100,
    {
      /** Various resource, inventory, equippable references **/
    },
    {
      // Maybe nothing here?
    }
  )


  return PlayerAttributes;
}
