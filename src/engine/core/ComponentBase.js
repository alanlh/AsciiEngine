class ComponentBase {
  constructor(id, controller) {
    this.id = id;
    this.controller = controller;
    this.messageBoard = controller.messageBoard;
    this.dataRetriever = controller.dataRetriever;
    this.messageHandlers = {};
    // Settings that should be kept constant throughout the game.
    // TODO: Keep track of accepted keys, so that applyParameters only sets those.
    this.parameters = {};
  }
  
  // Data that loads after the game has started
  init(messageHandlers) {
    // TODO: Replace with lambda function?
    this.messageBoard.signup(this.id, this.receiveMessage.bind(this));
    this.signupMessageHandlers(messageHandlers);
  }
  
  signupMessageHandlers(messageHandlers) {
    this.messageBoard.subscribe(this.id, Object.keys(messageHandlers));
    this.messageHandlers = Object.assign(this.messageHandlers, messageHandlers);
  }
  
  removeMessageHandlers(handlerKeys) {
    this.messageBoard.unsubscribe(this.id, handlerKeys);
    for (let key of handlerKeys) {
      delete this.messageHandlers[key];
    }
  }
  
  receiveMessage(message) {
    if (message.tag in this.messageHandlers) {
      // TODO: Find a way to avoid .call, performance?
      // Is it better to replace this with a class lambda function?
      // https://stackoverflow.com/questions/31362292/how-to-use-arrow-functions-public-class-fields-as-class-methods
      // https://medium.com/@charpeni/arrow-functions-in-class-properties-might-not-be-as-great-as-we-think-3b3551c440b1
      this.messageHandlers[message.tag].call(this, message);
    } else {
      // "this" is the derived object.
      LOGGING.ERROR("Message ", message, " is not recognized by ", this);
    }
  }
  
  applyParameters(params) {
    for (let key in params) {
      this.parameters[key] = params[key];
    }
  }
  
  destroy() {
    this.messageBoard.withdraw(this.id);
  }
}
