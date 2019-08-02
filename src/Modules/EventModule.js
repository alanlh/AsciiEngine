"use strict";
function EventModule(data) {
  // TODO: Make sure eventType and handlerKey are defined.
  // TODO: Make sure layerId is defined. 
  BaseModule.call(this, data.layerId, EventModule.type);
  
  const _events = {};
  const _eventsPublic = {};
  Object.defineProperty(this, "events", {
    value: _eventsPublic
  })
  for (let eventType in data.events) {
    _events[eventType] = new EventData(eventType, data.events[eventType]);
    Object.defineProperty(_eventsPublic, eventType, {
      // TODO: Is a setter needed? 
      get: function() {
        return _events[eventType];
      },
      set: function(newEventData) {
        // TODO: Verify new EventData
        _events[eventType] = newEventData;
      },
      enumerable: true
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
  return new EventModule({});
}

Object.defineProperty(BaseModule, EventModule.type, {
  value: EventModule.prototype.constructor
});

// TODO: Implement? 
EventModule.prototype.addEvent = function(type, key) {
  LOGGING.WARN("EventModule.addEvent is not implemented");
}

EventModule.prototype.removeEvent = function(type) {
  // TODO: Implement? 
  LOGGING.WARN("EventModule.removeEvent is not implemented");
  if (!(type in this.events)) {
    LOGGING.WARN("Attempting to remove non-existent event from EventModule.");
  }
}

EventModule.isEqual = function(e1, e2) {
  for (let eventType in e1) {
    if (!(eventType in e2) || !EventData.isEqual(e1[eventType], e2[eventType])) {
      return false;
    }
  }
  for (let eventType in e2) {
    if (!(eventType in e1) || !EventData.isEqual(e1[eventType], e2[eventType])) {
      return false;
    }
  }
  return true;
}
