class ScreenBase extends ComponentBase {
  constructor(name, type, manager, settings) {
    /** Only one of each should exist at any time **/
    super(this, manager.messageBoard);
    /**
      Quest, Menu, Map, Location
      TODO: Is this needed????
    **/
    this.type = type;
    this.manager = manager;
    
    this.baseSettings = UtilityMethods.initializeArgs({
      "displaySize": undefined, /** By default, ignore? **/
    }, settings);
    
    this.elements = {};
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
    let renderBody = {};
    for (let key in this.elements) {
      renderBody[key] = this.elements[key].getRenderDetails();
    }
    
    this.messageBoard.post(new Message(
      this.id,
      MessageTags.UpdateCurrentScreen,
      renderBody
    ));
  }
}
