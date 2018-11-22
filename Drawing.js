// Creates a drawing with the given set
function Drawing(textStr, coords, dimens) { // TODO: Remove dimens?
  let text_ = textStr;
  let width_ = 0; // Defined to be the MAX width of any line
  let height_ = 1; // Equivalent to number of \n + 1
  let rowIndices = [0];

  // Coordinate within the scene.
  let x_ = 0;
  let y_ = 0;

  for (let i = 1; i < text_.length; i ++) {
    if (text_.charAt(i) === '\n') {
      if (i - rowIndices[rowIndices.length - 1] > width_) {
        width_ = i - rowIndices[rowIndices.length - 1];
      }
      rowIndices.push(i + 1);
    }
    if (text_.charAt(i - 1) === '\n') {
      height_ ++;
    }
  }

  rowIndices.push(text_.length + 1);
  console.log(text_);
  console.log(width_, height_);
  console.log(rowIndices);

  // if (dimens == undefined) {
  //   for (let i = 0; i < text_.length; i ++) {
  //     if (text_.charAt(i) === '\n') {
  //       if (width_ == 0) {
  //         width_ = i;
  //       } else {
  //         console.assert(i % (width_ + 1) == width_, "Invalid Drawing: Uneven line sizes");
  //       }
  //     } else if (width_ > 0) {
  //       console.assert(i % (width_ + 1) != width_, "Invalid Drawing: Uneven line sizes");
  //     }
  //   }
  //   if (width_ == 0) {
  //     width_ = text_.length;
  //   }
  //   height_ = Math.ceil(text_.length / (width_ + 1));
  // } else {
  //   console.assert(width in dimens && height in dimens, "width and/or height not defined in dimens");
  //   width_ = dimens.width;
  //   height_ = dimens.height;
  // }

  if (coords !== undefined) {
    console.assert(x in coords && y in coords, "x and/or y not defined in coords");
    x_ = coords.x;
    y_ = coords.y;
  }

  this.getLoc = function() {
    return {x: x_, y: y_};
  }
  this.setLoc = function(newLoc) {
    // Validate newLoc;
    x_ = newLoc.x;
    y_ = newLoc.y;
  }

  this.getDimens = function() {
    return {width: width_, height: height_};
  }

  let priority_ = 0;
  this.setPriority = function(newPriority) {
    // Validate
    priority_ = newPriority;
  }
  this.getPriority = function() {
    return priority_;
  }

  let textFormat_ = {};
  this.clearFormatting = function() {
    // TODO: Store old formatting, so that only the changes need to be re-rendered
    textFormat_ = {};
  }

  this.getCharValScene = function(xScene, yScene) {
    // NOTE: Is it better to return " " if points out of bound?
    return this.getCharValDrawing(xScene - x_, yScene - y_);
  }

  this.getCharValDrawing = function(xDrawing, yDrawing) {
    console.assert(yDrawing >= 0 && yDrawing < height_, "Drawing getChar: Invalid y-index " + yDrawing);
    rowStart = rowIndices[yDrawing];
    nextRow = rowIndices[yDrawing + 1];
    console.assert(xDrawing >= 0 && xDrawing < width_, "Drawing getChar: Invalid x-index " + xDrawing);
    if (xDrawing < nextRow - rowStart - 1) {
      return text_.charAt(rowStart + xDrawing);
    }
    return "";

    // OLD version.
    console.assert(xDrawing < width_ && xDrawing >= 0, "Drawing getChar Invalid x-Index");
    console.assert(yDrawing < height_ && yDrawing >= 0, "Drawing getChar Invalid y-Index");
    let char = text_.charAt(yDrawing * (width_ + 1) + xDrawing);
    // Temporary fix. Planning to change system to no longer require evenly sized lines.
      if (char === "") {
      return " ";
    }
    return char;
  }

  let idSet_ = {};
  this.setIds = function(idSet) {
    idSet_ = idSet;
  }
}
