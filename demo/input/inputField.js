import AsciiEngine from "../../dist/engine.js";

import CursorSystem from "./CursorSystem.js";
import BlinkerSystem from "./BlinkerSystem.js";
import InputHandler from "./InputHandler.js";

import BlinkerComponent from "./BlinkerComponent.js";

export default async function inputField() {
  let gl = new AsciiEngine.GL.Instance("inputField");
  gl.init(32, 12);

  let engine = new AsciiEngine.Engine();
  let systemManager = engine.getSystemManager();

  engine.setModule(AsciiEngine.ModuleSlots.Graphics, gl);

  let resourceManager = new AsciiEngine.Modules.ResourceManager();
  engine.setModule(AsciiEngine.ModuleSlots.ResourceManager, resourceManager);
  await resourceManager.loadSpriteFiles([
    "./demo/input/assets/sprites.json",
  ]);
  await resourceManager.loadTemplateFiles([
    "./demo/input/assets/templates.json",
  ]);
  
  let mouseInput = new AsciiEngine.Modules.AsciiMouseInput(gl);
  engine.setModule("MouseInput", mouseInput);
  
  let keyboardInput = new AsciiEngine.Modules.KeyboardInput();
  engine.setModule(AsciiEngine.ModuleSlots.KeyboardInput, keyboardInput);

  let cursorSystem = new CursorSystem();
  systemManager.addSystem(cursorSystem);
  
  let blinkerSystem = new BlinkerSystem();
  systemManager.addSystem(blinkerSystem);
  
  let inputHandler = new InputHandler();
  systemManager.addSystem(inputHandler);
  
  let renderSystem = new AsciiEngine.Systems.AsciiRender();
  systemManager.addSystem(renderSystem);

  let asciiInputHandler = new AsciiEngine.Systems.AsciiInputHandler();
  systemManager.addSystem(asciiInputHandler);
  
  engine.startLoop(100);
  
  let borderRenderFactory = resourceManager.get("input-border");
  let borderEntity = new AsciiEngine.Entity("input-border");
  borderEntity.setComponent(borderRenderFactory.construct());
  borderEntity.setComponent(new AsciiEngine.Components.Position(0, 0, 0));
  engine.getEntityManager().requestAddEntity(borderEntity);
}
