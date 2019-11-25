class QuestBase extends DataStateBase {
  constructor(id, container, update, notify) {
    super(id, StateBase.TYPES.QUEST_DATA, container);
    
    this.handleStateUpdate = update; // Is this needed?
    this.handleEvent = notify;
  }
  
  // Overrides DataStateBase.createInstance
  createInstance() {
    container.addActiveState(new QuestInstance(this));
  }
  
  handleEvent() {
    LOGGING.ERROR("Abstract method QuestBase.handleEvent being called.");
  }
  
  generateInitialSetting() {
    // TODO: Should this method be here or with the active state?
    LOGGING.ERROR("Abstract method QuestBase.generateInitialSetting being called.");
  }
  
  generateEnemy() {
    // TODO: Should this method be here or with the active state?
    LOGGING.ERROR("Abstract method QuestBase.generateEnemy being called.");
  }
}
