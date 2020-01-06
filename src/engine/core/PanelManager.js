class PanelManager extends ComponentBase {
  constructor(controller) {
    super(ComponentNames.PanelManager, controller);
    
    this.activeLocation = undefined;
    // TODO: Always keep player menu active.
    
    // Only keep the current one.
    // If need to switch, ask DataRetriever
    this.currentScreenId = undefined;
    this.currentScreen = {};
  }
  
  init() {    
    super.init({
      // TODO: ???
      // Mainly player inputs...
      // TODO: ClockTick not needed, since individual screens have access to message board? 
      [MessageTags.ClockTick]: UtilityMethods.IGNORE,
      [MessageTags.ChangeActiveScreen]: UtilityMethods.IGNORE,
    });
    
    if (this.parameters.startScreen) {
      let screenTemplateData = this.dataRetriever.get(this.parameters.startScreen);
      
      for (let template of screenTemplateData.panels) {
        let panel = new Panel(this.controller, template.templateKey);
        panel.init({
          topLevelPanel: true,
          topLeft: template.topLeft || Vector2.default(),
        });
        this.currentScreen[panel.id] = panel;
      }
      
      this.currentScreenId = this.parameters.startScreen;
    } else {
      LOGGING.WARN("PanelManager default screen is not defined. Display is blank.");
    }
  }
  
  loadPersistentScreens() {
    // Load maps that should always be kept in memory, e.g. main map (no?), inventory, player attributes
    
    // Also load permanent menus: Including player status panel (bottom), and a message panel (left).
  }
  
  loadActiveScreen(name) {
    // Load the screen that currently should be displayed.
  }
}
