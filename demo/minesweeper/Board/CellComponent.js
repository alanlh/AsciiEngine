export default class CellComponent extends AsciiEngine.Component {
  constructor() {
    super();
    
    this.neighboringMines = 0;
    this.hasMine = false;
    this.revealed = false;
    this.flagged = false;
  }
}

CellComponent.type = "Cell";
