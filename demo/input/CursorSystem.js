import CursorComponent from "./CursorComponent.js";

import BlinkerComponent from "./BlinkerComponent.js";

export default class CursorSystem extends AsciiEngine.System {
  constructor() {
    super("Cursor");
    
    this._cursor = new AsciiEngine.Entity("Cursor");
  }
  
  startup() {
    let entityManager = this.getEngine().getEntityManager();
    
    let resourceManager = this.getEngine().getModule(AsciiEngine.Engine.ModuleSlots.ResourceManager);
    this._cursor.setComponent(new AsciiEngine.Components.Position(1, 1, 100));
    this._cursor.setComponent(resourceManager.get("cursor")());
    this._cursor.setComponent(new CursorComponent());
    this._cursor.setComponent(new BlinkerComponent(5));
    entityManager.requestAddEntity(this._cursor);
    
    let mouseInputModule = this.getEngine().getModule("MouseInput");
    mouseInputModule.signup(this.name, this.getMessageReceiver());
    mouseInputModule.subscribe(this.name, mouseInputModule.GLOBAL, ["click"])
    
    let keyboardInputModule = this.getEngine().getModule("KeyboardInput");
    keyboardInputModule.signup(this.name, this.getMessageReceiver());
    keyboardInputModule.subscribe(this.name, keyboardInputModule.ALL, ["keydown"]);
    keyboardInputModule.subscribe(this.name, "ArrowDown", ["keydown"]);
    keyboardInputModule.subscribe(this.name, "ArrowUp", ["keydown"]);
    keyboardInputModule.subscribe(this.name, "ArrowLeft", ["keydown"]);
    keyboardInputModule.subscribe(this.name, "ArrowRight", ["keydown"]);
  }
  
  shutdown() {
    entityManager.requestDeleteEntity(this._cursor);
    
    let keyboardInputModule = this.getEngine().getModule("KeyboardInput");
    keyboardInputModule.withdraw(this.name);
  }
  
  postUpdate() {
    // We handle everything in postUpdate because the cursor moves after everything else has been handled.
    this.getMessageReceiver().handleAll();
  }
  
  receiveMessage(source, tag, body) {
    // Three ways of changing cursor position.
    // Mouse click sets the cursor position to that coordinate
    // Arrow keys change the coordinate in the the given direction.
    // A visible character increments the mouse position by 1 (possibly to next row)
    // The last method is handled by the InputHandler.
    // 
    // The only event this is receiving should be related to cursor repositioning
    let position = this._cursor.getComponent(AsciiEngine.Components.Position.type);
    let x = position.x;
    let y = position.y;
    if (source === "click") {
      x = body.coords.x;
      y = body.coords.y;
    } else if (source === "keydown") {
      if (tag === "ArrowDown") {
        y ++;
      } else if (tag === "ArrowUp") {
        y --;
      } else if (tag === "ArrowRight") {
        x ++;
      } else if (tag === "ArrowLeft") {
        x --;
      }
    }
    x = Math.max(1, Math.min(x, 30));
    y = Math.max(1, Math.min(y, 10));
    position.x = x;
    position.y = y;
  }
}
