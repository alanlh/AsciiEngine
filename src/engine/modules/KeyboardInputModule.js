import MessageBoard from "../../utility/MessageBoard.js";

export default class KeyboardInputModule {
  constructor() {
    this.ALL = "ALL_KEYS";
    this._messageBoards = {};
    
    for (let eventType in KeyboardInputModule.EventTypes) {
      let eventName = KeyboardInputModule.EventTypes[eventType];
      this._messageBoards[eventName] = new MessageBoard();
      
      // Use the "key" property of the event as the events to listen for.
      document.addEventListener(eventName, (event) => {
        if (document.activeElement === document.body || document.activeElement === null) {
          // Only listen if nothing else is in focus.
          // TODO: Make it so that it must be focused on the target element.
          // How?
          this._messageBoards[eventName].post(eventName, event.key, event);
          // "" means listen for all events.
          this._messageBoards[eventName].post(eventName, this.ALL, event);
          if (event.keyCode <= 40 && event.keyCode >= 37) {
            event.preventDefault();
          } else if (event.keyCode === 32) {
            event.preventDefault();
          }
        }
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
