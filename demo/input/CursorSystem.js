import AsciiEngine from "../../dist/engine.js";

import CursorComponent from "./CursorComponent.js";

import BlinkerComponent from "./BlinkerComponent.js";

export default class CursorSystem extends AsciiEngine.System {
  constructor() {
    super("Cursor");
    
    this._cursor = new AsciiEngine.Entity("Cursor");
  }
  
  startup() {
    let entityManager = this.getEntityManager();
    
    let resourceManager = this.getEngine().getModule(AsciiEngine.ModuleSlots.Resources);
    this._cursor.setComponent(new AsciiEngine.Components.Position(1, 1, 100));
    this._cursor.setComponent(resourceManager.get("cursor").construct());
    this._cursor.setComponent(new CursorComponent());
    this._cursor.setComponent(new BlinkerComponent(5));
    entityManager.requestAddEntity(this._cursor);
    
    this.subscribe(["MouseEvent", undefined, "click"], this._mouseHandler, true);
    this.subscribe(["KeyboardEvent", undefined, "keydown", "Arrow"], this._arrowKeyHandler, true)
  }
  
  shutdown() {
    entityManager.requestDeleteEntity(this._cursor);
  }
    
  _mouseHandler(event) {
    this._setPosition(event.coords.x, event.coords.y);
  }

  _arrowKeyHandler(body, descriptor) {
    if (body.event.key === "ArrowDown") {
      this._incrementPosition(0, 1);
    } else if (body.event.key === "ArrowUp") {
      this._incrementPosition(0, -1);
    } else if (body.event.key === "ArrowRight") {
      this._incrementPosition(1, 0);
    } else if (body.event.key === "ArrowLeft") {
      this._incrementPosition(-1, 0);
    }
  }

  _incrementPosition(x, y) {
    let position = this._cursor.getComponent(AsciiEngine.Components.Position.type);
    position.x = Math.max(1, Math.min(position.x + x, 30));
    position.y = Math.max(1, Math.min(position.y + y, 10));
  }

  _setPosition(x, y) {
    let position = this._cursor.getComponent(AsciiEngine.Components.Position.type);
    x = Math.max(1, Math.min(x, 30));
    y = Math.max(1, Math.min(y, 10));
    position.x = x;
    position.y = y;
  }
}
