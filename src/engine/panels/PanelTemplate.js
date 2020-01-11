class PanelTemplate {
  constructor(parameters) {
    // Create object mainly to ensure that all arguments are passed in.
    this.parameters = UtilityMethods.initializeArgs({
      name: undefined, // Mandatory arg.
      panels: [],
      elements: [],
      messageHandlers: {},
      sceneId: "",
    }, parameters);
    
    Object.freeze(this.parameters);
    Object.freeze(this);
  }
  
  instantiate(controller) {
    return new Panel(controller, this);
  }
}

class PanelElementTemplate {
  constructor(parameters) {
    this.parameters = UtilityMethods.initializeArgs({
      name: undefined,
      spriteId: undefined,
      onclick: UtilityMethods.IGNORE,
      onhover: UtilityMethods.IGNORE,
    }, parameters);
    
    Object.freeze(this.parameters);
    Object.freeze(this);
  }
  
  instantiate(controller) {
    return new PanelElement(controller, this);
  }
}
