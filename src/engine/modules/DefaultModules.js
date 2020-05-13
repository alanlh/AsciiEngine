import KeyboardInputModule from "./KeyboardInputModule.js";
import AsciiMouseInputModule from "./AsciiMouseInputModule.js";
import Database from "./Database.js";

const Modules = {
  KeyboardInput: KeyboardInputModule,
  AsciiMouseInput: AsciiMouseInputModule,
  Database: Database,
}

Object.freeze(Modules);
export default Modules;
