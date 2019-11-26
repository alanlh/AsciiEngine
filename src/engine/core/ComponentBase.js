class ComponentBase {
  constructor(id, messageBoard) {
    this.id = id;
    this.messageBoard = messageBoard;
  }
  
  init() {
    LOGGING.ERROR("ComponentBase.init is abstract and should be called directly.");
  }
  
  receiveMessage(message) {
    LOGGING.ERROR("ComponentBase.receiveMessage is abstract and should be called directly.");
  }
  
  ERROR_MessageNotRecognized(message) {
    LOGGING.ERROR("Message ", message, " is not recognized by ", this);
  }
}
