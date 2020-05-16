import EntityManager from "./EntityManager.js";
import SystemManager from "./SystemManager.js";

export default class Engine {
  /**
   * The overall container for an AsciiEngine instance.
   * 
   * @param {Object} config The configurations for the Engine 
   * (including EntityManager and SystemManager).
   */
  constructor(config) {
    this._initialized = false;
    
    this._entityManager = new EntityManager(this);
    
    this._systemManager = new SystemManager(this);
    
    this._modules = {};
    
    this._millisecPerUpdate = 1000; // Default to 1 FPS
    this._intervalKey = undefined;
    this._delta = 0;
  }
  
  getEntityManager() {
    return this._entityManager;
  }
  
  getSystemManager() {
    return this._systemManager;
  }
  
  get modules() {
    return this._modules;
  }
  
  setModule(type, module) {
    this.modules[type] = module;
  }
  
  getModule(type) {
    return this.modules[type];
  }
  
  /**
   * TODO: Remove?
   */
  applyModuleConfig(config) {
    for (let type in this._modules) {
      this.modules[type].init(config);
    }
  }
  
  get running() {
    return this._intervalKey !== undefined;
  }
  
  /**
   * Starts the game loop.
   * 
   * @param {Number} updateRate Number of milliseconds between updates.
   */
  startLoop(updateRate) {
    if (updateRate !== undefined) {
      this._millisecPerUpdate = updateRate;
    }
    this._intervalKey = setInterval(() => {this.update()}, this._millisecPerUpdate);
  }
  
  pauseLoop() {
    clearInterval(this._intervalKey);
    this._intervalKey = undefined;
  }
  
  /**
   * Updates the game by one tick.
   */ 
  update() {
    for (let system of this._systemManager) {
      system.preUpdate();
    }
    
    for (let system of this._systemManager) {
      system.update();
    }
    
    for (let system of this._systemManager) {
      system.postUpdate();
    }
    
    // Update Entity/System Managers.
    this.getEntityManager().processEntityOperations();
    this.getSystemManager().processEntityOperations();
  }
}

Engine.ModuleSlots = {
  Graphics: Symbol("GraphicsLibrary"),
  ResourceManager: Symbol("ResourceManager"),
}

Object.freeze(Engine.Modules);
