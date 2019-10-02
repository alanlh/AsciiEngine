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
    addEvent: function(eventData) {
      addToEventList(eventData);
    },
    removeEvent: function(eventName) {
      removeFromEventList(eventName);
    },
    triggerStateChange: function(stateChangeEvent) {
      stateChangeHandler.handleEvent(stateChangeEvent);
    }, 
    requestDisplayChange: function(displayChangeEvent) {
      displayChangeHandler.handleEvent(displayChangeEvent);
    }
  };
  
  stateChangeHandler.initializeController(gameControllerInternals);
  displayChangeHandler.initializeController(gameControllerInternals);
  
  // Handling callbacks
  // TODO: ??????????????
  const TICKS_PER_SEC = 8;
  const MILLI_PER_TICK = 1000 / TICKS_PER_SEC;
  const convertToTicks = function(milliTime) {
    return Math.ceil(time / MILLI_PER_TICK);
  }
  
  const regularGameLoops = {};
  insertWithKey(regularGameLoops, "intervalTime", [
    new GameLoopCallbacks(gameControllerInternals, 2000)),
    new GameLoopCallbacks(gameControllerInternals, 1000)),
    new GameLoopCallbacks(gameControllerInternals, 500)),
    new GameLoopCallbacks(gameControllerInternals, 250)),
    new GameLoopCallbacks(gameControllerInternals, 125)),
  ]);
  
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
