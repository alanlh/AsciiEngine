"use strict";
function BaseLayer(data) {
  let self = this;
  Element.call(self, {
    boundingBoxDimens: data.boundingBoxDimens,
    topLeftCoords: data.topLeftCoords,
    priority: data.priority,
    events: data.events
  });
  
  if (self.constructor == BaseLayer) {
    LOGGING.ERROR("BaseLayer is an abstract class. Do not instantiate directly.");
  }  
}

BaseLayer.prototype = Object.create(Element.prototype);
BaseLayer.prototype.constructor = BaseLayer;
