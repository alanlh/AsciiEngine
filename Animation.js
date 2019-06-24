/**
 * An animation includes one or more Frames
 * Takes in an array of frames, and an array of lengths.
**/
function Animation(frames, options) {
  // TODO: Add support for multiple keys pointing to same frame without extra memory.
  let thisAnimation = this;
  let frames_ = {};
  options = options || {};
  let currentKey_ = options.startKey;
  let defaultKey_ = options.defaultKey || options.startKey;
  for (key in frames) {
    console.assert(frames[key] instanceof Frame, frames[key]);
    frames_[key] = frames[key].copy();
    
    if (!(currentKey_ in frames_) || currentKey_ == undefined) {
      currentKey_ = key;
    }
    if (!(defaultKey_ in frames_) || defaultKey_ == undefined) {
      defaultKey_ = key;
    }
  }
  
  let events_ = options.events || {};
  
  this.getEvents = function() {
    return events_;
  }
  
  this.copy = function() {
    return new Animation(frames_, defaultKey_);
  }
  
  this.printDebug = function(title) {
    // TODO: Print list of keys in frames? 
    if (title) {
      console.log(title);
    }
    for (key in frames) {
      console.log(key);
    }
  }

  this.setDefaultFrame = function(newDefault) {
    // TODO: Handle bad input
    defaultKey_ = newDefault;
  }

  this.setOptions = function(newOptions) {
    console.debug("This function is deprecated as of v0.3.3");
    return 0;
  }

  // Set to be the maximum dimensions of any frame. For internal use only.
  let width_ = 0;
  let height_ = 1;

  for (key in frames_) {
    width_ = Math.max(width_, frames_[key].getDimens().width);
    height_ = Math.max(height_, frames_[key].getDimens().height);
  }

  let x_ = 0;
  let y_ = 0;

  this.addFrame = function(frame, iterationCount) {
    console.log("Note: Animation.addFrame is currently unsupported, and will fail as of v0.3.3");
    return 0;
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
    currentFrame = frames_[currentKey_];
    let charData = currentFrame.getCharVal(x, y);
    charData.addHigherLevelEventListeners(events_);
    charData.setAnimationReference(thisAnimation);
    return charData;
  }

  this.nextFrame = function() {
    console.warn("This function is now deprecated as of v0.3.3." +
      "Use setFrame instead.");
    return 0;
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
  
  this.setFrame = function(key) {
    if (!key || !(key in frames_)) {
      key = defaultKey_;
    }
    currentKey_ = key;
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
