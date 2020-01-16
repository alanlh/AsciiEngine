class Display extends ComponentBase {
  constructor(controller) {
    super(ComponentNames.Display, controller);
    
    // this.display = new AsciiEngine.Scene();
    // Keep track of each individual panel, use AsciiEngine classes to keep track of everything.
    this.scenes = {};
    // Separately keep track of mappings from engine Ids to Scene Ids.
    // Ignore for now. 
    // TODO: Figure out of this is necessary, since all ids are already passed in.
    // this.elementMappings = {};
  }
  
  init(configs) {
    super.init({
      // TODO: ???
      // Changes in Location
      // Quest events
      [MessageTags.UpdateCurrentScreen]: this.updateCurrentScreen,
      [MessageTags.ChangeActiveScreen]: this.changeActiveScreen,
      [MessageTags.ClockTick]: this.render,
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
    if (!(message.body.sceneId in this.scenes)) {
      LOGGING.ERROR("Display does not recognize sceneId", message.body.sceneId, "in message", message);
    }
    let scene = this.scenes[message.body.sceneId];
    for (let key in message.body.elements) {
      // TODO: Ensure that key is a class/element in panel. 
      let changes = message.body.elements[key];
      if (changes[RenderElementChanges.shouldRemove]) {
        scene.removeElements(key);

        // TODO:
        // scene.removeElements(this.elementMappings[key]);
        // delete this.elementMappings[key];
        continue;
      }
      if (RenderElementChanges.firstRender in changes) {
        let spriteId = changes[RenderElementChanges.firstRender].spriteId;
        let parentIds = changes[RenderElementChanges.firstRender].parentIds;
        let sceneElement = this.dataRetriever.get(spriteId);
        let elementId = scene.addElement(parentIds, sceneElement);

        // TODO: Check against duplicates.
        // this.elementMappings[key] = elementId;
      }
      if (RenderElementChanges.visible in changes) {
        // Note that other changes must still be handled (i.e. changes while invisible)
        scene.setVisibility(key, changes[RenderElementChanges.visible]);
      }
      if (RenderElementChanges.topLeft in changes) {
        scene.moveElements(key, changes[RenderElementChanges.topLeft]);
      }
      if (RenderElementChanges.stateKey in changes) {
        scene.configureElements(key, changes[RenderElementChanges.stateKey]);
      }
      if (RenderElementChanges.priority in changes) {
        scene.orderElements(key, changes[RenderElementChanges.priority]);
      } 
    }
  }
  
  changeActiveScreen(message) {
    
  }
  
  render(message) {
    for (let sceneKey in this.scenes) {
      this.scenes[sceneKey].render();
    }
  }
}
