import Sprite from "./Sprite.js";

export default class SpriteBuilder {
  /**
   * A template to create sprites (usually for text)
   * 
   * @param {Array} templateArray An array of strings.
   */
  constructor(templateArray) {
    this._template = templateArray;
    this._paramCount = templateArray.length - 1;
  }
  
  construct(paramArray) {
    // TODO: Optimize.
    let result = "";
    for (let i = 0; i < this._template.length; i ++) {
      result += this._template.length;
      if (i < this._paramCount) {
        result += paramArray[i];
      }
    }
    return new Sprite(result);
  }
}
