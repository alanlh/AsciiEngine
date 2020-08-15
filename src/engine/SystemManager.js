import System from "./systems/System.js";

import MessageBoard from "../utility/MessageBoard.js";
import OrderedMultiMap from "../utility/data_structures/OrderedMultiMap.js";

export default class SystemManager {
  /**
   * Creates a new SystemManager
   * @param {Engine} engine The engine for reference
   */
  constructor(engine) {
    this._engine = engine;
    
    /**
     * @type {OrderedMultiMap<number, System>}
     */
    this._activeSystems = new OrderedMultiMap();
    /**
     * @type {Object.<string, System>}
     */
    this._systems = {};
    /**
     * @type {Object.<string, number>}
     */
    this._systemPriorities = {};
    
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
    for (let systemName in this._systems) {
      let system = this._systems[systemName];
      for (let entity of operations.added) {
        if (system.check(entity)) {
          system.add(entity);
        }
      }
      
      for (let entity of operations.enabled) {
        if (system.check(entity)) {
          system.add(entity);
        }
      }
      
      for (let entity of operations.changed) {
        if (!system.has(entity) && system.check(entity)) {
          system.add(entity);
        } else if (system.has(entity) && !system.check(entity)) {
          system.remove(entity);
        }
      }
      
      for (let entity of operations.disabled) {
        if (system.has(entity)) {
          system.remove(entity);
        }
      }
      
      for (let entity of operations.deleted) {
        if (system.has(entity)) {
          system.remove(entity);
        }
      }
    }
    
    this._engine.getEntityManager().markEntityChangesAsHandled();
  }
  
  getEngine() {
    return this._engine;
  }
  
  /**
   * Iterates over all active systems in the order they should be processed in.
   */ 
  *[Symbol.iterator]() {
    for (let system of this._activeSystems) {
      yield system;
    }
  }
  
  // ---------- PUBLIC API ---------- //
  
  /**
   * Adds a system to the SystemManager. 
   * The default priority is 0.
   * By default, the system is added immediately. (DELAY NOT IMPLEMENTED)
   * 
   * @param {System} system The system to add
   * @param {number} priority The priority of the system. Lower priorities are run first.
   * @param {Boolean} delay If true, the System is guaranteed to not run until the next cycle.
   */
  addSystem(system, priority, delay) {
    priority = priority || 0;
    this._systems[system.name] = system;
    this._activeSystems.add(priority, system);
    system.init(this);
    
    // If the game has already started, then all existing entities need to be registered with the system.
    let entityManager = this.getEngine().getEntityManager();
    for (let entity of entityManager.entities) {
      if (system.check(entity)) {
        system.add(entity);
      }
    }
  }
  
  /**
   * Removes a system specified by the name.
   * 
   * @param {String} name The name of the system to remove
   * @param {Boolean} delay If true, the System is not removed until the end of the cycle.
   */
  removeSystem(name, delay) {
    if (name in this._systems) {
      let system = this._systems[name];
      if (this._systems[name].active) {
        let priority = this._systemPriorities[name];
        this._activeSystems.delete(priority, system);
      }
      delete this._systems[name];
      system.destroy();
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
      let system = this._systems[name];
      system.enable();
      this._activeSystems.add(this._systemPriorities[name], system);
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
      let system = this._systems[name];
      system.disable();
      this._activeSystems.delete(this._systemPriorities[name], system);
      return true;
    }
    return false;
  }
  
  getMessageBoard() {
    return this._messageBoard;
  }
}
