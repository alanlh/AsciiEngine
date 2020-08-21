export default class DOMBuffer {
  constructor() {
    this.primaryElement = document.createElement("pre");
    this._width = 0;
    this._height = 0;
    
    this.activeRowLength = [];
    
    this.rows = [];
    this.elements = [];
    
    this.primaryElement.style.margin = "0";
  }
  
  init(width, height) {
    this._width = width;
    this._height = height;
    
    for (let y = 0; y < height; y ++) {
      let rowElement = document.createElement("div");
      rowElement.dataset.asciiGlRow = y;
      
      this.primaryElement.appendChild(rowElement);
      this.rows.push(rowElement);
      this.elements.push([]);
      this.activeRowLength.push(0);
      for (let x = 0; x < width; x ++) {
        this.elements[y].push(document.createElement("span"));
      }
    }
  }
  
  get width() {
    return this._width;
  }
  
  get height() {
    return this._height;
  }
  
  getDomElement() {
    return this.primaryElement;
  }
  
  /**
   * Causes the number of span elements attached to a row to change.
   */
  setRowLength(row, length) {
    if (length < this.activeRowLength[row]) {
      for (let x = this.activeRowLength[row] - 1; x >= length; x --) {
        this.rows[row].removeChild(this.elements[row][x]);
      }
    } else if (length > this.activeRowLength[row]) {
      for (let x = this.activeRowLength[row]; x < length; x ++) {
        this.rows[row].appendChild(this.elements[row][x]);
      }
    } else {
      // If equal, do nothing.
    }
    this.activeRowLength[row] = length;
  }
  
  bind(drawBuffer) {
    for (let y = 0; y < this.height; y ++) {
      let x = 0;
      let cellsUsed = 0;
      while (x < this.width) {
        let domElement = this.elements[y][cellsUsed];
        
        let segmentLength = drawBuffer.getSegmentLengthAt(x, y);
        let frontTextId = drawBuffer.getSpriteIdAt(x, y);
        let text = undefined;
        if (frontTextId === undefined) {
          text = " ".repeat(segmentLength);
        } else {
          text = drawBuffer.sprites[frontTextId].segmentAt(
            x - drawBuffer.locations[frontTextId][0],
            y - drawBuffer.locations[frontTextId][1],
            segmentLength
          );
        }
        domElement.textContent = text;
        
        let style = drawBuffer.getStyleAt(x, y);
        if (!style.completed) {
          style.fillRemainder(drawBuffer.backgroundStyle);
        }
        for (let styleName of style) {
          domElement.style[styleName] = style.getStyle(styleName);
        }
        domElement.dataset.asciiGlId = style.front;

        cellsUsed ++;
        x += segmentLength;
      }
      
      this.setRowLength(y, cellsUsed);
    }
  }
}
