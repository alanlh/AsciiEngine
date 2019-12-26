class ComponentBase {
  constructor(id, messageBoard) {
    this.id = id;
    this.messageBoard = messageBoard;
    this.messageHandlers = undefined;
  }
  
  // Data that loads after the game has started
  init(messageHandlers) {
    this.messageBoard.signup(this.id, this.receiveMessage);
    this.messageBoard.subscribe(this.id, Object.keys(messageHandlers));
    this.messageHandlers = messageHandlers;    
  }
  
  receiveMessage(message) {
    if (message.tag in this.messageHandlers) {
      this.messageHandlers[message.tag](message);
    } else {
      // TODO: Figure out whether "this" returns the base or derived object
      // Is it okay to just print the ID?
      LOGGING.ERROR("Message ", message, " is not recognized by ", this);
    }
  }
  
  destroy() {
    this.withdraw(this.id);
  }
}
