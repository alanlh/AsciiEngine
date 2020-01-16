function EventHandlerModule(data) {
  BaseModule.call(this, data.layerId, EventHandlerModule.type);
  
  // TODO: Verify layerId.
  Object.defineProperty(this, "layerId", {
    value: data.layerId
  });
    
  let _events = {};
  let _eventsPublic = {};
  Object.defineProperty(this, "handlers", {
    value: _eventsPublic
  });
  for (let eventKey in data.eventHandlers) {
    _events[eventKey] = data.eventHandlers[eventKey];
    Object.defineProperty(_eventsPublic, eventKey, {
      get: function() {
        return _events[eventKey];
      },
      // TODO: Should set exist? 
      set: function(newHandler) {
        // TODO: Verify handler to be string
        _events[eventKey] = newHandler;
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

EventHandlerModule.prototype = Object.create(BaseModule.prototype);
EventHandlerModule.prototype.constructor = EventHandlerModule;

Object.defineProperty(EventHandlerModule, "type", {
  value: "EVENTHANDLER"
});

Object.defineProperty(BaseModule, EventHandlerModule.type, {
  value: EventHandlerModule.prototype.constructor
});

EventHandlerModule.prototype.generateEventHandler = function(eventData) {
  let self = this;
  return function(e) {
    self.handlers[eventData.handlerKey](e, eventData.layerId);
  }
}

/**
  Attaches event handler referenced by eventData to cell. Calls cell's addEventListener function

  cell: CellData object
  eventData: eventData object
*/
EventHandlerModule.prototype.bindEvent = function(cell, eventData) {
  let handler = this.generateEventHandler(eventData);
  cell.addEventListener(eventData.eventType, handler);
  eventData.attachedCells.add(cell);
}

/**
  Removes event handler referenced by eventData to cell. Calls cell's removeEventListener function
*/
EventHandlerModule.prototype.unbindEvent = function(cell, eventData) {
  cell.removeEventListener(eventData.eventType);
  eventData.attachedCells.delete(cell);
}
