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
    
    let entityManager = this.getEngine().getEntityManager();
    entityManager.requestAddEntity(this.title);
    entityManager.requestAddEntity(this.easyGameButton);
    entityManager.requestAddEntity(this.mediumGameButton);
    entityManager.requestAddEntity(this.hardGameButton);
    entityManager.requestAddEntity(this.winDisplay);
    entityManager.requestAddEntity(this.loseDisplay);
    this.getSystemManager().addSystem(new BoardSystem(10, 10, 10));
    
    let mouseModule = this.getEngine().getModule("mouse");
    mouseModule.signup(this.name, this.getMessageReceiver());
    mouseModule.subscribe(this.name, this.easyGameButton.id, ["click"]);
    mouseModule.subscribe(this.name, this.mediumGameButton.id, ["click"]);
    mouseModule.subscribe(this.name, this.hardGameButton.id, ["click"]);
    
    let messageBoard = this.getSystemManager().getMessageBoard();
    
    messageBoard.subscribe(this.name, ["game_end"]);
  }
  
  shutdown() {
    // Should never be called, but let's cleanup anyways...
    // TODO: Need to remove title and new game button
    let messageBoard = this.getSystemManager().getMessageBoard();
    messageBoard.withdraw(this.name);
  }
  
  preUpdate() {
    // Only listen for events. Nothing else to do.
    this.getMessageReceiver().handleAll();
  }
  
  changeWinLossDisplay() {
    let winStringName = "text-" + this.wins.toString();
    let lossStringName = "text-" + this.losses.toString();
    
    let resourceManager = this.getEngine().getModule(AsciiEngine.Engine.ModuleSlots.ResourceManager);
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
  
  receiveMessage(source, tag, body) {
    if (tag === "game_end") {
      let gameWon = !!(body);
      if (gameWon) {
        this.wins ++;
      } else {
        this.losses ++;
      }
      this.changeWinLossDisplay();
    } else if (tag === this.easyGameButton.id) {
      if (body.type === "click") {
        this.getSystemManager().removeSystem("Board");
        this.getSystemManager().addSystem(new BoardSystem(10, 10, 10));
      }
    } else if (tag === this.mediumGameButton.id) {
      if (body.type === "click") {
        this.getSystemManager().removeSystem("Board");
        this.getSystemManager().addSystem(new BoardSystem(15, 15, 40));
      }
    } else if (tag === this.hardGameButton.id) {
      if (body.type === "click") {
        this.getSystemManager().removeSystem("Board");
        this.getSystemManager().addSystem(new BoardSystem(20, 20, 100));
      }
    }
  }
}

MenuSystem.type = "Menu";
