"use strict";
class GameController {
  constructor(divId) {
    let messageBoard = new MessageBoard();
    
    let clock = new Clock(messageBoard);
    let display = new Display(messageBoard);
    let locationManager = new LocationManager(messageBoard);
    
    let components = UtilityMethods.insertWithKey(
      {}, "id", 
      [clock, display, locationManager]
    );
    
    let gameOngoing = false;
    // TODO: Object.defineProperty
    this.start = function() {
      for (let componentId in components) {
        components[componentId].init({});
      }
      
      gameOngoing = true;
    };
    
    // TODO: Object.defineProperty
    this.loadComponent = function(component) {
      
    };

    this.takeInMessage = function(origin, tags, body) {
      // Mainly for testing.
      messageBoard.post(new Message(origin, tags, body));
    };
    
    this.loadConfig = function(configValues) {
      for (let componentKey in configValues) {
        components[componentKey].applyParameters(configValues[componentKey]);
      }
    };
    
    this.loadSpriteData = function(spriteDataFile) {
      
    };
    
    this.loadStoryData = function(storyData) {
      let storyManager = new StoryManager(messageBoard);
      UtilityMethods.insertWithKey(components, "id", [storyManager]);
    };
    
    this.loadSave = function(saveData) {
      
    };
  }
}
