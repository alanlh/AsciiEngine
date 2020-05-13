import BoardComponent from "./BoardComponent.js";
import CellComponent from "./CellComponent.js";

export default class BoardSystem extends AsciiEngine.System {
  constructor(width, height, mineCount) {
    super("Board");
    
    this._width = width;
    this._height = height;
    this._mineCount = mineCount;
    
    this._remaining = width * height;
    this._finished = false;
    
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
        mouseModule.subscribe(this.name, this.cells[y][x].id, ["click", "mouseenter", "mouseleave", "contextmenu"]);
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
   * Do everything in preUpdate, because why not...
   * 
   * Simply handle click events and update the components/render components.
   */
  preUpdate() {
    // TODO: Directly handle in receive message?

    this.getMessageReceiver().handleAll();
    for (let i = 0; i < this._clickLocations.length; i ++) {
      this.handleClick(...this._clickLocations[i]);
    }
    
    this._clickLocations = [];
  }
  
  handleClick(x, y, isLeftClick) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    let cellComponent = this.cells[y][x].getComponent(CellComponent.type);

    let renderComponent = this.cells[y][x].getComponent(AsciiEngine.Components.AsciiRender.type);
    
    if (this._finished) {
      // Do nothing.
      return;
    }
    
    if (isLeftClick) {
      // Do nothing if already revealed or flagged.
      if (cellComponent.revealed || cellComponent.flagged) {
        return;
      }
      if (cellComponent.hasMine) {
        // LOSE
        this.lose();
        return;
      }
      // Otherwise, set to revealed.
      cellComponent.revealed = true;
      this._remaining --;
      this.setToRevealedSprite(cellComponent, renderComponent);
      if (cellComponent.neighboringMines === 0) {
        this.handleClick(x + 1, y + 1, true);
        this.handleClick(x + 1, y, true);
        this.handleClick(x + 1, y - 1, true);
        this.handleClick(x, y + 1, true);
        this.handleClick(x, y - 1, true);
        this.handleClick(x - 1, y + 1, true);
        this.handleClick(x - 1, y, true);
        this.handleClick(x - 1, y - 1, true);
      }
      if (this._remaining === this._mineCount) {
        this.win();
        return;
      }
    } else {
      // Do nothing if already revealed.
      if (cellComponent.revealed) {
        return;
      }
      // Otherwise, flip the flag.
      cellComponent.flagged = !cellComponent.flagged;
      if (cellComponent.flagged) {
        renderComponent.spriteNameList[0] = "CellSprite-Flag";
      } else {
        renderComponent.spriteNameList[0] = "CellSprite-Empty";
      }
    }
  }
  
  setToRevealedSprite(cellComponent, renderComponent) {
    if (cellComponent.hasMine) {
      renderComponent.spriteNameList[0] = "CellSprite-Mine";
      renderComponent.styleNameList[0] = "CellStyle-Mine";
    } else if (cellComponent.neighboringMines === 0) {
      renderComponent.spriteNameList[0] = "CellSprite-Empty";
      renderComponent.styleNameList[0] = "CellStyle-Empty";
    } else {
      // Has neighboring mines.
      renderComponent.spriteNameList[0] = "CellSprite-" + cellComponent.neighboringMines;
      renderComponent.styleNameList[0] = "CellStyle-" + cellComponent.neighboringMines;
    }
  }
  
  lose() {
    if (this._finished) {
      return;
    }
    alert("You lose");
    this._finished = true;
    for (let y = 0; y < this.height; y ++) {
      for (let x = 0; x < this.width; x ++) {
        let cellComponent = this.cells[y][x].getComponent(CellComponent.type);
        this.setToRevealedSprite(
          cellComponent,
          this.cells[y][x].getComponent(AsciiEngine.Components.AsciiRender.type)
        );
        cellComponent.revealed = true;
      }
    }
  }
  
  win() {
    if (this._finished) {
      return;
    }
    this._finished = true;
    alert("You win!");
  }
  
  handleFlag(x, y) {
    let cellComponent = this.cells[y][x].getComponent(CellComponent.type);
    let renderComponent = this.cells[y][x].getComponent(AsciiEngine.Components.Render.type);
  }
  
  receiveMessage(tag, body) {
    let sections = body.target.split("-");
    let x = parseInt(sections[1]);
    // We can ignore the ID because parseInt stops after a non-digit.
    let y = parseInt(sections[2]);
    if (body.type === "click") {
      this._clickLocations.push([x, y, true]);
    } else if (body.type === "mouseenter") {
      if (!this.cells[y][x].getComponent(CellComponent.type).revealed) {
        this.cells[y][x].getComponent(AsciiEngine.Components.AsciiRender.type).styleNameList[0] = "CellStyle-Unrevealed-Hover";
      }
    } else if (body.type === "mouseleave") {
      if (!this.cells[y][x].getComponent(CellComponent.type).revealed) {
        this.cells[y][x].getComponent(AsciiEngine.Components.AsciiRender.type).styleNameList[0] = "CellStyle-Unrevealed";
      }
    } else if (body.type === "contextmenu") {
      this._clickLocations.push([x, y, false]);
    }
  }
}

BoardSystem.type = "Board";
