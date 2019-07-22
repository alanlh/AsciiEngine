function EventHandlerModule(data) {
  BaseModule.call(this, data.layerId, EventHandlerModule.type);
  
  // TODO: Verify layerId.
  Object.defineProperty(this, "layerId", {
    value: data.layerId
  });
  
  let _events = {};
  Object.defineProperty(this, "events", {
    value: Object.keys(_events)
  })
  for (let eventKey in data.eventHandlers) {
    _events[eventKey] = data.eventHandlers[eventKey];
    Object.defineProperty(this, eventKey, {
      get: function() {
        return _events[eventType];
      },
      // TODO: Should set exist? 
      set: function(newHandler) {
        // TODO: Verify handler to be string
        _events[eventKey] = newHandler;
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

EventHandlerModule.prototype = Object.create(BaseModule.prototype);
EventHandlerModule.prototype.constructor = EventHandlerModule;

Object.defineProperty(EventHandlerModule, "type", {
  value: "EVENTHANDLER"
});
