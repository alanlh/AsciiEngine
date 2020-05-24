import MessageBoard from "../../utility/MessageBoard.js";
import AsciiGL from "../../graphics/AsciiGL.js";

export default class AsciiMouseInputModule {
  constructor(agl) {
    this.GLOBAL = AsciiMouseInputModule.Global;
    this._agl = agl;
    
    this._registeredTargets = {};
    
    this._messageBoards = {};
    for (let name in AsciiGL.EventTypes) {
      this._messageBoards[AsciiGL.EventTypes[name]] = new MessageBoard();
    }
    
    agl.setHandler((event, type, target, coords) => {
      if (target !== undefined) {
        this._messageBoards[type].post(type, target, {
          type: type,
          target: target,
          event: event,
          coords: coords,
        });
      }
      this._messageBoards[type].post(type, this.GLOBAL, {
        type: type,
        target: target,
        event: event,
        coords: coords,
      });
    });
  }
  
  signup(id, receiver) {
    for (let name in this._messageBoards) {
      this._messageBoards[name].signup(id, receiver);
    }
  }
  
  withdraw(id) {
    for (let name in this._messageBoards) {
      this._messageBoards[name].withdraw(id);
    }
  }
  
  subscribe(id, target, events) {
    for (let eventType of events) {
      if (eventType in this._messageBoards) {
        this._messageBoards[eventType].subscribe(id, [target]);
      } else {
        console.warn("Message type", eventType, "not supported");
      }
    }
  }
  
  unsubscribe(id, target, events) {
    for (let eventType of events) {
      if (eventType in this._messageBoards) {
        this._messageBoards[eventType].unsubscribe(id, [target]);
      } else {
        console.warn("Message type", eventType, "not supported");
      }
    }
  }
}

AsciiMouseInputModule.Global = Symbol("Global");
