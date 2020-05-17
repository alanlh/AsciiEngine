import MessageBoard from "../../utility/MessageBoard.js";

export default class KeyboardInputModule {
  constructor() {
    this._messageBoards = {};
    
    for (let eventType in KeyboardInputModule.EventTypes) {
      let eventName = KeyboardInputModule.EventTypes.eventType;
      this_messageBoards[eventName] = new MessageBoard();
      
      // Use the "key" property of the event as the events to listen for.
      document.addEventListener(eventName, (event) => {
        this._messageBoards[eventName].post(event.key, event);
      });
    }
  }
  
  signup(id, receiver) {
    for (let eventType in this._messageBoards) {
      this._messageBoards[eventType].signup(id, receiver);
    }
  }
  
  withdraw(id) {
    for (let eventType in this._messageBoards) {
      this._messageBoards[eventType].withdraw(id, receiver);
    }
  }
  
  subscribe(id, target, events) {
    for (let event of events) {
      if (event in this._messageBoards) {
        this._messageBoards[event].subscribe(id, [target]);
      } else {
        console.warn("Keyboard event", event, "is not supported");
      }
    }
  }
  
  unsubscribe(id, target, events) {
    for (let event of events) {
      if (event in this._messageBoards) {
        this._messageBoards[event].unsubscribe(id, [target]);
      } else {
        console.warn("Keyboard event", event, "is not supported");
      }
    }
  }
}

KeyboardInputModule.EventTypes = {
  KEY_DOWN: "keydown",
  KEY_UP: "keyup",
}
