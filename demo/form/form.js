import { Engine, Modules, ModuleSlots, Systems, Gui, GL } from "../../dist/engine.js";
import FormManager from "./FormManager.js";

export default function form() {
  let engine = new Engine();
  let systemManager = engine.getSystemManager();

  let gl = new GL.Instance("form");
  gl.init(60, 25);
  engine.setModule(ModuleSlots.Graphics, gl);

  // TODO: Is this needed?
  let resourceManager = new Modules.ResourceManager();
  engine.setModule(ModuleSlots.Resources, resourceManager);

  let keyboardInput = new Modules.KeyboardInput();
  engine.setModule(ModuleSlots.KeyboardInput, keyboardInput);

  let renderSystem = new Systems.AsciiRender();
  systemManager.addSystem(renderSystem, 10);

  let inputHandler = new Systems.AsciiInputHandler();
  systemManager.addSystem(inputHandler);

  let buttonSystem = new Gui.Systems.Button();
  systemManager.addSystem(buttonSystem);

  let inputFieldSystem = new Gui.Systems.InputField();
  systemManager.addSystem(inputFieldSystem);

  let textBoxSystem = new Gui.Systems.TextBox();
  systemManager.addSystem(textBoxSystem);

  let formManager = new FormManager();
  systemManager.addSystem(formManager);

  engine.startLoop(100);
}