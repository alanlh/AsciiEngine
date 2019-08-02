function EventData(eventType, handlerKey) {
  // TODO: Make safe. 
  this.eventType = eventType;
  this.handlerKey = handlerKey;
  this.enabled = true;
  this.handlerMethod = undefined;
  this.attachedCells = new Set();
}

EventData.isEqual = function(e1, e2) {
  return e1.eventType == e2.eventType
    && e1.handlerKey == e2.handlerKey;
}
