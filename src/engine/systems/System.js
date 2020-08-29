export default class System {
  constructor(name) {
    this._engine = undefined;
    this._systemManager = undefined;
    this._entityManager = undefined;
    
    this._name = name;
    
    this._priority = 0;
    
    this._active = false;
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
    this._engine = systemManager.getEngine();
    // This should only be accessed in order to directly modify an Entity, rather than component data.
    this._entityManager = this._engine.getEntityManager();

    this._active = true;
    
    this.startup();
  }
 
  destroy() {
    this.shutdown();
    this.unsubscribe([]);
  }

  // ---------- PUBLIC API --------- //
  
  getSystemManager() {
    return this._systemManager;
  }
  
  getEngine() {
    return this._engine;
  }

  getEntityManager() {
    return this._entityManager;
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

  /**
   * A wrapper around SystemMessageBoard's subscribe.
   * @param {Array<string>} descriptor The event path descriptor
   * @param {import("../SystemMessageBoard").EventHandler} handler The event handler
   * @param {boolean} bind Whether or not the event handler should be bound to this.
   * @param {string?} source The source system. If undefined, will accept any system.
   */
  subscribe(descriptor, handler, bind, source) {
    if (bind) {
      handler = handler.bind(this);
    }
    this.getSystemManager().getMessageBoard().subscribe(
      this.name, descriptor, handler, source
    );
  }

  /**
   * A wrapper around SystemMessageBoard's unsubscribe.
   * @param {Array<string>} descriptor The path descriptor of the event
   */
  unsubscribe(descriptor) {
    this.getSystemManager().getMessageBoard().unsubscribe(
      this.name, descriptor
    );
  }

  /**
   * A wrapper around SystemMessageBoard's post.
   * @param {Array<string>} descriptor 
   * @param {any} body 
   * @param {string?} target 
   */
  postMessage(descriptor, body, target) {
    this.getSystemManager().getMessageBoard().post(
      this.name, descriptor, body, target
    )
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
  has(entity) {}
  
  /**
   * Adds the entity to the system.
   * The implementation should make sense for how the derived system stores its entities.
   */
  add(entity) {}
  
  /**
   * Removes the entity from this.entities.
   * The implementation should make sense for how the derived system stores its entities.
   *
   * Any alternate implementation MUST be defined so that the System no longer processes it.
   * Failure to do so may result in undefined behavior.
   */
  remove(entity) {}
  
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
}
