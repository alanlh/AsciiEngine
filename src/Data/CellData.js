/**
  Wrapper around dom elements with some utility functions.
  Internal class of scene only. 
  
  cellReference: reference to the dom element
  coords: coordinates of the cell in the Scene.
*/
function CellData(domReference, coords) {
  // TODO: Object.define. 
  this.domElement = domReference;
  this.coords = Vector2.copy(coords);
  this.activeEvents = {};
}

CellData.prototype.addEventListener = function(eventType, handler) {
  // TODO: Make this safe.
  if (this.activeEvents[eventType]) {
    this.removeEventListener(eventType);
  }
  this.domElement.addEventListener(eventType, handler);
  this.activeEvents[eventType] = handler;
}

CellData.prototype.removeEventListener = function(eventType) {
  this.domElement.removeEventListener(eventType, this.activeEvents[eventType]);
  delete this.activeEvents[eventType];
}
