import AsciiAnimateComponent from "./AsciiAnimateComponent.js";

export default class AsciiAnimateComponentFactory {
  constructor(componentSpecs) {
    /**
     * @private
     */
    this.specs = componentSpecs;
  }

  /**
   * @returns {AsciiAnimateComponent}
   */
  construct() {
    let animateComponent = new AsciiAnimateComponent();
    for (let frameName in this.specs) {
      // Need to create a copy to prevent (accidental?) changes.
      animateComponent.addFrame(
        frameName,
        [...(this.specs[frameName].spriteNameList)],
        [...(this.specs[frameName].styleNameList)],
        [...(this.specs[frameName].relativePositionList)],
      )
    }
    return animateComponent;
  }
}
