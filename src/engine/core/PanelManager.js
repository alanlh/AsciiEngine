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
      this.loadActiveScreen(this.parameters.startScreen);
    } else {
      LOGGING.WARN("PanelManager default screen is not defined. Display is blank.");
    }
  }
  
  loadActiveScreen(name) {
    if (this.currentScreenId) {
      // TODO: Clear existing screen
    }
    
    let screenTemplateData = this.dataRetriever.get(this.parameters.startScreen).parameters;
    
    // TODO: Move this into a separate method?
    for (const placementData of screenTemplateData.panels) {
      const panelTemplate = this.dataRetriever.get(placementData.templateKey);
      const panel = panelTemplate.instantiate(this.controller);
      panel.setRenderSettings(placementData);
      panel.initTopLevelPanel(placementData);
      this.currentScreen[panel.id] = panel;
    }
    
    this.currentScreenId = this.parameters.startScreen;
  }
}
