function StateChangeHandler() {
  // DATA FIELDS
  let gameController;
  
  this.initializeController = function(gameControllerInternals) {
    gameController = gameControllerInternals;
  }
  
  // Active states
  const loadStates = function() {
    
  };
  
  const states = loadStates();
  
  
  this.loadStates = function(saveStates) {
    
  }
  
  // Handling events
  
  let actionQueue = [];
  let lastRenderTime = performance.now();
  
  this.handleEvent = function(stateChangeEvent) {
    actionQueue.push(stateChangeEvent);
    
    // Check lastRenderTime. If enough time passed, evalutate.
  }
}
