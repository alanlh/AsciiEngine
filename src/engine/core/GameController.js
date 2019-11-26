"use strict";
(function() {
  let game = (function() {
    let messageBoard = new MessageBoard();
  
    let components = loadAllComponents();
    
    let gameOngoing = false;
    
    return {
      start(): function() {
        for (let component in components) {
          component.init();
        }
        
        gameOngoing = true;
      }, 
      takeInMessage: function(origin, tags, body) {
        messageBoard.post(new Message(origin, tags, body));
      }
    }
  })();
  
  game.start();
})();
