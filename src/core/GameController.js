"use strict";
function GameController() {
  // Do things that can be done before window loads.
  const NEW_GAME_SAVE_DATA = "";
  
  // Handling active events
  const activeEvents = {
    
  };
  
  const addToEventList = function(event) {
    // Starts the events, 
  }
  
  const removeFromEventList = function(event) {
    
  }
  
  // References to key components
  const stateChangeHandler = new StateChangeHandler();
  
  const displayChangeHandler = new DisplayChangeHandler();
  
  const gameControllerInternals = {
    addEvent: function(event) {
      addToEventList(event);
    },
    removeEvent: function(eventName) {
      removeFromEventList(eventName);
    },
    triggerStateChange: function(stateChangeEvent) {
      stateChangeHandler.handleEvent(stateChangeEvent);
    }, 
    triggerDisplayChange: function(displayChangeEvent) {
      displayChangeHandler.handleEvent(displayChangeEvent);
    }
  };
  
  stateChangeHandler.initializeController(gameControllerInternals);
  displayChangeHandler.initializeController(gameControllerInternals);
  
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
  }
  
  this.startGame = startGameInternal;
}
