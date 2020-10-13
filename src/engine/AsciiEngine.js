import EntityManager from "./EntityManager.js";
import SystemManager from "./SystemManager.js";

export default class Engine {
  /**
   * The overall container for an AsciiEngine instance.
   * 
   * @param {Object} [config] The configurations for the Engine 
   * (including EntityManager and SystemManager).
   */
  constructor(config) {
    /**
     * @type {boolean} Whether or not the engine is initialized.
     * @private 
     */
    this._initialized = false;

    /**
     * @type {EntityManager}
     * @private
     */
    this._entityManager = new EntityManager(this);

    /**
     * @type {SystemManager}
     * @private
     */
    this._systemManager = new SystemManager(this);

    /**
     * @type {Object<string | symbol, any>}
     * @private
     */
    this._modules = {};

    /**
     * @type {number}
     * @private
     */
    this._millisecPerUpdate = 1000; // Default to 1 FPS

    /**
     * @type {number}
     * @private
     */
    this._intervalKey = undefined;

    /**
     * @type {number}
     * @private
     */
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

  /**
   * @returns {Object.<string | symbol, any>}
   */
  get modules() {
    return this._modules;
  }

  /**
   * 
   * @param {string | symbol} type The name of the module being added
   * @param {any} module The module
   */
  setModule(type, module) {
    this.modules[type] = module;
  }

  /**
   * Returns a module
   * @param {string | symbol} type The name of the module to retrieve
   * @returns {any}
   */
  getModule(type) {
    return this.modules[type];
  }

  /**
   * Currently unused. TODO: Remove?
   * @deprecated
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
   * @param {number} [updateRate] Number of milliseconds between updates
   */
  startLoop(updateRate) {
    if (updateRate !== undefined) {
      this._millisecPerUpdate = updateRate;
    }
    this._intervalKey = setInterval(() => { this.update() }, this._millisecPerUpdate);
  }

  /**
   * Pauses the game loop.
   */
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