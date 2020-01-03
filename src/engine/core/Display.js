class Display extends ComponentBase {
  constructor(messageBoard) {
    super(ComponentNames.Display, messageBoard);
    
    // this.display = new AsciiEngine.Scene();
    // Keep track of each individual panel, use AsciiEngine classes to keep track of everything.
    this.scenes = {};
    // Separately keep track of mappings from engine Ids to Scene Ids.
    this.elementMappings = {};
  }
  
  init(configs) {
    super.init({
      // TODO: ???
      // Changes in Location
      // Quest events
      [MessageTags.UpdateCurrentScreen]: this.updateCurrentScreen,
      [MessageTags.ChangeActiveScreen]: this.changeActiveScreen,
    });
    
    for (let sceneKey in this.parameters.scenes) {
      this.scenes[sceneKey] = new Scene({
        divId: this.parameters.scenes[sceneKey].name,
        boundingBoxDimens: this.parameters.scenes[sceneKey].boundingBoxDimens,
        eventHandlers: {},
      });
    }
  }
  
  updateCurrentScreen(message) {
    let scene = this.scenes[message.body.sceneId];
    for (let key in message.body.elements) {
      let changes = message.body.elements[key];
      if (changes[RenderElementChanges.shouldRemove]) {
        scene.removeElements(this.elementMappings[key]);
        delete this.elementMappings[key];
        continue;
      }
      if (RenderElementChanges.firstRender in changes) {
        // TODO: FIGURE OUT HOW TO GET AN ELEMENT.
        let spriteId = changes[RenderElementChanges.firstRender];
        let sceneElement = undefined; // TODO: Convert spriteId to Scene Element....
        let elementId = scene.addElement([message.body.sceneId, key], sceneElement);
        // TODO: Check against duplicates. There should be none if inheriting from PanelElementBase
        this.elementMappings[key] = elementId;
      }
      if (RenderElementChanges.visible in changes) {
        // Note that other changes must still be handled (i.e. changes while invisible)
        scene.setVisibility(this.elementMappings[key], changes[RenderElementChanges.visible]);
      }
      if (RenderElementChanges.topLeft in changes) {
        scene.moveElements(this.elementMappings[key], changes[RenderElementChanges.topLeft]);
      }
      if (RenderElementChanges.stateChanged in changes) {
        scene.configureElements(this.elementMappings[key], changes[RenderElementChanges.stateChanged]);
      }
    }
  }
  
  changeActiveScreen(message) {
    
  }
}
