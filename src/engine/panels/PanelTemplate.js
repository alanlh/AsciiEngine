class PanelTemplate {
  constructor(parameters) {
    // Create object mainly to ensure that all arguments are passed in.
    this.parameters = UtilityMethods.initializeArgs({
      name: undefined, // Mandatory arg.
      panels: [],
      elements: [],
      messageHandlers: {},
    }, parameters);
    
    let formattedPanelData = new Set();
    for (let placementData of this.parameters.panels) {
      formattedPanelData.add(this.formatPanelPlacement(placementData));
    }
    this.parameters.panels = formattedPanelData;
    
    let formattedElementData = new Set();
    for (let placementData of this.parameters.elements) {
      formattedElementData.add(this.formatElementPlacement(placementData));
    }
    this.parameters.elements = formattedElementData;
    
    if (new.target === PanelTemplate) {
      Object.freeze(this.parameters);
      Object.freeze(this);
    }
  }
  
  instantiate(controller) {
    return new Panel(controller, this);
  }
  
  formatPanelPlacement(placementData) {
    return UtilityMethods.initializeArgs({
      templateKey: undefined, // Mandatory
      topLeft: Vector2.default(),
      classes: [],
    }, placementData);
  }
  
  formatElementPlacement(placementData) {
    return UtilityMethods.initializeArgs({
      templateKey: undefined, // Mandatory
      topLeft: Vector2.default(),
      classes: [],
      state: "",
      visible: true,
      priority: 0,
    }, placementData);
  }
}

class TopLevelPanelTemplate extends PanelTemplate {
  constructor(parameters) {
    parameters.elements = [];
    super(parameters);
    
    if (new.target === TopLevelPanelTemplate) {
      Object.freeze(this.parameters);
      Object.freeze(this);
    }
  }
  
  formatPanelPlacement(placementData) {
    if (!("sceneId" in placementData)) {
      LOGGING.ERROR("TopLevelPanelTemplate parameters is missing required setting sceneId", placementData.sceneId);
    }
    
    return UtilityMethods.initializeArgs({
      templateKey: undefined, // Mandatory
      topLeft: Vector2.default(),
      classes: [],
      sceneId: "",
    }, placementData);
  }
}

class PanelElementTemplate {
  constructor(parameters) {
    this.parameters = UtilityMethods.initializeArgs({
      name: undefined,
      spriteId: undefined,
      onclick: UtilityMethods.IGNORE,
      onhover: UtilityMethods.IGNORE,
      messageHandlers: {}
    }, parameters);
    
    Object.freeze(this.parameters);
    Object.freeze(this);
  }
  
  instantiate(controller) {
    return new PanelElement(controller, this);
  }
}
