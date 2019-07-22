"use strict";
function Element(data) {
  let self = this;
  Layer.call(self, {
    boundingBoxDimens: data.boundingBoxDimens,
  });
  
  if (self.constructor === Element) {
    LOGGING.ERROR("Element is an abstract class. Do not instantiate directly.");
  }
  
  // TODO: Handle case where not included. 
  LOGGING.ASSERT(Vector2.isInteger(data.topLeftCoords), 
    "Layer constructor parameter data.topLeftCoords has non-integer coordinates.",
    "Value: ", data.topLeftCoords
  );
  let topLeftCoords = Vector2.copy(data.topLeftCoords);
  Object.defineProperty(this, "topLeftCoords", {
    value: topLeftCoords
  });
  
  // TODO: Validate priority to be a number. 
  let priority = data.priority || 0;
  Object.defineProperty(this, "priority", {
    value: priority
  });
}

Element.prototype = Object.create(Layer.prototype);
Element.prototype.constructor = Element;

Element.prototype.copy = function() {
  LOGGING.ERROR(
    "Layer prototype function getCharAt is abstract and should not be called"
  );
};

Element.prototype.setConfiguration = function() {
  // Intentionally do nothing.
}
