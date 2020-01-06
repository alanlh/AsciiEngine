class Panel extends ComponentBase {
  constructor(controller, templateKey) {
    super(UtilityMethods.generateId(templateKey), controller);
    
    let templateData = this.dataRetriever.get(templateKey);
    this.panels = {};
    this.elements = {};
    for (let panelTemplate of templateData.panels) {
      this.placePanel(panelTemplate.templateKey, panelTemplate);
    }
    
    for (let elementTemplate of templateData.elements) {
      this.placeElement(elementTemplate.templateKey, elementTemplate);
    }
    
    this.messageHandlers = templateKey.messageHandlers || {};
    
    this.parameters = {
      sceneId: templateData.sceneId,
      topLevelPanel: false,
      topLeft: Vector2.default(),
    };

    // TODO: HANDLE MESSAGEHANDLERS FROM TEMPLATEDATA.
  }
  
  init(parameters) {
    this.parameters = UtilityMethods.initializeArgs(this.parameters, parameters);
    if (this.parameters.topLevelPanel) {
      super.init(Object.assign({
        [MessageTags.ClockTick]: this.sendRenderRequest,
      }, this.messageHandlers));
    } else {
      super.init(this.messageHandlers);
    }
  }
  
  placeElement(elementTemplateKey, parameters) {
    // Element id should always be unique, due to generateId method.
    let element = new PanelElement(this.controller, elementTemplateKey);
    this.elements[element.id] = element;
    element.init(parameters);
    return element.id;
  }
  
  removeElement(elementId) {
    // TODO: 
  }
  
  placePanel(panelTemplateKey, parameters) {
    let panel = new Panel(this.controller, panelTemplateKey);
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
