/* Constructor for Animation object from an array of strings */
function createAnimationFromString(string) {

}

/* Constructor for Animation object from filename */
function createAnimationFromFile(filename) {

}

// Todo?
function createAnimationFromHtml(htmlString) {

}

/**
 * An animation includes one or more Frames
 * Takes in an array of frames, and an array of lengths.
**/
function Animation(frameArray, iterations, options) {
  if (!(frameArray instanceof Array)) {
    console.error("Animation paramter frameArray is not an Array: ", frameArray);
  }
  for (let i = 0; i < frameArray.length; i ++) {
    if (!(frameArray[i] instanceof Frame)) {
      console.error("Animation parameter frameArray contains non-Frame objects at index ", i, ": ", frameArray[i]);
    }
  }

  if (!(iterations instanceof Array)) {
    console.error("Animation parameter iterations is not an Array: ", iterations);
  }
  if (iterations.length !== frameArray.length) {
    console.error("Animation parameters frameArray and iterations do not have the same length. ",
      "frameArray length: ", frameArray.length, ". ",
      "iterations length: ", iterations.length, ". "
    )
  }
  for (let i = 0; i < iterations.length; i ++) {
    if (!Number.isInteger(iterations[i])) {
      console.error("Animation parameter iteration contains non-Integer values at index ", i, ": ", iterations[i]);
    }
  }

  let frames_ = frameArray;
  let iterationCounts_ = [0];
  for (let i = 0; i < frameArray.length; i ++) {
    iterationCounts_.push(iterationCounts_[i] + iterations[i]);
  }

  let iterationIndex_ = 0;
  let frameIndex_ = 0;

  // TODO: Set values according to input parameter
  let options_ = {
    loop: false,
    manualIterate: false // Useful for when the number of frames is low,
      //or when the animation rate is defined by another factor
  }

  this.setOptions = function(newOptions) {
    // TODO:
  }

  // Set to be the maximum dimensions of any frame. For internal use only.
  let width_ = 0;
  let height_ = 1;

  for (let i = 0; i < frames_.length; i ++) {
    width_ = Math.max(width_, frames_[i].getDimens().width);
    height_ = Math.max(height_, frames_[i].getDimens().height);
  }

  let x_ = 0;
  let y_ = 0;

  this.addFrame = function(frame, iterationCount) {
    console.log("Note: Animation.addFrame is currently unsupported.")
    console.assert(frame instanceof Frame, "addFrame parameter frame not Frame object");
    if (iterationCount === undefined) {
      iterationCount = 1;
    }
    console.assert(Number.isInteger(iterationCount), "addFrame parameter iterationCount not integer");
    if (Number.isInteger(iterationCount)) {
      console.assert(interationCount > 0, "addFrame parameter iterationCount is non-positive");
    }

    frames_.push(frame);
    iterationCounts_.push(iterationCount + iterationCounts_[iterationCounts_.length - 1]);
  }

  this.getCharValFrame = function(x, y) {
    currentFrame = frames_[frameIndex_];
    return currentFrame.getCharVal(x, y);
  }

  this.nextFrame = function() {
    iterationIndex_ ++;
    if (iterationIndex_ >= iterationCounts_[frameIndex_ + 1]) {
      if (frameIndex_ + 1 == frames_.length) {
        if (options_.loop) {
          frameIndex_ = 0;
          iterationIndex_ = 0;
        } else {
          iterationIndex_ --;
        }
      } else {
        frameIndex_ += 1;
      }
    }
  }

  let priority_ = 0;

  this.setPriority = function(newPriority) {
    console.assert(Number.isInteger(newPriority), "Animation setPriority parameter newPriority is not an integer");
    priority_ = newPriority;
  }

  this.getPriority = function() {
    return priority_;
  }

  this.setCoords = function(coords) {
    x_ = coords.x;
    y_ = coords.y;
  }

  this.getCoords = function() {
    return {x: x_, y: y_};
  }

  this.getDimens = function() {
    return {width: width_, height: height_};
  }

  this.getCharValScene = function(xScene, yScene) {
    return this.getCharValFrame(xScene - x_, yScene - y_);
  }

  let idSet_ = {};
  this.setIds = function(idSet) {
    idSet_ = idSet;
  }

  this.getIds = function() {
    return idSet_;
  }
}
