class PanelBase extends ComponentBase {
  constructor(name, type, manager, settings) {
    /** Only one of each should exist at any time **/
    // TODO: Use UtilityMethods.generateId or not?
    // The same should not be used more than once at any given time.
    super(name, manager.messageBoard);
    /**
      Quest, Menu, Map, Location
      TODO: Is this needed????
    **/
    this.type = type;
    this.manager = manager;
    
    UtilityMethods.initializeArgs({
      displaySize: undefined, /** By default, ignore? **/
      topLeft: Vector2.create(0, 0),
    }, this.parameters);
    
    this.elements = {};
    this.currentlyActive = false;
  }
  
  init(messageHandlers) {
    // TODO: Are there any message handlers shared across all screens?
    super.init(messageHandlers);
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
      renderBody[elements][key] = this.elements[key].getRenderDetails();
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
