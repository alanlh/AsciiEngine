"use strict";
function PixelData(data) {
  let self = this;
  Object.defineProperty(self, "empty", {
    value: (!data)
  });
  
  data = data || {};

  Object.defineProperty(self, "text", {
    value: data.text || " "
  });
  
  let _activeLength = 0;
  self.incrementActiveLength = function() {
    if (self.canBeExtended) {
      _activeLength ++;
      return true;
    }
    return false;
  }
  
  Object.defineProperty(self, "activeLength", {
    get: function() {
      return _activeLength;
    }
  });
  // TODO: Keep a 'changed' variable. If 'changed', use substring. Otherwise return previous value. 
  Object.defineProperty(self, "activeString", {
    get: function() {
      return self.text.substring(0, _activeLength);
    }
  });
  Object.defineProperty(self, "canBeExtended", {
    get: function() {
      return _activeLength < self.text.length;
    }
  });
  
  if (!self.empty) {
    LOGGING.ASSERT(self.text.length > 0, "PixelData parameter text has length 0", self.text);
  }
  
  Object.defineProperty(self, "formatting", {
    value: {}
  });
  
  if (data.formatting) {
    for (let key in data.formatting.properties) {
      Object.defineProperty(self.formatting, key, {
        value: data.formatting.properties[key],
        enumerable: true
      });
    }
  }

  Object.defineProperty(this, "baseFormattingModule", {
    value: data.formatting || FormattingModule.EmptyModule
  });

  self.markedAsOpaque = false;
  if ("opaque" in data) {
    self.markedAsOpaque = data.opaque;
  }
  
  const _eventDataReferences = {};
  // Push initial event data, if any. 
  if (data.eventModule) {
    // TODO: Need better check. 
    for (let key in data.eventModule.events) {
      Object.defineProperty(_eventDataReferences, eventData.handlerKey, {
        value: eventData,
        enumerable: true
      });
    }
  }
  
  // TODO: Add baseEventsModule property instead?
  Object.defineProperty(self, "events", {
    value: _eventDataReferences
  });
    
  self.pushEventModule = function(newModule) {
    // TODO: Verify module.
    if (!newModule) {
      return;
    }
    LOGGING.ASSERT(newModule, "PixelData.pushEventModule parameter newModule is false: ", newModule);
    // TODO: Use Object.defineProperty on this.events for each new event.
    for (let key in newModule.events) {
      let eventData = newModule.events[key];
      if (!(eventData.eventType in _eventDataReferences)) {
        _eventDataReferences[eventData.eventType] = eventData;
        // These should be using references, i.e. changes to the eventData should be reflected in original Element object.
        Object.defineProperty(_eventDataReferences, eventData.eventType, {
          value: eventData,
          enumerable: true
        });
      }
    }
  }
  
  let _eventHandlers = {};
  
  Object.defineProperty(self, "eventHandlers", {
    get: function() {
      return _eventHandlers;
    }
  })
  
  self.initializeEventHandlers = function(eventHandlers) {
    // TODO: Verify that eventHandlers is an event handler module.
    for (let eventType in self.events) {
      if (self.events[eventType].handlerKey in eventHandlers.handlers) {
        let handler = eventHandlers.generateEventHandler(self.events[eventType]);
        _eventHandlers[eventType] = handler;
      } else {
        LOGGING.WARN("Event type: ", eventType, " not in event handlers.");
      }
    }
  }

  Object.defineProperty(self, "id", {
    value: data.id
  });
}

PixelData.Empty = new PixelData();
PixelData.Empty.pushEventModule = function() {};
PixelData.Empty.pushFormattingModule = function() {};
PixelData.Empty.isTransparent = function() {
  return true;
};
LOGGING.ASSERT(PixelData.Empty.incrementActiveLength(),
  "PixelData.Empty failed to intialize properly. incrementActiveLength returned false"
);
Object.freeze(PixelData.Empty);

PixelData.prototype.pushFormattingData = function(newFormattingData) {
  if (!newFormattingData) {
    // TODO: Verify to be FormattingData object.
    return;
  }
  for (let key in newFormattingData.properties) {
    Object.defineProperty(this.formatting, key, {
      value: newFormattingData.properties[key],
      enumerable: true,
    });
  }
}

PixelData.prototype.isTransparent = function() {
  return false;
}

PixelData.isEqual = function(p1, p2) {
  // TODO: Does this method make sense any more?
  return p1.text === p2.text
    && PixelData.isStyleEqual(p1, p2)
    && p1.id == p2.id;
}

PixelData.isStyleEqual = function(p1, p2) {
  // TODO: Modules shouldn't have isEqual methods, since pixelData contains multiple modules. 
  return FormattingModule.isEqual(p1.formatting, p2.formatting)
      && EventModule.isEqual(p1.events, p2.events);
}

// TODO: Place this somewhere more appropriate. 
// Inconsequential property which is used by Scene.render() for optimization. 
PixelData.prototype.priority = Infinity;
