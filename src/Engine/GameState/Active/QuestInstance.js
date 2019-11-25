"use strict";
// A central hub for quest states.
class QuestInstance extends StateBase {
  constructor(questTemplate) {
    // questId referes to which quest it is.
    // Should only have one instance at any given time. 
    super(questTemplate.id, StateBase.PERSISTENCE.ACTIVE, StateBase.TYPES.QUEST_MANAGER, 
      [], eventTypes, questTemplate.container,
      questTemplate.handleUpdate.bind(this), questTemplate.handleEvent.bind(this));
    // Parent list is default empty. Instead as quest states are created, they get connected. (What about player object?)
    // Events to listen for: enter quest, quest tick, exit quest
    // Update method is only added when 
    this.questTemplate = questTemplate;
    
    this.board = new CollisionDetector(); // Used to determine collision. Map from coordinates to the object at that coordinate. No overlaps allowed.
    
    this.board.unionWith(questTemplate.collisionCoordinates);

    // TODO: This should use container.getState to get information about the player character
    this.playerCharacter = new QuestPlayerFigure(this.questTemplate.playerStartPosition);
    this.board.unionWith(this.playerCharacter.collisionCoordinates);
    
    this.activeEnemies = [];
    for (let enemyId in questTemplate.startingEnemies) {
      // TODO: How is location of the enemy stored?
      activeEnemies.push(this.container.getState(enemyId).createInstance());
    }
    
    // Used to forward signals to respective objects?
    this.messageBoard = new MessageBoard();
  }
  
  // Override StateBase
  connectToParents() {
    return;
  }
  
  // Override StateBase
  disconnectFromParents() {
    return;
  }
  
  // Override StateBase
  requestConnection(id) {
    super.requestConnection(id); // Call StateBase's requestConnection
    this.container.getState(id).requestConnection(this.id);
  }
  
  // Override StateBase
  deleteConnection(id) {
    super.deleteConnection(id);
    // Remove from message board.
    this.container.getState(id).deleteConnection(this.id);
  }
  
  _handleUpdate(id, status, value) {
    // Need to specially handle a exit quest event. Other than that, pass to children
    let relevantIds = this.messageBoard.getSignUpList(); // TODO: What to put here?
  }
  
  _handleEvent(eventData) {
    // Need to specially handle a exit quest event. Other than that, pass to children
    let relevantIds = this.messageBoard.getSignUpList(eventData.id);
    for (id of relevantIds) {
      this.container.getState(id).notify(eventData);
    }
  }
  
  initializeQuest() {
    // Send signals to render to display to render.
  }
  
  fillInBoard(/** QuestObjectBase **/ questObject) {
    
  }
}

QuestInstance.ID = "QuestManager";
