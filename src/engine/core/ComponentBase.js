class ComponentBase {
  constructor(id, messageBoard) {
    this.id = id;
    this.messageBoard = messageBoard;
  }
  
  // Data that loads after the game has started
  init() {
    LOGGING.ERROR("ComponentBase.init is abstract and should be called directly.");
  }
  
  receiveMessage(message) {
    LOGGING.ERROR("ComponentBase.receiveMessage is abstract and should be called directly.");
  }
  
  ERROR_MessageNotRecognized(message) {
    // TODO: Figure out whether "this" returns the base or derived object
    // Is it okay to just print the ID?
    LOGGING.ERROR("Message ", message, " is not recognized by ", this);
  }
}
