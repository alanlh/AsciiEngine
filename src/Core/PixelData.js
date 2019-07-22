"use strict";
function PixelData(data) {
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
  
  Object.defineProperty(this, "events", {
    value: data.events || EventModule.EmptyModule()
  });
  
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
