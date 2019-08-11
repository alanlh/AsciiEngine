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
  const _formattingSettings = {};
  if (data.formatting) {
    for (let key in data.formatting.properties) {
      Object.defineProperty(_formattingSettings, key, {
        value: data.formatting.properties[key],
        enumerable: true,
      });
    }
  }
  
  Object.defineProperty(this, "formatting", {
    value: _formattingSettings
  });

  Object.defineProperty(this, "baseFormattingModule", {
    value: data.formatting || FormattingModule.EmptyModule
  })
  
  self.pushFormattingModule = function(newFormattingModule) {
    if (!newFormattingModule) {
      // TODO: Verify to be FormattingModule object.
      return;
    }
    for (let key in newFormattingModule.properties) {
      // TODO: Better way of handling this? 
      if (!(key in _formattingSettings)) {
        // Only push if the field has not already been specified. 
        Object.defineProperty(_formattingSettings, key, {
          value: newFormattingModule.properties[key],
          enumerable: true,
        });
      }
    }
  }
  
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
  Object.defineProperty(this, "events", {
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

  Object.defineProperty(this, "id", {
    value: data.id
  });
}

PixelData.Empty = new PixelData();
PixelData.Empty.pushEventModule = function() {};
PixelData.Empty.pushFormattingModule = function() {};
// PixelData.Empty.isTransparent = function() {return true;};
Object.freeze(PixelData.Empty);

PixelData.prototype.isTransparent = function() {
  return !this.markedAsOpaque && this.char === ' ' && this.baseFormattingModule.hasInvisibleFormatting();
}

PixelData.isEqual = function(p1, p2) {
  // TODO: Modules shouldn't have isEqual methods, since pixelData contains multiple modules. 
  return p1.char === p2.char
    && FormattingModule.isEqual(p1.formatting, p2.formatting)
    && EventModule.isEqual(p1.events, p2.events)
    && p1.id == p2.id;
}
