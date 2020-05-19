import SetSystem from "./SetSystem.js";
import MapSystem from "./MapSystem.js";
import AsciiRenderSystem from "./AsciiRenderSystem.js";

const DefaultSystems = {
  Set: SetSystem,
  Map: MapSystem,
  AsciiRender: AsciiRenderSystem,
}

Object.freeze(DefaultSystems);

export default DefaultSystems;
