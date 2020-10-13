import System from "./System.js";

export default class MapSystem extends System {
  /**
   * Creates a new System that uses a map to store its entities.
   * The entities are recorded by ID. 
   * Useful for systems where the exact entity or order of entities does not matter, 
   * but it is important to keep track of individuals.
   * @param {string} name The name of the system
   */
  constructor(name) {
    super(name);
    
    this.entities = {};
  }
  
  /**
   * Checks if the system has a certain Entity 
   * @param {Entity} entity The entity to check for
   * @returns {boolean} Whether or not the system has the specified entity
   */
  has(entity) {
    return entity.id in this.entities;
  };
  
  /**
   * 
   * @param {Entity} entity The entity to add
   */
  add(entity) {
    this.entities[entity.id] = entity;
  }
  
  /**
   * 
   * @param {Entity} entity The entity to remove
   */
  remove(entity) {
    delete this.entities[entity.id];
  }
}
