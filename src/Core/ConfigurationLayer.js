"use strict";
function ConfigurationLayer(children, data) {
  let self = this;
  LOGGING.ASSERT(children, "ConfigurationLayer constructor parameter 'children' is missing or invalid.");
  LOGGING.ASSERT(data, "ConfigurationLayer constructor parameter 'data' is missing or invalid.");

  // TODO: Since ContainerLayers are immutable, store a reference for each coordinate to the corresponding child. 
  // TODO: Verify childrn is an object.
  const _children = {};
  let topLeft = new Vector2(0, 0);
  let bottomRight = new Vector2(0, 0);
  for (let key in children) {
    // TODO: Verify key is string. 
    let child = children[key];
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
    _children[key] = child.copy();
  }
  // TODO: Check value of topLeftCoords and priority. 
  Element.call(this, {
    boundingBoxDimens: Vector2.subtract(bottomRight, topLeft),
    topLeftCoords: Vector2.add(topLeft, data.topLeftCoords),
    priority: data.priority,
    events: data.events
  });
  
  Object.defineProperty(this, "size", {
    value: _children.size
  });
  
  Object.defineProperty(this, "childKeys", {
    value: Object.keys(_children)
  });
  
  let _defaultKey = data.defaultKey || Object.keys(_children)[0];
  let _activeKey = data.activeKey || _defaultKey;
  Object.defineProperty(this, "defaultKey", {
    get: function() {
      return _defaultKey;
    }
  });
  Object.defineProperty(this, "activeKey", {
    get: function() {
      return _activeKey;
    },
    set: function(newKey) {
      // TODO: Mark as changed. 
      if (newKey in _children) {
        _activeKey = newKey;
      } else {
        _activeKey = _defaultKey;
      }
    }
  });
  
  this.setConfiguration = function(newConfiguration) {
    // TODO: Verify newConfiguration
    this.activeKey = newConfiguration;
    for (let key in _children) {
      _children[key].setConfiguration(newConfiguration);
    }
  }
  
  this.getCharAt = function(vec2) {
    // TODO: Verify that vec2 is Vector2
    if (!vec2.inBoundingBox(this.topLeftCoords, this.boundingBoxDimens)) {
      return false;
    }
    return _children[_activeKey].getCharAt(Vector2.subtract(vec2, this.topLeftCoords));
  };
  
  this.getPixelDataAt = function(vec2) {
    // TODO: Verify that vec2 is Vector2
    if (vec2.inBoundingBox(_children[_activeKey].topLeftCoords, _children[_activeKey].boundingBoxDimens)) {
      let childPixelData = _children[_activeKey].getPixelDataAt(Vector2.subtract(vec2, _children[_activeKey].topLeftCoords));
      childPixelData.pushEventModule(this[EventModule.type]);
      return childPixelData;
    }
    return new PixelData();
  }
    
  this.copy = function() {
    // TODO: Format data better. Use internal values, not parameter. 
    return new ConfigurationLayer(_children, data);
  }
  
  this.initializeModule = function(moduleType) {
    this.module = new BaseModule[moduleType](this);
    for (let childKey in _children) {
      _children[childKey].initializeModule(moduleType);
    }
  }
}
