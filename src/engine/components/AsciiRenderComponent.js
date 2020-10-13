import Component from "./Component.js";

export default class AsciiRenderComponent extends Component {
  /**
   * Creates a new Component that can be used by AsciiRenderSystem
   * 
   * @param {string[] | Sprite[]} spriteNameList The list of sprites or sprite names in the frame
   * @param {string[] | Style[]} styleNameList The list of styles or style names in the frame
   * @param {[number, number, number][]} relativePositionList The list of positions to render at
   */
  constructor(spriteNameList, styleNameList, relativePositionList) {
    super();
    // All these arrays should all be of the same length. Otherwise may cause problems.
    // TODO: Replace these properties with getters. Allow for different animations of the same entity.
    this.spriteNameList = spriteNameList || [];
    this.styleNameList = styleNameList || [];
    this.relativePositionList = relativePositionList || [];
    
    /**
     * @type {boolean} Whether or not the component should be rendered
     */
    this.visible = true;
    /**
     * @type {boolean} Whether or not the render information is located in the Component or should be retrieved in the ResourceManager
     */
    this.dataIsLocal = false;
  }
}

AsciiRenderComponent.type = "AsciiRender";
