class Display extends ComponentBase {
  constructor(messageBoard) {
    super("RENDER", messageBoard);
    
    // this.display = new AsciiEngine.Scene();
    // Keep track of each individual screen, use AsciiEngine classes to keep track of everything.
    
  }
  
  init() {
    super.init({
      // TODO: ???
      // Changes in Location
      // Quest events
      [MessageTags.UpdateCurrentScreen]: function(message) {
        
      },
      [MessageTags.ChangeActiveScreen]: function(message) {
        
      }
    });
  }
}
