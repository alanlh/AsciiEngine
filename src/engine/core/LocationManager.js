class LocationManager extends ComponentBase {
  constructor(messageBoard) {
    super(ComponentNames.LocationManager, messageBoard);
    
    this.activeLocation = undefined;
    // TODO: Always keep player menu active.
  }
  
  init() {    
    super.init({
      // TODO: ???
      // Mainly player inputs...
      // TODO: ClockTick not needed, since individual screens have access to message board? 
      [MessageTags.ClockTick]: UtilityMethods.IGNORE,
      [MessageTags.ChangeActiveScreen]: UtilityMethods.IGNORE,
    });
    
    this.loadPersistentScreens();
    // TODO: Figure out current location and load it. Do we load the same thing every time initially?
  }
  
  loadPersistentScreens() {
    // Load maps that should always be kept in memory, e.g. main map (no?), inventory, player attributes
    
    // Also load permanent menus: Including player status panel (bottom), and a message panel (left).
  }
  
  loadActiveScreen(name) {
    // Load the screen that currently should be displayed.
  }
}
