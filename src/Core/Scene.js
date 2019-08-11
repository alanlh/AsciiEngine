"use strict";
function Scene(data) {
  LOGGING.PERFORMANCE.START("Scene.constructor", 1);
  LOGGING.ASSERT(data, "Scene constructor is missing paramter 'data'");
  LOGGING.ASSERT(data.divId, "Scene constructor paramter 'data' is missing mandatory field 'divId'");

  Layer.call(this, {boundingBoxDimens: data.boundingBoxDimens});
  
  if (this.boundingBoxDimens.x == 0 || this.boundingBoxDimens.y == 0) {
    LOGGING.WARN("Scene height or width is 0");
  }
  
  let _camera = new CoreModule({
    topLeftCoords: Vector2.default()
  });
  
  let _domContainer = document.getElementById(data.divId);
  // Make sure element exists and is of appropriate type.
  LOGGING.ASSERT(_domContainer && (_domContainer.tagName === "PRE" || _domContainer.tagName ==="DIV"),
    "Cannot construct Scene: given DOM element not valid"
  );
  // Remove any existing children that might be attached (just in case)
  while (_domContainer.lastChild) {
    _domContainer.removeChild(_domContainer.lastChild);
  }
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
      cell.textContent = " ";
      cell.classList.add("scene-" + this.id + "-cell")
      cell.classList.add("scene-" + this.id + "-row-" + y);
      cell.classList.add("scene-" + this.id + "-column-" + x);
      cell.classList.add("scene-" + this.id + "-" + y + "-" + x);
      
      rowDomElement.append(cell);
      _domElementReferences[y].push(new CellData(cell, Vector2.default()));
      _currentPixelData[y].push(new PixelData());
    }
    _domContainer.append(rowDomElement);
  }
  
  // TODO: Verify eventHandlers
  // TODO: Is this even necessary, especially if not exposed to public?
  let _eventHandlers = new EventHandlerModule({
    layerId: this.id,
    eventHandlers: data.eventHandlers
  });
  
  let _events = new EventModule({
    layerId: this.id,
    events: data.events
  })
  
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
    internalElement.initializeModule(CoreModule.type);
    internalElement.initializeModule(EventModule.type);
    internalElement.initializeModule(FormattingModule.type);

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
      if (!(className in _classMembers)) {
        LOGGING.WARN(
          "filterElements: ",
          "Filter string: ", className, " not found."
        );
        continue;
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
  
  // TODO: Should this be an option? If so, how to implement? 
  this.setEventEnabled = function(classSet, status) {
    LOGGING.PERFORMANCE.START("Scene.setEventEnabled", 1);
    let relevantElements = filterElements(classSet);
    for (let id of relevantElements) {
      let element = _elementData[id];
      element.setEventStatus(status);
    }
    LOGGING.PERFORMANCE.STOP("Scene.setEventEnabled");
  }
  
  this.shiftCamera = function(shift) {
    // TODO: Verify shift. 
    LOGGING.PERFORMANCE.START("Scene.shiftCamera", 1);
    _camera.topLeftCoords = Vector2.subtract(_camera.topLeftCoords, shift);
    LOGGING.PERFORMANCE.STOP("Scene.shiftCamera");
  }
  
  this.render = function() {
    LOGGING.PERFORMANCE.START("Scene.render", 0);
    
    // TODO: Get all information, and then update everything at once. 
    for (let y = 0; y < this.boundingBoxDimens.y; y++) {
      for (let x = 0; x < this.boundingBoxDimens.x; x++) {
        let newPixelData = getUpdatedCell(Vector2.subtract(Vector2.create(x, y), _camera.topLeftCoords));
        let currPixelData = _currentPixelData[y][x];
        LOGGING.PERFORMANCE.START("Scene.render: CELL", 2);
        if (PixelData.isEqual(newPixelData, currPixelData)) {
          // If nothing changed, don't set anything.
        } else {
          let cell = _domElementReferences[y][x];
          if (currPixelData.char !== newPixelData.char) {
            cell.domElement.textContent = newPixelData.char;
          }
          let cellStyle = cell.domElement.style;
          // TODO: Use loop to iterate over formatting.          
          cellStyle.color = newPixelData.formatting.textColor.value;
          cellStyle.backgroundColor = newPixelData.formatting.backgroundColor.value;
          cellStyle.fontWeight = newPixelData.formatting.fontWeight.value;
          cellStyle.fontStyle = newPixelData.formatting.fontStyle.value;
          cellStyle.textDecoration = newPixelData.formatting.textDecoration.value;
          cellStyle.cursor = newPixelData.formatting.cursor.value;
          
          for (let eventType in currPixelData.events) {
            let oldEventData = currPixelData.events[eventType];
            let newEventData = newPixelData.events[eventType];
            if (eventType in newPixelData.events
              && oldEventData.eventType == newEventData.eventType
              && oldEventData.layerId == newEventData.layerId
              && oldEventData.handlerKey == newEventData.handlerKey
              && newEventData.enabled) {
              // If they belong to the same element, then don't change.
              // Cannot check newPixelData.id, since the event may have originated from a different layer.
              LOGGING.DEBUG("Keeping the same event listener for: (", x, ", ", y, ")");
            } else {
              // There might be other cases where the handler could be reused, but being safe for now. 
              LOGGING.DEBUG("Removing event listener from: (", x, ", ", y, ")");
              _eventHandlers.unbindEvent(cell, oldEventData);
            }
          }
          
          for (let eventType in newPixelData.events) {
            let eventData = newPixelData.events[eventType];
            if (eventData.enabled
              && !eventData.attachedCells.has(cell)) {
              _eventHandlers.bindEvent(cell, eventData);
              LOGGING.DEBUG("Adding event listener to: (", x, ", ", y, ")");
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
    
    let topPixelData = PixelData.Empty;
    let topPriority = Infinity;
    for (let id in _elementData) {
      // TODO: Sort _elementData by id, so that can immediately exit if find a valid PixelData
      let element = _elementData[id];
      if (!Vector2.inBoundingBox(coord, element[CoreModule.type].topLeftCoords, element.boundingBoxDimens)) {
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
  
  LOGGING.PERFORMANCE.STOP("Scene.constructor");
}

Scene.prototype = Object.create(Layer.prototype);
Scene.prototype.constructor = Scene;
