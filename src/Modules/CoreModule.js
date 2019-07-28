function CoreModule(data) {
  // TODO: Make sure data exists
  BaseModule.call(this, data.layerId, CoreModule.type);
  
  // TODO: Handle case where not included. 
  LOGGING.ASSERT(Vector2.isInteger(data.topLeftCoords), 
    "Layer constructor parameter data.topLeftCoords has non-integer coordinates.",
    "Value: ", data.topLeftCoords
  );
  let topLeftCoords = Vector2.copy(data.topLeftCoords);
  Object.defineProperty(this, "topLeftCoords", {
    get: function() {
      return topLeftCoords;
    },
    set: function(newCoords) {
      // TODO: Mark object as changed. 
      // TODO: Verify that newCoords is a Vector2. 
      topLeftCoords = newCoords;
    }
  });
  
  // TODO: Validate priority to be a number. 
  let priority = data.priority || 0;
  Object.defineProperty(this, "priority", {
    get: function() {
      return priority;
    },
    set: function(newPriority) {
      // TODO: Check value of newPriority
      priority = newPriority;
      // TODO: Mark this as changed. 
    }
  });
}

CoreModule.prototype = Object.create(BaseModule.prototype);
CoreModule.prototype.constructor = CoreModule;

Object.defineProperty(CoreModule, "type", {
  value: "CORE"
});


Object.defineProperty(BaseModule, CoreModule.type, {
  value: CoreModule.prototype.constructor
});

CoreModule.prototype.copy = function(newId) {
  // TODO: Verify newId
  return new CoreModule({
    layerId: newId,
    topLeftCoords: this.topLeftCoords,
    priority: this.priority
  });
}
