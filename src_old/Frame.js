/**
 * A frame represents a single image
 */
function Frame(layers, options) {
  "use strict"
  let thisFrame = this;
  // TODO: Check that layers is an array of FrameLayer objects
  let layers_ = [];
  for (let i = 0; i < layers.length; i ++) {
    layers_.push(layers[i].copy());
  }
  // // TODO: Check that offsets is an array of coordinates of the same length as layers
  let count_ = layers_.length;


  // TODO: Compute metadata
  let width_ = 0;
  let height_ = 1;

  for (let i = 0; i < layers_.length; i ++) {
    let layer = layers_[i];
    width_ = Math.max(width_, layer.getCoords().x + layer.getDimens().width);
    height_ = Math.max(height_, layer.getCoords().y + layer.getDimens().height);
  }
  
  options = options || {};
  
  let events_ = options.events || {};
  
  this.getEvents = function() {
    return events_;
  }

  this.copy = function() {
    // TODO: Also handle pass in options. 
    return new Frame(layers_, {
      events: events_
    });
  }

  // TODO:
  this.getDimens = function() {
    return {width: width_, height: height_};
  }

  this.getCharVal = function(x, y) {
    for (let i = count_ - 1; i >= 0; i --) {
      let charData = layers_[i].getCharPixel(x, y);
      if (!(charData.isTransparent())) {
        charData.addHigherLevelEventListeners(events_);
        charData.setFrameReference(thisFrame);
        return charData;
      }
    }
    return new CharPixel();
  }
}
