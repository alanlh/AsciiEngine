import CursorComponent from "./CursorComponent.js";

export default class InputHandler extends AsciiEngine.System {
  constructor() {
    super("InputHandler");
    
    this.spriteBuilders = [];
    let templateArray = [];
    for (let x = 0; x < 31; x ++) {
      templateArray.push("");
    }
    
    this.paramArrays = [];
    this.rowSprites = [];
    for (let y = 0; y < 10; y ++) {
      // Use the same templateArray because it's empty and should never be modified.
      this.spriteBuilders.push(new AsciiEngine.GL.SpriteBuilder(templateArray));
      this.paramArrays.push([]);
      for (let x = 0; x < 30; x ++) {
        this.paramArrays[y].push(" ");
      }
      this.rowSprites.push(
        this.spriteBuilders[y].construct(this.paramArrays[y])
      );
    }
  }
  
  // The only entity it cares about is the cursor. 
  check(entity) {
    return entity.hasComponent(CursorComponent.type);
  }
  
  hasEntity(entity) {
    return check(entity);
  }
  
  addEntity(entity) {
    this._cursor = entity;
  }
  
  removeEntity(entity) {
    if (entity === this._cursor) {
      this._cursor = undefined;
    }
  }
  
  startup() {
    let resourceManager = this.getEngine().getModule(AsciiEngine.Engine.ModuleSlots.ResourceManager);

    for (let y = 0; y < 10; y ++) {
      resourceManager.add("Row-" + y, this.rowSprites[y]);
      
      let rowEntity = new AsciiEngine.Entity("Row-" + y);
      rowEntity.setComponent(new AsciiEngine.Components.Position(1, y + 1, 0));
      rowEntity.setComponent(new AsciiEngine.Components.AsciiRender(
        ["Row-" + y], ["style-none"], [[0, 0, 0]]
      ));
      
      this.getEngine().getEntityManager().requestAddEntity(rowEntity);
    }
    
    let keyboardInput = this.getEngine().getModule("KeyboardInput");
    keyboardInput.signup(this.name, this.getMessageReceiver());
    keyboardInput.subscribe(this.name, keyboardInput.ALL, ["keydown"]);
  }
  
  shutdown() {
    let keyboardInput = this.getEngine().getModule("KeyboardInput");
    keyboardInput.withdraw(this.name);
  }
    
  preUpdate() {
    this.getMessageReceiver().handleAll();
  }
  
  update() {
    let resourceManager = this.getEngine().getModule(AsciiEngine.Engine.ModuleSlots.ResourceManager);
    
    for (let y = 0; y < 10; y ++) {
      let rowSprite = this.spriteBuilders[y].construct(this.paramArrays[y]);
      // Update the sprite in the resource manager, without modifying the entity/component.
      resourceManager.add("Row-" + y, rowSprite);
    }
  }
  
  receiveMessage(source, tag, body) {
    // TODO: Handle Backspace, etc.
    if (source === "keydown") {
      let key = body.key;
      if (key.length === 1) {
        // Visible character, proceed.
        let position = this._cursor.getComponent(AsciiEngine.Components.Position.type);
        this.paramArrays[position.y - 1][position.x - 1] = key;
        
        // Alternatively, we could derive a CursorPositionComponent system, which handles this automatically.
        position.x ++;
        // Harded-coded numbers...
        if (position.x === 31) {
          // Wrap to next line.
          position.y ++;
          position.x = 1;
          if (position.y === 11) {
            // Wrap to beginining of textbox.
            position.y = 1;
          }
        }
      }
    }
  }
}
