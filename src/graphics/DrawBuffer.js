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
      this.rowComputedData.push(new RowSegmentBuffer(y, width, this.backgroundStyle));
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
  
  getSegmentLengthAt(x, y) {
    return this.rowComputedData[y].getSegmentLengthAt(x);
  }

  getSegmentAt(x, y) {
    return this.rowComputedData[y].getSegmentAt(x);
  }
}

class RowSegmentBuffer {
  /**
   * 
   * @param {number} rowNumber The row number of this buffer
   * @param {number} width The width of the row
   * @param {SpriteStyle} defaultStyle A REFERENCE of the default style.
   */
  constructor(rowNumber, width, defaultStyle) {
    this._width = width;
    this._rowNumber = rowNumber;
    
    this._nextPointer = new Array(width);
    /** @type{Array<ComputedSegmentData>} */
    this._computedSegments = new Array(width);

    for (let i = 0; i < this.width; i++) {
      this._computedSegments[i] = new ComputedSegmentData(defaultStyle);
      this._nextPointer[i] = -1;
    }
    this._nextPointer[0] = this.width;
  }
  
  clear() {
    // Don't actually need to clear the old data.
    for (let i = 1; i < this.width; i ++) {
      this._nextPointer[i] = -1;
    }
    this._computedSegments[0].clear();
    this._nextPointer[0] = this.width;
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
      this._computedSegments[startX].clear();
      let prevActiveStyle = startX - 1;
      while (this._nextPointer[prevActiveStyle] === -1) {
        prevActiveStyle --;
      }
      this._nextPointer[startX] = this._nextPointer[prevActiveStyle];
      this._nextPointer[prevActiveStyle] = startX;
      this._computedSegments[startX].copy(this._computedSegments[prevActiveStyle]);
    }
  }
  
  loadSegment(segmentLength, startX, style, priority, id, visibleText) {
    let endX = startX + segmentLength;

    this.insertSegmentStart(startX);
    this.insertSegmentStart(endX);
    
    let currPointer = startX;
    do {
      this._computedSegments[currPointer].addStyle(id, visibleText, style, priority);
      currPointer = this._nextPointer[currPointer];
    }
    while (currPointer < this.width && currPointer < endX);
  }
    
  getSegmentLengthAt(x) {
    let prevActive = x;
    while(this._nextPointer[prevActive] === -1) {
      prevActive --;
    }
    return this._nextPointer[prevActive] - x;
  }

  getSegmentAt(x) {
    // TODO: Is this loop necessary? DOMBuffer elements should perfectly correspond to segments.
    while (this._nextPointer[x] === -1) {
      x--;
    }
    return this._computedSegments[x];
  }
}

class ComputedSegmentData {
  /**
   * A helper class to manage the resulting style.
   */
  constructor(defaultStyle) {
    this._default = defaultStyle;

    this._spriteId = undefined;
    this._spritePriority = undefined;

    this._styleValues = {};
    this._stylePriorities = {};
    
    this._highestPriority = Number.POSITIVE_INFINITY;
    this._frontId = undefined;
    this.clear();

    Object.seal(this);
    Object.seal(this._styleValues);
    Object.seal(this._stylePriorities);
  }
  
  copy(other) {
    for (let styleName in SpriteStyle.defaultValues) {
      this._styleValues[styleName] = other._styleValues[styleName];
      this._stylePriorities[styleName] = other._stylePriorities[styleName];
    }
    this._spriteId = other._spriteId;
    this._spritePriority = other._spritePriority;

    this._highestPriority = other._highestPriority;
    this._frontId = other._frontId;
  }
  
  clear() {
    for (let styleName in SpriteStyle.defaultValues) {
      this._styleValues[styleName] = this._default.getStyle(styleName);
      this._stylePriorities[styleName] = Number.POSITIVE_INFINITY;
    }
    this._spriteId = undefined;
    this._spritePriority = Number.POSITIVE_INFINITY;

    this._highestPriority = Number.POSITIVE_INFINITY;
    this._frontId = undefined;
  }
    
  get frontId() {
    return this._frontId;
  }

  get textId() {
    return this._spriteId;
  }

  get styles() {
    return this._styleValues;
  }
  
  /**
   * Adds a new segment at the specified priority.
   * 
   * @param {string} segmentId 
   * @param {boolean} hasText 
   * @param {SpriteStyle} style 
   * @param {number} priority 
   */
  addStyle(segmentId, hasText, style, priority) {
    for (let styleName of style) {
      if (priority < this._stylePriorities[styleName]) {
        let styleValue = style.getStyle(styleName);
        if (styleValue !== undefined) {
          this._styleValues[styleName] = styleValue;
          this._stylePriorities[styleName] = priority;
        }
      }
    }
    if (hasText && priority < this._spritePriority) {
      this._spriteId = segmentId;
      this._spritePriority = priority;
    }
    if (priority < this._highestPriority) {
      this._highestPriority = priority;
      this._frontId = segmentId;
    }
  }
}
