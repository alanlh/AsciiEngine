"use strict";
class QuestNpcData extends DataStateBase {
  constructor(id, container, npcAttributes) {
    super(id, StateBase.TYPES.NPC_ATTRIBUTES, container);
    
    UtilityMethods.checkForKeys(attributes, [
      "spriteKey",
      "maxHp",
      "moveSpeed",
      "attackDamage",
      "attackResistance",
      "attackType",
      "allegiance"
    ], LOGGING.ERROR);
    this.attributes = Object.freeze(npcAttributes);
  }
  
  createInstance(questInstanceId) {
    // Creates an instance of the NPC.
    // Each instance is represented by a new State Object.
    // Because this new state object should be owned by a quest instance, we don't directly add to container.
    return new QuestNPC(this, questInstanceId);
  }
}

QuestEnemyData.FormatNpcAttributes = function(attributes) {
  UtilityMethods.checkForKeys(attributes, [
    "spriteKey",
    "maxHp",
    "moveSpeed",
    "attackDamage",
    "attackResistance",
    "attackType",
    "allegiance"
  ], LOGGING.ERROR);
  return Object.freeze(attributes);
}
