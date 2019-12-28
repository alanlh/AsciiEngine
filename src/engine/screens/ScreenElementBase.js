class ScreenElementBase {
  constructor(name, type, renderSpriteId, settings) {
    this.id = ScreenElementBase.generateId(name); 
    
    this.type = type;
    this.renderSpriteId = renderSpriteId;
    this.settings = UtilityMethods.initializeArgs({
      "boundingBox": Vector2.create(0, 0),
      "fixedLocation": True
    }, settings);
    
    this.container = undefined;
    this.topLeft = topLeft;
    this.state = startingState;
    
    this.renderedBefore = false;
    this.topLeftChanged = false;
    this.stateChanged = false;
    this.markedForRemoval = false;
    this.removed = false;
  }
  
  initializeContainer(container, topLeft, startingState) {
    this.container = container;
    this.topLeft = topLeft;
    this.state = startingState;
  }
  
  getRenderDetails() {
    /** Flags to include:
      firstRender: Tells display to insert a new object. Flag should not exist or be undefined afterwards.
        The value is the spriteId
      topLeft: x, y coordinates within the sceen. Up to display to offset by screen x, y.
      stateKey: The key which to set the AsciiEngine element.
      visible: true or false.
      shouldRemove: True if should remove. Otherwise shouldn't even be present.
    **/
    
    // TODO: This should be overridden in DataHolders, since text may change arbitrarily.
    let renderDetails = {};
    if (!this.renderedBefore) {
      renderDetails.firstRender = this.spriteId;
      this.renderedBefore = true;
    }
    if (this.topLeftChanged) {
      renderDetails.topLeft = Vector2.copy(this.topLeft);
      this.topLeftChanged = false;
    }
    if (this.stateChanged) {
      renderDetails.stateKey = this.state;
      this.stateChanged = false;
    }
    if (this.visibilityChanged) {
      renderDetails.visible = this.visible;
      this.visibilityChanged = false;
    }
    if (this.markedForRemoval) {
      renderDetails.shouldRemove = true;
      // This field is to let the screen know this element should be removed.
      this.removed = true;
    }
    return renderDetails;
  }
}

// TODO: Make this safe by using Object.defineProperty. 
ScreenElementBase.generateId = (function() {
  let currNum = 1;
  return function(name) {
    return name + "_" + (currNum ++);
  }
})();

ScreenElementBase.types = {
  "DataHolder": "DATA_HOLDER"
}
