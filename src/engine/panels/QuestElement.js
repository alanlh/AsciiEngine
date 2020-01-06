class QuestElement extends PanelElement {
  constructor(name, type, renderSpriteId, settings) {
    super(name, type, renderSpriteId, settings);
    
    this.settings = UtilityMethods.initializeArgs({
      "collision": true,
      "visible": true,
      "has_gravity": true,
      "topLeft": Vector2.create(0, 0),
      "fixedVelocity": false,
      
    }, settings);
    
    // Need to include collision squares
    this.collisionSquares = new Set2D();
    
    this.topLeft = this.settings.topLeft;
  }
}
