(function() {
  let game = new GameController();
  
  game.loadConfig();
  
  game.loadSpriteData();
  
  game.loadStoryData();
  
  game.start();
})();
