class Panel extends ComponentBase {
  constructor(controller, template) {
    let templateData = template.parameters;
    super(UtilityMethods.generateId(templateData.name), controller);
    
    this.panels = new ClassMap();
    this.elements = new ClassMap();
    for (const panelPlacement of templateData.panels) {
      this.placePanel(panelPlacement.templateKey, panelPlacement, panelPlacement.classes);
    }
    for (const elementPlacement of templateData.elements) {
      this.placeElement(elementPlacement.templateKey, elementPlacement, elementPlacement.classes);
    }
    
    // No need to create a copy because bind
    for (let handlerKey in templateData.messageHandlers) {
      this.messageHandlers.add(handlerKey, templateData.messageHandlers[handlerKey]);
    }
    
    this.parameters = {
      sceneId: "", // The name of the scene on which to display
      topLevelPanel: false, // Whether this is owned by the PanelManager
      topLevelId: undefined, // The id of the top level panel.
    };
    
    this.parent = undefined;
    
    this.renderSettings = {
      topLeft: Vector2.default(),
      // TODO: Also include settings like visibility?
    }
  }
  
  init() {
    super.init(this.messageHandlers);
        
    for (const elementKey of this.elements) {
      this.elements.getElementById(elementKey).init(this);
    }
    
    for (const panelKey of this.panels) {
      this.panels.getElementById(panelKey).initWithParent(this);
    }
  }
  
  initWithParent(parent) {
    this.parent = parent;
    
    this.parameters.sceneId = parent.parameters.sceneId;
    this.parameters.topLevelId = parent.parameters.topLevelId;
    
    this.init();
  }
  
  initTopLevelPanel(parameters) {
    this.parameters.topLevelPanel = true;
    this.parameters.topLevelId = this.id;
    
    this.parameters.sceneId = parameters.sceneId;
    
    this.init();
    this.addMessageHandlers({
      [MessageTags.ClockTick]: this.sendRenderRequest,
    });
  }
  
  getParentList() {
    if (this.parameters.topLevelPanel) {
      return [this.id];
    }
    let parentList = this.parent.getParentList();
    parentList.push(this.id);
    return parentList;
  }
  
  setRenderSettings(newSettings) {
    this.renderSettings = UtilityMethods.initializeArgs(this.renderSettings, 
      newSettings);
  }
  
  placeElement(templateKey, parameters, classes) {
    // Element id should always be unique, due to generateId method.
    let elementTemplate = this.dataRetriever.get(templateKey);
    let element = elementTemplate.instantiate(this.controller);
    element.setRenderSettings(parameters);
    // TODO: Check value of classes.
    this.elements.add(element.id, element, classes || []);
    if (this.initialized) {
      element.init(this);
    }
    return element.id;
  }
  
  removeElement(elementId) {
    if (!this.elements.hasId(elementId)) {
      LOGGING.WARN("Attempting to remove", elementId, "which is not in panel", this.id);
      return;
    }
    this.sendRemovalRequest(elementId);

    this.elements.getElementById(elementId).destroy();
    this.elements.deleteId(elementId);
  }
  
  placePanel(templateKey, parameters, classes) {
    let panelTemplate = this.dataRetriever.get(templateKey)
    let panel = panelTemplate.instantiate(this.controller);
    panel.setRenderSettings(parameters);
    // TODO: Check value of classes.
    this.panels.add(panel.id, panel, classes || []);
    if (this.initialized) {
      panel.initWithParent(this);
    }
    return panel.id;
  }
  
  removePanel(panelId) {
    if (!(panelId in this.panels)) {
      LOGGING.WARN("Attempting to remove", panelId, "which is not in panel", this.id);
      return;
    }
    this.sendRemovalRequest(panelId);
    
    this.panels.getElementById(panelId).destroy();
    this.panels.deleteId(panelId);
  }
  
  removeClass(className) {
    let elementsToRemove = this.elements.getIdsByClass(className);
    for (const elementId of elementsToRemove) {
      this.removeElement(elementId);
    }
    
    let panelsToRemove = this.panels.getIdsByClass(className);
    for (const panelId of panelsToRemove) {
      this.removePanel(panelId);
    }
  }
  
  getRenderDetails() {
    let renderBody = {};
    for (const key of this.elements) {
      renderBody[key] = this.elements.getElementById(key).getRenderDetails();
    }
    
    for (const key of this.panels) {
      Object.assign(renderBody, this.panels.getElementById(key).getRenderDetails());
    }
    
    for (const key in renderBody) {
      if (RenderElementChanges.topLeft in renderBody[key]) {
        renderBody[key][RenderElementChanges.topLeft] 
          = Vector2.add(renderBody[key][RenderElementChanges.topLeft], 
            this.renderSettings.topLeft);
      }
    }
    return renderBody;
  }
  
  sendRemovalRequest(key) {
    let body = {
      elements: {
        [key]: {
          [RenderElementChanges.shouldRemove]: true,
        }
      },
      sceneId: this.parameters.sceneId,
      panelId: this.parameters.topLevelId,
    };
    
    this.messageBoard.post(new Message(
      this.id,
      MessageTags.UpdateCurrentScreen,
      body
    ));
  }
  
  sendRenderRequest() {
    let renderBody = {
      elements: this.getRenderDetails(),
      sceneId: this.parameters.sceneId,
      panelId: this.parameters.topLevelId,
    };
    
    this.messageBoard.post(new Message(
      this.id,
      MessageTags.UpdateCurrentScreen,
      renderBody
    ));
  }
  
  destroy() {
    for (const panelKey of this.panels) {
      this.panels.getElementById(panelKey).destroy();
    }
    
    for (const elementKey of this.elements) {
      this.elements.getElementById(elementKey).destroy();
    }
    
    this.panels = undefined;
    this.elements = undefined;
    // TODO: Send message to Display to remove? Only if topLevelPanel...
    super.destroy();
  }
}
