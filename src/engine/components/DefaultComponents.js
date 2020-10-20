import AsciiRenderComponent from "./AsciiRenderComponent.js";
import AsciiAnimateComponent from "./AsciiAnimateComponent.js";
import PositionComponent from "./PositionComponent.js";
import AsciiAnimateComponentFactory from "./AsciiAnimateComponentFactory.js";

const Components = {
  AsciiRender: AsciiRenderComponent,
  AsciiAnimate: AsciiAnimateComponent,
  Position: PositionComponent,
  AsciiAnimateFactory: AsciiAnimateComponentFactory,
}

Object.freeze(Components);
export default Components;
