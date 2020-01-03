window.addEventListener("load", async function() {
  demo1();
});

function demo1() {
  let game = new GameController();
    
  game.loadConfig(config1);
  
  game.loadSpriteData();
  
  game.loadStoryData();
  
  game.start();
}
