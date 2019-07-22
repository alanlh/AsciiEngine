"use strict";
function Scene(data) {
  LOGGING.PERFORMANCE.START("Scene.constructor", 1);
  LOGGING.ASSERT(data, "Scene constructor is missing paramter 'data'");
  LOGGING.ASSERT(data.divId, "Scene constructor paramter 'data' is missing mandatory field 'divId'");

  Layer.call(this, {boundingBoxDimens: data.boundingBoxDimens});
  
  if (this.boundingBoxDimens.x == 0 || this.boundingBoxDimens.y == 0) {
    LOGGING.WARN("Scene height or width is 0");
  }
  
  let _domContainer = document.getElementById(data.divId);
  // TODO: Make sure element exists. 

  LOGGING.ASSERT(_domContainer && (_domContainer.tagName === "PRE" || _domContainer.tagName ==="DIV"),
    "Cannot construct Scene: given DOM element not valid");

  // TODO: Clear any existing objects? 
  if (_domContainer.tagName === "DIV") {
    let child = document.createElement("pre");
    _domContainer.appendChild(child);
    _domContainer = child;
  }
  
  _domContainer.style.fontFamily = "Courier New";
  _domContainer.style.fontSize = "0.75em";
  
  // TODO: Merge these into one object? 
  let _domElementReferences = [];
  let _currentPixelData = [];
  for (let y = 0; y < this.boundingBoxDimens.y; y ++) {
    _domElementReferences.push([]);
    _currentPixelData.push([]);
    let rowDomElement = document.createElement("div");
    rowDomElement.classList.add("scene-" + this.id + "-row");
    for (let x = 0; x < this.boundingBoxDimens.x; x++) {
      let cell = document.createElement("span");
      let text = document.createTextNode(" ");
      cell.appendChild(text);
      cell.classList.add("scene-" + this.id + "-cell")
      cell.classList.add("scene-" + this.id + "-row-" + y);
      cell.classList.add("scene-" + this.id + "-column-" + x);
      cell.classList.add("scene-" + this.id + "-" + y + "-" + x);
      
      rowDomElement.append(cell);
      _domElementReferences[y].push(cell);
      _currentPixelData[y].push(new PixelData());
    }
    _domContainer.append(rowDomElement);
  }
    
  this.module = new EventHandlerModule({
    layerId: this.id,
    eventHandlers: data.eventHandlers
  });
  
  let _elementData = {};
  let _idTags = {};
  let _classMembers = {};
  
  this.addElement = function(classSet, element) {
    LOGGING.PERFORMANCE.START("Scene.addElement", 1);
    // TODO: Validate Inputs
    if (typeof classSet === "string") {
      classSet = classSet.split(" ");
      classSet = new Set(classSet);
    } else if (classSet instanceof Array) {
      classSet = new Set(classSet);
    } else if (!(classSet instanceof Set)) {
      LOGGING.WARN("Scene method addElement parameter 'classSet' is not a string, Array, or Set");
    }
    // Always use a copy of the element. 
    let internalElement = element.copy();
    internalElement.module = new CoreModule({
      layerId: internalElement.id,
      topLeftCoords: internalElement.topLeftCoords,
      priority: internalElement.priority
    });
    _elementData[internalElement.id] = internalElement;
    _idTags[internalElement.id] = classSet;
    
    for (let className of classSet) {
      if (!(className in _classMembers)) {
        _classMembers[className] = new Set();
      }
      _classMembers[className].add(internalElement.id);
    }
    LOGGING.DEBUG(
      "Scene.addElement added element with id: ", internalElement.id, " ",
      "and class names: ", classSet
    )
    LOGGING.PERFORMANCE.STOP("Scene.addElement");
    return internalElement.id;
  }
  
  let filterElements = function(classSet) {
    LOGGING.PERFORMANCE.START("Scene.filterElements", 1);
    if (typeof classSet === "string") {
      classSet = classSet.split(" ");
      if (classSet.length == 1) {
        if (classSet[0] in _elementData) {
          // TODO: WHAT DOES THIS MEAN????????????
          // Checking for ID? 
          LOGGING.DEBUG("Scene.filterElements found one class with ids: ", classSet);
          LOGGING.PERFORMANCE.STOP("Scene.filterElements");
          return new Set(classSet);
        }
      }
      classSet = new Set(classSet);
    } else if (classSet instanceof Array) {
      classSet = new Set(classSet);
    }
    
    for (let className of classSet) {
      // TODO: Any other cases that should be handled? Check if string in the first place
      if (className.length == 0) {
        classSet.delete(className);
      }
    }
    
    let candidates = new Set();
    let filtered = new Set();
    for (let className of classSet) {
      if (className in _idTags) {
        let singleElementSet = new Set();
        singleElementSet.add(className);
        LOGGING.DEBUG("Scene.filterElements parameter classSet refers to an id: ", classSet);
        LOGGING.PERFORMANCE.STOP("Scene.filterElements");
        return singleElementSet;
      }
    }
    if (classSet.size == 0) {
      LOGGING.DEBUG(
        "filterElements: ",
        "No filter strings found. Returning all elements."
      );
      // TODO: Make safe?
      return new Set(Object.keys(_elementData));
    }

    // TODO: Find better algorithm? 
    for (let className of classSet) {
      if (!className in _classMembers) {
        LOGGING.WARN(
          "filterElements: ",
          "Filter string: ", className, " not found."
        );
      }
      if (candidates.size == 0) {
        // NOTE: This will never be empty after the initial iteration, because filtered.size == 0. 
        candidates = _classMembers[className];
        continue;
      }
      filtered = new Set();
      for (let id of candidates) {
        if (_classMembers[className].has(id)) {
          filtered.add(id);
        }
      }
      if (filtered.size == 0) {
        LOGGING.DEBUG("Scene.filterElements found no ids matching all class restrictions.");
        LOGGING.PERFORMANCE.STOP("Scene.filterElements");
        return new Set();
      }
      candidates = filtered;
    }
    LOGGING.DEBUG(
      "Scene.filterElements found the following ids: ", candidates, " ",
      "with classSet: ", classSet
    );
    LOGGING.PERFORMANCE.STOP("Scene.filterElements");
    return candidates;    
  }
  
  this.shiftElements = function(classSet, shift) {
    LOGGING.PERFORMANCE.START("Scene.shiftElements", 1);
    // TODO: Check value of shift
    let relevantElements = filterElements(classSet);
    for (let id of relevantElements) {
      let element = _elementData[id];
      element[CoreModule.type].topLeftCoords = Vector2.add(element[CoreModule.type].topLeftCoords, shift);
    }
    LOGGING.PERFORMANCE.STOP("Scene.shiftElements");
  }
  
  this.moveElements = function(classSet, newLocation) {
    LOGGING.PERFORMANCE.START("Scene.moveElements", 1);
    // TODO: Check value of newLocation
    let relevantElements = filterElements(classSet);
    for (let id of relevantElements) {
      let element = _elementData[id];
      element[CoreModule.type].topLeftCoords = Vector2.copy(newLocation);
    }
    LOGGING.PERFORMANCE.STOP("Scene.moveElements");
  }
  
  this.orderElements = function(classSet, newPriority) {
    LOGGING.PERFORMANCE.START("Scene.orderElements", 1);
    // TODO: Check value of newPriority
    let relevantElements = filterElements(classSet);
    for (let id of relevantElements) {
      let element = _elementData[id];
      element[CoreModule.type].priority = newPriority;
    }
    LOGGING.PERFORMANCE.STOP("Scene.orderElements");
  }
  
  this.configureElements = function(classSet, configuration) {
    LOGGING.PERFORMANCE.START("Scene.configureElements", 1);
    // TODO: Check value of configuration
    // TODO: Change setConfiguration to return true if something changed, or false if nothing was changed. 
    // Log if returned false. 
    let relevantElements = filterElements(classSet);
    for (let id of relevantElements) {
      let element = _elementData[id];
      element.setConfiguration(configuration);
    }
    LOGGING.PERFORMANCE.STOP("Scene.configureElements");
  }
  
  this.render = function() {
    LOGGING.PERFORMANCE.START("Scene.render", 0);
    
    for (let y = 0; y < this.boundingBoxDimens.y; y++) {
      for (let x = 0; x < this.boundingBoxDimens.x; x++) {
        let newPixelData = getUpdatedCell(new Vector2(x, y));
        LOGGING.PERFORMANCE.START("Scene.render: CELL", 2);
        if (PixelData.isEqual(newPixelData, _currentPixelData[y][x])) {
          // If nothing changed, don't set anything.
        } else {
          let cell = _domElementReferences[y][x];
          cell.innerHTML = newPixelData.char;
          cell.style.color = newPixelData.formatting.textColor;
          cell.style.backgroundColor = newPixelData.formatting.backgroundColor;
          cell.style.fontWeight = newPixelData.formatting.fontWeight;
          cell.style.fontStyle = newPixelData.formatting.fontStyle;
          cell.style.textDecoration = newPixelData.formatting.textDecoration;
          
          let eventHandlerModule = this[EventHandlerModule.type];
          for (let eventType in _currentPixelData[y][x].events) {
            let oldEventData = _currentPixelData[y][x].events[eventType];
            if (oldEventData.active
              && oldEventData.eventType == newPixelData.events.eventType
              && oldEventData.layerId == newPixelData.events.layerId
              && oldEventData.handlerKey == newPixelData.events[eventType].handlerKey
              && newPixelData.event[eventType].enabled) {
              // If they belong to the same element, then don't change.
              // Cannot check newPixelData.id, since the event may have originated from a different layer.
              
            } else {
              // There might be other cases where the handler could be reused, but being safe for now. 
              cell.removeEventListener(eventType, oldEventData.handler);
              oldEventData.active = false;
            }
          }
          
          for (let eventType in newPixelData.events) {
            let eventData = newPixelData.events[eventType];
            if (newPixelData.events[eventType].enabled && !newPixelData.events[eventType].active) {
              let handler = generateEventHandler(eventHandlerModule[newPixelData.handlerKey], newPixelData.events.layerId);
              cell.addEventListener(eventType, handler);
              newPixelData.events[eventType].handler = handler;
              newPixelData.events[eventType].active = true;
            }
          }
          
          _currentPixelData[y][x] = newPixelData;
        }
        LOGGING.PERFORMANCE.STOP("Scene.render: CELL");
      }
    }
    
    LOGGING.PERFORMANCE.STOP("Scene.render");
  }
  
  let getUpdatedCell = function(coord) {
    LOGGING.PERFORMANCE.START("Scene.getUpdatedCell", 2);
    
    let topPixelData = new PixelData();
    let topPriority = Infinity;
    for (let id in _elementData) {
      let element = _elementData[id];
      if (!coord.inBoundingBox(element[CoreModule.type].topLeftCoords, element.boundingBoxDimens)) {
        continue;
      }
      
      let priority = element[CoreModule.type].priority;
      if (priority > topPriority) {
        continue;
      }
      
      let pixelData = element.getPixelDataAt(Vector2.subtract(coord, element[CoreModule.type].topLeftCoords));
      if (pixelData.isTransparent()) {
        continue;
      }
      topPixelData = pixelData;
      topPriority = priority;
    }
    
    LOGGING.DEBUG_VERBOSE(
      "Scene.getUpdatedCell at coords: ", coord, " ",
      "found: ", topPixelData
    );
    LOGGING.PERFORMANCE.STOP("Scene.getUpdatedCell");
    return topPixelData;
  }
  
  let generateEventHandler = function(handler, layerId) {
    return function(e) {
      handler(e, layerId);
    }
  }
  LOGGING.PERFORMANCE.STOP("Scene.constructor");
}

Scene.prototype = Object.create(Layer.prototype);
Scene.prototype.constructor = Scene;
