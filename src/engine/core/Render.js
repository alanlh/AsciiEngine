class Render extends ComponentBase {
  constructor(messageBoard) {
    super("RENDER", messageBoard);    
  }
  
  init() {
    this.messageBoard.signup(this.id, this.receiveMessage);
    
    this.messageBoard.subscribe(this.id, [
      // TODO: ???
      // Changes in Location
      // Quest events
      
    ]);
  }
  
  receiveMessage(message) {
    
  }
}
