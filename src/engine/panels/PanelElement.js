class PanelElement extends ComponentBase {
  constructor(controller, templateKey) {
    super(UtilityMethods.generateId(templateKey), controller);
    
    let templateData = this.dataRetriever.get(templateKey);
    this.spriteId = templateData.spriteId;
    // this.renderElement = templateData.renderElement;
    
    this.renderedBefore = false;
    this.topLeftChanged = true;
    this.stateChanged = true;
    this.priorityChanged = true;
    this.visibilityChanged = true;
    this.markedForRemoval = false;
    this.removed = false;
    
    // TODO: HANDLE MESSAGEHANDLERS FROM TEMPLATEDATA.
  }
  
  init(parameters) {
    super.init(Object.assign({
      // TODO: Should anything belong here? Most should be user specified...
    }, this.messageHandlers));
    
    this.parameters = UtilityMethods.initializeArgs({
      topLeft: Vector2.create(0, 0),
      state: "",
      visible: true,
      priority: 0
    }, parameters);
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
      renderDetails[RenderElementChanges.firstRender] = this.spriteId;
      this.renderedBefore = true;
    }
    if (this.topLeftChanged) {
      renderDetails[RenderElementChanges.topLeft] = this.parameters.topLeft;
      this.topLeftChanged = false;
    }
    if (this.stateChanged) {
      renderDetails[RenderElementChanges.stateKey] = this.parameters.state;
      this.stateChanged = false;
    }
    if (this.visibilityChanged) {
      renderDetails[RenderElementChanges.visible] = this.parameters.visible;
      this.visibilityChanged = false;
    }
    if (this.priorityChanged) {
      renderDetails[RenderElementChanges.priority] = this.parameters.priority;
      this.priorityChanged = false;
    }
    if (this.markedForRemoval) {
      renderDetails[RenderElementChanges.shouldRemove] = true;
      // This field is to let the screen know this element should be removed.
      this.removed = true;
    }
    return renderDetails;
  }
}

// TODO: Move this to GlobalNames?
PanelElement.types = {
  DataHolder: "DATA_HOLDER"
}
