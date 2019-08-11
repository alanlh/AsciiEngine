"use strict";
function ContainerLayer(children, data) {
  let self = this;
  LOGGING.ASSERT(children, "ContainerLayer constructor parameter 'children' is missing or invalid.");
  LOGGING.ASSERT(data, "ContainerLayer constructor parameter 'data' is missing or invalid.");

  // TODO: Since ContainerLayers are immutable, store a reference for each coordinate to the corresponding child. 
  // TODO: Verify children is Array. 
  const _children = [];
  let topLeft = Vector2.default();
  let bottomRight = Vector2.default();
  LOGGING.LOG("ContainerLayer constructor parameter children has length: ", children.length);
  for (let i = 0; i < children.length; i ++) {
    let child = children[i];
    if (!(child instanceof Element)) {
      LOGGING.ERROR(
        "ContainerLayer constructor 'children' contains a non-Element value.\n",
        "Value of child: ", child
      );
    }
    // TODO: Verify child status.
    topLeft = Vector2.takeTopLeft(topLeft, child.topLeftCoords);
    bottomRight = Vector2.takeBottomRight(bottomRight, 
      Vector2.add(child.topLeftCoords, child.boundingBoxDimens)
    );
    
    _children.push(child.copy());
  }
    
  // TODO: ???
  /**
  _children.sort(function(a, b) {
    return a.priority - b.priority;
  });
  **/
  
  // TODO: Check value of topLeftCoords and priority. 
  Element.call(self, {
    boundingBoxDimens: Vector2.subtract(bottomRight, topLeft),
    topLeftCoords: Vector2.add(topLeft, Vector2.createFrom(data.topLeftCoords)),
    priority: data.priority,
    events: data.events,
    formatting: data.formatting
  });
  
  Object.defineProperty(self, "size", {
    value: _children.length
  });
  
  self.setConfiguration = function(newConfiguration) {
    for (let child of _children) {
      child.setConfiguration(newConfiguration);
    }
  }
  
  self.getCharAt = function(vec2) {
    LOGGING.ASSERT(Vector2.verifyInteger(vec2), "ContainerLayer getCharAt of instance", self.id, " is not Vector2-like: ", vec2);
    for (let i = self.size - 1; i >= 0; i --) {
      let childChar = _children[i].getCharAt(Vector2.subtract(vec2, _children[i].topLeftCoords));
      if (childChar) {
        return childChar;
      }
    }
    return false;
  };
  
  this.getPixelDataAt = function(vec2) {
    LOGGING.ASSERT(Vector2.verifyInteger(vec2), "ContainerLayer getPixelDataAt of instance", self.id, " is not Vector2-like: ", vec2);
    for (let i = this.size - 1; i >= 0; i --) {
      if (Vector2.inBoundingBox(vec2, _children[i].topLeftCoords, _children[i].boundingBoxDimens)) {
        let childPixelData = _children[i].getPixelDataAt(Vector2.subtract(vec2, _children[i].topLeftCoords));
        if (!childPixelData.isTransparent()) {
          childPixelData.pushEventModule(this[EventModule.type]);
          childPixelData.pushFormattingModule(this[FormattingModule.type]);
          return childPixelData;
        }
      }
    }
    return PixelData.Empty;
  }
    
  self.copy = function() {
    return new ContainerLayer(_children, {
      topLeftCoords: self.topLeftCoords,
      priority: self.priority,
      events: self.events,
      formatting: self.formatting
    });
  }
  
  self.initializeModule = function(moduleType) {
    self.module = new BaseModule[moduleType](self);
    for (let child of _children) {
      child.initializeModule(moduleType);
    }
  }
}

ContainerLayer.prototype = Object.create(Element.prototype);
ContainerLayer.prototype.constructor = ContainerLayer;
