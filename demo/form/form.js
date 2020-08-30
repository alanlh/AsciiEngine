import { Engine, Modules, ModuleSlots, Systems } from "../../dist/engine.js";
import { AsciiGL, Sprite, Style } from "../../dist/gl.js";

export default function form() {
  let engine = new Engine();
  let systemManager = engine.getSystemManager();

  let gl = new AsciiGL("form");
  gl.init(120, 40);
  engine.setModule(ModuleSlots.Graphics, gl);

  // TODO: Is this needed?
  let resourceManager = new Modules.ResourceManager();
  engine.setModule(ModuleSlots.ResourceManager, resourceManager);

  let keyboardInput = new Modules.KeyboardInput();
  engine.setModule(ModuleSlots.KeyboardInput, keyboardInput);

  let renderSystem = new Systems.AsciiRender();
  systemManager.addSystem(renderSystem, 10);
}