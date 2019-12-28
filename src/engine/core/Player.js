class Player extends ComponentBase {
  constructor(messageBoard) {
    super("PLAYER", messageBoard);
    
    // PlayerAttributes
    this.personal_attributes = {
      // TODO: Convert into subclass?
      maxHp: 100,
      currHp: 100
    };
    
    this.inventory = {
      // TODO: Convert into subclass?
    };
    
    this.resources = {
      // TODO: Convert into subclass?
    }
  }
  
  init() {
    super.init({
      // Attacked
      // Resource Update
      // Item Update
    })
    // TODO: Anything else that needs to be done?
    // Default values, etc. 
  }
}
