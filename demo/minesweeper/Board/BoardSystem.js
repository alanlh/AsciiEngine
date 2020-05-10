import BoardComponent from "./BoardComponent.js";
import CellComponent from "./CellComponent.js";

export default class BoardSystem extends AsciiEngine.System {
  constructor(width, height, mineCount) {
    super("Board");
    
    this._width = width;
    this._height = height;
    this._mineCount = mineCount;
    
    this._remaining = width * height;
    
    this._clickLocations = [];
    
    this._board = new AsciiEngine.Entity("container");
    this._board.setComponent(new BoardComponent(
      width, height
    ));
    this._board.setComponent(new AsciiEngine.Components.Position(
      5, 5, 0
    ));
    this.cells = [];
    mineCount = 0;
    for (let y = 0; y < height; y ++) {
      this.cells.push([]);
      for (let x = 0; x < width; x ++) {
        let cell = new AsciiEngine.Entity("Cell-" + x + "-" + y);
        let cellComponent = new CellComponent();
        // FOR NOW, choose mines independently at random. Ignore the actual desired amount.
        if (Math.random() > 0.9) {
          cellComponent.hasMine = true;
          mineCount += 1;
        }
        cell.setComponent(cellComponent);
        cell.setComponent(new AsciiEngine.Components.Position(
          x, y
        ));
        cell.setComponent(new AsciiEngine.Components.AsciiRender(
          ["CellSprite-Empty"], ["CellStyle-Unrevealed"], [[0, 0, 0]]
        ));
        this.cells[y].push(cell);
        
        // Add cell as child of board.
        this._board.addChild(this.cells[y][x]);
      }
    }
    this._mineCount = mineCount;

    // Compute number of neighboring mines.
    for (let x = 0; x < width; x ++) {
      for (let y = 0; y < height; y ++) {
        if (this.cells[y][x].getComponent(CellComponent.type).hasMine) {
          continue;
        }
        for (let dy = -1; dy < 2; dy ++) {
          for (let dx = -1; dx < 2; dx ++) {
            if (x + dx >= 0 && x + dx < width 
              && y + dy >= 0 && y + dy < height
              && this.cells[y + dy][x + dx].getComponent(CellComponent.type).hasMine) {
              this.cells[y][x].getComponent(CellComponent.type).neighboringMines ++;
            }
          }
        }
      }
    }
    
    // Modify the number of 
  }
  
  get width() {
    return this._width;
  }
  
  get height() {
    return this._height;
  }
  
  get mineCount() {
    return this._mineCount;
  }
  
  startup() {
    // Entities have been created. Notify the entity manager about it.
    let entityManager = this.getEngine().getEntityManager();
    let mouseModule = this.getEngine().getModule("mouse");
    mouseModule.signup(this.name, this.getMessageReceiver());
    
    // Add board as an entity. This also adds all Cells as an entity as well.
    entityManager.requestAddEntity(this._board);
    for (let y = 0; y < this.height; y ++) {
      for (let x = 0; x < this.width; x ++) {
        // For each cell, listen for click events
        mouseModule.subscribe(this.name, this.cells[y][x].id, ["click"]);
      }
    }
  }
  
  shutdown() {
    let mouseModule = this.getEngine().getModule("mouse");
    mouseModule.withdraw(this.id);
  }
  
  /**
   * check(entity) always returns false 
   * because all entities relevant to BoardSystem are created by it.
   */
  
  /**
   * This should be the only System using CellComponents/BoardComponents. 
   * Also only uses CellComponents/BoardComponent.
   */
  hasEntity(entity) {
    return entity.hasComponent(CellComponent.type) || entity.hasComponent(BoardComponent.type);
  }
  
  /**
   * Never add entities...
   */
  addEntity() {}
  
  /**
   * Should only occur when the BoardSystem is being deleted.
   * 
   * In which case, do nothing...
   */
  removeEntity() {}
  
  /**
   * Do everything in preUpdate, because why not...
   * 
   * Simply handle click events and update the components/render components.
   */
  preUpdate() {
    // TODO: Directly handle in receive message?

    this.getMessageReceiver().handleAll();
    for (let i = 0; i < this._clickLocations.length; i ++) {
      this.handleReveal(this._clickLocations[i][0], this._clickLocations[i][1]);
    }
    
    this._clickLocations = [];
  }
  
  handleReveal(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    let cellComponent = this.cells[y][x].getComponent(CellComponent.type);
    if (cellComponent.revealed) {
      return;
    }
    let renderComponent = this.cells[y][x].getComponent(AsciiEngine.Components.AsciiRender.type);
    if (cellComponent.hasMine) {
      // LOSE :(
      renderComponent.spriteNameList[0] = "CellSprite-Mine";
      renderComponent.styleNameList[0] = "CellStyle-Mine";
      this.lose();
    } else {
      // Reveal number, if 0, recursively reveal all nearby squares.
      this._remaining -= 1;
      cellComponent.revealed = true;
      
      // Change the Sprite to be revealed.
      console.log(cellComponent.neighboringMines);
      if (cellComponent.neighboringMines === 0) {
        renderComponent.spriteNameList[0] = "CellSprite-Empty";
        renderComponent.styleNameList[0] = "CellStyle-Empty";
        this.handleReveal(x + 1, y + 1);
        this.handleReveal(x + 1, y);
        this.handleReveal(x + 1, y - 1);
        this.handleReveal(x, y + 1);
        this.handleReveal(x, y - 1);
        this.handleReveal(x - 1, y + 1);
        this.handleReveal(x - 1, y);
        this.handleReveal(x - 1, y - 1);
      } else {
        
        renderComponent.spriteNameList[0] = "CellSprite-" + cellComponent.neighboringMines;
        renderComponent.styleNameList[0] = "CellStyle-" + cellComponent.neighboringMines;
      }
      if (this._remaining === this._mineCount) {
        this.win();
      }
    }
  }
  
  lose() {
    for (let y = 0; y < this.height; y ++) {
      for (let x = 0; x < this.width; x ++) {
        this.handleReveal(x, y);
      }
    }
  }
  
  win() {
    alert("You win!");
  }
  
  handleFlag(x, y) {
    let cellComponent = this.cells[y][x].getComponent(CellComponent.type);
    let renderComponent = this.cells[y][x].getComponent(AsciiEngine.Components.Render.type);
  }
  
  receiveMessage(tag, body) {
    if (body.type === "click") {
      let sections = body.target.split("-");
      // We can ignore the ID because parseInt stops after a non-digit.
      if (sections[0] === "Cell") {
        this._clickLocations.push([parseInt(sections[1]), parseInt(sections[2])]);
      }
    }
    
  }
}

BoardSystem.type = "Board";
