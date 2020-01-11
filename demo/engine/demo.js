window.addEventListener("load", async function() {
  LOGGING.PERFORMANCE.LEVEL = -1;
  demo1();
});

function demo1() {
  let game = new GameController();
    
  game.loadConfig(demo_1_config);

  game.loadData(demo_1_sprites);  
  game.loadPanelTemplates(demo_1_panels);
  
  game.start();
}
