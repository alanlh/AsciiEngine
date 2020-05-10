import Engine from "../AsciiEngine.js";
import System from "./System.js";
import AsciiRenderModule from "../modules/AsciiRenderModule.js";
import AsciiRenderComponent from "../components/AsciiRenderComponent.js";
import PositionComponent from "../components/PositionComponent.js";

export default class AsciiRenderSystem extends System {
  constructor(name) {
    super(name);
    // Use the default Set container for all entities.
    
    this._asciiGl = null;
  }
  
  startup() {
    this._asciiGl = this.getEngine().getModule(Engine.ModuleSlots.Graphics);
  }
  
  check(entity) {
    // Need both renderable and position.
    return entity.hasComponent(AsciiRenderComponent.type)
      && entity.hasComponent(PositionComponent.type);
  }
  
  /**
   * Only render after the main loop.
   */
  postUpdate() {
    let database = this.getEngine().getModule(Engine.ModuleSlots.Database);
    
    for (let entity of this.entities) {
      let renderComponent = entity.getComponent(AsciiRenderComponent.type);
      let entityAbsolutePosition = this.getEntityAbsolutePosition(entity);
      for (let i = 0; i < renderComponent.spriteNameList.length; i ++) {
        let sprite = database.get(renderComponent.spriteNameList[i]);
        let location = [
          entityAbsolutePosition[0] + renderComponent.relativePositionList[i][0],
          entityAbsolutePosition[1] + renderComponent.relativePositionList[i][1],
          entityAbsolutePosition[2] + renderComponent.relativePositionList[i][2],
        ]
        let style = database.get(renderComponent.styleNameList[i]);
        this._asciiGl.draw(sprite, location, style, entity.id);
      }
    }
    
    this._asciiGl.render();
  }
  
  getEntityAbsolutePosition(entity) {
    let location = [0, 0, 0];
    while (entity) {
      if (entity.hasComponent(PositionComponent.type)) {
        let relativePosition = entity.getComponent(PositionComponent.type);
        location[0] += relativePosition.x;
        location[1] += relativePosition.y;
        location[2] += relativePosition.z;
      }
      entity = entity.getParent();
    }
    return location;
  }
}

AsciiRenderSystem.type = "AsciiRenderSystem";
