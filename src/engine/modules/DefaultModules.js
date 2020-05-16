import KeyboardInputModule from "./KeyboardInputModule.js";
import AsciiMouseInputModule from "./AsciiMouseInputModule.js";
import ResourceManager from "./ResourceManager.js";

const Modules = {
  KeyboardInput: KeyboardInputModule,
  AsciiMouseInput: AsciiMouseInputModule,
  ResourceManager: ResourceManager,
}

Object.freeze(Modules);
export default Modules;
