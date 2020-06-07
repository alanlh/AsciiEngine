import System from "./System.js";

export default class SetSystem extends System {
  /**
   * An implementation of System that adds uses a Set to store its entities.
   * 
   * Should not be instantiated directly.
   */
  constructor(name) {
    super(name);
    if (this.constructor === SetSystem) {
      throw new TypeError("SetSystem cannot be instantiated directly!");
    }
    this.entities = new Set();
  }
  
  has(entity) {
    return this.entities.has(entity);
  }
  
  add(entity) {
    this.entities.add(entity);
  }

  remove(entity) {
    this.entities.delete(entity);
  }
}
