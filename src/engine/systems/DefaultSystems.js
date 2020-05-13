import SetSystem from "./SetSystem.js";

import AsciiRenderSystem from "./AsciiRenderSystem.js";

const DefaultSystems = {
  Set: SetSystem,
  AsciiRender: AsciiRenderSystem,
}

Object.freeze(DefaultSystems);

export default DefaultSystems;
