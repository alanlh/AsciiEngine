import Component from "./Component.js";

export default class AsciiAnimateComponent extends Component {
  /**
   * A Component usable by AsciiRenderSystem which supports different frames.
   */
  constructor() {
    super();
    /**
     * @private
     */
    this._name = undefined;
    /**
     * @private
     */
    this._spriteNameList = {};
    /**
     * @private
     */
    this._styleNameList = {};
    /**
     * @private
     */
    this._relativePositionList = {};
    
    /**
     * @type {boolean} Whether or not the component should be rendered
     */
    this.visible = true;
    /**
     * @type {boolean} Whether or not the data is contained locally or should be retrieved from the Resource Manager
     */
    this.dataIsLocal = false;
  }
  
  /**
   * @returns {string} The name of the current frame
   */
  get currentFrame() {
    return this._name;
  }
  
  /**
   * @returns {string[] | Sprite[]} The list of sprite names or Sprites to render
   */
  get spriteNameList() {
    return this._spriteNameList[this.currentFrame];
  }
  
  /**
   * @returns {string[] | Style[]} The list of style names or Styles to render
   */
  get styleNameList() {
    return this._styleNameList[this.currentFrame];
  }
 
  /**
   * @returns {[number, number, number][]} The list of positions to render at
   */
  get relativePositionList() {
    return this._relativePositionList[this.currentFrame];
  }
  
  /**
   * 
   * @param {string} name The name of the frame
   * @param {string[] | Sprite[]} spriteNameList The list of sprites or sprite names in the frame
   * @param {string[] | Style[]} styleNameList The list of styles or style names in the frame
   * @param {[number, number, number][]} relativePositionList The list of positions to render at
   */
  addFrame(
    name,
    spriteNameList,
    styleNameList,
    relativePositionList
  ) {
    console.assert(
      spriteNameList.length === styleNameList.length &&
      spriteNameList.length === relativePositionList.length,
      "AsciiAnimateComponent inputs must be of the same length"
    );
    if (this._name === undefined) {
      this._name = name;
    }
    this._spriteNameList[name] = spriteNameList;
    this._styleNameList[name] = styleNameList;
    this._relativePositionList[name] = relativePositionList;
  }
  
  /**
   * Sets the current active frame
   * @param {string} name The frame to set to
   */
  setFrame(name) {
    if (name in this._spriteNameList) {
      this._name = name;
    }
  }
}

AsciiAnimateComponent.type = "AsciiAnimate";
