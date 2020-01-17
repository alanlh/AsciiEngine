class Display extends ComponentBase {
  constructor(controller) {
    super(ComponentNames.Display, controller);
    
    // Keep track of each individual panel, use AsciiEngine classes to keep track of everything.
    this.scenes = {};
    this.elementMappings = new ClassMap();
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
      let changes = message.body.elements[key];
      if (changes[RenderElementChanges.shouldRemove] && 
        this.elementMappings.hasClass(key)) {
        scene.removeElements(key);

        // Panel structure should ensure all deletions are necessary and sufficient.
        this.elementMappings.deleteClass(key);
        continue;
      }
      if (RenderElementChanges.firstRender in changes) {
        let spriteId = changes[RenderElementChanges.firstRender].spriteId;
        let parentIds = changes[RenderElementChanges.firstRender].parentIds;
        let sceneElement = this.dataRetriever.get(spriteId);
        let elementId = scene.addElement(parentIds, sceneElement);

        // No point keeping the sceneElement, since a copy is created anyways.
        this.elementMappings.add(elementId, undefined, parentIds);
      }
      LOGGING.ASSERT(
        this.elementMappings.hasClass(key),
        "Display does not have any elements with class", key
      );
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
