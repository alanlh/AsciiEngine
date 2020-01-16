class PanelElement extends ComponentBase {
  constructor(controller, template) {
    let templateData = template.parameters;
    super(UtilityMethods.generateId(templateData.name), controller);
    
    this.spriteId = templateData.spriteId;
    // this.renderElement = templateData.renderElement;
    
    this.renderedBefore = false;
    this.topLeftChanged = true;
    this.stateChanged = true;
    this.priorityChanged = true;
    this.visibilityChanged = true;
    
    this.parameters = {
      topLeft: Vector2.create(0, 0),
      state: "",
      visible: true,
      priority: 0,
    };
    for (let handlerKey in templateData.messageHandlers) {
      this.messageHandlers.add(handlerKey, templateData.messageHandlers[handlerKey]);
    }
  }
  
  init(parent) {
    super.init(Object.assign({
      // TODO: Should anything belong here? Most should be user specified...
    }, this.messageHandlers));
    
    // TODO: Check value of parent;
    this.parent = parent;
  }
  
  setRenderSettings(settings) {
    if (this.initialized) {
      LOGGING.WARN(
        "Do not update render settings via setRenderSettings after initialization."
        + "Set properties directly instead."
      );
    }
    
    this.parameters = UtilityMethods.initializeArgs(this.parameters, settings);
  }
  
  getParentList() {
    // Need to make sure parent is initialized
    let parentList = this.parent.getParentList();
    parentList.push(this.id);
    return parentList;
  }

  // TODO: MAKE SAFE.
  get topLeft() {
    return this.parameters.topLeft;
  }

  set topLeft(newTopLeft) {
    // TODO: Should the PanelElement be able to change the topLeft coord? 
    // Trust the user?
    this.topLeftChanged = true;
    this.parameters.topLeft = Vector2.copy(newTopLeft);
  }

  get state() {
    return this.parameters.state;
  }
  
  set state(newState) {
    this.stateChanged = true;
    this.parameters.state = newState;
  }
  
  get priority() {
    return this.parameters.priority;
  }
  
  set priority(newPriority) {
    this.priorityChanged = true;
    this.parameters.priority = newPriority;
  }
  
  get visibility() {
    return this.parameters.visibility;
  }
  
  set visibility(newVisibility) {
    this.visibilityChanged = true;
    this.parameters.visibility = newVisibility;
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
      renderDetails[RenderElementChanges.firstRender] = {
        spriteId: this.spriteId,
        parentIds: this.getParentList(),
      };
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
    return renderDetails;
  }
}
