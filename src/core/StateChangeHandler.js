"use strict";
function StateChangeHandler() {
  // DATA FIELDS
  let gameController;
  
  const UPDATE_TIME_SECS = 0.05;
  
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
  
  this.initializeStates = function(saveStates) {
    
  }
  
  // Handling events
  
  // let actionQueue = [];
  // let lastUpdateTime = performance.now();
  
  this.handleEvent = function(stateChangeEvent) {
    // actionQueue.push(stateChangeEvent);
    
    // Check lastRenderTime. If enough time passed, evalutate.
    // let currentTime = performance.now();
    // if (!stateChangeEvent.evaluatedImmediately || currentTime < lastUpdateTime + UPDATE_TIME_SECS) {
    //   return;
    // }
    
    
  }
}
