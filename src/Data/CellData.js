function CellData() {
  this.domElement = undefined;
  this.updatedPixelData = [];
  this.activeText = "";
  this.activeFormatting = {};
  this.activeBaseId = undefined;
  this.activeEventKeys = {};
  this.activeEventHandlers = {};
  Object.seal(this);
}

CellData.prototype.bindDomElement = function(domElement) {
  this.domElement = domElement;
}

CellData.prototype.eraseDomElement = function(parent) {
  // TODO: Clear remaining data. 
  if (this.hasActiveDomElement) {
    parent.removeChild(this.domElement);
    this.domElement = undefined;
  }
}

Object.defineProperty(CellData.prototype, "hasActiveDomElement", {
  get: function() {
    return this.domElement !== undefined;
  }
});

CellData.prototype.pushPixelData = function(pixelData) {
  // TODO: Verify that they have the same formatting/events.
  // TODO: Only push their text?
  this.updatedPixelData.push(pixelData);
}

CellData.prototype.clearPixelData = function() {
  this.updatedPixelData = [];
}

CellData.prototype.render = function() {
  this.domElement.textContent = CellData.getCombinedString(this.updatedPixelData);

  let cellStyle = this.domElement.style;
  let newFormatting = this.updatedPixelData[0].formatting;
  for (let styleKey in this.activeFormatting) {
    if (!(styleKey in newFormatting)) {
      cellStyle[styleKey] = FormattingModule.DEFAULTS[styleKey] || "";
      delete this.activeFormatting[styleKey];
    }
  }
  for (let styleKey in newFormatting) {
    cellStyle[styleKey] = newFormatting[styleKey];
    this.activeFormatting[styleKey] = newFormatting[styleKey];
  }
  
  let newEventKeys = this.updatedPixelData[0].events;
  let newEventHandlers = this.updatedPixelData[0].eventHandlers;
  if (this.activeBaseId !== this.updatedPixelData[0].id) {
    // TODO: Are there any more restrictive conditions?
    // Different object, so need to remove all current event listeners.
    LOGGING.DEBUG("CellData.renderDomElement is encountering new id: ", 
      this.updatedPixelData[0].id, " compared to previous id: ", this.activeBaseId, ". ",
      "Events might be removed or added."
    );
    for (let eventType in this.activeEventKeys) {
      LOGGING.DEBUG("CellData.renderDomElement for old id: ", this.activeBaseId, " .",
        "Removing event type: ", eventType, " with handler key: ", this.activeEventKeys[eventType]
      );
      this.domElement.removeEventListener(eventType, this.activeEventHandlers[eventType]);
      delete this.activeEventKeys[eventType];
      delete this.activeEventHandlers[eventType];
    }
    // TODO: Assert activeEventKeys/activeEventHandlers are empty.
    for (let eventType in newEventKeys) {
      LOGGING.DEBUG("CellData.renderDomElement for new id: ", this.updatedPixelData[0].id, " .",
        "Adding event type: ", eventType, " with handler key: ", this.activeEventKeys[eventType]
      );
      this.domElement.addEventListener(eventType, newEventHandlers[eventType]);
      this.activeEventKeys[eventType] = newEventKeys[eventType];
      this.activeEventHandlers[eventType] = newEventHandlers[eventType];
    }
    this.activeBaseId = this.updatedPixelData[0].id;
  } else {
    // TODO: They should be the same, but don't take the risk for right now.
    LOGGING.DEBUG("CellData.renderDomElement is encountering the same id: ", this.activeBaseId, ". ",
      "There should be no removing or adding of event listeners."
    );
    for (let eventType in this.activeEventKeys) {
      if (this.activeEventKeys[eventType] !== newEventKeys[eventType]) {
        LOGGING.WARN(
          "Removing eventType: ", eventType, " with key: ", this.activeEventKeys[eventType],". ",
        );
        this.domElement.removeEventListener(eventType, this.activeEventHandlers[eventKey]);
        delete this.activeEventKeys[eventType];
        delete this.activeEventHandlers[eventType];
      }
    }
    for (let eventType in newEventKeys) {
      if (!(eventType in this.activeEventKeys)) {
        LOGGING.WARN(
          "Adding eventType: ", eventType, " with key: ", newEventHandlers[eventType],". ",
        );
        this.domElement.addEventListener(eventType, newEventHandlers[eventType]);
        this.activeEventKeys[eventType] = newEventKeys[eventType];
        this.activeEventHandlers[eventType] = newEventHandlers[eventType];
      }
    }
  }
  
  this.activeBaseId = this.updatedPixelData[0].id;
  
  this.updatedPixelData = [];
}

Object.freeze(CellData.prototype);

CellData.getCombinedString = function(pixelDataArr) {
  let currString = "";
  for (let i = 0; i < pixelDataArr.length; i ++) {
    currString += pixelDataArr[i].activeString;
  }
  return currString;
}

Object.freeze(CellData);
