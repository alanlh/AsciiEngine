import Component from "./Component.js";

export default class AsciiRenderComponent extends Component {
  constructor(spriteNameList, styleNameList, relativePositionList) {
    super();
    // All these arrays should all be of the same length. Otherwise may cause problems.
    // TODO: Replace these properties with getters. Allow for different animations of the same entity.
    this.spriteNameList = spriteNameList || [];
    this.styleNameList = styleNameList || [];
    this.relativePositionList = relativePositionList || [];
  }
}

AsciiRenderComponent.type = "AsciiRender";
