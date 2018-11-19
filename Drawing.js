// Creates a drawing with the given set
function Drawing(textStr, coords, dimens) {
  let text_ = textStr;
  let width_ = 0; // TODO
  let height_ = 0; // TODO

  // Coordinate within the scene.
  let x_ = 0;
  let y_ = 0;

  if (dimens == undefined) {
    for (let i = 0; i < text_.length; i ++) {
      if (text_.charAt(i) === '\n') {
        if (width_ == 0) {
          width_ = i;
        } else {
          console.assert(i % (width_ + 1) == width_, "Invalid Drawing: Uneven line sizes");
        }
      } else if (width_ > 0) {
        console.assert(i % (width_ + 1) != width_, "Invalid Drawing: Uneven line sizes");
      }
    }
    if (width_ == 0) {
      width_ = text_.length;
    }
    height_ = Math.ceil(text_.length / (width_ + 1));
  } else {
    console.assert(width in dimens && height in dimens, "width and/or height not defined in dimens");
    width_ = dimens.width;
    height_ = dimens.height;
  }

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
    console.assert(xDrawing < width_ && xDrawing >= 0, "Drawing getChar Invalid x-Index");
    console.assert(yDrawing < height_ && yDrawing >= 0, "Drawing getChar Invalid y-Index");
    return text_.charAt(yDrawing * (width_ + 1) + xDrawing);
  }

  let idSet_ = {};
  this.setIds = function(idSet) {
    idSet_ = idSet;
  }
}
