import SetSystem from "./SetSystem.js";
import AsciiRenderComponent from "../components/AsciiRenderComponent.js";
import AsciiAnimateComponent from "../components/AsciiAnimateComponent.js";
import PositionComponent from "../components/PositionComponent.js";
import ModuleSlots from "../modules/ModuleSlots.js";

export default class AsciiRenderSystem extends SetSystem {
  constructor(name) {
    super(name || "AsciiRender");
    // Use the default Set container for all entities.
    
    this._asciiGl = null;
  }
  
  startup() {
    this._asciiGl = this.getEngine().getModule(ModuleSlots.Graphics);
  }
  
  check(entity) {
    // Need both renderable and position.
    return (entity.hasComponent(AsciiRenderComponent.type) 
      || entity.hasComponent(AsciiAnimateComponent.type))
      && entity.hasComponent(PositionComponent.type);
  }
  
  /**
   * Only render after the main loop.
   */
  postUpdate() {
    let resourceManager = this.getEngine().getModule(ModuleSlots.ResourceManager);
    
    for (let entity of this.entities) {
      let renderComponent = entity.getComponent(AsciiRenderComponent.type) || entity.getComponent(AsciiAnimateComponent.type);
      if (!renderComponent.visible) {
        continue;
      }
      let entityAbsolutePosition = this.getEntityAbsolutePosition(entity);
      for (let i = 0; i < renderComponent.spriteNameList.length; i++) {
        let sprite, style;
        if (renderComponent.dataIsLocal) {
          sprite = renderComponent.spriteNameList[i];
          style = renderComponent.styleNameList[i];
        } else {
          sprite = resourceManager.get(renderComponent.spriteNameList[i]);
          style = resourceManager.get(renderComponent.styleNameList[i]);
        }
        let location = [
          entityAbsolutePosition[0] + renderComponent.relativePositionList[i][0],
          entityAbsolutePosition[1] + renderComponent.relativePositionList[i][1],
          entityAbsolutePosition[2] + renderComponent.relativePositionList[i][2],
        ];
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
