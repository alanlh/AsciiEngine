import MessageReceiver from "../../utility/data_structures/MessageReceiver.js";

export default class System {
  constructor(name) {
    this._engine = undefined;
    this._systemManager = undefined;
    this._entityManager = undefined;
    
    this._name = name;
    
    this._priority = 0;
    
    this._active = false;
    
    /**
     * this.entities maintains the entities relevant to the system. 
     * It can (should) be overridden in a custom implementation
     * in a manner that makes sense for the system.
     */
    this.entities = new Set();
    
    this._messageReceiver = new MessageReceiver(this.receiveMessage.bind(this));
  }
  
  get type() {
    return this.constructor.type;
  }
  
  get name() {
    return this._name;
  }
  
  init(systemManager) {
    this._systemManager = systemManager;
    // TODO: Remove? Prevent direct access to EntityManager?
    this._engine = systemManager.engine;
    // This should only be accessed in order to directly modify an Entity, rather than component data.
    this._entityManager = this._engine.getEntityManager();
    
    this._systemManager.getMessageBoard().signup(this._name, this._messageReceiver);
    
    this._active = true;
    
    this.startup();
  }
  
  // ---------- PUBLIC API --------- //
  
  getSystemManager() {
    return this._systemManager;
  }
  
  getEngine() {
    return this._engine;
  }
  
  getMessageReceiver() {
    return this._messageReceiver;
  }
  
  enable() {
    if (!this._active) {
      this._active = true;
    }
  }
  
  disable() {
    if (this._active) {
      this._active = false;
    }
  }
  
  get active() {
    return this._active;
  }
  
  // ---------- PUBLIC INTERFACE ---------- //
  // Methods above should not be overriden. Methods below should be.
  
  /**
   * Runs when the System is initialized. Should be independent of any entities.
   */
  startup() {}
  
  /**
   * Runs when the system is removed from the SystemManager.
   */
  shutdown() {}
  
  /**
   * A virtual method Systems can override.
   * Determines of the entity is of importance to the System.
   * 
   * This method should NOT have any side effects. Doing so may result in undefined behavior.
   */
  check(entity) {
    return false;
  }
  
  /**
   * Returns true if and only if the System has this entity.
   * 
   * This method can be overriden to fit an alternative data structure.
   * However, failure to implement this correctly may result in undefined behavior.
   */
  hasEntity(entity) {
    return this.entities.has(entity);
  }
  
  /**
   * Adds the entity to this.entities.
   * This method can be overridden to fit an alternative data structure. 
   */
  addEntity(entity) {
    this.entities.add(entity);
  }
  
  /**
   * Removes the entity from this.entities.
   * This method can be overridden to fit an alternative data structure.
   * 
   * Any alternate implementation MUST be defined so that the System no longer processes it.
   * Failure to do so may result in undefined behavior.
   */
  removeEntity(entity) {
    this.entities.delete(entity);
  }
  
  /**
   * A virtual method Systems can override
   * Called before main update method.
   */
  preUpdate() {}
  
  /**
   * A virtual method Systems can override.
   * The main update for computation.
   */
  update() {}
  
  /**
   * A virtual method Systems can override.
   * Called after main update method.
   */
  postUpdate() {}
  
  /**
   * A virtual method Systems can override.
   * Passed to a message receiver. To run, call "this.getMessageReceiver().handle();"
   * This should not be an expensive method. Ideally, this should pass the message to another data structure,
   * where it can be handled later. 
   * 
   * @param {String} tag The tag of the message.
   * @param {Anything} body The message
   */
  receiveMessage(tag, body) {}
}
