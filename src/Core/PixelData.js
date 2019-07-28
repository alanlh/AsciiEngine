"use strict";
function PixelData(data) {
  let self = this;
  data = data || {};
  
  Object.defineProperty(this, "char", {
    value: data.char || ' '
  });
  
  // TODO: Verify that these are valid objects. 
  // If data.formatting is a FormattingSelection object, then keep.
  // Otherwise, create a new FormattingSelection object around it.
  // Same goes for events. 
  Object.defineProperty(this, "formatting", {
    value: data.formatting || new FormattingSelection()
  });
  
  const _eventDataReferences = {};
  // TODO: Is this used? Maybe only need _eventDataReferences
  let _eventModules = [];
  // Push initial event data, if any. 
  if (data.eventModule) {
    // TODO: Need better check. 
    _eventModules.push(data.eventModule);
    for (let key in data.eventModule.events) {
      Object.defineProperty(_eventDataReferences, eventData.handlerKey, {
        value: eventData,
        enumerable: true
      });
    }
  }
    
  Object.defineProperty(this, "events", {
    value: _eventDataReferences
  });
    
  self.pushEventModule = function(newModule) {
    // TODO: Verify module.
    if (!newModule) {
      return;
    }
    // TODO: Remove? Events may not be initialized?
    LOGGING.ASSERT(newModule, "PixelData.pushEventModule parameter newModule is false: ", newModule);
    _eventModules.push(newModule);
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
      
  // TODO: Check data.id is valid. 
  Object.defineProperty(this, "id", {
    value: data.id
  });
}

PixelData.prototype.isTransparent = function() {
  return this.char === ' ' && !this.formatting.hasVisibleFormatting();
}

PixelData.isEqual = function(p1, p2) {
  return p1.char === p2.char
    && FormattingSelection.isEqual(p1.formatting, p2.formatting)
    && EventModule.isEqual(p1.events, p2.events)
    && p1.id == p2.id;
}
