class WorldBase {
  constructor(name, type, manager, settings) {
    this.name = name;
    /**
      Quest, Menu, Map, Location
    **/
    this.type = type;
    this.manager = manager;
    
    settings = UtilityMethods.initializeArgs({
      "gravity": 0, 
      "boundingBox": Vector.create({x: 0, y: 0}),
      
    }, settings);
    
    
  }
}
