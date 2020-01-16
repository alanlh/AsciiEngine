class ComponentBase {
  constructor(id, controller) {
    this.id = id;
    this.controller = controller;
    this.messageBoard = controller.messageBoard;
    this.dataRetriever = controller.dataRetriever;
    this.messageHandlers = new Multimap();
    // Settings that should be kept constant throughout the game.
    // TODO: Keep track of accepted keys, so that applyParameters only sets those.
    this.parameters = {};
    this.initialized = false;
  }
  
  // Data that loads after the game has started
  init(messageHandlers) {
    // TODO: Replace with lambda function?
    this.messageBoard.signup(this.id, this.receiveMessage.bind(this));
    for (let newHandlerKey in messageHandlers) {
      this.messageHandlers.add(newHandlerKey, messageHandlers[newHandlerKey]);
    }
    this.messageBoard.subscribe(this.id, this.messageHandlers.getKeys());
    this.initialized = true;
  }
  
  addMessageHandlers(newMessageHandlers) {
    for (const handlerKey in newMessageHandlers) {
      if (!(this.messageHandlers.has(handlerKey))) {
        this.messageBoard.subscribe(this.id, [handlerKey]);
      }
      this.messageHandlers.add(handlerKey, newMessageHandlers[handlerKey]);
    }
  }
  
  removeMessageHandlers(handlerKeys) {
    this.messageBoard.unsubscribe(this.id, handlerKeys);
    for (let key of handlerKeys) {
      delete this.messageHandlers[key];
    }
  }
  
  receiveMessage(message) {
    if (this.messageHandlers.has(message.tag)) {
      // TODO: Find a way to avoid .call, performance?
      // Is it better to replace this with a class lambda function?
      // https://stackoverflow.com/questions/31362292/how-to-use-arrow-functions-public-class-fields-as-class-methods
      // https://medium.com/@charpeni/arrow-functions-in-class-properties-might-not-be-as-great-as-we-think-3b3551c440b1
      let allHandlers = this.messageHandlers.getKey(message.tag);
      for (let handler of allHandlers) {
        handler.call(this, message);
      }
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
