class LocationManager extends ComponentBase {
  constructor(messageBoard) {
    super("LOCATION_MANAGEER", messageBoard);
    
  }
  
  init() {
    this.messageBoard.signup(this.id, this.receiveMessage);
    
    this.messageBoard.subscribe(this.id, [
      // TODO: ???
      // Mainly player inputs...
    ]);
    
    loadPersistentMaps();
    // TODO: Figure out current location and load it. Do we load the same thing every time initially?
  }
  
  receiveMessage(message) {
    
  }
  
  loadPersistentMaps() {
    // Load maps that should always be kept in memory, e.g. main map, inventory, player attributes
  }
}
