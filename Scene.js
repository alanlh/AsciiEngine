"use strict"
function Scene(id) {
  let element = document.getElementById(id);
  // Makes sure the div exists.
  console.assert(element && (element.tagName === "PRE" || element.tagName ==="DIV"),
    "Cannot construct Scene: id not valid");
  // Clear div?
  if (element.tagName === "DIV") {
    let child = document.createElement("pre");
    element.appendChild(child);
    element = child;
  }

  const sceneContainer = element;
  sceneContainer.style.fontFamily = "Courier New";
  sceneContainer.style.fontSize = "0.75em";

  let width_ = 0;
  let height_ = 0;

  let topLayerId_ = [];

  this.setWidth = function(newWidth) {
    console.assert(Number.isInteger(newWidth), "Scene width must be an integer");
    console.assert(newWidth >= 0, "Scene width must be non-negative");
    if (newWidth < width_) {
      // TODO:
      for (let i = 0; i < height_; i ++) {
        let row = sceneContainer.children[i];
        for (let j = width_; j > newWidth; j--) {
          row.removeChild(row.children[j - 1]);
          topLayerId_[i].pop();
        }
      }
    } else if (newWidth > width_) {
      for (let i = 0; i < height_; i ++) {
        let row = sceneContainer.children[i];
        for (let j = width_; j < newWidth; j ++) {
          let node = document.createElement("span");
          let text = document.createTextNode(" ");
          node.appendChild(text);
          node.classList.add("scene-" + id + "-cell");
          node.classList.add("scene-" + id + "-row-" + i);
          node.classList.add("scene-" + id + "-column-" + j);
          node.classList.add("scene-" + id + "-" + i + "-" + j);
          // TODO?????

          row.appendChild(node);
          topLayerId_[i].push(0);
        }
      }

      // TODO: Need to re-update the screen in case there are parts of drawings which need to be shown.
    } else {
      // Do nothing?
      return;
    }
    width_ = newWidth;
  }
  this.setHeight = function(newHeight) {
    console.assert(Number.isInteger(newHeight), "Scene height must be an integer");
    console.assert(newHeight >= 0, "Scene height must be non-negative");
    if (newHeight < height_) {
      // TODO
      for (let i = height_; i > newHeight; i --) {
        sceneContainer.removeChild(sceneContainer.children[i - 1]);
        topLayerId_.pop();
      }
    } else if (newHeight > height_) {
      // TODO
      for (let i = height_; i < newHeight; i ++) {
        let row = document.createElement("div");
        row.classList.add("scene-" + id + "-row");
        topLayerId_.push([]);
        for (let j = 0; j < width_; j ++) {
          let cell = document.createElement("span");
          let text = document.createTextNode(" ");
          cell.appendChild(text);
          cell.classList.add("scene-" + id + "-cell")
          cell.classList.add("scene-" + id + "-row-" + i);
          cell.classList.add("scene-" + id + "-column-" + j);
          cell.classList.add("scene-" + id + "-" + i + "-" + j);

          row.appendChild(cell);
          topLayerId_[i].push(0);
        }
        sceneContainer.appendChild(row);
      }
    } else {
      return;
    }
    height_ = newHeight;
  }

  let drawingData = {};
  let idTags = {};
  let classMembers = {};
  // Adds a Drawing object to the Scene

  // Code from: https://stackoverflow.com/questions/5690723/how-should-i-generate-unique-ids-for-a-bunch-of-objects
  let generateId = (function() {
    let index = 1 + Math.floor(Math.random() * 1024);
    return function() {
      index += 1 + ((index * index) % 5);
      return id + "_" + index ++;
    }
  })();

  this.addAnimation = function(classSet, animation) {
    // TODO: Validate inputs
    if (typeof classSet === "string") {
      classSet = classSet.split(" ");
      classSet = new Set(classSet);
    } else if (classSet instanceof Array) {
      classSet = new Set(classSet);
    }
    let id = generateId();
    drawingData[id] = animation.copy();
    idTags[id] = classSet;

    classSet.forEach(function(className) {
      if (!(className in classMembers)) {
        classMembers[className] = new Set();
      }
      classMembers[className].add(id);
    })

    return id;
  }

  this.addDrawing = function(classSet, drawing) {
    // TODO: Find other failure conditions
    if (typeof classSet === "string") {
      classSet = classSet.split(" ");
      classSet = new Set(classSet);
    } else if (classSet instanceof Array) {
      classSet = new Set(classSet);
    }
    // console.assert(typeof drawing == "object" && drawing instanceof Drawing,
    //   "Scene.addDrawing: Invalid input 'drawing'. Drawing object required");

    let id = generateId();
    drawingData[id] = drawing;
    // Note: the drawing itself is only stored once. idTags and classSet both store the ids
    idTags[id] = classSet;
    classSet.forEach(function(className) {
      if (!(className in classMembers)) {
        classMembers[className] = new Set();
      }
      classMembers[className].add(id);
    });

    return id;
  }

  // Adds a drawing from text
  this.addDrawingText = function(classSet, textStr) {
    // TODO: Check textStr is valid
    // TODO: Check classSet is valid
    // TODO: Convert textStr to valid form
    const drawing = new Drawing(textStr);
    return addDrawing(classSet, drawing);
  }

  // Parses the given file and stores it as a Drawing.
  this.addFile = function(idSet, fileLoc) {
    // TODO: Check idSet is valid
    // TODO: Check fileLoc is valid

    // TODO
  }

  // Selects the ids of all drawings which match all classes stated in classSet, and returns them.
  // classSet should be a Set object
  let filterDrawings = function(classSet) {
    // Validate classSet
    // If string, search for id with that name, otherwise, must be array or set object.
    // Note: A slower algorithm is used for now because I'm not sure if the ids are ordered.
    
    // TODO: If classSet is empty, then return all animations. 
    if (typeof classSet === "string") {
      classSet = classSet.split(" ");
      if (classSet.length == 1) {
        if (drawingData[classSet[0]]) {
          return new Set(classSet)
        }
      }
      classSet = new Set(classSet);
    } else if (classSet instanceof Array) {
      classSet = new Set(classSet);
    }
    
    let candidates = new Set();
    let filtered = new Set();
    for (let className of classSet) {
      console.assert(className in classMembers, "Non-existent class name");
      if (candidates.size == 0) {
        // TODO: Fix bug so that only the first element does this. 
        candidates = classMembers[className];
        continue;
      }
      filtered = new Set();
      for (let id of candidates) {
        if (classMembers[className].has(id)) {
          filtered.add(id);
        }
      }
      if (filtered.size == 0) {
        return new Set();
      }
      candidates = filtered;
    }
    return candidates;
  }

  this.shiftDrawing = function(classSet, shift) {
    // TODO: classSet validation relegated to filterDrawings
    // TODO: Check if coord is a object with x and y as numbers.
    let relevantDrawings = filterDrawings(classSet);
    for (let id of relevantDrawings) {
      let drawing = drawingData[id];
      let currCoord = drawing.getCoords();
      currCoord.x += shift.x;
      currCoord.y += shift.y;
      drawing.setCoords(currCoord);
    }
  }

  this.moveDrawing = function(classSet, newLoc) {
    let relevantDrawings = filterDrawings(classSet);
    for (let id of relevantDrawings) {
      let drawing = drawingData[id];
      drawing.setCoords(newLoc);
    }
  }

  this.getDrawings = function(classSet) {
    return filterDrawings(classSet);
  }

  this.orderDrawing = function(classSet, newPriority) {
    // TODO: Verify newPriority;
    let relevantDrawings = filterDrawings(classSet);
    for (let id of relevantDrawings) {
      let drawing = drawingData[id];
      drawing.setPriority(newPriority);
    }
  }

  // Prompts the animations with those class names to move to next frame
  this.iterateAnimation = function(classSet, frameLabel) {
    let relevantDrawings = filterDrawings(classSet);
    if (relevantDrawings.size == 0) {
      console.warn("No relevant drawings found with label: ", classSet);
    }
    for (let id of relevantDrawings) {
      let animation = drawingData[id];
      animation.setFrame(frameLabel);
    }
  }

  this.getClassSet = function(id) {
    // Verify validity of id (Must be string)
    if (!(id in idTags)) {
      return undefined;
    }
    return idTags[id];
  }

  let events_ = {};
  let eventHandlers_ = {};
    
  this.addEvents = function(newEvents) {
    for (let eventType in newEvents) {
      events_[eventType] = newEvents[eventType];
    }
  }
  
  this.removeEvents = function(removeList) {
    // TODO: Verify input. Currently assume to be array of strings. 
    for (let i = 0; i < removeList.length(); i ++) {
      delete events_[removeList[i]];
    }
  }
  
  this.addEventHandlers = function(eventHandlers) {
    for (let eventName in eventHandlers) {      
      eventHandlers_[eventName] = eventHandlers[eventName];
    }
  }
  
  this.removeEventHandlers = function(eventHandlerList) {
    // TODO: Verify input. Currently assume to be array of strings. 
    for (let i = 0; i < eventHandlerList.length(); i ++) {
      delete events_[eventHandlerList[i]];
    }
  }

  let currentRenderData = [];

  this.render = function() {
    while (currentRenderData.length < height_) {
      currentRenderData.push([]);
    }
    for (let i = 0; i < height_; i ++) {
      while (currentRenderData[i].length < width_) {
        currentRenderData[i].push(new CharPixel());
      }
    }
        
    for (let y = 0; y < height_; y++) {
      let row = sceneContainer.children[y];
      for (let x = 0; x < width_; x++) {
        let topCharPixel = getUpdatedCell(x, y);
        if (topCharPixel.sameAs(currentRenderData[y][x])) {
          
        } else {
          let cell = row.children[x];
          cell.innerHTML = topCharPixel.char;
          cell.style.color = topCharPixel.textColor;
          cell.style.backgroundColor = topCharPixel.backgroundColor;
          cell.style.fontWeight = topCharPixel.fontWeight;
          cell.style.fontStyle = topCharPixel.fontStyle;
          cell.style.textDecoration = topCharPixel.textDecoration;
          
          handleEventListener.call(this, cell, currentRenderData[y][x], topCharPixel);
          
          currentRenderData[y][x] = topCharPixel;
        }
        // Other options here
      }
    }
  }
  
  let getUpdatedCell = function(x, y) {
    let topCharPixel = new CharPixel();
    let topPriority = Infinity;
    for (let id in drawingData) {
      let drawing = drawingData[id];
      // Ignore drawings/animations which are not in that region
      let loc = drawing.getCoords();
      if (x < loc.x || y < loc.y) {
        continue;
      }
      let dimens = drawing.getDimens();
      if (x >= dimens.width + loc.x || y >= dimens.height + loc.y) {
        continue;
      }

      let priority = drawing.getPriority();
      if (priority > topPriority) {
        continue;
      }
      // TODO: Check if getCharValScene returns blank space " "
      let charPixel = drawing.getCharValScene(x, y);
      if (charPixel.isTransparent()) {
        continue;
      }
      topCharPixel = charPixel;
      topPriority = priority;
    }
    topCharPixel.addHigherLevelEventListeners(events_);
    return topCharPixel;
  }
  
  let generateEventHandler = function(handler, containers) {
    let scene = this;
    return function(e) {
      handler(e, scene, containers);
    }
  }
  
  // Add and remove event handlers from cells. 
  let handleEventListener = function(cell, oldData, newData) {
    for (let oldEvent in oldData.activeListeners) {
      if (oldEvent in newData.events && oldData.events[oldEvent] == newData.events[oldEvent]
        && oldData.sameContainersAs(newData)) {
        // Transfer records over, since nothing changed
        newData.addActiveListenerRecord(oldEvent, oldData.activeListeners[oldEvent]);
      } else {
        // console.log("Removing old event listener: ", oldEvent);
        cell.removeEventListener(oldEvent, oldData.activeListeners[oldEvent]);
      }
      oldData.removeActiveListenerRecord(oldEvent);
    }
    for (let newEvent in newData.events) {
      if (newData.events[newEvent] in eventHandlers_ && !(newEvent in newData.activeListeners)) {
        // console.log("Adding new event listener: ", newEvent);
        // TODO: Change to store a thisScene variable to avoid this situtation. 
        // TODO: Include scene into CharPixel containers. 
        let handler = generateEventHandler.call(this, eventHandlers_[newData.events[newEvent]], 
          newData.getContainerReferences());
        cell.addEventListener(newEvent, handler);
        newData.addActiveListenerRecord(newEvent, handler);
      } else {
        // TODO: Warn if the eventHandler does not exist. 
      }
    }
  }
}
