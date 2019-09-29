"use strict";
function StateChangeHandler() {
  // DATA FIELDS
  let gameController;
  
  this.initializeController = function(gameControllerInternals) {
    gameController = gameControllerInternals;
  }
  
  // Active states
  const loadStates = function() {
    
  };
  
  const states = loadStates(this);
  
  this.getState = function(id) {
    return states[id];
  }
  
  this.initializeStates = function(saveStates) {
    
  }
  
  // Handling events
  
  let actionQueue = [];
  let lastRenderTime = performance.now();
  
  this.handleEvent = function(stateChangeEvent) {
    actionQueue.push(stateChangeEvent);
    
    // Check lastRenderTime. If enough time passed, evalutate.
  }
}
