function RowData(rowDomElement, width) {
  let self = this;
  LOGGING.ASSERT(rowDomElement && rowDomElement.tagName === "DIV", 
    "RowData constructor parameter rowDomElement is not a div element"
  );
  Object.defineProperty(self, "rowDomElement", {
    value: rowDomElement
  });
  Object.defineProperty(self, "width", {
    value: width
  })
  // Remove any existing children that might be attached (just in case)
  self.clearDom();
    
  // TODO: Verify that width is an integer
  LOGGING.ASSERT(width, "RowData parameter width is not defined: ", width);
  let _currentPixelData = [];
  let _updatedPixelData = [];
  let _cellData = [];
  for (let i = 0; i < width; i ++) {
    _currentPixelData.push(PixelData.Empty);
    _updatedPixelData.push(PixelData.Empty);
    _cellData.push(new CellData());
  }
    
  self.updatePixelData = function(index, pixelData) {
    // TODO: Verify that pixelData is a PixelData object.
    _updatedPixelData[index] = pixelData;
  }
  
  self.render = function() {
    let currIdx = 0;
    let blocksUsed = 0;
    // Each block is for objects with different styles.
    while (currIdx < self.width) {
      let nextIdx = RowData.getSimilarBlock(_updatedPixelData, currIdx);
      
      if (!_cellData[blocksUsed].hasActiveDomElement) {
        let domElement = document.createElement("span");
        _cellData[blocksUsed].bindDomElement(domElement);
        self.rowDomElement.appendChild(domElement);
      }

      // TODO: Find way to check if PixelData are the same, to avoid modifying cell.
      _cellData[blocksUsed].clearPixelData();
      // Find all blocks with the same style.
      let currPos = currIdx;
      do {
        _cellData[blocksUsed].pushPixelData(_updatedPixelData[currPos]);
        currPos += _updatedPixelData[currPos].activeLength;
      } while (currPos < self.width 
        && PixelData.isStyleEqual(_updatedPixelData[currIdx], _updatedPixelData[currPos])
      );
      currIdx = currPos;
      _cellData[blocksUsed].render();
      
      blocksUsed ++;
    }
    for (let i = self.width - 1; i >= blocksUsed; i --) {
      // TODO: Remove that block from DOM.
      _cellData[i].eraseDomElement(self.rowDomElement);
    }
    
    for (let i = 0; i < self.width; i ++) {
      _currentPixelData[i] = _updatedPixelData[i];
      _updatedPixelData[i] = PixelData.Empty;
    }
  }
  
  self.render();
  
  Object.seal(this);
}

RowData.prototype.clearDom = function() {
  while (this.rowDomElement.lastChild) {
    // TODO: Remove from CellData as well.
    this.rowDomElement.removeChild(this.rowDomElement.lastChild);
  }
}

RowData.getSimilarBlock = function(pixelDataArr, startIdx) {
  let currPos = startIdx + pixelDataArr[startIdx].activeLength;
  while (currPos < pixelDataArr.length) {
    if (!PixelData.isStyleEqual(pixelDataArr[startIdx], pixelDataArr[currPos])) {
      return currPos;
    }
    currPos += pixelDataArr[currPos].activeLength;
  }
  return pixelDataArr.length;
}
