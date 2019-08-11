"use strict";
function ConfigurationLayer(children, data) {
  let self = this;
  LOGGING.ASSERT(children, "ConfigurationLayer constructor parameter 'children' is missing or invalid.");
  LOGGING.ASSERT(data, "ConfigurationLayer constructor parameter 'data' is missing or invalid.");

  // TODO: Verify childrn is an Element.
  const _children = {};
  let topLeft = Vector2.default();
  let bottomRight = Vector2.default();
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
  Element.call(this, {
    boundingBoxDimens: Vector2.subtract(bottomRight, topLeft),
    topLeftCoords: Vector2.add(topLeft, Vector2.createFrom(data.topLeftCoords)),
    priority: data.priority,
    events: data.events,
    formatting: data.formatting
  });
  
  Object.defineProperty(this, "size", {
    value: _children.size
  });
  
  Object.defineProperty(this, "childKeys", {
    get: function() {
      return Object.keys(_children);
    }
  });
  
  let _defaultKey = data.defaultKey;
  let _activeKey = data.activeKey;
  if (!(data.defaultKey in _children)) {
    LOGGING.WARN("ConfigurationLayer constructor parameter defaultKey does not exist among child keys: ", defualtKey);
    _defaultKey = Object.keys(_children)[0];
  }
  
  if (!(data.activeKey in _children)) {
    LOGGING.WARN("ConfigurationLayer constructor parameter activeKey does not exist among child keys: ", data.activeKey);
    _activeKey = _defaultKey;
  }
  
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
      if (newKey in _children) {
        // TODO: Mark as changed?
        _activeKey = newKey;
      } else {
        // Do not change. Could just be setting key of children. 
      }
    }
  });
  
  self.setConfiguration = function(newConfiguration) {
    self.activeKey = newConfiguration;
    for (let key in _children) {
      _children[key].setConfiguration(newConfiguration);
    }
  }
  
  self.getCharAt = function(vec2) {
    LOGGING.ASSERT(Vector2.verifyInteger(vec2), "ConfigurationLayer getCharAt of instance", self.id, " is not Vector2-like: ", vec2);
    if (!Vector2.inBoundingBox(vec2, this.topLeftCoords, this.boundingBoxDimens)) {
      return false;
    }
    return _children[_activeKey].getCharAt(Vector2.subtract(vec2, this.topLeftCoords));
  };
  
  self.getPixelDataAt = function(vec2) {
    LOGGING.ASSERT(Vector2.verifyInteger(vec2), "ConfigurationLayer getPixelDataAt of instance", self.id, " is not Vector2-like: ", vec2);
    if (Vector2.inBoundingBox(vec2, _children[_activeKey].topLeftCoords, _children[_activeKey].boundingBoxDimens)) {
      let childPixelData = _children[_activeKey].getPixelDataAt(Vector2.subtract(vec2, _children[_activeKey].topLeftCoords));
      childPixelData.pushEventModule(this[EventModule.type]);
      childPixelData.pushFormattingModule(this[FormattingModule.type]);
      return childPixelData;
    }
    return new PixelData();
  }
    
  self.copy = function() {
    return new ConfigurationLayer(_children, {
      topLeftCoords: self.topLeftCoords,
      priority: self.priority,
      events: self.events,
      formatting: self.formatting,
      defaultKey: _defaultKey,
      activeKey: _activeKey
    });
  }
  
  this.initializeModule = function(moduleType) {
    this.module = new BaseModule[moduleType](this);
    for (let childKey in _children) {
      _children[childKey].initializeModule(moduleType);
    }
  }
}
