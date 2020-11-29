import System from "./System.js";

export default class SetSystem extends System {
  /**
   * An implementation of System that adds uses a Set to store its entities.
   * 
   * Should not be instantiated directly.
   * @param {string} name The name of the system
   */
  constructor(name) {
    super(name);
    if (this.constructor === SetSystem) {
      throw new TypeError("SetSystem cannot be instantiated directly!");
    }
    /**
     * @protected
     * @type {Set<Entity>}
     */
    this.entities = new Set();
  }
  
  /**
   * 
   * @param {Entity} entity The entity to check for
   * @returns {boolean} Whether or not the System has the given entity
   */
  has(entity) {
    return this.entities.has(entity);
  }
  
  /**
   * 
   * @param {Entity} entity The entity to add
   */
  add(entity) {
    this.entities.add(entity);
  }

  /**
   * 
   * @param {Entity} entity The entity to remove
   */
  remove(entity) {
    this.entities.delete(entity);
  }
}
