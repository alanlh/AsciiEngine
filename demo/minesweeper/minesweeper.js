import BoardSystem from "./Board/BoardSystem.js";
import MenuSystem from "./Menu/MenuSystem.js";

// import TimerSystem from "./Board/TimerSystem.js";

export default function minesweeper() {
  let engine = new AsciiEngine.Engine();
  let systemManager = engine.getSystemManager();
  
  let gl = new AsciiEngine.GL.Instance("minesweeper");
  gl.init(20, 15);
  engine.setModule(AsciiEngine.Engine.ModuleSlots.Graphics, gl);

  let database = new AsciiEngine.Modules.Database;
  engine.setModule(AsciiEngine.Engine.ModuleSlots.Database, database);
  loadSprites(database);
  
  let mouseInput = new AsciiEngine.Modules.AsciiMouseInput(gl);
  engine.setModule("mouse", mouseInput);

  let menuSystem = new MenuSystem("menu");
  systemManager.addSystem(menuSystem);
  
  let renderSystem = new AsciiEngine.Systems.AsciiRender("render");
  systemManager.addSystem(renderSystem);
  
  engine.startLoop(250);
}

function loadSprites(database) {
  // Create sprite for empty block.
  let emptySprite = new AsciiEngine.GL.Sprite(" ", {
    spaceIsTransparent: false,
  });
  database.add("CellSprite-Empty", emptySprite);
  let unclickedStyle = new AsciiEngine.GL.SpriteStyle();
  unclickedStyle.setStyle("backgroundColor", "green");
  database.add("CellStyle-Unrevealed", unclickedStyle);
  let emptyStyle = new AsciiEngine.GL.SpriteStyle();
  emptyStyle.setStyle("backgroundColor", "blue")
  database.add("CellStyle-Empty", emptyStyle);
  // Create sprites for every block with neighboring mines.
  for (let i = 1; i < 10; i ++) {
    let sprite = new AsciiEngine.GL.Sprite(i.toString());
    database.add("CellSprite-" + i.toString(), sprite);
    let style = new AsciiEngine.GL.SpriteStyle();
    style.setStyle("backgroundColor", "blue");
    style.setStyle("color", "white");
    database.add("CellStyle-" + i.toString(), style);
  }
  let mineSprite = new AsciiEngine.GL.Sprite("M");
  database.add("CellSprite-Mine", mineSprite);
  let mineStyle = new AsciiEngine.GL.SpriteStyle();
  mineStyle.setStyle("backgroundColor", "red");
  mineStyle.setStyle("color", "white");
  database.add("CellStyle-Mine", mineStyle);
}
