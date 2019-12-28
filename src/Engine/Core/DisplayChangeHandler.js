"use strict";
function DisplayChangeHandler() {
  let gameController = undefined;
  
  let dataRetriever = new DataRetriever();
  
  this.statBar = AsciiEngine.NewScene({});
  this.mainScreen = AsciiEngine.NewScene({});
  this.inventoryScreen = AsciiEngine.NewScene({});
  this.farmScreen = AsciiEngine.NewScene({});
  this.chocolateMineScreen = AsciiEngine.NewScene({});
  this.saveScreen = AsciiEngine.NewScene({});
  this.settingsScreen = AsciiEngine.NewScene({});
  
  let renderQueue = new Queue();
  let handleEvents = function() {
    
  }
  
  /** Public API **/
  
  // Changes which screen is displayed
  this.addEventToQueue = function(eventData) {
    // Event Types:
    // changeActveScreen (newScreenName)
    // addSprite (spriteName, spriteKey, sceneName, location)
    // shiftSprite (key, shiftValues)
    // moveSprite (key, newLocation)
    // changeSpriteForm (key, newForm)
    // removeSprite (key)
    // clearScreen (screenName)
    // mandatoryRenderSignal
    renderQueue.enqueue(eventData);
    // TODO: decide if time to handle everything.
    // If so, first check if there are anythings that can eliminate previous changes (e.g. clearScreen)
  }
  
  this.changeActiveScreen = function() {
    // TODO:
  }
  
  // Adds an AsciiEngine.Layer to a certain screen. Returns a unique id.
  this.addSprite = function(spriteKey, sceneId, location) {
    // TODO:
  }
  
  this.shiftSprite = function(key, shiftValues) {
    
  }
  
  this.moveSprite = function(key, newLocation) {
    
  }
  
  this.changeSpriteForm = function(key, newForm) {
    
  }
  
  this.removeSprite = function(key) {
    
  }
}
