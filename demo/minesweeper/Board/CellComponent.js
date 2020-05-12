export default class CellComponent extends AsciiEngine.Component {
  constructor(x, y) {
    super();
    
    this.x = x;
    this.y = y;
    
    this.neighboringMines = 0;
    this.hasMine = false;
    this.revealed = false;
    this.flagged = false;
  }
}

CellComponent.type = "Cell";
