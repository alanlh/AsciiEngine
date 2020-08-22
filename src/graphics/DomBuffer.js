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
        this.elements[y].push(new DOMCellWrapper());
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
        this.rows[row].removeChild(this.elements[row][x].getDomElement());
      }
    } else if (length > this.activeRowLength[row]) {
      for (let x = this.activeRowLength[row]; x < length; x ++) {
        this.rows[row].appendChild(this.elements[row][x].getDomElement());
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
        let domElementWrapper = this.elements[y][cellsUsed];
        
        let segmentLength = drawBuffer.getSegmentLengthAt(x, y);
        let segmentData = drawBuffer.getSegmentAt(x, y);

        let frontTextId = segmentData.textId;
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
        domElementWrapper.setText(text);
        
        let style = segmentData.styles;
        for (let styleName in style) {
          domElementWrapper.setStyle(styleName, style[styleName]);
        }

        domElementWrapper.setId(segmentData.frontId);

        cellsUsed ++;
        x += segmentLength;
        domElementWrapper.applyChanges();
      }
      
      this.setRowLength(y, cellsUsed);
    }
  }
}

class DOMCellWrapper {
  constructor() {
    this._domElement = document.createElement("span");
    this._currText = "";
    this._currStyles = {};

    this._nextText = "";
    this._nextStyles = {};

    this._currId = "";
    this._nextId = "";
  }
  
  getDomElement() {
    return this._domElement;
  }

  setText(value) {
    this._nextText = value;
  }

  setStyle(styleName, value) {
    this._nextStyles[styleName] = value || "";
  }

  setId(value) {
    this._nextId = value;
  }

  applyChanges() {
    let domElement = this._domElement;
    if (this._nextText !== this._currText) {
      domElement.textContent = this._nextText;
    }
    this._currText = this._nextText;
    for (let styleName in this._nextStyles) {
      let styleValue = this._nextStyles[styleName];
      if (styleValue !== this._currStyles[styleName]) {
        domElement.style[styleName] = styleValue;
      }
      this._currStyles[styleName] = styleValue;
    }
    if (this._nextId !== this._currId) {
      domElement.dataset.asciiGlId = this._nextId;
    }
    this._currId = this._nextId;
  }
}