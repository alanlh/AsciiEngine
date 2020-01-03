class DataHolder extends PanelElementBase {
  constructor(name, type, settings) {
    super(name, PanelElementBase.DataHolder, undefined /**TODO: New text box every time**/, settings);
    
    this.settings = UtilityMethods.initializeArgs({
      "defaultValue": undefined,
      "updateFunction": undefined,
      "listenedMessages": undefined
      // TODO:
    }, settings);
    
    this.currentValue = this.settings.defaultValue;
  }
  
  
}
