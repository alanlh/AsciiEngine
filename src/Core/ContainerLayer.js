"use strict";
function ContainerLayer(children, data) {
  let self = this;
  LOGGING.ASSERT(children, "ContainerLayer constructor parameter 'children' is missing or invalid.");
  LOGGING.ASSERT(data, "ContainerLayer constructor parameter 'data' is missing or invalid.");

  // TODO: Since ContainerLayers are immutable, store a reference for each coordinate to the corresponding child. 
  // TODO: Verify children is Array. 
  const _children = [];
  let topLeft = new Vector2(0, 0);
  let bottomRight = new Vector2(0, 0);
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
  Element.call(this, {
    boundingBoxDimens: Vector2.subtract(bottomRight, topLeft),
    topLeftCoords: Vector2.add(topLeft, data.topLeftCoords),
    priority: data.priority,
    events: data.events,
    formatting: data.formatting
  });
  
  Object.defineProperty(this, "size", {
    value: _children.length
  });
  
  this.setConfiguration = function(newConfiguration) {
    for (let child of _children) {
      child.setConfiguration(newConfiguration);
    }
  }
  
  this.getCharAt = function(vec2) {
    // TODO: Verify that vec2 is Vector2
    for (let i = this.size - 1; i >= 0; i --) {
      let childChar = _children[i].getCharAt(Vector2.subtract(vec2, _children[i].topLeftCoords));
      if (childChar) {
        return childChar;
      }
    }
    return false;
  };
  
  this.getPixelDataAt = function(vec2) {
    // TODO: Verify that vec2 is Vector2
    for (let i = this.size - 1; i >= 0; i --) {
      if (vec2.inBoundingBox(_children[i].topLeftCoords, _children[i].boundingBoxDimens)) {
        let childPixelData = _children[i].getPixelDataAt(Vector2.subtract(vec2, _children[i].topLeftCoords));
        if (!childPixelData.isTransparent()) {
          childPixelData.pushEventModule(this[EventModule.type]);
          childPixelData.pushFormattingModule(this[FormattingModule.type]);
          return childPixelData;
        }
      }
    }
    return new PixelData();
  }
    
  this.copy = function() {
    // TODO: Format data better. Use internal values, not parameter. 
    return new ContainerLayer(_children, data);
  }
  
  this.initializeModule = function(moduleType) {
    this.module = new BaseModule[moduleType](this);
    for (let child of _children) {
      child.initializeModule(moduleType);
    }
  }
}

ContainerLayer.prototype = Object.create(Element.prototype);
ContainerLayer.prototype.constructor = ContainerLayer;
