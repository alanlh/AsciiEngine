import System from "./System.js";

export default class MapSystem extends System {
  constructor() {
    super();
    
    this.entities = {};
  }
  
  hasEntity(entity) {
    return entity.id in this.entities;
  };
  
  addEntity(entity) {
    this.entities[entity.id] = entity;
  }
  
  removeEntity(entity) {
    delete this.entities[entity.id];
  }
}