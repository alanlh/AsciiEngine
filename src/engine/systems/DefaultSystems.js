import SetSystem from "./SetSystem.js";
import MapSystem from "./MapSystem.js";
import AsciiRenderSystem from "./AsciiRenderSystem.js";
import AsciiInputHandlerSystem from "./AsciiInputHandlerSystem.js";

const DefaultSystems = {
  Set: SetSystem,
  Map: MapSystem,
  AsciiRender: AsciiRenderSystem,
  AsciiInputHandler: AsciiInputHandlerSystem,
}

Object.freeze(DefaultSystems);

export default DefaultSystems;
