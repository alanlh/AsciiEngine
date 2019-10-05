"use strict";
function StateChangeHandler() {
  // DATA FIELDS
  let gameController = undefined;
    
  this.initializeController = function(gameControllerInternals) {
    gameController = gameControllerInternals;
  }
  
  // States
  const loadDataStates = function() {
    
  }
  
  const dataStates = loadDataStates(this);
  
  const loadPassiveStates = function(this) {
    let blankStates = {};
    blankStates = unionIntoFirst(blankStates, generateStoryStates(this), true);
    blankStates = unionIntoFirst(blankStates, generatePlayerAttributes(this), true);
    
    return blankStates;
  };
  
  const passiveStates = loadPassiveStates(this);
  
  // By definition, no permanent active states. Instead, have active module. 
  
  const activeStateManager = new ActiveStateManager(this);
  
  this.getState = function(id) {
    if (id in dataStates) {
      return dataStates[id];
    }
    if (id in passiveStates) {
      return passiveStates[id];
    }
    if (activeStateManager.contains(id)) {
      return activeStateManager.get(id);
    }
    LOGGING.ERROR("State ", id, " not found.");
  }
  
  this.messageBoard = new MessageBoard();
  
  this.initializeStates = function(saveStates) {
    
  }
  
  // Handling events
  
  let actionQueue = new Queue();
  // let lastUpdateTime = performance.now();
  
  this.addEventToQueue = function(stateChangeEvent) {
    actionQueue.push(actionQueue);
    if (actionQueue.size == 1) {
      // Assumption is that if size > 1, then handleEvents is in the call stack somewhere above.
      this.handleEvents();
    }
  }
  
  this.handleEvents = function() {
    while (!actionQueue.empty) {
      let eventData = actionQueue.front;
      let relevantStateIds = this.messageBoard.getSignUpList(eventData.actionName);
      for (let relevantStateId in relevantStateIds) {
        this.getState(relevantStateId).notify(eventData);
      }
      
      // Do not dequeue until we are finished handling it
      actionQueue.dequeue(1);
    }
    
  }
}
