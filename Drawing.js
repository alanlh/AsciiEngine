// Creates a drawing with the given set
function Drawing(textStr, dimens, coords) {
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
          console.assert(i % (width_ + 1) == 0, "Invalid Drawing: Uneven line sizes");
        }
      } else if (width_ > 0) {
        console.assert(i % (width_ + 1) != 0, "Invalid Drawing: Uneven line sizes");
      }
    }
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

  this.getLoc() = function() {
    return {x: x_, y: y_};
  }

  this.setLoc(newLoc) = function() {
    // Validate newLoc; 
    x_ = newLoc.x;
    y_ = newLoc.y;
  }

  let priority_ = 0;
  this.setPriority = function(newPriority) {
    priority_ = newPriority;
  }
  let textFormat_ = {};
  this.clearFormatting = function() {
    // TODO: Store old formatting, so that only the changes need to be re-rendered
    textFormat_ = {};
  }

  this.render = function() {
    // TODO??? Should this be here?
    // Parameters: x,y?
  }


  this.getCharValScene = function(xScene, yScene) {
    return this.getCharValDrawing(xScene - x_, yScene - y_);
  }

  this.getCharValDrawing = function(xDrawing, yDrawing) {
    console.assert(xScene < width_ && xScene >= 0, "Drawing getChar Invalid x-Index");
    console.assert(yScene < height_ && yScene >= 0, "Drawing getChar Invalid y-Index");
    return this.text.charAt(yScene * (height_ + 1) + xScene);
  }

  let idSet_ = {};
  this.setIds(idSet) {
    idSet_ = idSet;
  }
}
