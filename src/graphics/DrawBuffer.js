// Only importing Sprite due to type checking in vs code...
import Sprite from "./Sprite.js";
import SpriteStyle from "./SpriteStyle.js";

export default class DrawBuffer {
  constructor() {
    this._width = 0;
    this._height = 0;
    
    this.rowComputedData = [];
    this.sprites = {};
    this.locations = {};
    
    this.backgroundStyle = new SpriteStyle();
    this.backgroundStyle.fillRemainder();
  }
  
  init(width, height) {
    this._width = width;
    this._height = height;
    
    for (let y = 0; y < height; y ++) {
      this.rowComputedData.push(new RowSegmentBuffer(y, width));
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
      this.rowComputedData[y].clear();
    }
    this.sprites = {};
    this.locations = {};
  }
  
  /**
   * 
   * @param {Sprite} sprite The sprite to draw
   * @param {Array<number>} location The position to draw at
   * @param {SpriteStyle} style The corresponding style
   * @param {string} id The unique id associated with the draw
   */
  draw(sprite, location, style, id) {
    for (let segment of sprite.getItScreenPos(location[0], location[1], 0, 0, this.width, this.height)) {
      let y = segment.y;
      this.rowComputedData[y].loadSegment(segment.length, segment.x, style, location[2], id, segment.visibleText);
    }
    
    this.sprites[id] = sprite;
    this.locations[id] = location;
  }
  
  getStyleAt(x, y) {
    return this.rowComputedData[y].getStyleAt(x);
  }
  
  getSegmentLengthAt(x, y) {
    return this.rowComputedData[y].getSegmentLengthAt(x);
  }

  getSpriteIdAt(x, y) {
    return this.rowComputedData[y].getSpriteIdAt(x);
  }
}

class RowSegmentBuffer {
  constructor(rowNumber, width) {
    this._width = width;
    this._rowNumber = rowNumber;
    
    this._textIds = new Array(width);
    this._textPriority = new Array(width);
    this._computedStyles = new Array(width);
    this._nextPointer = new Array(width);
    
    for (let i = 0; i < this.width; i++) {
      this._textIds[i] = undefined;
      this._textPriority[i] = Number.POSITIVE_INFINITY;
      this._computedStyles[i] = new ComputedStyle();
      this._nextPointer[i] = -1;
    }
    this._nextPointer[0] = this.width;
  }
  
  clear() {
    // Don't actually need to clear the old data.
    for (let i = 1; i < this.width; i ++) {
      this._nextPointer[i] = -1;
    }
    this._nextPointer[0] = this.width;
    this._computedStyles[0].clear();
    this._textIds[0] = undefined;
    this._textPriority[0] = Number.POSITIVE_INFINITY;
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
      this._textIds[startX] = undefined;
      let prevActiveStyle = startX - 1;
      while (this._nextPointer[prevActiveStyle] === -1) {
        prevActiveStyle --;
      }
      this._nextPointer[startX] = this._nextPointer[prevActiveStyle];
      this._nextPointer[prevActiveStyle] = startX;
      this._computedStyles[startX].copy(this._computedStyles[prevActiveStyle]);
      this._textIds[startX] = this._textIds[prevActiveStyle];
      this._textPriority[startX] = this._textPriority[prevActiveStyle];
    }
  }
  
  loadSegment(segmentLength, startX, style, priority, id, visibleText) {
    let endX = startX + segmentLength;

    this.insertSegmentStart(startX);
    this.insertSegmentStart(endX);
    
    let currPointer = startX;
    do {
      this._computedStyles[currPointer].addStyle(style, priority, id);
      if (visibleText && this._textPriority[currPointer] > priority) {
        this._textIds[currPointer] = id;
        this._textPriority[currPointer] = priority;
      } else if (!visibleText) {
        visibleText = false;
      }
      currPointer = this._nextPointer[currPointer];
    }
    while (currPointer < this.width && currPointer < endX);
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

  getSpriteIdAt(x) {
    while (this._nextPointer[x] === -1) {
      x--;
    }
    return this._textIds[x];
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
    for (let styleName in SpriteStyle.defaultValues) {
      this._styles[styleName] = other._styles[styleName];
      this._priorities[styleName] = other._priorities[styleName];
    }
    this._frontId = other._frontId;
    this._highestPriority = other._highestPriority;
  }
  
  clear() {
    for (let styleName in SpriteStyle.defaultValues) {
      this._styles[styleName] = null;
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
