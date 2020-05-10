import AsciiRenderModule from "./AsciiRenderModule.js";
import KeyboardInputModule from "./KeyboardInputModule.js";
import AsciiMouseInputModule from "./AsciiMouseInputModule.js";
import Database from "./Database.js";

const Modules = {
  AsciiRender: AsciiRenderModule,
  KeyboardInput: KeyboardInputModule,
  AsciiMouseInput: AsciiMouseInputModule,
  Database: Database,
}

Object.freeze(Modules);
export default Modules;
