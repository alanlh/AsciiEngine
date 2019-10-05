"use strict";
function GameController() {
  // Do things that can be done before window loads.
  const NEW_GAME_SAVE_DATA = "";
    
  // References to key components
  const stateChangeHandler = new StateChangeHandler();
  
  const displayChangeHandler = new DisplayChangeHandler();
  
  const gameControllerInternals = {
    triggerStateChange: function(stateChangeEvent) {
      stateChangeHandler.addEventToQueue(stateChangeEvent);
    }, 
    requestDisplayChange: function(displayChangeEvent) {
      displayChangeHandler.handleEvent(displayChangeEvent);
    }
  };
  
  stateChangeHandler.initializeController(gameControllerInternals);
  displayChangeHandler.initializeController(gameControllerInternals);
  
  // Handling callbacks  
  const eventManager = new EventManager(gameControllerInternals);
  gameControllerInternals.addEvent = eventManager.addEvent;
  gameControllerInternals.removeEvent = eventManager.removeEventId;

  const loadGame = function(saveData) {
    if (!saveData) {
      saveData = NEW_GAME_SAVE_DATA;
    }
  }
  
  // START GAME METHOD //
  
  const startGameInternal = function() {
    loadGame();
    // Create new game loop event
    
    startRender();
    eventManager.startAll();
  }
  
  this.startGame = startGameInternal;
}
