import BoardSystem from "../Board/BoardSystem.js";

export default class MenuSystem extends AsciiEngine.System {
  constructor(name) {
    super(name);
    
    this.wins = 0;
    this.losses = 0;
  }
  
  startup() {
    this.wins = 0;
    this.losses = 0;
    
    let entityManager = this.getEngine().getEntityManager();
    this.getSystemManager().addSystem(new BoardSystem(10, 10, 10));
  }
  
  check(entity) {
    
  }

}

MenuSystem.type = "Menu";
