"use strict";
function Layer(data) {
  let self = this;
  if (self.constructor === Layer) {
    LOGGING.ERROR("Layer is an abstract class. Do not instantiate directly.");
  }
  
  // TODO: Check if data is an object. 
  LOGGING.ASSERT(data,
    "Layer parameter data is not an object", 
    "Value: ", data
  )
  
  LOGGING.ASSERT(Vector2.isInteger(data.boundingBoxDimens), 
    "Layer constructor parameter data.boundingBoxDimens has non-integer coordinates.",
    "Value: ", data.boundingBoxDimens
  );
  Object.defineProperty(this, "boundingBoxDimens", {
    value: Vector2.copy(data.boundingBoxDimens)
  });
  
  Object.defineProperty(this, "id", {
    value: Layer.generateId()
  });
}

Layer.prototype.getCharAt = function() {
  LOGGING.ERROR(
    "Layer prototype function getCharAt is abstract and should not be called"
  );
};

Layer.prototype.getPixelDataAt = function() {
  LOGGING.ERROR(
    "Layer prototype function getPixelDataAt is abstract and should not be called"
  );
};

Layer.generateId = (function() {
  let index = 1 + Math.floor(Math.random() * 1024);
  return function() {
    index += 1 + ((index * index) % 5);
    return "AE_" + index ++;
  }
})();
// TODO: Add verifyId method to contain list of all created Ids. 
