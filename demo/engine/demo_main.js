(function() {
  let game = new GameController();
  
  game.loadConfig(config);
  
  game.loadSpriteData();
  
  game.loadStoryData();
  
  game.start();
})();
