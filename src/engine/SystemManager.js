import System from "./systems/System.js";

import MessageBoard from "../utility/data_structures/MessageBoard.js";

export default class SystemManager {
  constructor(engine) {
    this._engine = engine;
    
    this._systems = {};
    
    this._messageBoard = new MessageBoard();
  }
  
  /**
   * Sets the configuration values. 
   * 
   * @param {Object} config The values to set.
   */
  init(config) {
    // TODO: Implement.
  }
  
  /**
   * Processes all changes that happened to entities in the past cycle.
   * Alerts all changes to the Systems.
   */
  processEntityOperations() {
    let operations = this._engine.getEntityManager().requestEntityChanges();
    for (let system of this) {
      for (let entity of operations.added) {
        if (system.check(entity)) {
          system.addEntity(entity);
        }
      }
      
      for (let entity of operations.enabled) {
        if (system.check(entity)) {
          system.addEntity(entity);
        }
      }
      
      for (let entity of operations.changed) {
        if (!system.hasEntity(entity) && system.checkEntity(entity)) {
          system.addEntity(entity);
        } else if (systm.hasEntity(entity) && !system.checkEntity(entity)) {
          system.removeEntity(entity);
        }
      }
      
      for (let entity of operations.disabled) {
        if (system.hasEntity(entity)) {
          system.removeEntity(entity);
        }
      }
      
      for (let entity of operations.deleted) {
        if (system.hasEntity(entity)) {
          system.removeEntity(entity);
        }
      }
    }
    
    this._engine.getEntityManager().markEntityChangesAsHandled();
  }
  
  get engine() {
    return this._engine;
  }
  
  /**
   * Iterates over all active systems in the order they should be processed in.
   */ 
  *[Symbol.iterator]() {
    // Return in order of priority.
    for (let systemName in this._systems) {
      let system = this._systems[systemName];
      if (system.active) {
        yield system;
      }
    }
  }
  
  // ---------- PUBLIC API ---------- //
  
  /**
   * Adds a system to the SystemManager.
   * 
   * @param {System} system The system to add
   * @param {Boolean} delay If true, the System is guaranteed to not run until the next cycle.
   */
  addSystem(system, delay) {
    // TODO: Implement priority.
    this._systems[system.name] = system;
    system.init(this);
    
    // TODO: IMPORTANT
    // If the game has already started, then all existing entities need to be registered with the system.
  }
  
  /**
   * Removes a system specified by the name.
   * 
   * @param {String} name The name of the system to remove
   * @param {Boolean} delay If true, the System is not removed until the end of the cycle.
   */
  removeSystem(name, delay) {
    if (name in this._systems) {
      this._systems[name].destroy();
      delete this._systems[name];
    }
  }
  
  /**
   * Enables a system for processing.
   * 
   * @param {String} name The name of the system to enable.
   * @param {Boolean} delay If true, the System is guaranteed to not run until the next cycle.
   * @return {Boolean} true if a system with the specified name was found.
   */
  enableSystem(name, delay) {
    // TODO: Give the option to delay this from taking effect until the next cycle.
    // TODO: Make this a configuration setting.
    if (name in this._systems) {
      this._systems[name].enable();
      return true;
    }
    return false;
  }
  
  /**
   * Disables a system for processing.
   * 
   * @param {String} name The name of the system to enable.
   * @param {Boolean} delay If true, the System is guaranteed to not run until the next cycle.
   * @return {Boolean} true if a system with the specified name was found.
   */
  disableSystem(name, delay) {
    // TODO: Give the option to delay this from taking effect until the next cycle.
    // TODO: Make this a configuration setting.
    if (name in this._systems) {
      this._systems[name].disable();
      return true;
    }
    return false;
  }
  
  getMessageBoard() {
    return this._messageBoard;
  }
}
