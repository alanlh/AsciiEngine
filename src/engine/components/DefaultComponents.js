import AsciiRenderComponent from "./AsciiRenderComponent.js";
import AsciiAnimateComponent from "./AsciiAnimateComponent.js";
import PositionComponent from "./PositionComponent.js";

const Components = {
  AsciiRender: AsciiRenderComponent,
  AsciiAnimate: AsciiAnimateComponent,
  Position: PositionComponent,
}

Object.freeze(Components);
export default Components;
