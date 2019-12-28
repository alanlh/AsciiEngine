"use strict";
class QuestObjectBase extends StateBase {
  constructor(questInstanceId, container, update, notify, spriteKey) {
    super(questInstanceId, StateBase.PERSISTENCE.ACTIVE, StateBase.TYPES.QUEST_NPC, 
      [QuestManager.id], eventKeys, container, update, notify);
    
    this.spriteKey = spriteKey;
    
    this.topLeftCoords = {
      x: 0, y: 0
    }
    
    this.occupiedCoordinates = {
      
    }
  }
}
