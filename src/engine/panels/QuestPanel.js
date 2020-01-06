class QuestPanel extends Panel {
  constructor(name, type, manager, settings) {
    super(name, type, manager, settings);
    
    this.settings = UtilityMethods.initializeArgs({
      "background": undefined,
      "boundingBox": Vector2.create(0, 0)
    }, settings);
    
    // Quests need to support collision detection. 
    this.collisionDetector = new CollisionDetector();
  }
  
  placeElement(element, topLeft, startingState) {
    super.placeElement();
    
    this.collisionDetector.insertSet2D(element.id, element.collisionSquares); 
  }
}
