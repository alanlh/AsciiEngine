import Functions from "../utility/Functions.js"

export default class Entity {
  constructor(name) {
    this._name = name;
    this._id = Functions.generateId(this._name);
    
    this._initialized = false;
    this._entityManager = undefined;
    
    this._components = {};
    this._parent = undefined;
    this._children = {};
    
    this._changed = true;
    
    this._enabled = true;
    this._ancestorsEnabled = true;
  }
  
  /**
   * Creates a copy, including of all children and all components.
   * 
   * TODO: Implement.
   * 
   * @return {Entity} The clone.
   */
  clone() {
    
  }
  
  /**
   * Called by the entityManager after being inserted.
   */
  init(entityManager) {
    this._initialized = true;
    this._entityManager = entityManager;
    this._entityManager.notifyAddition(this);
    // Now inits all children as well.
    for (let childId in this._children) {
      this._children[childId].init(entityManager);
    }
  }
  
  get initialized() {
    return this._initialized;
  }
  
  /**
   * Destroys self and any children.
   * 
   * If initialized, notifies EntityManager of destruction.
   * Do not call directly if initialized. Call Entity.markForDeletion instead.
   */
  destroy() {
    // First destories all children.
    for (let childId in this._children) {
      this._children[childId].destroy();
    }
    
    // Remove from parent, if have one.
    // TODO: Is there a better way w/o directly accessing properties?
    if (this._parent) {
      delete this._parent._children[this.id];
    }
    
    if (this.initialized) {
      this._entityManager.notifyDeletion(this);
    } 
  }
  
  setParent(parent) {
    this._parent = parent;
  }
  
  getParent() {
    return this._parent;
  }
  
  get name() {
    return this._name;
  }
  
  get id() {
    return this._id;
  }
  
  // ---------- PUBLIC API ----------- //
  
  /**
   * After insertion into the EntityManager, all set operations are asynchronous. 
   * The operation is sent to the EntityManager, which performs it once the cycle is over.
   * 
   * The public and private versions of each method are placed together for convenience.
   * However, the private versions (beginning with _) should not be called directly.
   */
  
  /**
   * Sets the component of the entity.
   * 
   * Public version of this method. 
   * Passes to EntityManager.requestSetComponent if initialized already.
   */ 
  setComponent(component) {
    if (this.initialized) {
      this._entityManager.requestSetComponent(this, component)
    } else {
      this._setComponent(component);
    }
  }
  
  /**
   * Sets the component of the entity. Notifies entityManager of change.
   * 
   * Private version of this method. Should not be called directly.
   */
  _setComponent(component) {
    this._components[component.type] = component;
    if (this.initialized) {
      this._entityManager.notifyComponentChange(this, component);
    }
  }
  
  /**
   * Returns the component of the specified type associated with this entity.
   * 
   * Should be called in Systems to get the relevant data.
   */
  getComponent(type) {
    if (this.hasComponent(type)) {
      return this._components[type];
    }
    // TODO: Replace with custom logging.
    console.warn("Entity", id, "does not have component of type ", type);
  }
  
  /**
   * Returns true if this entity has a component of the specified type.
   * 
   * Useful for checking if this entity should be processed by a System.
   */
  hasComponent(type) {
    return type in this._components;
  }
  
  /**
   * Deletes a component from the entity.
   * 
   * Public version of this method. Passes to EntityManager.requestDeleteComponent if initialized.
   */
  deleteComponent(type) {
    if (this.initialized && this.hasComponent(type)) {
      this._entityManager.requestDeleteComponent(this, type);
    } else {
      this._deleteComponent(type);
    }
  }
  
  /**
   * Deletes a component from the entity. Notifies EntityManager of change if initialized.
   * 
   * The private version of this method. Should not be called directly.
   */
  _deleteComponent(type) {
    if (this.hasComponent(type)) {
      delete this._components[type];
      if (this.initialized) {
        this._entityManager.notifyComponentChange(this);
      }
    } else {
      console.warn("Entity", this.id, "does not have component of type ", type);
    }
  }
  
  /**
   * Adds a child entity to this entity.
   * 
   * Public version of this method.
   * Passes to EntityManager.requestAddChild if initialized already.
   */
  addChild(childEntity) {
    if (this.initialized) {
      this._entityManager.requestAddEntity(childEntity, this);
    } else {
      this._addChild(childEntity);
    }
  }
  
  /**
   * Adds a child entity to this entity.
   * 
   * The EntityManager is responsible for initializing it.
   * 
   * Private version of this method. Should not be called directly.
   */
  _addChild(childEntity) {
    this._children[childEntity.id] = childEntity;
    childEntity.setParent(this);
  }
  
  /**
   * TODO: What should this method do?
   */
  removeChild(id) {
    if (this.initialized && id in this._children) {
      // this._entityManager.requestDeleteEntity(this);
    }
  }
  
  _removeChild(id) {
    
  }
  
  /**
   * Marks this entity to be deleted. 
   * If initialized, actual deletion happens at the end of the current game loop. Otherwise, destroyed immediately.
   * Also destroys all children (and removes them from the EntityManager).
   * 
   * Public version of this method. Calls EntityManager.requestDeleteEntity if initialized.
   */
  markForDeletion() {
    if (this.initialized) {
      this._entityManager.requestDeleteEntity(this);
    } else {
      this.destroy();
    }
  }
  
  /**
   * Enables the Entity for processing. 
   * If shouldEnableChildren is true, then also enables all children.
   * Note that it's possible for children to already be enabled.
   * 
   * Public version of this method. Calls Entity.requestEnable if initialized.
   */
  enable(shouldEnableChildren) {
    if (this.initialized) {
      this._entityManager.requestEnable(this, shouldEnableChildren);
    } else {
      this._enable(shouldEnableChildren);
    }
  }
  
  /**
  * Enables the Entity for processing. 
  * If shouldEnableChildren is true, then also enables all children.
  * Note that it's possible for children to already be enabled.
  * 
  * Private version of this method. Do not call directly.
  */
  _enable(shouldEnableChildren) {
    this._entityManager.notifyEnable(this);
    
    if (shouldEnableChildren) {
      for (let childId in this._children) {
        this._children[childId]._enable(shouldEnableChildren);
      }
    }
  }
  
  /**
   * Disables the Entity for processing. 
   * If shouldDisableChildren is true, then also disables all children.
   * Note that if this is disabled, its children will also not be processed, 
   *  regardless of whether they are enabled/disabled.
   * 
   * Public version of this method. Calls Entity.requestDisable if initialized.
   */
  disable(shouldDisableChildren) {
    if (this.initialized) {
      this._entityManager.requestDisable(this, shouldDisableChildren);
    } else {
      this._disable(shouldDisableChildren);
    }
  }
  
  
  /**
   * Disables the Entity for processing. 
   * If shouldDisableChildren is true, then also disables all children.
   * Note that if this is disabled, its children will also not be processed, 
   *  regardless of whether they are enabled/disabled.
   * 
   * Private version of this method. Do not call directly.
   */
  _disable(shouldDisableChildren) {
    this._entityManager.notifyDisable(this);
    
    if (shouldDisableChildren) {
      for (let childId in this._children) {
        this._children[childId]._disable(shouldDisableChildren);
      }
    }
  }
}
