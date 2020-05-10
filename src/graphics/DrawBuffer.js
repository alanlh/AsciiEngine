import SpriteStyle from "./SpriteStyle.js";

import Utility from "../utility/Utility.js";

export default class DrawBuffer {
  constructor() {
    this._width = 0;
    this._height = 0;
    
    this.computedStyles = [];
    this.sprites = {};
    this.locations = {};
    
    this.backgroundStyle = new SpriteStyle();
    this.backgroundStyle.fillRemainder();
  }
  
  init(width, height) {
    this._width = width;
    this._height = height;
    
    for (let y = 0; y < height; y ++) {
      this.computedStyles.push(new RowSegmentBuffer(y, width));
    }
  }
  
  get width() {
    return this._width;
  }
  
  get height() {
    return this._height;
  }
  
  clear() {
    for (let y = 0; y < this.height; y ++) {
      this.computedStyles[y].clear();
    }
    this.sprites = {};
    this.locations = {};
  }
  
  draw(sprite, location, style, id) {
    let startX = Math.max(location[0], 0);
    let startY = Math.max(location[1], 0);
    let endX = Math.min(location[0] + sprite.width, this.width);
    let endY = Math.min(location[1] + sprite.height, this.height);
    
    for (let y = startY; y < endY; y ++) {
      let x = startX;
      while (x < endX) {
        let segmentLength = sprite.segmentLengthAt(x - location[0], y - location[1]);
        if (segmentLength > 0) {
          this.computedStyles[y].loadSegment(segmentLength, x, style, location[2], id);
          x += segmentLength;
        } else {
          x ++;
        }
      }
      // for (let x = startX; x < endX; x ++) {
      //   if (sprite.charAt(x - location[0], y - location[1]).length > 0) {
      //     this.computedStyles[y][x].addStyle(style, location[2], id);
      //   }
      // }
    }
    
    this.sprites[id] = sprite;
    this.locations[id] = location;
  }
  
  getStyleAt(x, y) {
    return this.computedStyles[y].getStyleAt(x);
  }
  
  getSegmentLengthAt(x, y) {
    return this.computedStyles[y].getSegmentLengthAt(x);
  }
}

class RowSegmentBuffer {
  constructor(rowNumber, width) {
    this._width = width;
    this._rowNumber = rowNumber;
    
    this._computedStyles = new Array(width);
    this._nextPointer = new Array(width);
    
    for (let i = 0; i < this.width; i ++) {
      this._computedStyles[i] = new ComputedStyle();
      this._nextPointer[i] = -1;
    }
    this._nextPointer[0] = this.width;
  }
  
  clear() {
    for (let i = 1; i < this.width; i ++) {
      this._nextPointer[i] = -1;
    }
    this._nextPointer[0] = this.width;
    this._computedStyles[0].clear();
  }
  
  get row() {
    return this._rowNumber;
  }
  
  get width() {
    return this._width;
  }
  
  insertSegmentStart(startX) {
    if (this._nextPointer[startX] === -1) {
      // If it's not a segment start point already,
      // Find the previous segment and copy it.
      this._computedStyles[startX].clear();
      let prevActiveStyle = startX - 1;
      while (this._nextPointer[prevActiveStyle] === -1) {
        prevActiveStyle --;
      }
      this._nextPointer[startX] = this._nextPointer[prevActiveStyle];
      this._nextPointer[prevActiveStyle] = startX;
      this._computedStyles[startX].copy(this._computedStyles[prevActiveStyle]);
    }
  }
  
  loadSegment(segmentLength, startX, style, priority, id) {
    let endX = startX + segmentLength;

    this.insertSegmentStart(startX);
    this.insertSegmentStart(endX);
    
    this._computedStyles[startX].addStyle(style, priority, id);
    let currPointer = this._nextPointer[startX];
    while (currPointer < this.width && currPointer < endX) {
      this._computedStyles[currPointer].addStyle(style, priority, id);
      currPointer = this._nextPointer[currPointer];
    }
  }
  
  getStyleAt(x) {
    while(this._nextPointer[x] === -1) {
      x --;
    }
    return this._computedStyles[x];
  }
  
  getSegmentLengthAt(x) {
    let prevActive = x;
    while(this._nextPointer[prevActive] === -1) {
      prevActive --;
    }
    return this._nextPointer[prevActive] - x;
  }
}

class ComputedStyle extends SpriteStyle {
  /**
   * A helper class to manage the resulting style.
   */
  constructor() {
    super();
    this._priorities = {};
    this._highestPriority = Number.POSITIVE_INFINITY;
    this._frontId = null;
    this.clear();
  }
  
  copy(other) {
    super.copy(other);
    for (let styleName in SpriteStyle.defaultValues) {
      this._priorities[styleName] = other._priorities[styleName];
    }
    this._frontId = other._frontId;
    this._highestPriority = other._highestPriority;
  }
  
  clear() {
    super.clear();
    for (let styleName in SpriteStyle.defaultValues) {
      this._priorities[styleName] = Number.POSITIVE_INFINITY;
    }
    this._highestPriority = Number.POSITIVE_INFINITY;
    this._frontId = null;
  }
  
  get completed() {
    for (let styleName in SpriteStyle.defaultValues) {
      if (this._styles[styleName] === null) {
        return false;
      }
    }
    return true;
  }
  
  get front() {
    return this._frontId;
  }
  
  /**
   * Adds a new style at the specified priority.
   */
  addStyle(style, priority, id) {
    for (let styleName of style) {
      if (this._priorities[styleName] > priority) {
        this.setStyle(styleName, style.getStyle(styleName));
        this._priorities[styleName] = priority;
      }
    }
    if (priority < this._highestPriority) {
      this._highestPriority = priority;
      this._frontId = id;
    }
  }
  
  sameAs(other) {
    return super.sameAs(other) && this.front === other.front;
  }
}
