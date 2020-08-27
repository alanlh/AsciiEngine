import BoardSystem from "./Board/BoardSystem.js";
import MenuSystem from "./Menu/MenuSystem.js";

// import TimerSystem from "./Board/TimerSystem.js";

export default function minesweeper() {
  let engine = new AsciiEngine.Engine();
  let systemManager = engine.getSystemManager();
  
  let gl = new AsciiEngine.GL.Instance("minesweeper");
  gl.init(40, 25);
  engine.setModule(AsciiEngine.ModuleSlots.Graphics, gl);

  let resourceManager = new AsciiEngine.Modules.ResourceManager();
  engine.setModule(AsciiEngine.ModuleSlots.ResourceManager, resourceManager);
  loadSprites(resourceManager);
  
  let mouseInput = new AsciiEngine.Modules.AsciiMouseInput(gl);
  engine.setModule("mouse", mouseInput);

  let menuSystem = new MenuSystem("menu");
  systemManager.addSystem(menuSystem);
  
  let renderSystem = new AsciiEngine.Systems.AsciiRender();
  systemManager.addSystem(renderSystem);

  let inputHandlerSystem = new AsciiEngine.Systems.AsciiInputHandler();
  systemManager.addSystem(inputHandlerSystem);
  
  engine.startLoop(50);
}

function loadSprites(resourceManager) {
  let titleSprite = new AsciiEngine.GL.Sprite("MINESWEEPER!");
  resourceManager.add("title", titleSprite);
  
  let titleStyle = new AsciiEngine.GL.SpriteStyle();
  titleStyle.setStyle("fontWeight", "bold");
  resourceManager.add("title-style", titleStyle);
  
  let easyGameSprite = new AsciiEngine.GL.Sprite(
    "Easy", {
    spaceIsTransparent: false,
  });
  resourceManager.add("easy_game_button", easyGameSprite);
  
  let mediumGameSprite = new AsciiEngine.GL.Sprite(
    "Medium", {
    spaceIsTransparent: false,
  });
  resourceManager.add("medium_game_button", mediumGameSprite);

  let hardGameSprite = new AsciiEngine.GL.Sprite(
    "Hard", {
    spaceIsTransparent: false,
  });
  resourceManager.add("hard_game_button", hardGameSprite);


  let emptyTextStyle = new AsciiEngine.GL.SpriteStyle();
  resourceManager.add("empty-style", emptyTextStyle);
  
  let winsSprite = new AsciiEngine.GL.Sprite("Wins: ", {
    spaceIsTransparent: false,
  });
  resourceManager.add("win_header", winsSprite);

  let lossesSprite = new AsciiEngine.GL.Sprite("Losses: ", {
    spaceIsTransparent: false,
  });
  resourceManager.add("lose_header", lossesSprite);

  let zeroTextSprite = new AsciiEngine.GL.Sprite("0");
  resourceManager.add("text-0", zeroTextSprite);
  
  let buttonStyle = new AsciiEngine.GL.SpriteStyle();
  buttonStyle.setStyle("backgroundColor", "#CCCCCC");
  buttonStyle.setStyle("cursor", "pointer");
  resourceManager.add("button-style", buttonStyle);
  
  // Create sprite for empty block.
  let emptySprite = new AsciiEngine.GL.Sprite(" ", {
    spaceIsTransparent: false,
    ignoreLeadingSpaces: false,
  });
  resourceManager.add("CellSprite-Empty", emptySprite);
  
  let flagSprite = new AsciiEngine.GL.Sprite("F");
  resourceManager.add("CellSprite-Flag", flagSprite);
  
  let unclickedStyle = new AsciiEngine.GL.SpriteStyle();
  unclickedStyle.setStyle("backgroundColor", "#00BB00");
  resourceManager.add("CellStyle-Unrevealed", unclickedStyle);
  
  let unclickedHoverStyle = new AsciiEngine.GL.SpriteStyle();
  unclickedHoverStyle.setStyle("backgroundColor", "#44FF44");
  unclickedHoverStyle.setStyle("cursor", "pointer");
  resourceManager.add("CellStyle-Unrevealed-Hover", unclickedHoverStyle);
  
  let emptyStyle = new AsciiEngine.GL.SpriteStyle();
  emptyStyle.setStyle("backgroundColor", "blue")
  resourceManager.add("CellStyle-Empty", emptyStyle);
  // Create sprites for every block with neighboring mines.
  for (let i = 1; i < 10; i ++) {
    let sprite = new AsciiEngine.GL.Sprite(i.toString());
    resourceManager.add("CellSprite-" + i.toString(), sprite);
    let style = new AsciiEngine.GL.SpriteStyle();
    style.setStyle("backgroundColor", "blue");
    style.setStyle("color", "white");
    resourceManager.add("CellStyle-" + i.toString(), style);
  }
  let mineSprite = new AsciiEngine.GL.Sprite("M");
  resourceManager.add("CellSprite-Mine", mineSprite);
  let mineStyle = new AsciiEngine.GL.SpriteStyle();
  mineStyle.setStyle("backgroundColor", "red");
  mineStyle.setStyle("color", "white");
  resourceManager.add("CellStyle-Mine", mineStyle);
}
