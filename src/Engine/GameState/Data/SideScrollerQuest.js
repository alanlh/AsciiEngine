class SideScrollerQuest extends QuestBase {
  constructor(id, container, update, notify, generateInitial, spriteKey, questAttributes) {
    super(id, container, update, notify);
    
    UtilityMethods.checkForKeys(questAttributes, [
      "enemyGenerationDistribution", // A distribution (not necessarily sum to 1) over enemy Ids.
      "gainRewardsWithoutWin", // Whether or not player keeps rewards if leave quest early/die
      "movementTrack", // A list of positions which determine movement. Can move left/right along track.
      "playerStartPosition", // A location on the track.
      "enemySpawnPosition", // Where new enemies are spawned from. A location on the track.
      "initialEnemyPlacement", // Map from enemyIds to track positions // TODO: Find a way to randomize
    ], LOGGING.ERROR);
    this.attributes = Object.freeze(questAttributes);
    
    /**
      Attributes: 
      playerCurrentPosition ()
    **/
  }
  
  generateEnemy() {
    // TODO: Does this just return an enemy from the enemyGenerationDistribution?
    let enemyId = this.attributes.enemyGenerationDistribution.getRandom();
  }
  
  generateInitialSetting() {
    // TODO: How does this work???
  }
  
  handleNotify(id, status, value) {
    
  }
  
  handleEvent(eventData) {
    // Jump
    // Tick
    // Exit quest
    // Attack
    // Collision?
  }
}
