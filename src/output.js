import Engine from "./engine/AsciiEngine.js";
import Entity from "./engine/Entity.js";
import Components from "./engine/components/DefaultComponents.js";
import Component from "./engine/components/Component.js";
import System from "./engine/systems/System.js";
import Systems from "./engine/systems/DefaultSystems.js";
import Modules from "./engine/modules/DefaultModules.js";
import ModuleSlots from "./engine/modules/ModuleSlots.js";
import Utility from "./utility/Utility.js";

import AsciiGL from "./graphics/AsciiGL.js";

const AsciiEngine = {
  Engine: Engine,
  Entity: Entity,
  Component: Component,
  Components: Components,
  System: System,
  Systems: Systems,
  Modules: Modules,
  ModuleSlots: ModuleSlots,
  GL: AsciiGL,
  Utility: Utility,
}

Object.freeze(AsciiEngine);

export default AsciiEngine;
