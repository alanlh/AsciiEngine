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
  for (let y = 0; y < this.boundingBoxDimens.y; y ++) {
    let rowDomElement = document.createElement("div");
    _domElementReferences.push(new RowData(rowDomElement, this.boundingBoxDimens.x));
    //rowDomElement.classList.add("scene-" + this.id + "-row");
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
  });

  // Key: Id, Value: Element
  let _elementData = {};
  // Key: Id, Value: class names
  let _idTags = {};
  // Key: class names, Value: Member Ids
  let _classMembers = {};
  // Ids sorted by priority of corresponding element. 
  let _sortedElementIds = [];
  // Key: Id, Value: A bounding box.
  let _elementSceneBoundaries = {};

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

    // Insert into _sortedElementIds for easier access later on.
    // If two objects have the same priority, behavior is unspecified.
    // However, current behavior is to make it the last of such elements.
    // TODO: Replace with linked list. 
    let inserted = false;
    for (let i = 0; i < _sortedElementIds.length; i ++) {
      if (_elementData[_sortedElementIds[i]][CoreModule.type].priority > internalElement[CoreModule.type].priority) {
        _sortedElementIds.splice(i, 0, internalElement.id);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      _sortedElementIds.push(internalElement.id);
    }

    _elementSceneBoundaries[internalElement.id] = BoundingBox.create(Vector2.default(), this.boundingBoxDimens);

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
        // Set initial candidates to the classMembers of the first name.
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

  this.removeElements = function(classSet) {
    LOGGING.PERFORMANCE.START("Scene.removeElements", 1);
    // TODO: Change remove to return true if something changed, or false if nothing was changed. 
    // Log if returned false
    let relevantElements = filterElements(classSet);
    for (let idToRemove of relevantElements) {
      delete _elementData[idToRemove];
      _sortedElementIds.splice(_sortedElementIds.indexOf(idToRemove), 1);
      delete _elementSceneBoundaries[idToRemove];
      for (let className of _idTags[idToRemove]) {
        _classMembers[className].delete(idToRemove);
        if (_classMembers[className].size === 0) {
          delete _classMembers[className];
        }
      }
      delete _idTags[idToRemove];
    }
    LOGGING.PERFORMANCE.STOP("Scene.removeElements");
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
    // Unknown result after sorting, so just use default sort.
    // TODO: Since all resulting elements have the same priority, find better algorithm?
    _sortedElementIds.sort(function(a, b) {
      return _elementData[a][CoreModule.type].priority - _elementData[b][CoreModule.type].priority;
    });
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
  
  this.setVisibility = function(classSet, visibility) {
    LOGGING.PERFORMANCE.START("Scene.setVisibility", 1);
    // TODO: Check value of visibility
    // TODO: Change setVisibility to return true if something changed, or false if nothing was changed. 
    // Log if returned false
    let relevantElements = filterElements(classSet);
    for (let id of relevantElements) {
      let element = _elementData[id];
      element[CoreModule.type].visible = visibility;
    }
    LOGGING.PERFORMANCE.STOP("Scene.setVisibility");
  }
  
  this.setInternalBoundary = function(classSet, boundingBox) {
    LOGGING.PERFORMANCE.START("Scene.setInternalBoundary", 1);
    // TODO: Check value of visibility
    // TODO: Change setInternalBoundary to return true if something changed, or false if nothing was changed. 
    // Log if returned false
    let relevantElements = filterElements(classSet);
    for (let id of relevantElements) {
      _elementSceneBoundaries[id] = BoundingBox.copy(boundingBox);
    }
    LOGGING.PERFORMANCE.STOP("Scene.setInternalBoundary");
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
    _camera.topLeftCoords = Vector2.add(_camera.topLeftCoords, shift);
    LOGGING.PERFORMANCE.STOP("Scene.shiftCamera");
  }
  
  this.render = function() {
    LOGGING.PERFORMANCE.START("Scene.render", 0);
    
    // TODO: Get all information, and then update everything at once. 
    for (let y = 0; y < this.boundingBoxDimens.y; y++) {
      let prevPixelData = PixelData.Empty;
      for (let x = 0; x < this.boundingBoxDimens.x; x++) {
        LOGGING.PERFORMANCE.START("Scene.render: getUpdatedCell", 2);
        let relativeCoords = Vector2.create(x, y);
        let absoluteCoords = Vector2.add(relativeCoords, _camera.topLeftCoords);
        let maxAllowedPriority = Infinity;
        // TODO: Temporary work around. 
        // Instead of keeping "topLevelId", keep a tree from each subnode to the root node id.
        // TODO: REMOVE WHEN DONE.
        if (prevPixelData.canBeExtended && 
          BoundingBox.inBoundingBox(_elementSceneBoundaries[prevPixelData.topLevelId], relativeCoords)) {
          maxAllowedPriority = prevPixelData.priority;
        }
        let newPixelData = getUpdatedCell(
          absoluteCoords, relativeCoords, maxAllowedPriority
        );
        // TODO: Optimize scene boundary detection. 
        if ((newPixelData === PixelData.Empty 
          || BoundingBox.inBoundingBox(_elementSceneBoundaries[newPixelData.topLevelId], relativeCoords)) 
          && newPixelData.incrementActiveLength()) {
          // TODO: ASSERT newPixelData should have higher priority than prevPixelData
          prevPixelData = newPixelData;
          // TODO: Turn initializeEventHandlers to be a method for EventHandlerModule, not PixelData
          newPixelData.initializeEventHandlers(_eventHandlers);
          _domElementReferences[y].updatePixelData(x, newPixelData);
        } else if ((prevPixelData === PixelData.Empty 
          || BoundingBox.inBoundingBox(_elementSceneBoundaries[prevPixelData.topLevelId], relativeCoords)) 
          && prevPixelData.incrementActiveLength()) {
          // Do nothing, since prevPixelData should already have been inserted into RowData
        } else {
          prevPixelData = PixelData.Empty;
        }
        LOGGING.PERFORMANCE.STOP("Scene.render: getUpdatedCell");
      }
    }
    for (let y = 0; y < this.boundingBoxDimens.y; y++) {
      _domElementReferences[y].render();
    }
    
    LOGGING.PERFORMANCE.STOP("Scene.render");
  }
  
  let getUpdatedCell = function(absoluteCoords, relativeCoords, maxAllowedPriority) {
    LOGGING.PERFORMANCE.START("Scene.getUpdatedCell", 2);
    let topPixelData = PixelData.Empty;
    if (maxAllowedPriority === undefined) {
      maxAllowedPriority = Infinity;
    }
    for (let i = 0; i < _sortedElementIds.length; i ++) {
      // TODO: Sort _elementData by id, so that can immediately exit if find a valid PixelData
      let element = _elementData[_sortedElementIds[i]];
      if (element.priority >= maxAllowedPriority) {
        break;
      }
      
      if (!element[CoreModule.type].visible) {
        continue;
      }
      
      if (!BoundingBox.inBoundingBox(_elementSceneBoundaries[_sortedElementIds[i]], relativeCoords)) {
        continue;
      }
      
      if (!Vector2.inBoundingBox(absoluteCoords, element[CoreModule.type].topLeftCoords, element.boundingBoxDimens)) {
        continue;
      }
      
      // No need to check priority since elements are sorted. 
      // The first nonTransparent Element is used. 
      
      let pixelData = element.getPixelDataAt(Vector2.subtract(absoluteCoords, element[CoreModule.type].topLeftCoords));
      if (pixelData.isTransparent()) {
        continue;
      }
      topPixelData = pixelData;
      topPixelData.priority = element.priority;
      // TODO: Remove when possible.
      topPixelData.topLevelId = element.id;
      break;
    }
    LOGGING.DEBUG_VERBOSE(
      "Scene.getUpdatedCell at coords: ", absoluteCoords, " ",
      "found: ", topPixelData
    );
    LOGGING.PERFORMANCE.STOP("Scene.getUpdatedCell");
    return topPixelData;
  }
  
  LOGGING.PERFORMANCE.STOP("Scene.constructor");
}

Scene.prototype = Object.create(Layer.prototype);
Scene.prototype.constructor = Scene;
