function BaseModule(layerId, type) {
  if (self.constructor === BaseModule) {
    LOGGING.ERROR("BaseModule is an abstract class. Do not instantiate directly.");
    LOGGING.DEBUG("BaseModule constructor: ", self.constructor);
  }
  
  // TODO: If layerId does not exist, mark as valid. 
  
  Object.defineProperty(this, "layerId", {
    value: layerId
  });
  
  Object.defineProperty(this, "type", {
    value: type
  });
}

BaseModule.EmptyModule = function() {
  LOGGING.ERROR("BaseModule.EmptyModule is abstract and should not be called directly");
}

BaseModule.prototype.copy = function(newId) {
  LOGGING.ERROR("Attempting to create copy using the BaseModule abstract definition.");
}
