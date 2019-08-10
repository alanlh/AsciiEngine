/**
  Wrapper around dom elements with some utility functions.
  Internal class of scene only. 
  
  cellReference: reference to the dom element
  coords: coordinates of the cell in the Scene.
*/
function CellData(domReference, coords) {
  this.domElement = domReference;
  LOGGING.ASSERT(Vector2.verifyInteger(coords) && Vector2.isInteger(coords),
    "CellData parameter coords is not Vector2-like or does not contain integer values: ", coords
  );
  this.coords = Vector2.copy(coords);
  this.activeEvents = {};

  Object.seal(this);
}

CellData.prototype.addEventListener = function(eventType, handler) {
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
