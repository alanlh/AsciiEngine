import Entity from "./Entity.js";
import Queue from "../utility/data_structures/Queue.js";

/**
 * Helper class to execute Entity operations at a later time.
 */
class EntityOp {
  constructor(operation, target, ...args) {
    this.operation = operation;
    this.target = target;
    this.args = args;
    Object.freeze(this);
  }
}

EntityOp.ADD_ENTITY = Symbol("AddEntity");
EntityOp.DELETE_ENTITY = Symbol("DeleteEntity");
EntityOp.SET_COMPONENT = Symbol("SetComponent");
EntityOp.DELETE_COMPONENT = Symbol("DeleteComponent");
EntityOp.ENABLE = Symbol("Enable");
EntityOp.DISABLE = Symbol("Disable");


export default class EntityManager {
  constructor(engine) {
    this._engine = engine;
    
    this._entities = [];
    
    this._entityOperations = new Queue();
    
    this._added = new Set();
    this._deleted = new Set();
    this._changed = new Set();
    this._enabled = new Set();
    this._disabled = new Set();
  }
  
  /**
   * Sets the configuration values. 
   * 
   * @param {Object} config The values to set.
   */
  init(config) {
    // TODO: Implement.
  }
  
  initEntity(entity) {
    entity.init(this);
  }
  
  /**
   * Run after each game loop.
   */
  processEntityOperations() {
    while (!this._entityOperations.empty) {
      let nextOp = this._entityOperations.dequeue();
      this[nextOp.operation](nextOp.target, ...nextOp.args);
    }
  }
  
  /**
   * Returns all changes to entities that happened in this game loop.
   * 
   * Should only be called by SystemManager.
   */
  requestEntityChanges() {
    return {
      added: this._added,
      deleted: this._deleted,
      changed: this._changed,
      enabled: this._enabled,
      disabled: this._disabled,
    }
  }
  
  /**
   * Marks the changes as handled and clears the changes.
   * 
   * Should only be called by SystemManager when processing entity changes.
   */
  markEntityChangesAsHandled() {
    this._added.clear();
    this._deleted.clear();
    this._changed.clear();
    this._enabled.clear();
    this._disabled.clear();
  }
    
  // --------- PUBLIC API ------------ //
  
  /**
   * Only "request" methods should be called by user-code. 
   * The operations do not occur until the end of the game loop,
   *  at which point the EntityManager performs the operations on the Entities.
   * The handler and "notify" methods should only be called by Entities to alert the manager of changes.
   * 
   * The handler and "notify" methods are placed together for convenience.
   * 
   * TODO: request method calls handler method directly if game has not been started?
   */
  
  /**
   * Adds a new entity to the entity manager.
   * 
   * Does not have an associated 
   * 
   * @param {Entity} entity The entity to add.
   * @param {String} parent The parent to add the entity under. If undefined, 
   * then the entity is added as a root node.
   */
  requestAddEntity(entity, parent) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.ADD_ENTITY, entity, parent
    ));
  }
  
  [EntityOp.ADD_ENTITY](entity, parent) {
    if (parent) {
      parent._addChild(entity);
    }
    // This notifies any children as well.
    this.initEntity(entity);
  }
  
  notifyAddition(entity) {
    this._added.add(entity);
  }
  
  requestDeleteEntity(entity) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.DELETE_ENTITY, entity
    ));
  }
  
  [EntityOp.DELETE_ENTITY](entity) {
    // TODO: Implement based off of how entites are stored in the EntityManager
    entity.destroy();
  }
  
  notifyDeletion(entity) {
    this._deleted.add(entity);
  }
  
  requestSetComponent(entity, component) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.SET_COMPONENT, entity, component
    ));
  }
  
  [EntityOp.SET_COMPONENT](entity, component) {
    entity._setComponent(component);
  }
  
  requestDeleteComponent(entity, type) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.DELETE_COMPONENT, entity, type
    ));
  }
  
  [EntityOp.DELETE_COMPONENT](entity, type) {
    target._deleteComponent(type);
  }
  
  /**
   * Mark the entity as having changed its components.
   * The specific change (addition/removal) does not matter. Need to query every system regardless.
   * 
   * Should not be called directly.
   */
  notifyComponentChange(entity) {
    this._changed.add(entity);
  }
  
  requestEnable(entity, shouldEnableChildren) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.ENABLE, entity, shouldEnableChildren
    ));
  }
  
  [EntityOp.ENABLE](entity, shouldEnableChildren) {
    entity._enable(shouldEnableChildren);
  }
  
  notifyEnable(entity) {
    this._enabled.add(entity);
  }
  
  requestDisable(entity, shouldDisableChildren) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.DISABLE, entity, shouldDisableChildren
    ));
  }
  
  [EntityOp.DISABLE](target, shouldDisableChildren) {
    entity._disable(shouldDisableChildren);
  }
  
  notifyDisable(entity) {
    this._disabled.add(entity);
  }
}
