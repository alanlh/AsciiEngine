/**
 * A frame represents a single image
 * Takes in a plaintext string, and three objects:
 */
function Frame(layers) {
  // TODO: Check that layers is an array of FrameLayer objects
  let layers_ = layers;
  // // TODO: Check that offsets is an array of coordinates of the same length as layers
  let count_ = layers_.length;


  // TODO: Compute metadata
  let width_ = 0;
  let height_ = 1;

  for (let i = 0; i < layers.length; i ++) {
    layer = layers_[i];
    width_ = Math.max(width_, layer.getCoords().x + layer.getDimens().width);
    height_ = Math.max(height_, layer.getCoords().y + layer.getDimens().height);
  }

  // TODO:
  this.getDimens = function() {
    return {width: width_, height: height_};
  }

  this.getCharVal = function(x, y) {
    for (let i = count_ - 1; i >= 0; i --) {
      let charData = layers_[i].getCharData(x, y);
      if (!(charData.isTransparent())) {
        return charData;
      }
    }
    return new CharPixel();
  }
}
