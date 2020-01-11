class Panel extends ComponentBase {
  constructor(controller, template) {
    let templateData = template.parameters;
    super(UtilityMethods.generateId(templateData.name), controller);
    
    this.panels = {};
    this.elements = {};
    for (let panelPlacement of templateData.panels) {
      this.placePanel(this.dataRetriever.get(panelPlacement.templateKey), 
        panelPlacement);
    }
    
    for (let elementPlacement of templateData.elements) {
      this.placeElement(this.dataRetriever.get(elementPlacement.templateKey), 
        elementPlacement);
    }
    
    // No need to create a copy because bind
    this.messageHandlers = templateData.messageHandlers;
    
    this.parameters = {
      sceneId: "",
      topLevelPanel: false,
      topLeft: Vector2.default(),
    };

    // TODO: HANDLE MESSAGEHANDLERS FROM TEMPLATEDATA.
  }
  
  init(parameters) {
    this.parameters = UtilityMethods.initializeArgs(this.parameters, parameters);
    super.init(this.messageHandlers);
  }
  
  indicateTopLevelPanel(parameters) {
    this.parameters.topLevelPanel = true;
    this.parameters.sceneId = parameters.sceneId;
    this.signupMessageHandlers({
      [MessageTags.ClockTick]: this.sendRenderRequest,
    })
  }
  
  placeElement(elementTemplate, parameters) {
    // Element id should always be unique, due to generateId method.
    let element = elementTemplate.instantiate(this.controller);
    this.elements[element.id] = element;
    element.init(parameters);
    return element.id;
  }
  
  removeElement(elementId) {
    // TODO: 
  }
  
  placePanel(panelTemplate, parameters) {
    let panel = panelTemplate.instantiate(this.controller);
    this.panels[panel.id] = panel;
    panel.init(parameters);
    return panel.id;
  }
  
  removePanel(panelId) {
    // TODO:
  }
  
  getRenderDetails() {
    let renderBody = {};
    for (let key in this.elements) {
      renderBody[key] = this.elements[key].getRenderDetails();
    }
    
    for (let key in this.panels) {
      Object.assign(renderBody, this.panels[key].getRenderDetails())
    }
    
    for (let key in renderBody) {
      if (RenderElementChanges.topLeft in renderBody[key]) {
        renderBody[key][RenderElementChanges.topLeft] 
          = Vector2.add(renderBody[key][RenderElementChanges.topLeft], 
            this.parameters.topLeft);
      }
    }
    return renderBody;
  }
  
  sendRenderRequest() {
    // TODO: Remove element if shouldRemove is marked true.
    LOGGING.ASSERT(this.parameters.topLevelPanel, 
      "Lower level panel sending a render request", this.id);
    let renderBody = {
      elements: this.getRenderDetails(),
      screenId: this.id,
      sceneId: this.parameters.sceneId,
    };
    
    this.messageBoard.post(new Message(
      this.id,
      MessageTags.UpdateCurrentScreen,
      renderBody
    ));
  }
  
  destroy() {
    super.destroy();
    this.currentlyActive = false;
    // TODO: Send message to Display to remove?
  }
}

// TODO: defineProperty?
Panel.constructors = {
  
};
