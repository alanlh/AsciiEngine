import Heap from "../utility/data_structures/Heap.js";
import SpriteView from "./SpriteView.js";
import Sprite from "./Sprite.js";

import Utility from "../utility/Utility.js";

export default class Buffer {
  /**
   * A helper class to help AsciiGL manage what is being drawn.
   * 
   * Specifically in charge of managing the text and ids.
   * 
   * TODO: OPTIMIZE!!!! RowBuffer implementation is probably not efficient.
   * 
   * TODO: For collision detection, maybe use this paper:
   * http://www4.tu-ilmenau.de/combinatorial-optimization/Schmidt2009a.pdf
   */
  constructor() {
    this._domElement = document.createElement("PRE");
    this._rows = [];
    this._width = 0;
    this._height = 0;
  }
  
  init(width, height) {
    this._width = width;
    this._height = height;

    for (let y = 0; y < height; y ++) {
      this._rows.push(new RowBuffer(width, y));
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
      this._rows[y].clear();
    }
  }
  
  // "Draws" the spriteView onto the buffer.
  draw(spriteView) {
    // Load each row of the sprite text to the appropriate RowBuffer.
    for (let y = Math.max(spriteView.y, 0); (y < spriteView.y + spriteView.height) && (y < this.height); y ++) {
      let x = spriteView.x;
      while (x < spriteView.x + spriteView.width) {
        let segmentLength = spriteView.segmentLengthAt(x, y);
        // console.assert(currSegmentLength >= 0, "For some reason a segment length is negative...");
        if (segmentLength > 0) {
          this._rows[y].drawSegment(spriteView, x, segmentLength, spriteView.depth);
          x += segmentLength;
        } else {
          x ++;
        }
      }
    }
  }
  
  render() {
    let workingDomElement = document.createElement("PRE");
    for (let i = 0; i < this._rows.length; i ++) {
      workingDomElement.appendChild(this._rows[i].render());
    }
    return workingDomElement;
  }
  
  getCoordinateSprites(x, y) {
    return this._rows[y].getCoordinateSprites(x);
  }
}

/**
 * A helper class to manage each row.
 */
class RowBuffer {
  constructor(width, rowNumber) {
    this._width = width;
    this._rowNumber = rowNumber;
    
    this._dataSegments = [];
    this._criticalPoints = new Set();
    this.clear();
  }
  
  get row() {
    return this._rowNumber;
  }
  
  get width() {
    return this._width;
  }
  
  clear() {
    this._dataSegments = [];
    this._criticalPoints.clear();
    this._criticalPoints.add(0);
    this._criticalPoints.add(this.width);
  }
  
  drawSegment(spriteView, start, length, depth) {
    this._dataSegments.push(new CellData(spriteView, start, length, depth));
    this._criticalPoints.add(Utility.clamp(start, 0, this.width));
    this._criticalPoints.add(Utility.clamp(start + length, 0, this.width));
  }
  
  render() {
    this._dataSegments.sort((a, b) => {
      /**
       * a and b should both be CellData structs.
       */
      return a.depth - b.depth;
    });
    
    const workingDomElement = document.createElement("DIV");

    const sortedCritPts = [...this._criticalPoints].sort((a, b) => {
      return a - b;
    });
    for (let i = 0; i < sortedCritPts.length - 1; i ++) {
      let startIdx = sortedCritPts[i];
      let length = sortedCritPts[i + 1] - startIdx;
      let cellFound = false;
      for (let cellData of this._dataSegments) {
        if (cellData.covers(startIdx)) {
          this.renderCell(
            workingDomElement, cellData, startIdx, length
          );
          cellFound = true;
          break;
        }
      }
      if (!cellFound) {
        this.renderEmptyCell(workingDomElement, length);
      }
    }

    return workingDomElement;
  }
  
  /**
   * A helper method to attach individual segments.
   */
  renderCell(workingDomElement, cell, screenStartIdx, length) {
    let newDomElement = document.createElement("span");
    newDomElement.textContent = cell.spriteView.segmentAt(
      screenStartIdx, this.row, length
    );
    if (cell.spriteView.tags.length > 0) {
      newDomElement.dataset["asciiGlId"] = cell.spriteView.tags[0];
    }
    newDomElement.classList.add(cell.spriteView.id.toString());
    workingDomElement.appendChild(newDomElement);
  }
  
  renderEmptyCell(workingDomElement, length) {
    let newDomElement = document.createElement("span");
    newDomElement.textContent = " ".repeat(length);
    workingDomElement.appendChild(newDomElement);
  }
  
  getCoordinateSprites(x) {
    let self = this;
    return function*() {
      for (let cellData of self._dataSegments) {
        if (cellData.covers(x)) {
          yield cellData.spriteView;
        }
      }
    };
  }
}

RowBuffer.EmptyText = null;

/**
 * A struct to help store data.
 */
class CellData {
  constructor(spriteView, start, length, depth) {
    this.spriteView = spriteView;
    this.start = start;
    this.length = length;
    this.depth = depth;
    Object.freeze(this);
  }
  
  get end() {
    return this.start + this.length;
  }
  
  covers(idx) {
    return this.start <= idx && idx < this.end;
  }
}
