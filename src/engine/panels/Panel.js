class Panel extends ComponentBase {
  constructor(controller, templateKey) {
    super(UtilityMethods.generateId(templateKey), controller);
    
    let templateData = this.dataRetriever.get(templateKey);
    this.panels = {};
    this.elements = {};
    this.topLeftCoords = {};
    for (let subpanel of templateData.panels) {
      let panel = new Panel(this.controller, subpanel.templateKey);
      this.panels[panel.id] = panel;
      this.topLeftCoords[panel.id] = subpanel.topLeft;
      subpanel.init();
    }
    
    for (let elementTemplate of templateData.elements) {
      let element = new PanelElement(this.controller, elementTemplate.templateKey);
      this.elements[element.id] = element;
      this.elements[element.id].initializeContainer(this, elementTemplate.topLeft);
      this.topLeftCoords[element.id] = elementTemplate.topLeft;
      element.init();
    }
    
    this.messageHandlers = templateKey.messageHandlers || {};
    
    this.parameters = {};
    this.parameters.sceneId = templateData.sceneId;
  }
  
  init() {
    super.init(Object.assign({
      [MessageTags.ClockTick]: this.sendRenderRequest,
    }, this.messageHandlers));
  }
  
  placeElement(element, topLeft, startingState) {
    // Element id should always be unique, due to generateId method.
    this.elements[element.id] = element;
    element.initializeContainer(this, topLeft, startingState, visible);
  }
  
  sendRenderRequest() {
    // TODO: Remove element if shouldRemove is marked true.
    let renderBody = {
      elements: {},
      screenId: this.id,
      sceneId: this.parameters.sceneId,
    };
    for (let key in this.elements) {
      renderBody.elements[key] = this.elements[key].getRenderDetails();
    }
    
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
