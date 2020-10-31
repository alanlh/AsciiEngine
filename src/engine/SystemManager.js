import System from "./systems/System.js";
import SystemMessageBoard from "./SystemMessageBoard.js";

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
     * @private
     */
    this._activeSystems = new OrderedMultiMap();
    /**
     * @type {Object.<string, System>}
     * @private
     */
    this._systems = {};
    /**
     * @type {Object.<string, number>}
     * @private
     */
    this._systemPriorities = {};
    
    /**
     * @type {SystemMessageBoard}
     * @private
     */
    this._messageBoard = new SystemMessageBoard();

    /**
     * @type {Set<System>}
     * @private
     */
    this._systemsToEnable = new Set();
    // Remove and disable are different because we should not call shutdown until after end of cycle. However, we can call startup immediately.
    /**
     * @type {Set<System>}
     * @private
     */
    this._systemsToDisable = new Set();
    /**
     * @type {Set<System>}
     * @priavte
     */
    this._systemsToRemove = new Set();
  }
  
  /**
   * Sets the configuration values. 
   * 
   * @param {Object} [config] The values to set.
   */
  init(config) {
    // TODO: Implement.
  }
  
  /**
   * Enables any systems that were added.
   * Processes all changes that happened to entities in the past cycle.
   * Alerts all changes to the Systems.
   * @private
   */
  postUpdateCleanup() {
    this._processEntityUpdates();
    this._updateSystemStatuses();
  }

  /**
   * @private
   */
  _processEntityUpdates() {
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

  /**
   * @private
   */
  _updateSystemStatuses() {
    for (let system of this._systemsToEnable) {
      this._enableSystem(system);
    }
    this._systemsToEnable.clear();

    for (let system of this._systemsToDisable) {
      this._activeSystems.delete(this._systemPriorities[system.name], system);
      system.disable();
    }
    this._systemsToDisable.clear();

    for (let system of this._systemsToRemove) {
      this._removeSystem(system);
    }
    this._systemsToRemove.clear();
  }

  /**
   * @private
   * @param {System} system The system to enable
   */
  _enableSystem(system) {
    this._activeSystems.add(this._systemPriorities[system.name], system);
    system.enable();
  }

  /**
   * @private
   * @param {System} system The system to disable
   */
  _disableSystem(system) {
    this._activeSystems.delete(this._systemPriorities[system.name], system);
    system.disable();
  }
  
  /**
   * @private
   * @param {System} system The system to remove. It should already have been disabled.
   */
  _removeSystem(system) {
    if (system.active) {
      this._disableSystem(system);
    }
    delete this._systems[system.name];
    delete this._systemPriorities[system.name];
    system.destroy();
  }
  
  /**
   * @returns {Engine}
   */
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
   * @param {number} [priority] The priority of the system. Lower priorities are run first. Default 0.
   * @param {Boolean} [delay] If true, the System is guaranteed to not run until the next cycle. Default false.
   */
  addSystem(system, priority, delay) {
    if (system.name in this._systems) {
      throw new Error("Two systems with the same cannot be added at the same time. Name: ", system.name);
    }
    priority = priority || 0;
    this._systems[system.name] = system;
    this._systemPriorities[system.name] = priority;
    system.init(this);

    if (delay) {
      this._systemsToEnable.add(system);
    } else {
      this._enableSystem(system);
    }
    
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
   * @param {Boolean} [delay] If true, the System is not removed until the end of the cycle.
   */
  removeSystem(name, delay) {
    if (name in this._systems) {
      let system = this._systems[name];
      if (delay) {
        this._systemsToRemove.add(system);
      } else {
        this._removeSystem(system);
      }
    }
  }
  
  /**
   * Enables a system for processing.
   * 
   * @param {String} name The name of the system to enable.
   * @param {Boolean} [delay] If true, the System is guaranteed to not run until the next cycle.
   * @return {Boolean} true if a system with the specified name was found.
   */
  enableSystem(name, delay) {
    // TODO: Give the option to delay this from taking effect until the next cycle.
    if (!(name in this._systems)) {
      return false;
    }
    let system = this._systems[name];
    if (delay) {
      this._systemsToEnable.add(system);
    } else {
      this._enableSystem(system);
    }
    return true;
  }
  
  /**
   * Disables a system for processing.
   * 
   * @param {String} name The name of the system to enable.
   * @param {Boolean} [delay] If true, the System is guaranteed to not run until the next cycle.
   * @return {Boolean} true if a system with the specified name was found.
   */
  disableSystem(name, delay) {
    // TODO: Give the option to delay this from taking effect until the next cycle.
    // TODO: Make this a configuration setting.
    if (name in this._systems) {
      let system = this._systems[name];
      if (delay) {
        this._systemsToDisable.add(system);
      } else {
        this._disableSystem(system);
      }
      return true;
    }
    return false;
  }
  
  /**
   * @returns {SystemMessageBoard} The system's message board
   */
  getMessageBoard() {
    return this._messageBoard;
  }
}
