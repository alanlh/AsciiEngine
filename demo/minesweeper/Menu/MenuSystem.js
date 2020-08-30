import AsciiEngine from "../../../dist/engine.js";

import BoardSystem from "../Board/BoardSystem.js";

export default class MenuSystem extends AsciiEngine.System {
  constructor() {
    super("Menu");
    
    this.wins = 0;
    this.losses = 0;
    
    this.title = new AsciiEngine.Entity("Title");
    this.title.setComponent(new AsciiEngine.Components.Position(
      14, 0
    ));
    this.title.setComponent(new AsciiEngine.Components.AsciiRender(
      ["title"], ["title-style"], [[0, 0, 0]]
    ));
    
    this.easyGameButton = new AsciiEngine.Entity("easy_game");
    this.easyGameButton.setComponent(new AsciiEngine.Components.Position(
      11, 2
    ));
    this.easyGameButton.setComponent(new AsciiEngine.Components.AsciiRender(
      ["easy_game_button"], ["button-style"], [[0, 0, 0]]
    ));

    this.mediumGameButton = new AsciiEngine.Entity("medium_game");
    this.mediumGameButton.setComponent(new AsciiEngine.Components.Position(
      17, 2
    ));
    this.mediumGameButton.setComponent(new AsciiEngine.Components.AsciiRender(
      ["medium_game_button"], ["button-style"], [[0, 0, 0]]
    ));

    this.hardGameButton = new AsciiEngine.Entity("hard_game");
    this.hardGameButton.setComponent(new AsciiEngine.Components.Position(
      25, 2
    ));
    this.hardGameButton.setComponent(new AsciiEngine.Components.AsciiRender(
      ["hard_game_button"], ["button-style"], [[0, 0, 0]]
    ));
    
    this.winDisplay = new AsciiEngine.Entity("wins");
    this.winDisplay.setComponent(new AsciiEngine.Components.Position(
      10, 4
    ));
    this.winDisplay.setComponent(new AsciiEngine.Components.AsciiRender(
      ["win_header", "text-0"], ["empty-style", "empty-style"], [[0, 0, 0], [6, 0, 0]]
    ));
    
    this.loseDisplay = new AsciiEngine.Entity("losses");
    this.loseDisplay.setComponent(new AsciiEngine.Components.Position(
      20, 4
    ));
    this.loseDisplay.setComponent(new AsciiEngine.Components.AsciiRender(
      ["lose_header", "text-0"], ["empty-style", "empty-style"], [[0, 0, 0], [8, 0, 0]]
    ));
  }
  
  startup() {
    this.wins = 0;
    this.losses = 0;
    
    let entityManager = this.getEntityManager();
    entityManager.requestAddEntity(this.title);
    entityManager.requestAddEntity(this.easyGameButton);
    entityManager.requestAddEntity(this.mediumGameButton);
    entityManager.requestAddEntity(this.hardGameButton);
    entityManager.requestAddEntity(this.winDisplay);
    entityManager.requestAddEntity(this.loseDisplay);
    this.getSystemManager().addSystem(new BoardSystem(10, 10, 10));
    
    let newGameHandler = this._handleNewGameClick.bind(this);
    this.subscribe(["MouseEvent", "click", this.easyGameButton.id], newGameHandler);
    this.subscribe(["MouseEvent", "click", this.mediumGameButton.id], newGameHandler);
    this.subscribe(["MouseEvent", "click", this.hardGameButton.id], newGameHandler);
    
    this.subscribe(["Game", "End"], this._handleGameEnd, true);
  }
  
  shutdown() {
    // TODO: Need to remove title and new game button?
  }
    
  changeWinLossDisplay() {
    let winStringName = "text-" + this.wins.toString();
    let lossStringName = "text-" + this.losses.toString();
    
    let resourceManager = this.getEngine().getModule(AsciiEngine.ModuleSlots.ResourceManager);
    if (!resourceManager.has(winStringName)) {
      let winStringSprite = new AsciiEngine.GL.Sprite(this.wins.toString());
      resourceManager.add(winStringName, winStringSprite);
    }
    if (!resourceManager.has(lossStringName)) {
      let lossStringSprite = new AsciiEngine.GL.Sprite(this.losses.toString());
      resourceManager.add(lossStringName, lossStringSprite);
    }
    
    this.winDisplay.getComponent(AsciiEngine.Components.AsciiRender.type).spriteNameList[1] = winStringName;
    this.loseDisplay.getComponent(AsciiEngine.Components.AsciiRender.type).spriteNameList[1] = lossStringName;
  }
  
  _handleGameEnd(event, descriptor) {
    let gameWon = !!(event);
    if (gameWon) {
      this.wins++;
    } else {
      this.losses++;
    }
    this.changeWinLossDisplay();
  }

  _handleNewGameClick(event, descriptor) {
    if (descriptor.length !== 3) {
      return;
    }
    if (descriptor[2] === this.easyGameButton.id) {
      this.getSystemManager().removeSystem("Board");
      this.getSystemManager().addSystem(new BoardSystem(10, 10, 10));
    } else if (descriptor[2] === this.mediumGameButton.id) {
      this.getSystemManager().removeSystem("Board");
      this.getSystemManager().addSystem(new BoardSystem(15, 15, 40));
    } else if (descriptor[2] === this.hardGameButton.id) {
      this.getSystemManager().removeSystem("Board");
      this.getSystemManager().addSystem(new BoardSystem(20, 20, 100));
    }
  }
}

MenuSystem.type = "Menu";
