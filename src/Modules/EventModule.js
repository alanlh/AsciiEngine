"use strict";
function EventModule(data) {
  // TODO: Make sure eventType and handlerKey are defined.
  // TODO: Make sure layerId is defined. 
  BaseModule.call(this, data.layerId, EventModule.type);
  
  let _events = {};
  Object.defineProperty(this, "events", {
    value: Object.keys(_events)
  })
  for (let eventType in data.events) {
    _events[eventType] = new EventData(eventType, data.events[eventType]);
    Object.defineProperty(this, eventType, {
      get: function() {
        return _events[eventType];
      },
      // TODO: Should set exist? 
      set: function(newHandler) {
        // TODO: Verify handler to be string
        _events[eventType] = new EventData(eventType, data.events[eventType]);
      }
    });
  }
  
  this.copy = function(newId) {
    // TODO: Verify newId
    let events = {};
    for (eventType in _events) {
      events[eventType] = _events[eventType].handler;
    }
    return new EventModule({
      layerId: newId,
      events: _events
    })
  }
}

EventModule.prototype = Object.create(BaseModule.prototype);
EventModule.prototype.constructor = EventModule;

Object.defineProperty(EventModule, "type", {
  value: "EVENT"
});

EventModule.EmptyModule = function() {
  return new EventModule("EMPTY");
}
Object.defineProperty(BaseModule, EventModule.type, {
  get: function() {
    // TODO: Handle empty case. 
    return EventModule.EmptyModule();
  }
});

EventModule.prototype.addEvent = function(type, key) {
  // TODO: Implement? 
}

EventModule.prototype.removeEvent = function(type) {
  // TODO: Implement? 
  if (!(type in this.events)) {
    LOGGING.WARN("Attempting to remove non-existent event from EventModule.");
  }
}

EventModule.isEqual = function(e1, e2) {
  for (eventType in e1.events) {
    if (!(eventType in e2.events) || !EventData.isEqual(e1[eventType], e2[eventType])) {
      return false;
    }
  }
  for (eventType in e2.events) {
    if (!(eventType in e1.events) || !EventData.isEqual(e1[eventType], e2[eventType])) {
      return false;
    }
  }
  return true;
}

// A simple container class to make life easier. 
function EventData(eventType, handlerKey) {
  // TODO: Make safe. 
  this.eventType = eventType;
  this.handlerKey = handlerKey;
  this.active = false;
  this.enabled = true;
}

EventData.isEqual = function(e1, e2) {
  return e1.eventType == e2.eventType
    && e1.handlerKey == e2.handlerKey;
}
