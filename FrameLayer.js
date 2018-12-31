function createFrameLayerFromFile(filename) {

}

function createFrameLayerFromString(string) {

}

function createFrameLayerFromHTML(htmlString) {

}

function FrameLayer(textStr, coords, formatting, options) {
  let text_ = textStr;
  let width_ = 0;
  let height_ = 1;
  let rowIndices = [0];

  coords = coords || {x: 0, y: 0};
  let x_ = coords.x || 0;
  let y_ = coords.y || 0;

  for (let i = 1; i < text_.length; i ++) {
    if (text_.charAt(i) === '\n') {
      if (i - rowIndices[rowIndices.length - 1] > width_) {
        width_ = Math.max(width_, i - rowIndices[rowIndices.length - 1]);
      }
      rowIndices.push(i + 1);
    }
    if (text_.charAt(i - 1) === '\n') {
      height_ ++;
    }
  }

  if (text_.charAt(text_.length - 1) !== '\n') {
    width_ = Math.max(width_, text_.length - rowIndices[rowIndices.length - 1]);
  }
  rowIndices.push(text_.length + 1);

  this.getCoords = function() {
    return {x: x_, y: y_};
  }

  this.getDimens = function() {
    return {width: width_, height: height_};
  }

  let formatting_ = {
    textColor: "#000000",
    backgroundColor: "#FFFFFF",
    bold: false,
    underline: false,
    italics: false,
    strikethrough: false
  }

  let options_ = {
    spaceIsTransparent: true,
    spaceHasFormatting: false,
    setAsBlank: ' '
  }

  this.getCharData = function(x, y) {
    layerX = x - x_;
    layerY = y - y_;
    if (layerX < 0 || layerX > width_ || layerY < 0 || layerY > height_) {
      // If outside of Layer boundaries, immediately return false
      return new CharPixel();
    }

    rowStart = rowIndices[layerY];
    nextRow = rowIndices[layerY + 1];

    let char = text_.charAt(rowStart + layerX);
    if (formatting_.backgroundColor === "#FFFFFF" && char === ' ') {
      return new CharPixel();
    } else if (layerX >= nextRow - rowStart - 1) {
      return new CharPixel();
    } else if (char === options_.setAsBlank) {
      // TODO:
    } else {
      // Set the space as

      return new CharPixel({
        char: char,
      });
    }
  }

}

function CharPixel(charData) {
  charData = charData || {};
  this.char = charData.char || ' ';
  this.textColor = charData.textColor || "#000000";
  this.backColor = charData.backColor || "#FFFFFF";
  this.bold = charData.bold || false;
  this.italics = charData.italics || false;
  this.underline = charData.underline || false;
  this.strikethrough = charData.strikethrough || false;

  this.isTransparent = function() {
    return this.char === ' ' && this.backColor === "#FFFFFF"
      && !this.underline && !this.strikethrough;
  }

}
