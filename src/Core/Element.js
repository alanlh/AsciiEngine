"use strict";
function Element(data) {
  let self = this;
  Layer.call(self, {
    boundingBoxDimens: data.boundingBoxDimens,
  });
  
  if (self.constructor === Element) {
    LOGGING.ERROR("Element is an abstract class. Do not instantiate directly.");
  }
  
  let modules = {};
  Object.defineProperty(self, "module", {
    set: function(newModule) {
      if (newModule.type in modules) {
        LOGGING.WARN("Replacing module of type ", newModule.type, " in layer: ", this.id);
        return;
      }
      modules[newModule.type] = newModule;
      Object.defineProperty(self, newModule.type, {
        get: function() {
          if (newModule.type in modules) {
            return modules[newModule.type];
          }
          return BaseModule[newModule.type];
        }
      });
    }
  });
  
  // TODO: Is there a better way?
  LOGGING.ASSERT(!("topLeftCoords" in data) || Vector2.isInteger(data.topLeftCoords), 
    "Layer constructor parameter data.topLeftCoords has non-integer coordinates.",
    "Value: ", data.topLeftCoords
  );
  let topLeftCoords = data.topLeftCoords ? Vector2.copy(data.topLeftCoords) : new Vector2(0, 0);
  Object.defineProperty(this, "topLeftCoords", {
    value: topLeftCoords
  });
  
  // TODO: Validate priority to be a number. 
  let priority = data.priority || 0;
  Object.defineProperty(this, "priority", {
    value: priority
  });
  
  Object.defineProperty(this, "formatting", {
    value: {}
  });
  for (let property in data.formatting) {
    self.formatting[property] = data.formatting[property]
  }
  Object.freeze(self.formatting);
  
  Object.defineProperty(this, "events", {
    value: {}
  });
  // Create copy. 
  for (let eventType in data.events) {
    self.events[eventType] = data.events[eventType];
  }
  // Prevent changes. To access current state of events, use the event module. 
  Object.freeze(this.events);
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

// Overriden by Elements that have children.
Element.prototype.initializeModule = function(moduleType) {
  this.module = new BaseModule[moduleType](this);
}
