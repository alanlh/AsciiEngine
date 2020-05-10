import Sprite from "./Sprite.js";

import Utility from "../utility/Utility.js";

export default class SpriteView {
  constructor(spriteReference, tags, location) {
    this._id = Utility.generateId("SpriteView");
    this._x = location[0];
    this._y = location[1];
    this._z = 0;
    if (location.length >= 2) {
      this._z = location[2];
    }
    
    this._spriteReference = spriteReference;
    
    this._tags = tags || [];
  }
  
  get id() {
    return this._id;
  }
  
  get x() {
    return this._x;
  }
  
  get y() {
    return this._y;
  }
  
  get z() {
    return this._z;
  }

  get width() {
    return this._spriteReference.width;
  }
  
  get height() {
    return this._spriteReference.height;
  }

  get depth() {
    return this._z;
  }
  
  get tags() {
    return this._tags;
  }
  
  /**
   * Calls charAt for the sprite, after offsetting for the location.
   */
  charAt(x, y) {
    return this._spriteReference.charAt(x - this.x, y - this.y);
  }
  
  /**
   * Calls segmentAt for the sprite, after offsetting for the location.
   */
  segmentLengthAt(x, y) {
    return this._spriteReference.segmentLengthAt(x - this.x, y - this.y);
  }
  
  /**
   * Calls segmentAt for the sprite, after offsetting for the location.
   */
  segmentAt(x, y, maxLength) {
    return this._spriteReference.segmentAt(x - this.x, y - this.y, maxLength);
  }
}
