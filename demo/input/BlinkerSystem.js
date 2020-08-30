import AsciiEngine from "../../dist/engine.js";

import BlinkerComponent from "./BlinkerComponent.js";

export default class BlinkerSystem extends AsciiEngine.Systems.Set {
  constructor() {
    super("Blinker");
  }
  
  check(entity) {
    return entity.hasComponent(BlinkerComponent.type) 
    && entity.hasComponent(AsciiEngine.Components.AsciiAnimate.type);
  }
  
  preUpdate() {
    for (let entity of this.entities) {
      let blinker = entity.getComponent(BlinkerComponent.type);
      let animate = entity.getComponent(AsciiEngine.Components.AsciiAnimate.type);
      
      if (blinker.tick()) {
        if (animate.currentFrame === "default") {
          animate.setFrame("off");
        } else {
          animate.setFrame("default");
        }
      }
    }
  }
}
