"use strict";
class GameController {
  constructor(divId) {
    this.messageBoard = new MessageBoard();
    this.dataRetriever = new DataRetriever();
    
    let clock = new Clock(this);
    let display = new Display(this);
    let panelManager = new PanelManager(this);
    
    let components = UtilityMethods.insertWithKey(
      {}, "id", 
      [clock, display, panelManager]
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
    
    this.loadData = function(data) {
      this.dataRetriever.loadData(data);
    }
    
    this.loadPanelTemplates = function(data) {
      this.dataRetriever.loadPanelTemplates(data);
    }
    
    this.loadSpriteData = function(spriteDataFile) {
      
    };
    
    this.loadStoryData = function(storyData) {
      let storyManager = new StoryManager(this);
      UtilityMethods.insertWithKey(components, "id", [storyManager]);
    };
    
    this.loadSave = function(saveData) {
      
    };
  }
}
