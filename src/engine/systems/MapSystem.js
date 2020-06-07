import System from "./System.js";

export default class MapSystem extends System {
  constructor(name) {
    super(name);
    
    this.entities = {};
  }
  
  has(entity) {
    return entity.id in this.entities;
  };
  
  add(entity) {
    this.entities[entity.id] = entity;
  }
  
  remove(entity) {
    delete this.entities[entity.id];
  }
}
