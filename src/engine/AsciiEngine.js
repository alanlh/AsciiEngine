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

  /**
   * @returns {EntityManager}
   */
  getEntityManager() {
    return this._entityManager;
  }

  /**
   * @returns {SystemManager}
   */
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
   * Currently unused. TODO: Remove?
   */
  applyModuleConfig(config) {
    for (let type in this._modules) {
      this.modules[type].init(config);
    }
  }

  /**
   * Returns whether or not the game loop is running.
   * @returns {boolean}
   */
  get running() {
    return this._intervalKey !== undefined;
  }

  /**
   * Starts the game loop
   * @param {number} updateRate Number of milliseconds between updates
   */
  startLoop(updateRate) {
    if (updateRate !== undefined) {
      this._millisecPerUpdate = updateRate;
    }
    this._intervalKey = setInterval(() => { this.update() }, this._millisecPerUpdate);
  }

  pauseLoop() {
    clearInterval(this._intervalKey);
    this._intervalKey = undefined;
  }

  /**
   * Updates the game by one tick.
   */
  update() {
    // Currently, process between update functions, so that data isn't changed as the result of a message.
    // This isn't set in stone, maybe change as necessary.
    // The two other alternatives are process immediately during update, or always process immediately.
    this._systemManager.getMessageBoard().processMessages();
    for (let system of this._systemManager) {
      system.preUpdate();
    }
    this._systemManager.getMessageBoard().processMessages();
    for (let system of this._systemManager) {
      system.update();
    }
    this._systemManager.getMessageBoard().processMessages();
    for (let system of this._systemManager) {
      system.postUpdate();
    }
    this._systemManager.getMessageBoard().processMessages();
    // Update Entity/System Managers.
    this.getEntityManager().processEntityOperations();
    this.getSystemManager().processEntityOperations();
  }
}