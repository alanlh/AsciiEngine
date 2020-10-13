const Functions = {
  generateId: (function() {
    let currId = 0;
    
    return function(name) {
      if (name === undefined) {
        name = "AsciiEngine";
      }
      currId ++;
      return name + "_" + currId;
    }
  })(),
  clamp: function(num, min, max) {
    return Math.max(min, Math.min(num, max));
  },
  /**
   * Splits a single line of text (no \n) into an array of strings
   * such that each individual string has length at most the specified width.
   * Does not append white-space if the row is less than the desired width.
   * 
   * @todo Optimize and clean up.
   * @param {string} line A line of text
   * @param {number} width The max number of chars on each row.
   * @param {boolean} [fillWidth] Whether or not lines with less than the specified width
   * should have spaces appended to them. Default false.
   * @returns {Array<string>} The line broken up into rows.
   */
  breakLineIntoRows: (line, width, fillWidth = false) => {
    let words = line.split(" ");
    let rows = [];

    let currRowLength = 0;
    let rowStartIdx = 0;
    let rowStartCharIdx = 0;
    for (let i = 0; i < words.length; i++) {
      // TODO: Is there any easier way to express this logic?
      if (i > rowStartIdx) {
        if (currRowLength + 1 + words[i].length <= width) {
          currRowLength += 1 + words[i].length;
          continue;
        }
        let row = words.slice(rowStartIdx, i).join(" ").substr(rowStartCharIdx);
        if (row.length < width && fillWidth) {
          row += " ".repeat(width - row.length);
        }
        rows.push(row);
        currRowLength = 0;
        rowStartIdx = i;
        rowStartCharIdx = 0;
      }
      // For the first word only, break into multiple lines if too long.
      if (words[i].length > width) {
        let c = 0;
        for (; c < words[i].length - width; c += width) {
          rows.push(words[i].substr(c, width));
        }
        currRowLength = words[i].length - c;
        rowStartCharIdx = c;
      } else {
        currRowLength = words[i].length;
      }
    }

    rows.push(words.slice(rowStartIdx, words.length).join(" ").substr(rowStartCharIdx));
    return rows;
  },
  /**
   * Splices a string. 
   * @param {string} string The string to splice
   * @param {number} index The start index from which to remove characters
   * @param {number} count The number of characters to remove
   * @param {string} [add] The string to insert in its place
   */
  stringSplice(string, index, count, add) {
    return string.substring(0, index) + (add || "") + string.substring(index + count);
  }
};

Object.freeze(Functions);

class Entity {
  /**
   * Creates a new Entity
   * @param {string} name The name of the entity
   */
  constructor(name) {
    /**
     * @type {string}
     * @private
     */
    this._name = name;
    /**
     * @type {string}
     * @private
     */
    this._id = Functions.generateId(this._name);
    
    /**
     * @type {boolean}
     * @private
     */
    this._initialized = false;
    /**
     * @type {EntityManager}
     * @private
     */
    this._entityManager = undefined;
    
    /**
     * @type {Object<string, Component>}
     * @private
     */
    this._components = {};
    /**
     * @type {Entity | undefined}
     * @private
     */
    this._parent = undefined;

    /**
     * @type {Object<string, Entity>}
     * @private
     */
    this._children = {};
    
    /**
     * @type {boolean}
     * @private
     */
    this._changed = true;
    
    /**
     * @type {boolean}
     * @private
     */
    this._enabled = true;
    /**
     * @type {boolean}
     * @private
     */
    this._ancestorsEnabled = true;
  }
  
  /**
   * Creates a copy, including of all children and all components.
   * 
   * TODO: Implement.
   * 
   * @param {string} [name] The name of the new Entity. Otherwise defaults to the existing entity's name
   * @return {Entity} The clone.
   * @deprecated
   */
  clone(name) {
    
  }
  
  /**
   * Called by the entityManager after being inserted.
   * Should ONLY be called by the Entity Manager
   * @param {EntityManager} entityManager The entityManager caller
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
  
  /**
   * @returns {boolean} Whether the Entity is initialized
   */
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
  
  /**
   * Sets the parent entity of the current entity.
   * @param {Entity} parent The parent entity
   */
  setParent(parent) {
    this._parent = parent;
  }
  
  /**
   * @returns {Entity} This entity's parent, or undefined if there isn't one.
   */
  getParent() {
    return this._parent;
  }
  
  /**
   * The name of the Entity
   * @returns {string}
   */
  get name() {
    return this._name;
  }
  
  /**
   * The id of the entity
   * @returns {string}
   */
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
   * 
   * @param {Component} component The component to add
   */ 
  setComponent(component) {
    if (this.initialized) {
      this._entityManager.requestSetComponent(this, component);
    } else {
      this._setComponent(component);
    }
  }
  
  /**
   * Sets the component of the entity. Notifies entityManager of change.
   * 
   * Private version of this method. Should not be called directly.
   * @private
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
   * @param {string} type The type of the component to return
   * @returns {Component} The component specified by the type string
   */
  getComponent(type) {
    if (this.hasComponent(type)) {
      return this._components[type];
    }
    return null;
  }
  
  /**
   * Returns true if this entity has a component of the specified type.
   * 
   * Useful for checking if this entity should be processed by a System.
   * @param {string} type
   * @returns {boolean}
   */
  hasComponent(type) {
    return type in this._components;
  }
  
  /**
   * Deletes a component from the entity.
   * 
   * Public version of this method. Passes to EntityManager.requestDeleteComponent if initialized.
   * @param {string} type
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
   * @private
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
   * @param {Entity} childEntity
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
   * @private
   */
  _addChild(childEntity) {
    this._children[childEntity.id] = childEntity;
    childEntity.setParent(this);
  }
  
  /**
   * TODO: What should this method do?
   * @deprecated
   */
  removeChild(id) {
    if (this.initialized && id in this._children) ;
  }
  
  /**
   * @private
   * @deprecated
   * @param {string} id 
   */
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
   * @param {boolean} [shouldEnableChildren] Whether the children of this entity should be enabled as well
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
  * @private
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
   * @param {boolean} [shouldDisableChildren] Whether or not to disable the children
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

/**
 * An implementation of queue that allows the user to access any element in it (but not modify)
 * @template T
 */
class Queue {
  constructor() {
    this._storage = [];
    this._size = 0;
    
    this._currIdx = 0;
  }
  
  enqueue(newElement) {
    this._storage.push(newElement);
    this._size ++;
  }
  
  // Removes n (default 1) elements. Returns the top one.
  dequeue(n) {
    let front = this.front;
    if (n === undefined) {
      n = 1;
    }
    if (this.size <= n) {
      this._storage = [];
      this._size = 0;
      this._currIdx = 0;
    } else if (this.size - n < this._storage.length / 2) {
      this._storage = this._storage.slice(this._currIdx + n);
      this._currIdx = 0;
      this._size -= n;
    } else {
      let removed = 0;
      while (removed < n) {
        this._storage[this._currIdx] = undefined;
        this._size --;
        this._currIdx ++;
        removed ++;
      }
    }
    return front;
  }
  
  get front() {
    if (this._size > 0) {
      return this._storage[this._currIdx];
    }
  }
  
  get back() {
    if (this._size > 0) {
      return this._storage[this._storage.length - 1];
    }
  }
  
  at(idx) {
    if (idx >= this._size || idx < 0) {
      return undefined;
    }
    return this._storage[this._currIdx + idx];
  }
  
  get size() {
    return this._size;
  }
  
  get empty() {
    return this.size == 0;
  }
}

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


class EntityManager {
  /**
   * 
   * @param {Engine} engine The engine creating the EntityManager
   */
  constructor(engine) {
    /**
     * @private
     */
    this._engine = engine;
    
    /**
     * @type {Set<Entity>}
     * @private
     */
    this._entities = new Set();
    
    /**
     * @type {Set<EntityOp>}
     * @private
     */
    this._entityOperations = new Queue();
    
    /**
     * @type {Set<Entity>}
     * @private
     */
    this._added = new Set();
    /**
     * @type {Set<Entity>}
     * @private
     */
    this._deleted = new Set();
    /**
     * @type {Set<Entity>}
     * @private
     */
    this._changed = new Set();
    /**
     * @type {Set<Entity>}
     * @private
     */
    this._enabled = new Set();
    /**
     * @type {Set<Entity>}
     * @private
     */
    this._disabled = new Set();
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
   * 
   * @param {Entity} entity The entity to initialize
   */
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
  
  get entities() {
    return this._entities;
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
  
  /**
   * @private
   * @param {Entity} entity 
   */
  [EntityOp.ADD_ENTITY](entity, parent) {
    if (parent) {
      parent._addChild(entity);
    }
    // This notifies any children as well.
    this.initEntity(entity);
  }
  
  /**
   * @private
   * @param {Entity} entity 
   */
  notifyAddition(entity) {
    this._added.add(entity);
    this.entities.add(entity);
  }
  
  /**
   * Deletes an entity. Removes it from all Systems.
   * @param {Entity} entity The entity to delete
   */
  requestDeleteEntity(entity) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.DELETE_ENTITY, entity
    ));
  }
  
  /**
   * @private
   * @param {Entity} entity 
   */
  [EntityOp.DELETE_ENTITY](entity) {
    // TODO: Implement based off of how entites are stored in the EntityManager
    entity.destroy();
  }
  
  /**
   * @private
   * @param {Entity} entity 
   */
  notifyDeletion(entity) {
    this._deleted.add(entity);
    this.entities.delete(entity);
  }
  
  /**
   * 
   * @param {Entity} entity The entity to set the component in
   * @param {Component} component The component to add to the Entity
   */
  requestSetComponent(entity, component) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.SET_COMPONENT, entity, component
    ));
  }
  
  /**
   * @private
   */
  [EntityOp.SET_COMPONENT](entity, component) {
    entity._setComponent(component);
  }
  
  /**
   * 
   * @param {Entity} entity The entity to delete the component from
   * @param {string} type The type of component to delete
   */
  requestDeleteComponent(entity, type) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.DELETE_COMPONENT, entity, type
    ));
  }
  
  /**
   * @private
   */
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
  
  /**
   * 
   * @param {Entity} entity The entity to enable
   * @param {boolean} [shouldEnableChildren] Whether or not the entity's children should also be enabled
   */
  requestEnable(entity, shouldEnableChildren) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.ENABLE, entity, shouldEnableChildren
    ));
  }
  
  /**
   * @private
   */
  [EntityOp.ENABLE](entity, shouldEnableChildren) {
    entity._enable(shouldEnableChildren);
  }
  
  /**
   * @private
   * @param {Entity} entity 
   */
  notifyEnable(entity) {
    this._enabled.add(entity);
  }
  
  /**
   * 
   * @param {Entity} entity The entity to disable
   * @param {boolean} [shouldDisableChildren] Whether or not the entity's children should also be disabled
   */
  requestDisable(entity, shouldDisableChildren) {
    this._entityOperations.enqueue(new EntityOp(
      EntityOp.DISABLE, entity, shouldDisableChildren
    ));
  }
  
  /**
   * @private
   */
  [EntityOp.DISABLE](target, shouldDisableChildren) {
    entity._disable(shouldDisableChildren);
  }
  
  /**
   * @private
   * @param {Entity} entity 
   */
  notifyDisable(entity) {
    this._disabled.add(entity);
  }
}

class System {
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
  
  /**
   * @returns {SystemManager}
   */
  getSystemManager() {
    return this._systemManager;
  }
  
  /**
   * @returns {Engine}
   */
  getEngine() {
    return this._engine;
  }

  /**
   * @returns {EntityManager}
   */
  getEntityManager() {
    return this._entityManager;
  }
  
  /**
   * @deprecated DO NOT USE. Currently incomplete
   */
  enable() {
    if (!this._active) {
      this._active = true;
    }
  }
  
  /**
   * @deprecated DO NOT USE. Currently incomplete
   */
  disable() {
    if (this._active) {
      this._active = false;
    }
  }
  
  /**
   * @returns {boolean} Whether or not the system is active
   */
  get active() {
    return this._active;
  }

  /**
   * A wrapper around SystemMessageBoard's subscribe.
   * @param {Array<string>} descriptor The event path descriptor
   * @param {import("../SystemMessageBoard").EventHandler} handler The event handler
   * @param {boolean} bind Whether or not the event handler should be bound to this.
   * @param {string} [source] The source system. If undefined, will accept any system.
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
   * @param {string} [target] 
   */
  postMessage(descriptor, body, target) {
    this.getSystemManager().getMessageBoard().post(
      this.name, descriptor, body, target
    );
  }
  
  // ---------- PUBLIC INTERFACE ---------- //
  // Methods above should not be overriden. Methods below should be.
  
  /**
   * Runs when the System is initialized. Should be independent of any entities.
   * @interface
   */
  startup() {}
  
  /**
   * Runs when the system is removed from the SystemManager.
   * @interface
   */
  shutdown() {}
  
  /**
   * A virtual method Systems can override.
   * Determines of the entity is of importance to the System.
   * 
   * This method should NOT have any side effects. Doing so may result in undefined behavior.
   * @interface
   * @param {Entity} entity
   * @returns {boolean}
   */
  check(entity) {
    return false;
  }
  
  /**
   * Returns true if and only if the System has this entity.
   * 
   * This method can be overriden to fit an alternative data structure.
   * However, failure to implement this correctly may result in undefined behavior.
   * 
   * @interface
   * @param {Entity} entity
   * @returns {boolean}
   */
  has(entity) {}
  
  /**
   * Adds the entity to the system.
   * The implementation should make sense for how the derived system stores its entities.
   * @param {Entity} entity The entity to add
   */
  add(entity) {}
  
  /**
   * Removes the entity from this.entities.
   * The implementation should make sense for how the derived system stores its entities.
   *
   * Any alternate implementation MUST be defined so that the System no longer processes it.
   * Failure to do so may result in undefined behavior.
   * 
   * @interface
   * @param {Entity} entity
   */
  remove(entity) {}
  
  /**
   * A virtual method Systems can override
   * Called before main update method.
   * @interface
   */
  preUpdate() {}
  
  /**
   * A virtual method Systems can override.
   * The main update for computation.
   * @interface
   */
  update() {}
  
  /**
   * A virtual method Systems can override.
   * Called after main update method.
   * @interface
   */
  postUpdate() {}
}

/**
 * @template T
 * @todo OPTIMIZE!!!!!!!
 */
class RootedSearchTreeNode {
  constructor() {
    /** @type {Object.<string, RootedSearchTreeNode<T>>} */
    this.children = {};
    /** @type {Set<T>} */
    this.data = new Set();
    /**
     * @type {number}
     * Keeps track of the number of values in this and all child nodes.
     */
    this.size = 0;
  }

  /**
   * Checks if the value appears in the subtree specified by the path.
   * If undefined, only checks if the path exists.
   * @param {Array<string>} path The path descriptor
   * @param {T} [value] The value to check
   */
  has(path, value) {
    this._has(path, 0, value);
  }

  _has(path, index, value) {
    if (index >= path.length) {
      if (value === undefined || this.data.has(value)) {
        return true;
      }
      for (let key in this.children) {
        if (this.children[key]._has(path, index + 1, value)) {
          return true;
        }
      }
      return MATCH_ANY in this.children
        && this.children[MATCH_ANY]._has(path, index + 1, value);
    }
    if (path[index] === undefined) {
      for (let key in this.children) {
        if (this.children[key]._has(path, index + 1, value)) {
          return true;
        }
      }
      return MATCH_ANY in this.children
        && this.children[MATCH_ANY]._has(path, index + 1, value);
    }
    if (path[index] in this.children
      && this.children[path[index]]._has(path, index + 1, value)) {
      return true;
    }
    return MATCH_ANY in this.children
      && this.children[MATCH_ANY]._has(path, index + 1, value);
  }

  /**
   * 
   * @param {Array<string>} path The path to add to
   * @param {T} value The value to add
   */
  add(path, value) {
    this._add(path, 0, value);
  }

  /**
   * 
   * @param {Array<string>} path The path to add to
   * @param {number} index The current index of the path
   * @param {T} value The value to add
   */
  _add(path, index, value) {
    if (index === path.length) {
      this.data.add(value);
      this.size++;
      return;
    }
    let key = path[index];
    if (key === undefined) {
      key = MATCH_ANY;
    }
    if (!(key in this.children)) {
      this.children[key] = new RootedSearchTreeNode();
    }
    this.children[key]._add(path, index + 1, value);
    this.size++;
  }

  /**
   * Removes all instances of value in the subtree rooted at the specified path.
   * If path is the empty array, will remove all instances of value in the tree.
   * @param {Array<string>} path The path in which to remove the elements
   * @param {T} [value] The value to remove
   */
  delete(path, value) {
    if (path.length === 0 && value === undefined) {
      // This should only be called on the root node. 
      // Must be handled separately because the implementation in _delete
      // relies on a parent node to clean it up.
      this.children = {};
      this.data = new Set();
      this.size = 0;
      return;
    }
    this._delete(path, 0, value);
  }

  /**
   * 
   * @param {Array<string>} path 
   * @param {number} index 
   * @param {T} [value] If undefined, removes everything.
   * @returns {number} The number of times value was deleted.
   */
  _delete(path, index, value) {
    let deleted = 0;
    if (index >= path.length) {
      if (value === undefined) {
        // Quick way to have the parent completely remove it. 
        let deleted = this.size;
        this.size = 0;
        return deleted;
      }
      if (this.data.delete(value)) {
        deleted++;
      }
      this.size -= deleted;
      for (let childKey in this.children) {
        deleted += this._deleteHelper(path, index + 1, value, childKey);
      }
      if (MATCH_ANY in this.children) {
        deleted += this._deleteHelper(path, index + 1, value, MATCH_ANY);
      }
      return deleted;
    }
    if (path[index] === undefined) {
      for (let key in this.children) {
        deleted += this._deleteHelper(path, index + 1, value, key);
      }
      if (MATCH_ANY in this.children) {
        deleted += this._deleteHelper(path, index + 1, value, MATCH_ANY);
      }
      return deleted;
    }
    if (path[index] in this.children) {
      deleted += this._deleteHelper(path, index + 1, value, path[index]);
    }
    if (MATCH_ANY in this.children) {
      deleted += this._deleteHelper(path, index + 1, value, MATCH_ANY);
    }
    return deleted;
  }

  _deleteHelper(path, index, value, key) {
    let deleted = this.children[key]._delete(path, index + 1, value);
    if (this.children[key].size === 0) {
      delete this.children[key];
    }
    this.size -= deleted;
    return deleted;
  }

  /**
   * Iterates over the data at the node specified by path,
   * along with all descendant nodes. 
   * @param {Array<string>} path 
   * @returns {Generator<T, void, any>}
   */
  *getDescIt(path) {
    yield* this._getDescIt(path, 0);
  }

  /**
   * 
   * @param {Array<string>} path 
   * @param {number} index 
   * @returns {Generator<T, void, any>}
   */
  *_getDescIt(path, index) {
    if (index >= path.length) {
      for (let value of this.data) {
        yield value;
      }
      for (let childKey in this.children) {
        yield* this.children[childKey]._getDescIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getDescIt(path, index + 1);
      }
      return;
    }
    if (path[index] === undefined) {
      for (let key in this.children) {
        yield* this.children[key]._getDescIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getDescIt(path, index + 1);
      }
    } else {
      if (path[index] in this.children) {
        yield* this.children[path[index]]._getDescIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getDescIt(path, index + 1);
      }
    }
  }

  /**
   * Iterates over the data at the node specified by path,
   * along with all ancestor nodes. 
   * @param {Array<string>} path 
   */
  *getAnscIt(path) {
    yield* this._getAnscIt(path, 0);
  }

  *_getAnscIt(path, index) {
    if (index >= path.length) {
      for (let value of this.data) {
        yield value;
      }
      return;
    }
    if (path[index] === undefined) {
      for (let key in this.children) {
        yield* this.children[key]._getAnscIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getAnscIt(path, index + 1);
      }
    } else {
      if (path[index] in this.children) {
        yield* this.children[path[index]]._getAnscIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getAnscIt(path, index + 1);
      }
    }
    for (let value of this.data) {
      yield value;
    }
  }
}

const MATCH_ANY = Symbol("ANY");

/**
 * @typedef {(event: any, descriptor: Array<string>, sender: string) => void} EventHandler
 * @typedef {{
 * name: string,
 * handler: EventHandler,
 * source?: string,
 * }} ListenerInfo
 * @typedef {string} ListenerKey
 * @typedef {[string, Array<string>, any, string?]} Message
 */
class MessageBoard {
  /**
   * A central message board implementation for Systems.
   */
  constructor() {
    /**
     * Keeps track of the information associated with each key.
     * @type {Object.<ListenerKey, ListenerInfo>}
     * @private
     */
    this._listeners = {};
    /**
     * Keeps track of the events each system is listening to,
     * @type {Object.<string, RootedSearchTreeNode<ListenerKey>>}
     * @private
     */
    this._subscribers = {};
    /** 
     * Keeps track of the event descriptorss that can trigger an event. 
     * @type {RootedSearchTreeNode<ListenerKey>} 
     * @private
     */
    this._descriptors = new RootedSearchTreeNode();

    /**
     * @type {Queue<Message>}
     * @private
     */
    this._messageQueue = new Queue();
    /**
     * @type {boolean}
     * @private
     */
    this._processImmediately = false;
    /**
     * @type {boolean}
     * @private
     */
    this._currentlyProcessing = false;
  }

  /**
   * @returns {boolean} True if should process immediately
   */
  get processImmediately() {
    return this._processImmediately;
  }

  /**
   * @param {boolean}
   */
  set processImmediately(value) {
    this._processImmediately = !!value;
    if (this._processImmediately) {
      this.processMessages();
    }
  }

  /**
   * Subscribes to an event. 
   * @param {string} name The name of the subscribing system
   * @param {Array<string>} descriptor The path descriptor of the event
   * @param {EventHandler} handler The event handler
   * @param {string} source The name of the source. Default is undefined, which handles all sources.
   */
  subscribe(name, descriptor, handler, source) {
    if (!(name in this._subscribers)) {
      this._subscribers[name] = new RootedSearchTreeNode();
    }
    let listenerKey = Functions.generateId("SystemMessageBoard");
    this._subscribers[name].add(descriptor, listenerKey);
    let listenerInfo = {
      name: name,
      handler: handler,
      source: source,
    };
    this._listeners[listenerKey] = listenerInfo;
    this._descriptors.add(descriptor, listenerKey);
  }

  /**
   * Unsubscribes to any event listeners in the given path.
   * @param {string} name The name of the unsubscribing system
   * @param {Array<string>} descriptor The path descriptor of the event
   */
  unsubscribe(name, descriptor) {
    if (!(name in this._subscribers)) {
      return;
    }
    for (let key of this._subscribers[name].getDescIt(descriptor)) {
      this._descriptors.delete(descriptor, key);
      delete this._listeners[key];
    }
    this._subscribers[name].delete(descriptor);
    if (this._subscribers[name].size === 0) {
      delete this._subscribers[name];
    }
  }

  /**
   * Unsubscribes to all events
   * @param {string} name The name of the unsubscribing system
   */
  unsubscribeAll(name) {
    this.unsubscribe(name, []);
  }

  /**
   * Posts a message to the message board.
   * Messages will always be handled in the order they are received.
   * However, they may be handled asynchronously.
   * @param {string} sender The sender system's name
   * @param {Array<string>} descriptor The path descriptor of the event, in increasing specificity
   * @param {any} body The event body
   * @param {string} [target] The target system's name, or undefined for all systems
   */
  post(sender, descriptor, body, target) {
    this._messageQueue.enqueue([
      sender, descriptor, body, target
    ]);

    if (this.processImmediately) {
      this.processMessages();
    }
  }

  /**
   * Processes all messasges in the queue.
   */
  processMessages() {
    if (this._currentlyProcessing) {
      // Prevent bloating the call stack.
      return;
    }
    this._currentlyProcessing = true;
    while (this._messageQueue.size > 0) {
      let [sender, descriptor, body, target] = this._messageQueue.dequeue(1);
      for (let listenerKey of this._descriptors.getAnscIt(descriptor)) {
        let {
          name: subscriberName, handler, source: senderName
        } = this._listeners[listenerKey];
        if (target !== undefined && target !== subscriberName) {
          continue;
        }
        if (senderName !== undefined && senderName !== sender) {
          continue;
        }
        
        handler(body, descriptor, sender);
      }
    }
    this._currentlyProcessing = false;
  }
}

/**
   * A map but with sorted keys.
   * @template K Key type
   * @template V Value Type
 */
class OrderedMultiMap {
  /**
   * Creates an OrderedMultiMap instance.
   * @param {function(K, K) => number} comparator A comparator for two keys
   */
  constructor(comparator) {
    /**
     * @type {Map.<K, Set<V>>}
     * @private
     */
    this._data = new Map();
    /**
     * @type {K[]}
     * @private
     */
    this._sortedKeys = [];

    this._comparator = comparator;
  }

  /**
   * Checks if the key and value appear in this collection.
   * If value is not specified, only searches for the key.
   * @param {K} key The key to search for
   * @param {V} [value] The value to search for (optional)
   * @returns {boolean}
   */
  has(key, value) {
    return this._data.has(key) && (value === undefined || this._data.get(key).has(value));
  }

  /**
   * Iterates over all values corresponding to the given key
   * @param {K} key The key whose values to iterate over
   */
  *getIt(key) {
    if (!this.has(key)) {
      return;
    }
    for (let value of this._data.get(key)) {
      yield value;
    }
  }

  /**
   * Returns all values corresponding to a key
   * @param {K} key The key whose values to get
   * @returns {Set<V>} The set of values, or an empty set.
   */
  get(key) {
    let vals = new Set();
    for (let val of this.getIt()) {
      vals.add(val);
    }
    return val;
  }

  /**
   * @generator
   * @yields {V}
   */
  *[Symbol.iterator]() {
    for (let sortedKey of this._sortedKeys) {
      for (let value of this._data.get(sortedKey)) {
        yield value;
      }
    }
  }

  /**
   * Adds a new key/value to the multimap.
   * @param {K} key The key to insert
   * @param {V} value The value to insert
   */
  add(key, value) {
    if (!this._data.has(key)) {
      this._data.set(key, new Set());
      // TODO: OPTIMIZE
      this._sortedKeys.push(key);
      this._sortedKeys.sort(this._comparator);
    }
    this._data.get(key).add(value);
  }

  /**
   * Removes a value from the map.
   * @param {K} key The key for the value to remove
   * @param {V} value The value to remove
   */
  delete(key, value) {
    if (!this._data.has(key)) {
      return;
    }
    this._data.get(key).delete(value);
    if (this._data.get(key).size === 0) {
      this._data.delete(key);
      // TODO: Optimize
      this._sortedKeys.splice(this._sortedKeys.indexOf(key), 1);
    }
  }
}

OrderedMultiMap.NumericComparator = (n1, n2) => {
  return n1 - n2;
};

class SystemManager {
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
    this._messageBoard = new MessageBoard();
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
   * @param {number} [priority] The priority of the system. Lower priorities are run first.
   * @param {Boolean} [delay] If true, the System is guaranteed to not run until the next cycle.
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
   * @param {Boolean} [delay] If true, the System is not removed until the end of the cycle.
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
   * @param {Boolean} [delay] If true, the System is guaranteed to not run until the next cycle.
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
   * @param {Boolean} [delay] If true, the System is guaranteed to not run until the next cycle.
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
  
  /**
   * @returns {SystemMessageBoard} The system's message board
   */
  getMessageBoard() {
    return this._messageBoard;
  }
}

class Engine {
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
    this._intervalKey = setInterval(() => { this.update(); }, this._millisecPerUpdate);
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

class Component {
  /**
   * Base class for components.
   * All derived components must specify a static "name" property. 
   */
  constructor() {
    if (this.constructor === Component) {
      throw new TypeError("Components cannot be instantiated directly!");
    }
  }
  
  /**
   * @returns {string} The type of the Component
   */
  get type() {
    return this.constructor.type;
  }
}

class AsciiRenderComponent extends Component {
  /**
   * Creates a new Component that can be used by AsciiRenderSystem
   * 
   * @param {string[] | Sprite[]} spriteNameList The list of sprites or sprite names in the frame
   * @param {string[] | Style[]} styleNameList The list of styles or style names in the frame
   * @param {[number, number, number][]} relativePositionList The list of positions to render at
   */
  constructor(spriteNameList, styleNameList, relativePositionList) {
    super();
    // All these arrays should all be of the same length. Otherwise may cause problems.
    // TODO: Replace these properties with getters. Allow for different animations of the same entity.
    this.spriteNameList = spriteNameList || [];
    this.styleNameList = styleNameList || [];
    this.relativePositionList = relativePositionList || [];
    
    /**
     * @type {boolean} Whether or not the component should be rendered
     */
    this.visible = true;
    /**
     * @type {boolean} Whether or not the render information is located in the Component or should be retrieved in the ResourceManager
     */
    this.dataIsLocal = false;
  }
}

AsciiRenderComponent.type = "AsciiRender";

class AsciiAnimateComponent extends Component {
  /**
   * A Component usable by AsciiRenderSystem which supports different frames.
   */
  constructor() {
    super();
    /**
     * @private
     */
    this._name = undefined;
    /**
     * @private
     */
    this._spriteNameList = {};
    /**
     * @private
     */
    this._styleNameList = {};
    /**
     * @private
     */
    this._relativePositionList = {};
    
    /**
     * @type {boolean} Whether or not the component should be rendered
     */
    this.visible = true;
    /**
     * @type {boolean} Whether or not the data is contained locally or should be retrieved from the Resource Manager
     */
    this.dataIsLocal = false;
  }
  
  /**
   * @returns {string} The name of the current frame
   */
  get currentFrame() {
    return this._name;
  }
  
  /**
   * @returns {string[] | Sprite[]} The list of sprite names or Sprites to render
   */
  get spriteNameList() {
    return this._spriteNameList[this.currentFrame];
  }
  
  /**
   * @returns {string[] | Style[]} The list of style names or Styles to render
   */
  get styleNameList() {
    return this._styleNameList[this.currentFrame];
  }
 
  /**
   * @returns {[number, number, number][]} The list of positions to render at
   */
  get relativePositionList() {
    return this._relativePositionList[this.currentFrame];
  }
  
  /**
   * 
   * @param {string} name The name of the frame
   * @param {string[] | Sprite[]} spriteNameList The list of sprites or sprite names in the frame
   * @param {string[] | Style[]} styleNameList The list of styles or style names in the frame
   * @param {[x: number, y: number, z: number][]} relativePositionList The list of positions to render at
   */
  addFrame(
    name,
    spriteNameList,
    styleNameList,
    relativePositionList
  ) {
    console.assert(
      spriteNameList.length === styleNameList.length &&
      spriteNameList.length === relativePositionList.length,
      "AsciiAnimateComponent inputs must be of the same length"
    );
    if (this._name === undefined) {
      this._name = name;
    }
    this._spriteNameList[name] = spriteNameList;
    this._styleNameList[name] = styleNameList;
    this._relativePositionList[name] = relativePositionList;
  }
  
  /**
   * Sets the current active frame
   * @param {string} name The frame to set to
   */
  setFrame(name) {
    if (name in this._spriteNameList) {
      this._name = name;
    }
  }
}

AsciiAnimateComponent.type = "AsciiAnimate";

class PositionComponent extends Component {
  /**
   * Creates a basic 3D position
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  constructor(x, y, z) {
    super();
    /**
     * @type {number} The x coordinate
     */
    this.x = x || 0;
    /**
     * @type {number} The y coordinate
     */
    this.y = y || 0;
    /**
     * @type {number} The z coordinate
     */
    this.z = z || 0;
  }
}

PositionComponent.type = "PositionComponent";

const Components = {
  AsciiRender: AsciiRenderComponent,
  AsciiAnimate: AsciiAnimateComponent,
  Position: PositionComponent,
};

Object.freeze(Components);

class SetSystem extends System {
  /**
   * An implementation of System that adds uses a Set to store its entities.
   * 
   * Should not be instantiated directly.
   * @param {string} name The name of the system
   */
  constructor(name) {
    super(name);
    if (this.constructor === SetSystem) {
      throw new TypeError("SetSystem cannot be instantiated directly!");
    }
    this.entities = new Set();
  }
  
  /**
   * 
   * @param {Entity} entity The entity to check for
   * @returns {boolean} Whether or not the System has the given entity
   */
  has(entity) {
    return this.entities.has(entity);
  }
  
  /**
   * 
   * @param {Entity} entity The entity to add
   */
  add(entity) {
    this.entities.add(entity);
  }

  /**
   * 
   * @param {Entity} entity The entity to remove
   */
  remove(entity) {
    this.entities.delete(entity);
  }
}

class MapSystem extends System {
  /**
   * Creates a new System that uses a map to store its entities.
   * The entities are recorded by ID. 
   * Useful for systems where the exact entity or order of entities does not matter, 
   * but it is important to keep track of individuals.
   * @param {string} name The name of the system
   */
  constructor(name) {
    super(name);
    
    this.entities = {};
  }
  
  /**
   * Checks if the system has a certain Entity 
   * @param {Entity} entity The entity to check for
   * @returns {boolean} Whether or not the system has the specified entity
   */
  has(entity) {
    return entity.id in this.entities;
  };
  
  /**
   * 
   * @param {Entity} entity The entity to add
   */
  add(entity) {
    this.entities[entity.id] = entity;
  }
  
  /**
   * 
   * @param {Entity} entity The entity to remove
   */
  remove(entity) {
    delete this.entities[entity.id];
  }
}

const ModuleSlots = {
  Graphics: Symbol("GraphicsLibrary"),
  Resources: Symbol("ResourceManager"),
  KeyboardInput: Symbol("KeyboardInput"),
};

class AsciiRenderSystem extends SetSystem {
  constructor(name) {
    super(name || "AsciiRender");
    // Use the default Set container for all entities.
    
    /**
     * @private
     */
    this._asciiGl = null;
  }
  
  startup() {
    this._asciiGl = this.getEngine().getModule(ModuleSlots.Graphics);
  }
  
  check(entity) {
    // Need both renderable and position.
    return (entity.hasComponent(AsciiRenderComponent.type) 
      || entity.hasComponent(AsciiAnimateComponent.type))
      && entity.hasComponent(PositionComponent.type);
  }
  
  /**
   * Only render after the main loop.
   */
  postUpdate() {
    let resourceManager = this.getEngine().getModule(ModuleSlots.Resources);
    
    for (let entity of this.entities) {
      let renderComponent = entity.getComponent(AsciiRenderComponent.type) || entity.getComponent(AsciiAnimateComponent.type);
      if (!renderComponent.visible) {
        continue;
      }
      let entityAbsolutePosition = this.getEntityAbsolutePosition(entity);
      for (let i = 0; i < renderComponent.spriteNameList.length; i++) {
        let sprite, style;
        if (renderComponent.dataIsLocal) {
          sprite = renderComponent.spriteNameList[i];
          style = renderComponent.styleNameList[i];
        } else {
          sprite = resourceManager.get(renderComponent.spriteNameList[i]);
          style = resourceManager.get(renderComponent.styleNameList[i]);
        }
        let location = [
          entityAbsolutePosition[0] + renderComponent.relativePositionList[i][0],
          entityAbsolutePosition[1] + renderComponent.relativePositionList[i][1],
          entityAbsolutePosition[2] + renderComponent.relativePositionList[i][2],
        ];
        this._asciiGl.draw(sprite, location, style, entity.id);
      }
    }
    
    this._asciiGl.render();
  }
  
  getEntityAbsolutePosition(entity) {
    let location = [0, 0, 0];
    while (entity) {
      if (entity.hasComponent(PositionComponent.type)) {
        let relativePosition = entity.getComponent(PositionComponent.type);
        location[0] += relativePosition.x;
        location[1] += relativePosition.y;
        location[2] += relativePosition.z;
      }
      entity = entity.getParent();
    }
    return location;
  }
}

AsciiRenderSystem.type = "AsciiRenderSystem";

/**
 * Handles events from mouse and keyboard
 * Mouse events are sent by AsciiGL. 
 * This system should only be used with AsciiGL as the graphics library,
 * and the built-in KeyboardInputModule for keyboard events.
 * 
 * Allows for focusing. An entity is focused iff it is registered as a focusable element,
 * and a click event occurred on it. 
 * If there is a focused entity, keyboard events will only be sent to the system that
 * registered focus for that element.
 * Once an entity has been registered as focusable, other systems cannot register focus for
 * that element until the initial system releases it.
 * If an element is no longer used, it should be unregistered.
 * If no entity is focused, keyboard events will be sent to all systems
 */
class AsciiInputHandlerSystem extends System {
  constructor(name) {
    super(name || "AsciiInputHandler");
    // TODO: Do we actually need to keep track of this?
    /**
     * @private
     */
    this._mouseEventsEnabled = false;
    /**
     * @private
     */
    this._keyboardEventsEnabled = false;

    /**
     * @private
     */
    this._focusedElement = undefined;
    /**
     * @private
     */
    this._focusableEntityOwners = {};
  }

  startup() {
    let asciiGl = this.getEngine().getModule(ModuleSlots.Graphics);
    if (asciiGl !== undefined) {
      asciiGl.setHandler(this._mouseEventHandler.bind(this));
      this._mouseEventsEnabled = true;
    }

    let keyboardInputModule = this.getEngine().getModule(ModuleSlots.KeyboardInput);
    if (keyboardInputModule !== undefined) {
      keyboardInputModule.addEventListener(this._keyboardEventHandler.bind(this));
      this._keyboardEventsEnabled = true;
    }

    // Enable focus checking iff both mouse and keyboard events are available.
    if (this.mouseEventsEnabled && this.keyboardEventsEnabled) {
      this.subscribe(["InputHandlerRequest", "AddFocusable"], this._handleAddFocusable, true);
      this.subscribe(["InputHandlerRequest", "RemoveFocusable"], this._handleRemoveFocusable, true);
      this.subscribe(["InputHandlerRequest", "SetFocusRequest"], this._handleSetFocusRequest, true);
      this.subscribe(["InputHandlerRequest", "ReleaseFocus"], this._handleReleaseFocus, true);
    }
  }

  /**
   * @returns {boolean}
   */
  get mouseEventsEnabled() {
    return this._mouseEventsEnabled;
  }

  /**
   * @returns {boolean}
   */
  get keyboardEventsEnabled() {
    return this._keyboardEventsEnabled;
  }

  /**
   * Receives mouse input messages from AsciiGL and forwards them to the System Message Board.
   * The event descriptor always begins with ["MouseEvent", eventType].
   * If there is a named target being clicked, it will be appended.
   * 
   * @param {MouseEvent} event The MouseEvent object generated by the browser
   * @param {string} target The target element's name, if defined
   * @param {string} type The event type
   * @param {{x: number, y: number}} coords The location of the mouse event on the screen.
   */
  _mouseEventHandler(event, type, target, coords) {
    this.postMessage(
      ["MouseEvent", target || "", type],
      {
        event: event,
        coords: coords,
      },
    );
    if (type === "click") {
      this._switchFocus(target, coords);
    }
  }

  /**
   * Receives keyboard events from KeyboardInputModule and forwards them to the System Message Board
   * The event descriptor is 
   * ["KeyboardEvent", eventType [, key category[, key subcategory...]], event.key]
   * Current key categories include:
   * Visible: Any visible character
   *    - Alphabetical: a-z A-Z
   *      - Lower: a-z
   *      - Upper: A-Z
   *    - Numeric: 0-9
   *    - Symbol: Everything else
   * Arrow: One of the four arrow keys
   * 
   * @param {string} eventName The type of event
   * @param {string} eventKey The name of the key that triggered the event
   * @param {KeyboardEvent} event The event object generated by the browser.
   */
  _keyboardEventHandler(eventName, eventKey, event) {
    let target = (this._focusedElement !== undefined) ? this._focusedElement : "";
    let eventDescriptor = undefined;
    if (eventKey.length === 1) {
      let keyCode = eventKey.charCodeAt(0);
      if (keyCode >= 48 && keyCode <= 57) {
        eventDescriptor = ["KeyboardEvent", target, eventName, "Visible", "Numeric", eventKey];
      } else if (keyCode >= 65 && keyCode <= 90) {
        eventDescriptor = ["KeyboardEvent", target, eventName, "Visible", "Alphabetical", "Upper", eventKey];
      } else if (keyCode >= 97 && keyCode <= 122) {
        eventDescriptor = ["KeyboardEvent", target, eventName, "Visible", "Alphabetical", "Lower", eventKey];
      } else {
        eventDescriptor = ["KeyboardEvent", target, eventName, "Visible", "Symbol", eventKey];
      }
    } else if (eventKey.startsWith("Arrow")) {
      eventDescriptor = ["KeyboardEvent", target, eventName, "Arrow", eventKey];
    } else {
      eventDescriptor = ["KeyboardEvent", target, eventName, eventKey];
    }
    let body = {
      event: event,
    };
    if (this._focusedElement !== undefined) {
      body.targetEntity = this._focusedElement;
      this.postMessage(
        eventDescriptor,
        body,
        this._focusableEntityOwners[this._focusedElement]
      );
    } else {
      this.postMessage(
        eventDescriptor,
        body,
      );
    }
  }

  /**
   * 
   * @param {string} entityId The event body.
   *    Should be the id of the entity to register. 
   * @param {Array<string>} _descriptor
   * @param {string} sender The name of the System registering the entity
   */
  _handleAddFocusable(entityId, _descriptor, sender) {
    if (!(entityId in this._focusableEntityOwners)) {
      this._focusableEntityOwners[entityId] = sender;
    }
  }

  /**
   * Unregisters the entity from being focusable.
   * The message sender should be the same System that registered the entity.
   * However this *currently* is not enforced.
   * 
   * @param {any} entityId The event body
   *    Should be the id of the entity to unregister
   */
  _handleRemoveFocusable(entityId) {
    if (entityId in this._focusableEntityOwners) {
      if (this._focusedElement === entityId) {
        this._switchFocus();
      }
      delete this._focusableEntityOwners[entityId];
    }
  }

  /**
   * Programatically tries to set focus to an entity. 
   * For now, this will always work, but logic may be added later for situations
   * where we don't want this to happen.
   * 
   * The message sender should be the same System that registered the entity.
   * However, this *currently* is not enforced. 
   * 
   * Systems should not assume that the set focus was successful unless the FocusSet message is received.
   * 
   * @param {any} entityId The event body
   *    Should be the id of the entity to focus.
   */
  _handleSetFocusRequest(entityId) {
    if (entityId in this._focusableEntityOwners) {
      this._switchFocus(entityId);
    }
  }

  /**
   * Programmatically releases focus from an entity if it is currently focused.
   * The message sender should be the same System that registered the entity.
   * However, this is not enforced.
   *
   * @param {any} entityId The event body
   *    Should be the id of the entity to release focus from.
   */
  _handleReleaseFocus(entityId) {
    if (this._focusedElement !== undefined && this._focusedElement === entityId) {
      this._switchFocus();
    }
  }

  /**
   * Switches focus to the specified id. That id should be registered already.
   * Does not do error checking.
   * @param {string} newFocusedId The new id to focus on.
   * @param {{x: number, y: number}} [coords] The global location being focused.
   */
  _switchFocus(newFocusedId, coords) {
    let currFocusedId = this._focusedElement;
    if (currFocusedId !== undefined && currFocusedId !== newFocusedId) {
      this.postMessage(["InputHandlerFocusEvent", currFocusedId, "FocusLost"],
        {
          entityId: currFocusedId
        }, this._focusableEntityOwners[currFocusedId]);
      this._focusedElement = undefined;
    }
    if (newFocusedId !== undefined && currFocusedId !== newFocusedId) {
      this._focusedElement = newFocusedId;
      this.postMessage(["InputHandlerFocusEvent", newFocusedId, "FocusSet"],
        {
          entityId: newFocusedId,
          coords: coords,
        }, this._focusableEntityOwners[newFocusedId]);
    }
  }
}

const DefaultSystems = {
  Set: SetSystem,
  Map: MapSystem,
  AsciiRender: AsciiRenderSystem,
  AsciiInputHandler: AsciiInputHandlerSystem,
};

Object.freeze(DefaultSystems);

/**
 * Listens for and processes keyboard events.
 * Does limited filtering for usability.
 * 
 * @typedef {(
 * eventName: string, 
 * eventKey: string, 
 * event: KeyboardEvent
 * ) => void} KeyboardEventHandler
 */
class KeyboardInputModule {
  constructor() {
    /**
     * @type {Set<KeyboardEventHandler>}
     * @private
     */
    this.handlers = new Set();

    for (let eventType in KeyboardInputModule.EventTypes) {
      let eventName = KeyboardInputModule.EventTypes[eventType];
      document.addEventListener(eventName, (event) => {
        if (document.activeElement === document.body || document.activeElement === null) {
          // Only listen if nothing else is in focus.
          // TODO: Make it so that it must be focused on the target element. How?
          for (let handler of this.handlers) {
            handler(eventName, event.key, event);
          }
          if (event.keyCode <= 40 && event.keyCode >= 37) {
            event.preventDefault();
          } else if (event.keyCode === 32) {
            event.preventDefault();
          }
        }
      });
    }
  }

  /**
   * Attaches an event listener.
   * For now, only allow all or nothing. 
   * The handler should decide what to do with everything else by itself.
   * @param {KeyboardEventHandler} handler The event handler to attach
   */
  addEventListener(handler) {
    this.handlers.add(handler);
  }

  /**
   * Removes an event listener.
   * @param {KeyboardEventHandler} handler The handler to remove.
   */
  removeEventListener(handler) {
    this.handlers.delete(handler);
  }
}

KeyboardInputModule.EventTypes = {
  KEY_DOWN: "keydown",
  KEY_UP: "keyup",
};

class MessageBoard$1 {
  constructor() {
    this.channelSubscribers = {}; // Maps channels to their subscribers
    this.subscriptions = {}; // Maps ids to set of subscriptions
    this.receivers = {}; // Maps each id to where it receives messages.
    
    this.channelQueue = new Queue();
    this.messageQueue = new Queue();
  }
  
  getAllChannels() {
    // Is this ever used?
    return Object.keys(this.channelSubscribers);
  }
  
  getSubscriptions(id) {
    if (id in this.subscriptions) {
      return this.subscriptions[id];
    }
    console.warn("Id ", id, " not found in messageBoard");
  }
  
  getSubscribers(channel) {
    // TODO: Is this ever used?
    if (id in this.channelSubscribers) {
      return this.channelSubscribers[id];
    }
    console.warn("Id ", id, " not found in messageBoard");
  }
  
  signup(id, receiver) {
    // console.debug("Component", id, "signing up.");
    if (id in this.receivers) {
      console.warn("Id ", id, " is already signed up.");
      return;
    }
    this.receivers[id] = receiver;
    this.subscriptions[id] = new Set();
  }
  
  subscribe(id, channels) {
    if (!(id in this.receivers)) {
      // this.subscriptions[id] = new Set();
      // TODO: Create similar message when receiving. 
      console.error("Id ", id, " does not have a receiver but is signing up for messages.");
      return;
    }
    for (let channel of channels) {
      if (!(channel in this.channelSubscribers)) {
        this.channelSubscribers[channel] = new Set();
      }
      if (id in this.channelSubscribers[channel]) {
        // console.debug("Channel ", id, " is already signed up for ", channel);
        continue;
      }
      this.channelSubscribers[channel].add(id);
      this.subscriptions[id].add(channel);
    }
  }
  
  unsubscribe(id, channels) {
    if (!(id in this.subscriptions)) {
      console.warn("Channel: ", id, " does not appear in the message board");
      return;
    }
    for (let channel of channels) {
      if (!(channel in this.channelSubscribers)) {
        console.error("Channel ", channel, " does not belong the messageBoard");
        continue;
      }
      if (!(id in this.channelSubscribers[channel])) {
        console.warn("State id: ", id, " does not appear in the messageBoard list ", channel);
      }
      this.channelSubscribers[channel].delete(id);
      if (this.channelSubscribers[channel].size === 0) {
        delete this.channelSubscribers[channel];
      }
      this.subscriptions[id].delete(channel);
    }
  }
  
  withdraw(id) {
    if (!(id in this.subscriptions)) {
      console.warn("Id: ", id, " does not appear in the message board");
    }
    for (let channel of this.subscriptions[id]) {
      this.channelSubscribers[channel].delete(id);
      if (this.channelSubscribers[channel].size === 0) {
        delete this.channelSubscribers[channel];
      }
    }
    delete this.subscriptions[id];
    delete this.receivers[id];
  }
  
  // Posts message to all ids who have signed for the channel/tag.
  post(source, channel, message) {
    // Keep for now?
    if (channel in this.channelSubscribers) {
      for (let id of this.channelSubscribers[channel]) {
        this.receivers[id].receiveMessage(source, channel, message);
      }
    }
    
    return;
  }
}

/**
 * @typedef {{
 * setAsBlank?: string,
 * spaceIsTransparent?: boolean,
 * ignoreLeadingSpaces?: boolean,
 * spaceHasFormatting?: boolean,
 * }} SpriteSettings
 * 
 *
 * @typedef {{
 * x: number,
 * y: number,
 * length: number,
 * visibleText: boolean,
 * }} SegmentData
 */
class Sprite {
  /**
   * Creates a new Sprite that can be used by AsciiGL.
   * @param {string} text The text which the sprite is composed of
   * @param {SpriteSettings} settings Controls how the sprite is displayed
   */
  constructor(text, settings) {
    // TODO: Verify text.
    text = text || "";
    settings = settings || {};

    this._text = text;
    /** 
     * @type {Array<number>} 
     * @private
     */
    this._rowIndices = [];
    /**
     * @type {Array<number>}
     * @private
     */
    this._firstVisibleChar = [];
    /**
     * @private
     */
    this._width = 0;
    /**
     * @private
     */
    this._height = 1;
    /** 
     * @type {Array<Array<SegmentData>>}
     * @private 
     */
    this._segments = undefined;

    // All characters in this set are replaced with a blank space when being drawn.
    // These characters are not transparent.
    /**
     * @private
     */
    this._setAsBlank = "";
    /**
     * @private
     */
    this._setAsBlankRegexp = null;
    // By default, all spaces (in the string) are transparent, 
    // i.e. they take the formatting of the sprite behind them.
    /**
     * @private
     */
    this._spaceIsTransparent = true;
    // By default, leading spaces in each line are ignored.
    /**
     * @private
     */
    this._ignoreLeadingSpaces = true;
    // If ignoreLeadingSpaces is true but spaceIsTransparent is false, leading spaces are still ignored.
    // i.e. ignoreLeadingSpaces takes precedence. 
    /**
     * @private
     */
    this._spaceHasFormatting = false;

    if ("setAsBlank" in settings) {
      this._setAsBlank = settings.setAsBlank;
    }
    this._setAsBlankRegexp = new RegExp("[" + this._setAsBlank + "]", "g");
    /**
     * @private
     */
    this._processedText = this._text.replace(this._setAsBlankRegexp, " ");

    if ("spaceIsTransparent" in settings) {
      this._spaceIsTransparent = settings.spaceIsTransparent;
    }

    if ("ignoreLeadingSpaces" in settings) {
      this._ignoreLeadingSpaces = settings.ignoreLeadingSpaces;
    }

    if ("spaceHasFormatting" in settings) {
      this._spaceHasFormatting = settings.spaceHasFormatting;
    }

    this._parseSpriteShape();

    /** Parse and store segment data */
    this._parseSegmentData();
    Object.freeze(this);
  }

  /**
   * @private
   */
  _parseSpriteShape() {
    let visibleCharFound = false;
    let textIdx = 0;
    if (this.text[0] === '\n') {
      // Ignore the first character if it is a newline.
      textIdx = 1;
    }
    this._rowIndices.push(textIdx);
    this._firstVisibleChar.push(this.ignoreLeadingSpaces ? undefined : textIdx);
    for (; textIdx < this.text.length; textIdx++) {
      if (this.text[textIdx] === '\n') {
        if (textIdx - this._rowIndices[this._rowIndices.length - 1] > this._width) {
          this._width = Math.max(this._width, textIdx - this._rowIndices[this._rowIndices.length - 1]);
        }
        this._rowIndices.push(textIdx + 1);
        this._firstVisibleChar.push(this.ignoreLeadingSpaces ? undefined : textIdx);
        visibleCharFound = false;
      } else if (!visibleCharFound && this.text[textIdx] !== ' ') {
        visibleCharFound = true;
        this._firstVisibleChar[this._firstVisibleChar.length - 1] = textIdx;
      }
      // TODO: Handle any other bad characters (\t, \b, etc.)
      if (textIdx > 1 && this.text[textIdx - 1] === '\n') {
        this._height++;
      }
    }
    if (this.text.charAt(this.text.length - 1) !== '\n') {
      this._width = Math.max(
        this._width,
        this.text.length - this._rowIndices[this._rowIndices.length - 1]
      );
      this._rowIndices.push(this.text.length + 1);
    } else {
      this._rowIndices.push(this.text.length);
    }

  }

  /**
   * @private
   */
  _parseSegmentData() {
    this._segments = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      this._segments[y] = [];

      let rowStart = this._rowIndices[y];
      let rowEnd = this._rowIndices[y + 1] - 1; // Subtract 1 because last character is a new line.
      let rowLength = rowEnd - rowStart;

      let firstUsedX = this.ignoreLeadingSpaces ? this._firstVisibleChar[y] - rowStart : 0;
      let x = firstUsedX;
      let currSegmentStart = x;
      let currSegmentState = SegmentState.BLANK;
      while (x < rowLength) {
        let charIdx = rowStart + x;
        let char = this.text[charIdx];
        let charState = this._charState(char);
        if (charState !== currSegmentState) {
          this._addSegment(currSegmentStart, x, y, currSegmentState);
          currSegmentStart = x;
          currSegmentState = charState;
        }
        x++;
      }
      this._addSegment(currSegmentStart, x, y, currSegmentState);
    }
  }

  /**
   * 
   * @private
   * @param {number} startX 
   * @param {number} currX 
   * @param {number} y 
   * @param {SegmentState} state 
   */
  _addSegment(startX, currX, y, state) {
    if (state !== SegmentState.BLANK) {
      this._segments[y].push({
        x: startX,
        y: y,
        length: currX - startX,
        visibleText: state === SegmentState.HAS_TEXT,
      });
    }
  }

  /**
   * @returns {String} The original text within the Sprite
   */
  get text() {
    return this._text;
  }

  /**
   * @returns {number} The width of the Sprite
   */
  get width() {
    return this._width;
  }

  /**
   * @returns {number} The height of the Sprite
   */
  get height() {
    return this._height;
  }

  /**
   * @returns {string} The set of characters in the Sprite which will be rendered as blanks.
   */
  get setAsBlank() {
    return this._setAsBlank;
  }

  /**
   * @returns {boolean} Whether or not spaces are rendered in the Sprite
   */
  get spaceIsTransparent() {
    return this._spaceIsTransparent;
  }

  /**
   * @returns {boolean} Whether or not leading spaces are rendered
   */
  get ignoreLeadingSpaces() {
    return this._ignoreLeadingSpaces;
  }

  /**
   * @returns {boolean} Whether or not the associated Style is still rendered, if spaceIsTransparent is true
   */
  get spaceHasFormatting() {
    return this._spaceHasFormatting;
  }

  /**
   * Iterates over the segments of the Sprite
   * 
   * @param {number} left The leftmost allowed column in sprite coordinates
   * @param {number} right 
   * @param {number} top 
   * @param {number} bottom 
   * @yields {SegmentData} 
   */
  *getItSpritePos(left, right, top, bottom) {
    let minY = Math.max(top, 0);
    let maxY = Math.min(bottom, this.height);

    if (top >= this.height || bottom <= 0) {
      // The sprite is above or below the screen, respectively;
      return;
    }

    for (let y = minY; y < maxY; y++) {
      if (this._firstVisibleChar[y] === undefined) {
        continue;
      }
      let rowStart = this._rowIndices[y];
      let rowEnd = this._rowIndices[y + 1] - 1; // Subtract 1 because last character is a new line.
      let rowLength = rowEnd - rowStart;
      let firstUsedX = this.ignoreLeadingSpaces ? this._firstVisibleChar[y] - rowStart : 0;

      if (left >= rowLength || right <= firstUsedX) {
        // This row is to the right or left of the screen, respectively.
        continue;
      }

      for (let segment of this._segments[y]) {
        let segmentLeft = Math.max(segment.x, left);
        let segmentRight = Math.min(segment.x + segment.length, right);
        if (right <= segmentLeft) {
          break;
        }
        if (segmentRight <= left) {
          continue;
        }
        yield {
          x: segmentLeft,
          y: y,
          length: segmentRight - segmentLeft,
          visibleText: segment.visibleText,
        };
      }
    }
  }

  /**
   * 
   * @param {number} spriteX 
   * @param {number} spriteY 
   * @param {number} screenX 
   * @param {number} screenY 
   * @param {number} screenWidth 
   * @param {number} screenHeight 
   * 
   * @yields {SegmentData}
   */
  *getItScreenPos(spriteX, spriteY, screenX, screenY, screenWidth, screenHeight) {
    for (let segmentData of this.getItSpritePos(
      screenX - spriteX,
      screenX + screenWidth - spriteX,
      screenY - spriteY,
      screenY + screenHeight - spriteY)
    ) {
      segmentData.x += spriteX;
      segmentData.y += spriteY;
      yield segmentData;
    }
  }

  /**
   * @private
   * @param {string} c A string of length one
   */
  _charHasFormatting(c) {
    return c !== " " || !this.spaceIsTransparent || this.spaceHasFormatting;
  }

  /**
   * @private
   * @param {string} c
   * @returns {boolean}
   */
  _charHasText(c) {
    return c !== " " || !this.spaceIsTransparent;
  }

  /**
   * @private
   * @param {string} c 
   * @returns {boolean}
   */
  _charState(c) {
    return this._charHasText(c) ? SegmentState.HAS_TEXT :
      this._charHasFormatting(c) ? SegmentState.HAS_FORMATTING :
        SegmentState.BLANK;
  }

  /**
   * Computes the length of the segment starting at the the specified location.
   * 
   * If the starting character has neither text nor formatting, returns 0.
   * 
   * TODO: REPLACE WITH METHOD THAT USES this._segments
   * @deprecated
   */
  segmentLengthAt(x, y) {
    // TODO: Store this data?
    if (y < 0 || y >= this.height) {
      return 0;
    }
    if (x < 0 || x >= this.width) {
      return 0;
    }
    // TODO: Binary search?
    for (let segment of this._segments[y]) {
      if (segment.x + segment.length <= x) {
        continue;
      }
      if (x < segment.x) {
        return 0;
      }
      return segment.x + segment.length - x;
    }
    return 0;
  }

  /**
   * Returns a substring of the row starting at the specified location.
   * Stops when it encounters a non-visible character, or a new line.
   * 
   * If the starting character is not visible, returns an empty string.
   * 
   * maxLength specifies the maximum length of the returned string.
   * Used if caller wants a shorter string.
   */
  segmentAt(x, y, maxLength) {
    // TODO: Store this data?
    const rowStart = this._rowIndices[y];
    let strLength = this.segmentLengthAt(x, y);
    strLength = (maxLength && maxLength < strLength) ? maxLength : strLength;
    return this._processedText.substring(rowStart + x, rowStart + x + strLength);
  }
}

/**
 * @enum
 */
const SegmentState = {
  BLANK: 0,
  HAS_FORMATTING: 1,
  HAS_TEXT: 2,
};

class Style {
  /**
   * Creates a new blank Style object
   */
  constructor() {
    /**
     * @private
     */
    this._styles = {};
    for (let styleName in Style.defaultValues) {
      this._styles[styleName] = null;
    }
  }
  
  /**
   * Prevents this Style from being changed in the future.
   */
  freeze() {
    Object.freeze(this._styles);
    Object.freeze(this);
  }
  
  /**
   * Resets all of the properties in the Style
   */
  clear() {
    for (let styleName in Style.defaultValues) {
      this._styles[styleName] = null;
    }
  }
  
  /**
   * Copies the data from the other Style object.
   * 
   * @param {Style} other The Style to copy from
   */
  copy(other) {
    this.clear();
    for (let styleName of other) {
      this.setStyle(styleName, other.getStyle(styleName));
    }
  }
  
  // ---- PUBLIC API ---- // 
  
  /**
   * Checks if the two styles are the same
   * @param {Style} other The Style to compare to
   * @returns {boolean} True if they are the same, false otherwise
   */
  sameAs(other) {
    for (let styleName in Style.defaultValues) {
      if (
        (this.hasStyle(styleName) !== other.hasStyle(styleName)) || 
        (this.getStyle(styleName) !== other.getStyle(styleName))
      ) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Sets a single property in the Style
   * @param {string} styleName The name of the property to set
   * @param {string} value The value to set to
   */
  setStyle(styleName, value) {
    if (!(styleName in Style.defaultValues)) {
      console.warn("AsciiGL currently does not support the style", styleName);
    }
    this._styles[styleName] = value || null;
  }
  
  /**
   * Checks if the property is specified
   * @param {string} styleName The name of a Style property
   * @returns {boolean} True if the property is set, false otherwise
   */
  hasStyle(styleName) {
    return this._styles[styleName] !== null;
  }
  
  /**
   * Returns the value of the a single Style property
   * @param {string} styleName The name of the Style property
   * @returns {string} The property value, or "" if it's not set
   */
  getStyle(styleName) {
    if (this.hasStyle(styleName)) {
      return this._styles[styleName];
    }
    return "";
  }
  
  /**
   * Allows for iterating over the specified properties of this Style.
   */
  *[Symbol.iterator]() {
    for (let styleName in this._styles) {
      if (this.hasStyle(styleName)) {
        yield styleName;
      }
    }
  }
  
  /**
   * Fills in all used style fields.
   * 
   * Ensures that all formatting comes from the current sprite, not ones behind it.
   * 
   * The parameter, if passed, specifies the default values to use.
   * 
   * @param {Style} base The style to copy from
   */
  fillRemainder(base) {
    for (let styleName in Style.defaultValues) {
      if (!this.hasStyle(styleName)) {
        if (base && base.hasStyle(styleName)) {
          this.setStyle(styleName, base.getStyle(styleName));
        } else {
          this.setStyle(styleName, Style.defaultValues[styleName]);
        }
      }
    }
  }
}

/**
 * @enum {String} A list of supported style properties
 */
Style.defaultValues = {
  color: "black",
  backgroundColor: "transparent",
  fontWeight: "normal",
  fontStyle: "normal",
  textDecoration: "none",
  cursor: "default",
};

/**
 * Sets the default property value for ALL Styles
 * @param {string} styleName The style property
 * @param {string} value The value to set to
 */
Style.setDefaultStyle = function(styleName, value) {
  if (styleName in Style.defaultValues) {
    // TODO: Verify value.
    Style.defaultValues[styleName] = value;
  } else {
    console.warn("Style does not support", styleName);
  }
};

class SpriteBuilder {
  /**
   * A template to create sprites (usually for text)
   * 
   * @param {Array} templateArray An array of strings.
   */
  constructor(templateArray) {
    this._template = templateArray;
    this._paramCount = templateArray.length - 1;
  }
  
  /**
   * Builds a new Sprite using the template and parameters.
   * @param {Array<string>} paramArray The array of parameters used to build the new Sprite
   * @returns {Sprite} A new Sprite
   */
  construct(paramArray) {
    // TODO: Optimize.
    let result = "";
    for (let i = 0; i < this._template.length; i ++) {
      result += this._template[i];
      if (i < this._paramCount) {
        result += paramArray[i];
      }
    }
    return new Sprite(result);
  }
}

class DOMBuffer {
  /**
   * A wrapper around the DOM elements which are rendered.
   * 
   * Maintains a virtual DOM for performance.
   */
  constructor() {
    this.primaryElement = document.createElement("pre");
    this._width = 0;
    this._height = 0;
    
    this.activeRowLength = [];
    
    this.rows = [];
    this.elements = [];
    
    this.primaryElement.style.margin = "0";
  }
  
  /**
   * Initializes the DOMBuffer.
   * Creates the necessary DOM elements and supporting data structures.
   * @param {number} width The width of the canvas
   * @param {number} height The height of the canvas
   */
  init(width, height) {
    this._width = width;
    this._height = height;
    
    for (let y = 0; y < height; y ++) {
      let rowElement = document.createElement("div");
      // TODO: Is this necessary? Remove?
      rowElement.dataset.asciiGlRow = y;
      
      this.primaryElement.appendChild(rowElement);
      this.rows.push(rowElement);
      this.elements.push([]);
      this.activeRowLength.push(0);
      for (let x = 0; x < width; x ++) {
        this.elements[y].push(new DOMCellWrapper());
      }
    }
  }
  
  /**
   * @return {number} The width of the canvas
   */
  get width() {
    return this._width;
  }
  
  /**
   * @return {number} The height of the canvas
   */
  get height() {
    return this._height;
  }
  
  /**
   * @returns {HTMLElement} The primary HTML element which should be used for rendering.
   */
  getDomElement() {
    return this.primaryElement;
  }
  
  /**
   * Causes the number of span elements attached to a row to change.
   * 
   * @param {number} row The row number
   * @param {number} length The number of elements that should be used.
   */
  setRowLength(row, length) {
    if (length < this.activeRowLength[row]) {
      for (let x = this.activeRowLength[row] - 1; x >= length; x --) {
        this.rows[row].removeChild(this.elements[row][x].getDomElement());
      }
    } else if (length > this.activeRowLength[row]) {
      for (let x = this.activeRowLength[row]; x < length; x ++) {
        this.rows[row].appendChild(this.elements[row][x].getDomElement());
      }
    }
    this.activeRowLength[row] = length;
  }
  
  /**
   * Loads rendering information from a DrawBuffer and updates the DOM.
   * @param {DrawBuffer} drawBuffer The drawbuffer to get rendering information from
   */
  bind(drawBuffer) {
    for (let y = 0; y < this.height; y ++) {
      let x = 0;
      let cellsUsed = 0;
      while (x < this.width) {
        let domElementWrapper = this.elements[y][cellsUsed];
        
        let segmentLength = drawBuffer.getSegmentLengthAt(x, y);
        let segmentData = drawBuffer.getSegmentAt(x, y);

        let frontTextId = segmentData.textId;
        let text = undefined;
        if (frontTextId === undefined) {
          text = " ".repeat(segmentLength);
        } else {
          text = drawBuffer.sprites[frontTextId].segmentAt(
            x - drawBuffer.locations[frontTextId][0],
            y - drawBuffer.locations[frontTextId][1],
            segmentLength
          );
        }
        domElementWrapper.setText(text);
        
        let style = segmentData.styles;
        for (let styleName in style) {
          domElementWrapper.setStyle(styleName, style[styleName]);
        }

        domElementWrapper.setId(segmentData.frontId);

        cellsUsed ++;
        x += segmentLength;
        domElementWrapper.applyChanges();
      }
      
      this.setRowLength(y, cellsUsed);
    }
  }
}

class DOMCellWrapper {
  constructor() {
    this._domElement = document.createElement("span");
    this._currText = "";
    this._currStyles = {};

    this._nextText = "";
    this._nextStyles = {};

    this._currId = "";
    this._nextId = "";
  }
  
  getDomElement() {
    return this._domElement;
  }

  setText(value) {
    this._nextText = value;
  }

  setStyle(styleName, value) {
    this._nextStyles[styleName] = value || "";
  }

  setId(value) {
    this._nextId = value;
  }

  applyChanges() {
    let domElement = this._domElement;
    if (this._nextText !== this._currText) {
      domElement.textContent = this._nextText;
    }
    this._currText = this._nextText;
    for (let styleName in this._nextStyles) {
      let styleValue = this._nextStyles[styleName];
      if (styleValue !== this._currStyles[styleName]) {
        domElement.style[styleName] = styleValue;
      }
      this._currStyles[styleName] = styleValue;
    }
    if (this._nextId !== this._currId) {
      // TODO: Find a more efficient way of storing this property.
      // Testing currently suggests setting values w/ dataset is very expensive.
      if (this._nextId === undefined) {
        delete domElement.dataset.asciiGlId;
      } else {
        domElement.dataset.asciiGlId = this._nextId;
      }
    }
    this._currId = this._nextId;
  }
}

// Only importing Sprite due to type checking in vs code...

class DrawBuffer {
  constructor() {
    this._width = 0;
    this._height = 0;
    
    this.rowComputedData = [];
    this.sprites = {};
    this.locations = {};
    
    this.backgroundStyle = new Style();
    this.backgroundStyle.fillRemainder();
  }
  
  init(width, height) {
    this._width = width;
    this._height = height;
    
    for (let y = 0; y < height; y ++) {
      this.rowComputedData.push(new RowSegmentBuffer(y, width, this.backgroundStyle));
    }
  }
  
  get width() {
    return this._width;
  }
  
  get height() {
    return this._height;
  }
  
  clear() {
    for (let y = 0; y < this.height; y ++) {
      this.rowComputedData[y].clear();
    }
    this.sprites = {};
    this.locations = {};
  }
  
  /**
   * 
   * @param {Sprite} sprite The sprite to draw
   * @param {Array<number>} location The position to draw at
   * @param {Style} style The corresponding style
   * @param {string} id The unique id associated with the draw
   */
  draw(sprite, location, style, id) {
    for (let segment of sprite.getItScreenPos(location[0], location[1], 0, 0, this.width, this.height)) {
      let y = segment.y;
      this.rowComputedData[y].loadSegment(segment.length, segment.x, style, location[2], id, segment.visibleText);
    }
    
    this.sprites[id] = sprite;
    this.locations[id] = location;
  }
  
  getSegmentLengthAt(x, y) {
    return this.rowComputedData[y].getSegmentLengthAt(x);
  }

  getSegmentAt(x, y) {
    return this.rowComputedData[y].getSegmentAt(x);
  }
}

class RowSegmentBuffer {
  /**
   * 
   * @param {number} rowNumber The row number of this buffer
   * @param {number} width The width of the row
   * @param {Style} defaultStyle A REFERENCE of the default style.
   */
  constructor(rowNumber, width, defaultStyle) {
    this._width = width;
    this._rowNumber = rowNumber;
    
    this._nextPointer = new Array(width);
    /** @type{Array<ComputedSegmentData>} */
    this._computedSegments = new Array(width);

    for (let i = 0; i < this.width; i++) {
      this._computedSegments[i] = new ComputedSegmentData(defaultStyle);
      this._nextPointer[i] = -1;
    }
    this._nextPointer[0] = this.width;
  }
  
  clear() {
    // Don't actually need to clear the old data.
    for (let i = 1; i < this.width; i ++) {
      this._nextPointer[i] = -1;
    }
    this._computedSegments[0].clear();
    this._nextPointer[0] = this.width;
  }
  
  get row() {
    return this._rowNumber;
  }
  
  get width() {
    return this._width;
  }
  
  insertSegmentStart(startX) {
    if (this._nextPointer[startX] === -1) {
      // If it's not a segment start point already,
      // Find the previous segment and copy it.
      this._computedSegments[startX].clear();
      let prevActiveStyle = startX - 1;
      while (this._nextPointer[prevActiveStyle] === -1) {
        prevActiveStyle --;
      }
      this._nextPointer[startX] = this._nextPointer[prevActiveStyle];
      this._nextPointer[prevActiveStyle] = startX;
      this._computedSegments[startX].copy(this._computedSegments[prevActiveStyle]);
    }
  }
  
  loadSegment(segmentLength, startX, style, priority, id, visibleText) {
    let endX = startX + segmentLength;

    this.insertSegmentStart(startX);
    this.insertSegmentStart(endX);
    
    let currPointer = startX;
    do {
      this._computedSegments[currPointer].addStyle(id, visibleText, style, priority);
      currPointer = this._nextPointer[currPointer];
    }
    while (currPointer < this.width && currPointer < endX);
  }
    
  getSegmentLengthAt(x) {
    let prevActive = x;
    while(this._nextPointer[prevActive] === -1) {
      prevActive --;
    }
    return this._nextPointer[prevActive] - x;
  }

  getSegmentAt(x) {
    // TODO: Is this loop necessary? DOMBuffer elements should perfectly correspond to segments.
    while (this._nextPointer[x] === -1) {
      x--;
    }
    return this._computedSegments[x];
  }
}

class ComputedSegmentData {
  /**
   * A helper class to manage the resulting style.
   */
  constructor(defaultStyle) {
    this._default = defaultStyle;

    this._spriteId = undefined;
    this._spritePriority = undefined;

    this._styleValues = {};
    this._stylePriorities = {};
    
    this._highestPriority = Number.POSITIVE_INFINITY;
    this._frontId = undefined;
    this.clear();

    Object.seal(this);
    Object.seal(this._styleValues);
    Object.seal(this._stylePriorities);
  }
  
  copy(other) {
    for (let styleName in Style.defaultValues) {
      this._styleValues[styleName] = other._styleValues[styleName];
      this._stylePriorities[styleName] = other._stylePriorities[styleName];
    }
    this._spriteId = other._spriteId;
    this._spritePriority = other._spritePriority;

    this._highestPriority = other._highestPriority;
    this._frontId = other._frontId;
  }
  
  clear() {
    for (let styleName in Style.defaultValues) {
      this._styleValues[styleName] = this._default.getStyle(styleName);
      this._stylePriorities[styleName] = Number.POSITIVE_INFINITY;
    }
    this._spriteId = undefined;
    this._spritePriority = Number.POSITIVE_INFINITY;

    this._highestPriority = Number.POSITIVE_INFINITY;
    this._frontId = undefined;
  }
    
  get frontId() {
    return this._frontId;
  }

  get textId() {
    return this._spriteId;
  }

  get styles() {
    return this._styleValues;
  }
  
  /**
   * Adds a new segment at the specified priority.
   * 
   * @param {string} segmentId 
   * @param {boolean} hasText 
   * @param {Style} style 
   * @param {number} priority 
   */
  addStyle(segmentId, hasText, style, priority) {
    for (let styleName of style) {
      if (priority < this._stylePriorities[styleName]) {
        let styleValue = style.getStyle(styleName);
        if (styleValue !== undefined) {
          this._styleValues[styleName] = styleValue;
          this._stylePriorities[styleName] = priority;
        }
      }
    }
    if (hasText && priority < this._spritePriority) {
      this._spriteId = segmentId;
      this._spritePriority = priority;
    }
    if (priority < this._highestPriority) {
      this._highestPriority = priority;
      this._frontId = segmentId;
    }
  }
}

class AsciiGLInstance {
  /**
   * Creates a new AsciiGL instance and attaches it to a div and prepares it for use.
   */
  constructor(containerId) {
    console.assert(containerId, "AsciiGL constructor requires a valid HTML element id parameter.");
    let outerContainer = document.getElementById(containerId);
    console.assert(outerContainer, "AsciiGL constructor parameter containerId does not correspond to a valid HTML element.");
    console.assert(
      (outerContainer.tagName === "DIV"),
      "Container element must be a DIV"
    );
    
    while (outerContainer.lastChild) {
      outerContainer.removeChild(outerContainer.lastChild);
    }
    
    outerContainer.style.textAlign = "center";
    
    let container = document.createElement("DIV");
    
    container.style.display = "inline-block";
    container.style.fontFamily = "Courier New";
    container.style.fontSize = "1em";
    container.style.userSelect = "none";
    container.style.margin = "0";
    
    outerContainer.appendChild(container);
    
    /**
     * @type {HTMLDivElement}
     * @private
     */
    this._container = container;
    
    // Have two so that only one is modified at any given time.
    // TODO: Later, do more testing on using 2 DOMBuffers.
    /**
     * @private
     */
    this._domBuffer = new DOMBuffer();
    // For now, just use simple objects to hold.
    /**
     * @private
     */
    this._nameBuffers = [{}, {}];
    /**
     * @private
     */
    this._drawBufferIdx = 0;
    /**
     * @private
     */
    this._activeBufferIdx = 1;
    
    /**
     * @private
     */
    this._width = 0;
    /**
     * @private
     */
    this._height = 0;
    
    /**
     * @private
     */
    this._drawBuffer = new DrawBuffer();
    
    /**
     * @private
     */
    this._currMouseOver = undefined;
    /**
     * @private
     */
    this._currMouseDown = undefined;
    /**
     * @private
     */
    this._handler = () => {};
  }
  
  /**
   * Initializes the pre element for rendering.
   * 
   * @param {number} width The width of the canvas in characters
   * @param {number} height The height of the canvas in characters
   */
  init(width, height) {
    console.assert(width > 0 && height > 0, "AsciiGL must have positive dimensions.");
    
    this._width = width;
    this._height = height;
    
    this._drawBuffer.init(width, height);

    this._domBuffer.init(width, height);
    this._nameBuffers[0] = {};
    this._nameBuffers[1] = {};
    
    this._container.appendChild(this._domBuffer.getDomElement());
    
    this._setupEventListeners();
    this.render();
  }
  
  /**
   * A helper method to set up event listeners on the container.
   */
  _setupEventListeners() {
    // See below for list of event types:
    // https://www.w3schools.com/jsref/obj_mouseevent.asp
    this._container.addEventListener("mouseenter", (event) => {
      let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
      this._handler(event, "mouseentercanvas", undefined, mouseCoords);
      let target = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
      this._currMouseOver = target;
      if (target) {
        this._handler(event, "mouseenter", this._currMouseOver, mouseCoords);
      }
    });
    
    this._container.addEventListener("mouseleave", (event) => {
      let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
      // This should partially alleviate glitches where mousemove isn't triggered after the mouse leaves the canvas.
      if (this._currMouseOver) {
        this._handler(event, "mouseleave", this._currMouseOver, mouseCoords);
      }
      if (this._currMouseDown) {
        this._currMouseDown = undefined;
      }
      this._currMouseOver = undefined;
      this._handler(event, "mouseleavecanvas", undefined, mouseCoords);
    });

    this._container.addEventListener("mousemove", (event) => {
      let target = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
      let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);

      if (target !== this._currMouseOver) {
        if (this._currMouseOver) {
          this._handler(event, "mouseleave", this._currMouseOver, mouseCoords);
        }
        this._currMouseOver = target;
        if (target) {
          this._handler(event, "mouseenter", this._currMouseOver,  mouseCoords);
        }
      }
      this._handler(event, "mousemove", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
    });

    this._container.addEventListener("mousedown", (event) => {
      let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
      this._currMouseDown = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId] || undefined;
      this._handler(event, "mousedown", this._currMouseDown, mouseCoords);
    });
    
    this._container.addEventListener("mouseup", (event) => {
      let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
      this._handler(event, "mouseup", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
    });
    
    this._container.addEventListener("click", (event) => {
      let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
      let currMouseDown = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
      if (this._currMouseDown !== undefined && currMouseDown !== this._currMouseDown) {
        this._currMouseDown = undefined;
      }
      this._handler(event, "click", this._currMouseDown, mouseCoords);
      this._currMouseDown = undefined;
    });
    
    this._container.addEventListener("contextmenu", (event) => {
      // TODO: Perhaps let user customize behavior?
      event.preventDefault();
      let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
      this._handler(event, "contextmenu", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
    });
  }
  
  /**
   * Converts mouse position viewport coordinates into asciiengine coordinates.
   * 
   * @param {number} mouseX The x-coordinate of the mouse in the canvas
   * @param {number} mouseY The y-coordinate of the mouse in the canvas
   * @returns {{x: number, y: number}} The coordinate of the mouse in AsciiGL
   */
  mousePositionToCoordinates(mouseX, mouseY) {
    // TODO: Find a more efficient method.
    let bounds = this._container.getBoundingClientRect();
    
    let x = Math.floor((mouseX - bounds.x) * this.width / bounds.width);
    let y = Math.floor((mouseY - bounds.y) * this.height / bounds.height);
    return {x: x, y: y}
  }
  
  _flipBuffers() {
    this._drawBufferIdx = 1 - this._drawBufferIdx;
    this._activeBufferIdx = 1 - this._activeBufferIdx;
  }
  
  /**
   * @returns {number} The width of the canvas in characters
   */
  get width() {
    return this._width;
  }
  
  /**
  * @returns {number} The height of the canvas in characters
  */
  get height() {
    return this._height;
  }
  
  /**
   * @returns {Style} The current set of background style properties.
   */
  get backgroundStyles() {
    return this._drawBuffer.backgroundStyle;
  }
  
  /**
   * Returns a single style property
   * 
   * @param {String} styleName The name of the style to return
   */
  getBackgroundStyle(styleName) {
    return this._drawBuffer.backgroundStyle.getStyle(styleName);
  }
  
  /**
   * Sets a single background style property
   * @param {String} styleName The name of the style to set
   * @param {String} value The value to set to
   */
  setBackgroundStyle(styleName, value) {
    this._drawBuffer.backgroundStyle.setStyle(styleName, value);
  }
  
  /**
   * Set by user code. handlerFunc is called when an AsciiGL mouse event occurs. 
   * 
   * handlerFunc takes in (event, type, target, coords).
   * event is the original MouseEvent object that triggered the AsiiGL event.
   * type is the name of the triggered event, with respect to AsciiGL.
   * target is the name of the element which the event was triggered on (may be undefined)
   * coords is the coordinate of the character that the mouse is currently over.
   * 
   * The type parameter does not necessarily correspond to the type of MouseEvent.
   * AsciiGL currently reports the current events:
   * 
   * mousemove: Mouse is in the AsciiGL canvas, and has moved.
   *  The coordinates of the mouse are in the MouseEvent object. 
   * mouseenter: Mouse entered the space belonging to a new target
   * mouseleave: Mouse leaves the space belonging to the current target
   * mouseentercanvas: Mouse enters the AsciiGL canvas
   * mouseleavecanvas: Mouse leaves the AsciiGL canvas
   * mousedown: Mouse button is pressed in the AsciiGL canvas
   * mouseup: Mousebutton is released in the AsciiGL canvas
   * click: A click event was registered in the AsciiGL canvas
   * 
   * @param {(event: MouseEvent, type: String, target: String, coords: {x: number, y: number}) => void} handlerFunc The mouse handler function
   */
  setHandler(handlerFunc) {
    this._handler = handlerFunc;
  }
  
  /**
   * Draws a sprite onto the canvas. 
   * Must specify a location to draw to.
   * Style determines what the text looks like.
   * name is optional, and allows it to be referenced in event listeners.
   * Different sprites may share the same name.
   * 
   * @param {Sprite} sprite The sprite to render
   * @param {{x: number, y: number, z: number}} location The location to draw
   * @param {Style} style How the sprite is styled
   * @param {String} [name] A name associated with the sprite. Does not need to be unique.
   */
  draw(sprite, location, style, name) {
    let id = Functions.generateId(name);
    this._drawBuffer.draw(sprite, location, style, id);
    if (name) {
      this._nameBuffers[this._drawBufferIdx][id] = name;
    }
  }
  
  /**
   * Displays the current buffer and hides the displayed one.
   * 
   * All changes until the next call to flip will be on the other buffer. 
   */
  render() {
    this._domBuffer.bind(this._drawBuffer);
    // NOTE: Intitial tests suggest having only one buffer may be more optimal...
    // If so, move the appendChild line to init.
    // 
    // Clear the current elements and attach new ones. 
    // while (this._container.lastChild) {
    //   this._container.removeChild(this._container.lastChild);
    // }
    // this._container.appendChild(this._buffers[this._drawDOMBufferIdx].getDomElement());    
    //this._flipDomBuffers();
    this._drawBuffer.clear();
    this._nameBuffers[this._activeBufferIdx] = {};
    this._flipBuffers();
  }
}

const EventTypes = {
  MOUSE_ENTER_CANVAS: "mouseentercanvas",
  MOUSE_LEAVE_CANVAS: "mouseleavecanvas",
  MOUSE_ENTER: "mouseenter",
  MOUSE_LEAVE: "mouseleave",
  MOUSE_MOVE: "mousemove",
  MOUSE_ENTER: "mouseenter",
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  CLICK: "click",
  CONTEXT_MENU: "contextmenu",
};

Object.freeze(EventTypes);

const AsciiGL = {
  Instance: AsciiGLInstance,
  Sprite: Sprite,
  Style: Style,
  SpriteBuilder: SpriteBuilder,
  EventTypes: EventTypes,
};

Object.freeze(AsciiGL);

/**
 * @deprecated
 */
class AsciiMouseInputModule {
  constructor(agl) {
    this.GLOBAL = AsciiMouseInputModule.Global;
    this._agl = agl;
    
    this._registeredTargets = {};
    
    this._messageBoards = {};
    for (let name in AsciiGL.EventTypes) {
      this._messageBoards[AsciiGL.EventTypes[name]] = new MessageBoard$1();
    }
    
    agl.setHandler((event, type, target, coords) => {
      if (target !== undefined) {
        this._messageBoards[type].post(type, target, {
          type: type,
          target: target,
          event: event,
          coords: coords,
        });
      }
      this._messageBoards[type].post(type, this.GLOBAL, {
        type: type,
        target: target,
        event: event,
        coords: coords,
      });
    });
  }
  
  signup(id, receiver) {
    for (let name in this._messageBoards) {
      this._messageBoards[name].signup(id, receiver);
    }
  }
  
  withdraw(id) {
    for (let name in this._messageBoards) {
      this._messageBoards[name].withdraw(id);
    }
  }
  
  subscribe(id, target, events) {
    for (let eventType of events) {
      if (eventType in this._messageBoards) {
        this._messageBoards[eventType].subscribe(id, [target]);
      } else {
        console.warn("Message type", eventType, "not supported");
      }
    }
  }
  
  unsubscribe(id, target, events) {
    for (let eventType of events) {
      if (eventType in this._messageBoards) {
        this._messageBoards[eventType].unsubscribe(id, [target]);
      } else {
        console.warn("Message type", eventType, "not supported");
      }
    }
  }
}

AsciiMouseInputModule.Global = Symbol("Global");

const AssetLoader = {
  /**
   * 
   * @param {string} filename The file name to load
   */
  loadFileAsString: async function(filename) {
    let request = async function(filename) {
      return new Promise(function(resolve, reject) {
        let file = new XMLHttpRequest();
        file.open("GET", filename);
        file.onreadystatechange = function() {
          if (file.readyState === 4) {
            if (file.status === 200 || file.status === 0) {
              let text = file.responseText;
              resolve(text);
            } else {
              console.error("HTTP Request returned status code: ", file.status);
            }
          }
        };
        file.send();
      });
    };
    let fileString = await request(filename);
    return fileString;
  },
};

Object.freeze(AssetLoader);

/**
 * There are two main types of files to parse.
 * 
 * The first is raw Sprite/Style data.
 * These should be loaded directly into the resource manager.
 * 
 * The second is a AsciiAnimateComponent template.
 * These specify how to construct specific classes of AsciiAnimateComponents.
 */
const Parser = {
  /**
   * 
   * @param {string} fileString The file data as a string
   * @returns {{sprites: Object<string, Sprite>, styles: Object<string, Style}}
   */
  getSpriteDataFromString: function (fileString) {
    let json = JSON.parse(fileString);
    Parser.getSpriteDataFromJson(json);
  },

  /**
   * 
   * @param {any} json The sprite data as json
   */
  getSpriteDataFromJson: function (json) {
    //  JSON structure:
    //  {
    //    sprites: {
    //      spriteName: {
    //        text: "sprite text",
    //        settings: { sprite settings }
    //      }
    //    },
    //    styles: {
    //      styleName: { style data }
    //    }
    //  }
    let spriteData = json.sprites;
    let sprites = {};
    for (let spriteName in spriteData) {
      sprites[spriteName] = new Sprite(
        spriteData[spriteName].text,
        spriteData[spriteName].settings,
      );
    }
    let styleData = json.styles;
    let styles = {};
    for (let styleName in styleData) {
      let spriteStyle = new Style();
      for (let style in styleData[styleName]) {
        spriteStyle.setStyle(style, styleData[styleName][style]);
      }
      styles[styleName] = spriteStyle;
    }
    return {
      sprites: sprites,
      styles: styles,
    }
  },
  /**
   * Returns a function that builds AsciiAnimateComponents specified by fileString.
   * @param {string} fileString The file data as a string
   * @returns {Object<string, AsciiAnimateComponentFactory>}
   */
  getComponentFactoriesFromString: function (fileString) {
    let json = JSON.parse(fileString);
    Parser.getComponentFactoriesFromJson(json);
  },
  /**
   * 
   * @param {any} json The component factory data in json format
   */
  getComponentFactoriesFromJson: function(json) {
    // JSON structure:
    // {
    //    componentName: {
    //      frameName: {
    //        spriteNameList: [],
    //        styleNameList: [],
    //        relativePositionList: []
    //      }, ...
    //    }, ...
    // }
    let factories = {};
    for (let componentName in json) {
      let componentSpecs = json[componentName];
      factories[componentName] = new AsciiAnimateComponentFactory(componentSpecs);
    }
    return factories;
  }
};

class AsciiAnimateComponentFactory {
  constructor(componentSpecs) {
    /**
     * @private
     */
    this.specs = componentSpecs;
  }
  
  /**
   * @returns {AsciiAnimateComponent}
   */
  construct() {
    let animateComponent = new AsciiAnimateComponent();
    for (let frameName in this.specs) {
      // Need to create a copy to prevent (accidental?) changes.
      animateComponent.addFrame(
        frameName,
        [...(this.specs[frameName].spriteNameList)],
        [...(this.specs[frameName].styleNameList)],
        [...(this.specs[frameName].relativePositionList)],
      );
    }
    return animateComponent;
  }
}

Object.freeze(Parser);

class ResourceManager {
  constructor() {
    /**
     * @private
     */
    this.data = {};
  }
  
  /**
   * 
   * @param {string | symbol} key The key of the item to store
   * @param {any} value The value to store
   */
  add(key, value) {
    this.data[key] = value;
  }
  
  /**
   * Deletes an item
   * @param {string | symbol} key 
   */
  delete(key) {
    if (this.has(key)) {
      delete this.data[key];
    }
  }
  
  /**
   * 
   * @param {string | symbol} key 
   * @returns {boolean}
   */
  has(key) {
    return key in this.data;
  }
  
  /**
   * 
   * @param {string | symbol} key 
   * @returns {any}
   */
  get(key) {
    if (!(key in this.data)) {
      console.warn("Resource key: ", key, "not found");
    }
    return this.data[key];
  }
  
  /**
   * 
   * @param {Array<string>} fileList 
   */
  async loadSpriteFiles(fileList) {
    for (let spriteFile of fileList) {
      let fileString = await AssetLoader.loadFileAsString(spriteFile);
      this.loadSpriteFileJson(JSON.parse(fileString));
    }
  }

  /**
   * Loads JSON which contains sprite/style data from one file
   * @param {Object} json 
   */
  loadSpriteFileJson(json) {
    let spriteData = Parser.getSpriteDataFromJson(json);
    for (let spriteName in spriteData.sprites) {
      this.add(spriteName, spriteData.sprites[spriteName]);
    }

    for (let styleName in spriteData.styles) {
      this.add(styleName, spriteData.styles[styleName]);
    }
  }
  
  /**
   * 
   * @param {Array<string>} fileList 
   */
  async loadTemplateFiles(fileList) {
    for (let templateFile of fileList) {
      let fileString = await AssetLoader.loadFileAsString(templateFile);
      this.loadTemplateJson(JSON.parse(fileString));
    }
  }

  /**
   * 
   * @param {Object} json The json data for one template
   */
  loadTemplateJson(json) {
    let templateData = Parser.getComponentFactoriesFromJson(json);
    for (let templateName in templateData) {
      this.add(templateName, templateData[templateName]);
    }
  }
}

const Modules = {
  KeyboardInput: KeyboardInputModule,
  AsciiMouseInput: AsciiMouseInputModule,
  ResourceManager: ResourceManager,
};

Object.freeze(Modules);

class MessageReceiver {
  /**
   * An extensible class that receives messages from message boards.
   * Allows for delayed processing.
   * 
   * Currently supports processing only the top message.
   * In the future, may allow for grouping of messages, etc.
   * 
   * @param {Function} callback The callback to handle each message.
   *    NOTE: Should be bound to the owner of this MessageReceiver!
   */
  constructor(callback) {
    this.sourceQueue = new Queue();
    this.tagQueue = new Queue();
    this.messageQueue = new Queue();
    this.callback = callback;
  }
  
  receiveMessage(source, tag, message) {
    this.sourceQueue.enqueue(source);
    this.tagQueue.enqueue(tag);
    this.messageQueue.enqueue(message);
  }
  
  handle() {
    let source = this.sourceQueue.dequeue();
    let tag = this.tagQueue.dequeue();
    let message = this.messageQueue.dequeue();
    this.callback(source, tag, message);
  }
  
  handleAll() {
    while (this.tagQueue.size > 0) {
      this.handle();
    }
  }
}

// A selection of tools and data structures to export.
const Utility = {
  Parser: Parser,
  AssetLoader: AssetLoader,
  MessageBoard: MessageBoard$1,
  MessageReceiver: MessageReceiver,
};

Object.freeze(Utility);

class ButtonComponent extends Component {
  constructor() {
    super();
    
    /**
     * @type {Sprite} The sprite of the button.
     */
    this.sprite = new Sprite("");
    /**
     * @type {string} The text color of the button
     */
    this.textColor = undefined;
    /**
     * @type {string?} The background color of the button
     */
    this.backgroundColor = undefined;
    /**
     * @type {string | undefined} The background color of the button when hovered
     */
    this.hoverColor = undefined;
    /**
     * @type {string | undefined} The background color of the button when clicked
     */
    this.activeColor = undefined;
  }
}

ButtonComponent.type = "AsciiButton";

class InputFieldComponent extends Component {
  constructor() {
    super();

    /**
     * @type {number}
     */
    this.width = 0;
    /**
     * @type {number}
     */
    this.height = 1;

    /**
     * @type {string}
     */
    this.initialText = "";

    /**
     * @private
     */
    this._currentText = "";

    /**
     * @type {string}
     */
    this.textColor = undefined;
    /**
     * @type {string}
     */
    this.backgroundColor = undefined;
    /**
     * @type {string}
     */
    this.focusedColor = undefined;
    /**
     * @type {string}
     */
    this.cursorColor = undefined;

    /**
     * @type {boolean}
     */
    this.editable = false;

    /**
     * @type {number}
     */
    this.maxLength = 0;
  }

  /**
   * @returns {boolean}
   */
  get currentText() {
    return this._currentText;
  }
}

InputFieldComponent.type = "AsciiInputField";

class TextBoxComponent extends Component {
  constructor() {
    super();

    /**
     * @type {string}
     */
    this.text = "";
    /**
     * @type {number}
     */
    this.width = 0;
    /**
     * @type {number}
     */
    this.height = 1;

    /**
     * @type {string | undefined}
     */
    this.textColor = undefined;
    /**
     * @type {string | undefined}
     */
    this.backgroundColor = undefined;
  }
}

TextBoxComponent.type = "TextBox";

class ButtonInternalComponent extends Component {
  constructor() {
    super();

    /**
     * @type {ButtonInternalComponent.MouseStates}
     */
    this.mouseState = ButtonInternalComponent.MouseStates.Default;
  }
}

ButtonInternalComponent.type = "AsciiButtonInternal";

/**
 * @enum {string} 
 */
ButtonInternalComponent.MouseStates = {
  Default: "Default",
  Hover: "Hover",
  Active: "Active",
};

class ButtonSystem extends System {
  constructor() {
    super("Buttons");

    /**
     * @private
     */
    this._handleMouseClick = this._handleMouseClick.bind(this);
    /**
     * @private
     */
    this._handleMouseEnter = this._handleMouseEnter.bind(this);
    /**
     * @private
     */
    this._handleMouseLeave = this._handleMouseLeave.bind(this);
    /**
     * @private
     */
    this._handleMouseDown = this._handleMouseDown.bind(this);
    /**
     * @private
     */
    this._handleMouseUp = this._handleMouseUp.bind(this);

    /**
     * @private
     */
    this.buttonEntities = {};
    /**
     * @private
     */
    this.buttonSubentities = {};
    /**
     * @private
     */
    this.childMap = {};

    /**
     * @type {string}
     */
    this.defaultTextColor = "#222222";
    /**
     * @type {string}
     */
    this.defaultBackgroundColor = "#dddddd";
    /**
     * @type {string}
     */
    this.defaultHoverColor = "#bbbbbb";
    /**
     * @type {string}
     */
    this.defaultActiveColor = "#aaaaaa";
  }

  check(entity) {
    return entity.hasComponent(ButtonComponent.type)
      || entity.hasComponent(ButtonInternalComponent.type);
  }

  has(entity) {
    return entity.id in this.buttonEntities || entity.id in this.buttonSubentities;
  }

  add(entity) {
    if (entity.hasComponent(ButtonComponent.type)) {
      this.buttonEntities[entity.id] = entity;
      this._constructButtonSubentities(entity);
    } else if (entity.hasComponent(ButtonInternalComponent.type)) {
      this.buttonSubentities[entity.id] = entity;
      this.childMap[entity.getParent().id] = entity.id;
    }
  }

  remove(entity) {
    if (entity.id in this.buttonEntities) {
      this._deconstructButtonSubentities(entity);
      if (this.childMap[entity.id] in this.buttonSubentities) {
        this.getEntityManager()
          .requestDeleteEntity(this.buttonSubentities[this.childMap[entity.id]]);
      }
      delete this.childMap[entity.id];
      delete this.buttonEntities[entity.id];
    } else if (entity.id in this.buttonSubentities) {
      delete this.buttonSubentities[entity.id];
    }
  }

  postUpdate() {
    for (let subEntityId in this.buttonSubentities) {
      let entity = this.buttonSubentities[subEntityId];
      let animateComponent = entity.getComponent(AsciiAnimateComponent.type);
      let buttonInternal = entity.getComponent(ButtonInternalComponent.type);
      animateComponent.setFrame(buttonInternal.mouseState);
    }
  }

  /**
   * Initializes a button.
   * @private
   * @param {Entity} entity An Entity, which should hold a ButtonComponent 
   *    containing all the data needed to initialize the button.
   */
  _constructButtonSubentities(entity) {
    let buttonData = entity.getComponent(ButtonComponent.type);

    let subEntity = new Entity(entity.id);
    let positionComponent = new PositionComponent(0, 0, 0);
    subEntity.setComponent(positionComponent);
    
    let asciiAnimateComponent = new AsciiAnimateComponent();
    asciiAnimateComponent.dataIsLocal = true;

    let textColor = buttonData.textColor || this.defaultTextColor;

    let defaultStyle = new Style();
    defaultStyle.setStyle("cursor", "pointer");
    defaultStyle.setStyle("color", textColor);
    let backgroundColor = buttonData.backgroundColor || this.defaultBackgroundColor;
    defaultStyle.setStyle("backgroundColor", backgroundColor);
    asciiAnimateComponent.addFrame(ButtonInternalComponent.MouseStates.Default,
      [buttonData.sprite], [defaultStyle], [[0, 0, 0]]);

    let hoverStyle = new Style();
    hoverStyle.setStyle("cursor", "pointer");
    hoverStyle.setStyle("color", textColor);
    let hoverColor = buttonData.hoverColor || this.defaultHoverColor;
    hoverStyle.setStyle("backgroundColor", hoverColor);
    asciiAnimateComponent.addFrame(ButtonInternalComponent.MouseStates.Hover,
      [buttonData.sprite], [hoverStyle], [[0, 0, 0]]);

    let activeStyle = new Style();
    activeStyle.setStyle("cursor", "pointer");
    activeStyle.setStyle("color", textColor);
    let activeColor = buttonData.activeColor || this.defaultActiveColor;
    activeStyle.setStyle("backgroundColor", activeColor);
    asciiAnimateComponent.addFrame(ButtonInternalComponent.MouseStates.Active,
      [buttonData.sprite], [activeStyle], [[0, 0, 0]]);
    subEntity.setComponent(asciiAnimateComponent);
    
    let buttonInternalComponent = new ButtonInternalComponent();
    subEntity.setComponent(buttonInternalComponent);

    this.subscribe(["MouseEvent", subEntity.id, "click"], this._handleMouseClick, false);
    this.subscribe(["MouseEvent", subEntity.id, "mouseenter"], this._handleMouseEnter, false);
    this.subscribe(["MouseEvent", subEntity.id, "mouseleave"], this._handleMouseLeave, false);
    this.subscribe(["MouseEvent", subEntity.id, "mousedown"], this._handleMouseDown, false);
    this.subscribe(["MouseEvent", subEntity.id, "mouseup"], this._handleMouseUp, false);
    
    entity.addChild(subEntity);
  }

  /**
   * Performs cleanup operations when a button is removed.
   * For now, removes event listeners.
   * @private
   * @param {Entity} entity The parent entity being removed.
   */
  _deconstructButtonSubentities(entity) {
    let childId = this.childMap[entity.id];
    this.unsubscribe(["MouseEvent", childId, "click"]);
    this.unsubscribe(["MouseEvent", childId, "mouseenter"]);
    this.unsubscribe(["MouseEvent", childId, "mouseleave"]);
    this.unsubscribe(["MouseEvent", childId, "mousedown"]);
    this.unsubscribe(["MouseEvent", childId, "mouseup"]);
  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseClick(_event, descriptor) {
    let parentId = this.buttonSubentities[descriptor[1]].getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "click"]);
  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseEnter(_event, descriptor) {
    let childId = descriptor[1];
    let childEntity = this.buttonSubentities[childId];
    let parentId = childEntity.getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "mouseenter"]);
    let buttonInternalComponent = childEntity.getComponent(ButtonInternalComponent.type);
    buttonInternalComponent.mouseState = ButtonInternalComponent.MouseStates.Hover;
  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseLeave(_event, descriptor) {
    let childId = descriptor[1];
    let childEntity = this.buttonSubentities[childId];
    let parentId = childEntity.getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "mouseleave"]);
    let buttonInternalComponent = childEntity.getComponent(ButtonInternalComponent.type);
    buttonInternalComponent.mouseState = ButtonInternalComponent.MouseStates.Default;
  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseDown(_event, descriptor) {
    let childId = descriptor[1];
    let childEntity = this.buttonSubentities[childId];
    let parentId = childEntity.getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "mousedown"]);
    let buttonInternalComponent = childEntity.getComponent(ButtonInternalComponent.type);
    buttonInternalComponent.mouseState = ButtonInternalComponent.MouseStates.Active;

  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseUp(_event, descriptor) {
    let childId = descriptor[1];
    let childEntity = this.buttonSubentities[childId];
    let parentId = childEntity.getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "mouseup"]);
    let buttonInternalComponent = childEntity.getComponent(ButtonInternalComponent.type);
    buttonInternalComponent.mouseState = ButtonInternalComponent.MouseStates.Hover;
  }
}

class InputFieldInternalComponent extends Component {
  constructor(data) {
    super();

    this.width = data.width;
    this.height = data.height;

    this.defaultStyle = undefined;
    this.focusedStyle = undefined;
    this.cursorStyle = undefined;

    /**
     * Hard-coded to false for now because we don't support multi-line input fields.
     */
    this.multiLine = false;

    this.lines = [];
    this.data = "";
    this.changed = true;

    this.viewX = 0;
    this.viewY = 0;

    this.cursorX = 0;
    this.cursorY = 0;

    if (this.multiLine) {
      this.initRows(data.initialText);
    } else {
      this.data = data.initialText.replace("\n", " ");
    }
  }

  /**
   * 
   * @param {string} text 
   */
  initRows(text) {
    let lines = text.split("\n");
    for (let y = 0; y < lines.length; y++) {
      this.rows.push(Functions.breakLineIntoRows(lines[y], this.width));
    }
    this.changed = true;
  }

  /**
   * Gets the text to display as an array of strings.
   * Each string is less than the width of the input field.
   * 
   * @returns {string} The string used to generate the output sprite
   */
  getDisplayString() {
    if (this.multiLine) {
      return this.lines.slice(this.viewY, this.viewY + this.height)
        .map((value) => {
          let rowStr = value.join(" ").substr(this.viewX, this.width);
          if (rowStr.length < this.width) {
            rowStr += " ".repeat(this.width - rowStr.length);
          }
          return rowStr;
        })
        .join("\n");
    }
    // No special formatting needed if only one line.
    let filledString = this.data.substr(this.viewX, this.width);
    return filledString + " ".repeat(this.width - filledString.length);
  }

  getTextString() {
    if (this.multiLine) {
      return this.lines.map((value) => value.join(" ")).join("\n");
    }
    // No special formatting needed if only one line.
    return this.data;
  }

  handleCharacterInput(body) {
    if (this.multiLine) ; else {
      this.data = Functions.stringSplice(this.data, this.cursorX, 0, body.event.key);
      this.shiftCursor(1, 0);
      this.changed = true;
    }
  }

  handleArrowInput(body, descriptor) {
    if (this.multiLine) ; else {
      if (body.event.key === "ArrowLeft") {
        this.shiftCursor(-1, 0);
        this.changed = true;
      } else if (body.event.key === "ArrowRight") {
        this.shiftCursor(1, 0);
        this.changed = true;
      }
    }
  }

  handleBackspaceInput() {
    if (this.multiLine) ; else {
      if (this.cursorX > 0) {
        this.shiftCursor(-1, 0);
        if (this.viewX === this.cursorX && this.viewX > 0) {
          this.viewX--;
        }
        this.data = Functions.stringSplice(this.data, this.cursorX, 1);
        this.changed = true;
      }
    }
  }

  handleEnterInput() {
    if (this.multiLine) ;
  }

  handleDeleteInput() {
    if (this.multiLine) ; else {
      if (this.cursorX < this.data.length) {
        this.data = Functions.stringSplice(this.data, this.cursorX, 1);
        this.changed = true;
      }
    }
  }

  shiftCursor(x, y) {
    if (this.multiLine) ; else {
      // Not this.data.length - 1 because we want cursor to go behind text.
      this.cursorX = Math.max(0, Math.min(this.data.length, this.cursorX + x));
      if (this.cursorX < this.viewX) {
        this.viewX = this.cursorX;
      } else if (this.cursorX >= this.viewX + this.width) {
        this.viewX = this.cursorX - this.width + 1;
      }
    }
  }

  placeCursor(x, y) {
    if (this.multiLine) ; else {
      this.cursorX = this.viewX + Math.max(0, Math.min(this.data.length, x));
      this.cursorY = 0;
    }
  }
}

InputFieldInternalComponent.type = "AsciiInputFieldInternal";

class CursorComponent extends Component {
  constructor() {
    super();

    this.screenX = undefined;
    this.screenY = undefined;
    this.fieldX = undefined;
    this.fieldY = undefined;
    this.placedEntityKey = undefined;
  }
}

CursorComponent.type = "TextFieldCursor";

/**
 * Controls all text fields.
 * 
 * Listens for three types of events from AsciiInputHandler.
 * Focus events decide the background UI and whether the cursor appears.
 * Mouse events determine where the cursor appears, if it should appear.
 *    It also controls where keyboard events take effect.
 * Keyboard events control the text in the focused keyboard event.
 */
class InputFieldSystem extends System {
  constructor() {
    super("InputFields");

    /**
     * @private
     */
    this.parentEntities = {};
    this.childEntities = {};
    /**
     * @private
     */
    this.childMap = {};
    /**
     * @private
     */

    this.defaultTextColor = "#222222";
    this.defaultBackgroundColor = "#dddddd";
    this.defaultFocusedColor = "#bbbbbb";
    this.defaultCursorColor = "#888888";

    /**
     * @private
     */
    this.cursorEntity = new Entity("AsciiCursor");
    /**
     * @private
     */
    this.cursorComponent = new CursorComponent();
    this.cursorEntity.setComponent(this.cursorComponent);

    let cursorPositionComponent = new PositionComponent(0, 0, 0);
    this.cursorEntity.setComponent(cursorPositionComponent);

    let cursorStyle = new Style();
    cursorStyle.setStyle("backgroundColor", this.defaultCursorColor);
    let cursorRenderComponent = new AsciiRenderComponent([
      new Sprite(" ", {
        ignoreLeadingSpaces: false,
        spaceIsTransparent: true,
        spaceHasFormatting: true,
      })
    ], [
      cursorStyle
    ], [
      [0, 0, 0]
    ]);
    cursorRenderComponent.visible = false;
    cursorRenderComponent.dataIsLocal = true;
    this.cursorEntity.setComponent(cursorRenderComponent);

    /**
     * @private
     */
    this._focusSet = this._focusSet.bind(this);
    /**
     * @private
     */
    this._focusLost = this._focusLost.bind(this);

    /**
     * @private
     */
    this._handleMouseClick = this._handleMouseClick.bind(this);
  }

  check(entity) {
    return entity.hasComponent(InputFieldComponent.type)
      || entity.hasComponent(InputFieldInternalComponent.type)
      || (entity.hasComponent(CursorComponent.type)
      && entity.id === this.cursorEntity.id);
  }

  has(entity) {
    return entity.id in this.parentEntities || entity.id in this.childEntities;
  }

  add(entity) {
    if (entity.hasComponent(InputFieldComponent.type)) {
      this.parentEntities[entity.id] = entity;
      this._constructChildEntity(entity);
    } else if (entity.hasComponent(InputFieldInternalComponent.type)) {
      this.childEntities[entity.id] = entity;
      this.childMap[entity.getParent().id] = entity.id;
    }
  }

  remove(entity) {
    if (entity.id in this.parentEntities) {
      this._deconstructChildEntity(entity);
      if (this.childMap[entity.id] in this.childEntities) {
        this.getEntityManager()
          .requestDeleteEntity(this.childEntities[this.childMap[entity.id]]);
      }
      delete this.childMap[entity.id];
      delete this.parentEntities[entity.id];
    } else if (entity.id in this.childEntities) {
      delete this.childEntities[entity.id];
    }
  }

  startup() {
    this.getEntityManager().requestAddEntity(this.cursorEntity);
  }

  shutdown() {
    this.getEntityManager().requestDeleteEntity(this.cursorEntity);
  }

  postUpdate() {
    for (let parentId in this.childMap) {
      let childId = this.childMap[parentId];
      let childEntity = this.childEntities[childId];
      let parentEntity = this.parentEntities[parentId];

      let publicComponent = parentEntity.getComponent(InputFieldComponent.type);
      let internalComponent = childEntity.getComponent(InputFieldInternalComponent.type);

      if (!internalComponent.changed) {
        continue;
      }

      publicComponent._currentText = internalComponent.getTextString();

      let renderComponent = childEntity.getComponent(AsciiRenderComponent.type);
      renderComponent.spriteNameList[0] = new Sprite(
        internalComponent.getDisplayString(), {
        ignoreLeadingSpaces: false,
        spaceIsTransparent: false,
      });
      let style = internalComponent.defaultStyle;
      if (this.cursorComponent.placedEntityKey === childId) {
        style = internalComponent.focusedStyle;
      }
      renderComponent.styleNameList[0] = style;

      if (this.cursorComponent.placedEntityKey !== childEntity.id) {
        continue;
      }

      let positionComponent = this._getChildGlobalPositionComponent(childId);
      let globalCursorX = positionComponent.x + internalComponent.cursorX - internalComponent.viewX;
      let globalCursorY = positionComponent.y + internalComponent.cursorY - internalComponent.viewY;
      
      let cursorPosition = this.cursorEntity.getComponent(PositionComponent.type);
      cursorPosition.x = globalCursorX;
      cursorPosition.y = globalCursorY;

      internalComponent.changed = false;
    }
  }

  /**
   * Performs setup work for a newly registered Text Field.
   * The child entity should only be managed by TextFieldSystem. 
   * @param {Entity} entity The newly added entity to initialize
   * @private
   */
  _constructChildEntity(entity) {
    let textFieldData = entity.getComponent(InputFieldComponent.type);

    let child = new Entity(entity.id);
    let positionComponent = new PositionComponent(0, 0, 0);
    child.setComponent(positionComponent);

    let internalComponent = new InputFieldInternalComponent(textFieldData);
    child.setComponent(internalComponent);

    let sprite = new Sprite(internalComponent.getDisplayString(), {
      ignoreLeadingSpaces: false,
      spaceIsTransparent: false,
    });

    let textColor = textFieldData.textColor || this.defaultTextColor;
    let backgroundColor = textFieldData.backgroundColor || this.defaultBackgroundColor;
    let focusedColor = textFieldData.focusedColor || this.defaultFocusedColor;
    let cursorColor = textFieldData.cursorColor || this.defaultCursorColor;

    let defaultStyle = new Style();
    defaultStyle.setStyle("cursor", "text");
    defaultStyle.setStyle("color", textColor);
    defaultStyle.setStyle("backgroundColor", backgroundColor);
    
    let focusedStyle = new Style();
    focusedStyle.setStyle("cursor", "text");
    focusedStyle.setStyle("color", textColor);
    focusedStyle.setStyle("backgroundColor", focusedColor);

    let cursorStyle = new Style();
    cursorStyle.setStyle("backgroundColor", cursorColor);

    internalComponent.defaultStyle = defaultStyle;
    internalComponent.focusedStyle = focusedStyle;
    internalComponent.cursorStyle = cursorStyle;

    let asciiRenderComponent = new AsciiRenderComponent([sprite], [defaultStyle], [[0, 0, 0]]);
    asciiRenderComponent.dataIsLocal = true;
    child.setComponent(asciiRenderComponent);

    entity.addChild(child);

    // TODO: Set focusable.
    this.postMessage(["InputHandlerRequest", "AddFocusable"], child.id);
    this.subscribe(["InputHandlerFocusEvent", child.id, "FocusSet"], this._focusSet);
    this.subscribe(["InputHandlerFocusEvent", child.id, "FocusLost"], this._focusLost);
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Visible"], 
      internalComponent.handleCharacterInput.bind(internalComponent));
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Arrow"], 
      internalComponent.handleArrowInput.bind(internalComponent));
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Enter"], 
      internalComponent.handleEnterInput.bind(internalComponent));
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Backspace"], 
      internalComponent.handleBackspaceInput.bind(internalComponent));
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Delete"], 
      internalComponent.handleDeleteInput.bind(internalComponent));
    this.subscribe(["MouseEvent", child.id, "click"], this._handleMouseClick);
  }

  /**
   * @private
   * @param {Entity} entity 
   */
  _deconstructChildEntity(entity) {
    let childId = this.childMap[entity.id];
    this.unsubscribe(["InputHandlerFocusEvent", childId]);
    this.unsubscribe(["KeyboardEvent", childId]);
    this.postMessage(["InputHandlerRequest", "RemoveFocusable"], childId);
  }

  /**
   * @private
   * @param {any} entity 
   */
  _focusSet(body) {
    let focusedEntityId = body.entityId;
    this.cursorComponent.placedEntityKey = focusedEntityId;
    let cursorRender = this.cursorEntity.getComponent(AsciiRenderComponent.type);
    cursorRender.visible = true;
    let focusedEntity = this.childEntities[focusedEntityId];
    this._placeCursor(body.coords, focusedEntity);
    this._markChildEntityChanged(focusedEntityId);
  }

  /**
   * @private
   * @param {any} entity 
   */
  _focusLost() {
    this._markChildEntityChanged(this.cursorComponent.placedEntityKey);
    this.cursorComponent.placedEntityKey = undefined;
    let cursorRender = this.cursorEntity.getComponent(AsciiRenderComponent.type);
    cursorRender.visible = false;
  }

  /**
   * @private
   * @param {any} entity 
   */
  _handleMouseClick(body) {
    if (this.cursorComponent.placedEntityKey) {
      let placedEntity = this.childEntities[this.cursorComponent.placedEntityKey];
      this._placeCursor(body.coords, placedEntity);
      this._markChildEntityChanged(this.cursorComponent.placedEntityKey);
    }
  }

  /**
   * 
   * @param {[number, number]} clickPosition The global click position
   * @param {Entity} targetEntity The child entity being clicked
   */
  _placeCursor(clickPosition, targetEntity) {
    let targetData = targetEntity.getComponent(InputFieldInternalComponent.type);
    let targetPosition = this._getChildGlobalPositionComponent(targetEntity.id);

    targetData.placeCursor(clickPosition.x - targetPosition.x,
      clickPosition.y - targetPosition.y);
  }

  /**
   * @private
   * @param {any} entity 
   */
  _markChildEntityChanged(entityId) {
    let childEntity = this.childEntities[entityId];
    let internalComponent = childEntity.getComponent(InputFieldInternalComponent.type);
    internalComponent.changed = true;
  }

  /**
   * @private
   * @param {any} entity 
   */
  _getChildGlobalPositionComponent(childId) {
    let childEntity = this.childEntities[childId];
    let parentEntity = childEntity.getParent();
    return parentEntity.getComponent(PositionComponent.type);
  }
}

class TextBoxInternalComponent extends Component {
  constructor() {
    super();
  }
}

TextBoxInternalComponent.type = "TextBoxInternal";

class TextBoxSystem extends System {
  constructor() {
    super("TextBox");

    /**
     * @private
     */
    this.parentEntities = {};
    /**
     * @private
     */
    this.childEntities = {};
    /**
     * @private
     */
    this.childMap = {};
    
    /**
     * @type {string} 
     */
    this.defaultTextColor = "#000000";
    /**
     * @type {string} 
     */
    this.defaultBackgroundColor = "#ffffff";
  }

  /**
   * 
   * @param {Entity} entity 
   */
  check(entity) {
    return entity.hasComponent(TextBoxComponent.type)
      || entity.hasComponent(TextBoxInternalComponent.type);
  }

  /**
   * 
   * @param {Entity} entity 
   */
  has(entity) {
    return entity.id in this.parentEntities
      || entity.id in this.childEntities;
  }

  /**
   * 
   * @param {Entity} entity 
   */
  add(entity) {
    if (entity.hasComponent(TextBoxComponent.type)) {
      this.parentEntities[entity.id] = entity;
      this._constructChildEntity(entity);
    } else if (entity.hasComponent(TextBoxInternalComponent.type)) {
      this.childEntities[entity.id] = entity;
      this.childMap[entity.getParent().id] = entity.id;
    }
  }

  /**
   * 
   * @param {Entity} entity 
   */
  remove(entity) {
    if (entity.id in this.parentEntities) {
      this._deconstructChildEntity(entity);
      if (this.childMap[entity.id] in this.childEntities) {
        this.getEntityManager()
          .requestDeleteEntity(this.childEntities[this.childMap[entity.id]]);
      }
      delete this.childMap[entity.id];
      delete this.parentEntities[entity.id];
    } else if (entity.id in this.childEntities) {
      delete this.childEntities[entity.id];
    }
  }

  /**
   * 
   * @private
   * @param {Entity} parentEntity
   */
  _constructChildEntity(parentEntity) {
    let textBoxData = parentEntity.getComponent(TextBoxComponent.type);

    let childEntity = new Entity(parentEntity.id);
    let positionComponent = new PositionComponent(0, 0, 0);
    childEntity.setComponent(positionComponent);

    let lines = textBoxData.text.split("\n");
    let rows = [];
    for (let i = 0; i < lines.length; i++) {
      let lineRows = Functions.breakLineIntoRows(lines[i], textBoxData.width, true);
      if (rows.length + lineRows.length > textBoxData.height) {
        lineRows = lineRows.slice(0, textBoxData.height - rows.length);
      }
      rows.push(...lineRows);
      if (rows.length >= textBoxData.height) {
        break;
      }
    }
    while (rows.length < textBoxData.height) {
      rows.push(" ".repeat(textBoxData.width));
    }
    let text = rows.join("\n");

    let sprite = new Sprite(text, {
      spaceIsTransparent: false,
      ignoreLeadingSpaces: false,
    });

    let textColor = textBoxData.textColor || this.defaultTextColor;
    let backgroundColor = textBoxData.backgroundColor || this.defaultBackgroundColor;
    let style = new Style();
    style.setStyle("color", textColor);
    style.setStyle("backgroundColor", backgroundColor);

    let asciiRenderComponent = new AsciiRenderComponent([sprite], [style], [[0, 0, 0]]);
    asciiRenderComponent.dataIsLocal = true;
    childEntity.setComponent(asciiRenderComponent);

    let internalComponent = new TextBoxInternalComponent();
    childEntity.setComponent(internalComponent);

    parentEntity.addChild(childEntity);
  }

  _deconstructChildEntity(parentEntity) {
    // TODO: Is there anything to do, since it doesn't listen for any events?
  }
}

const GuiElements = {
  Components: {
    Button: ButtonComponent,
    InputField: InputFieldComponent,
    TextBox: TextBoxComponent,
  },
  Systems: {
    Button: ButtonSystem,
    InputField: InputFieldSystem,
    TextBox: TextBoxSystem,
  }
};

const AsciiEngine = {
  Engine: Engine,
  Entity: Entity,
  Component: Component,
  Components: Components,
  System: System,
  Systems: DefaultSystems,
  Modules: Modules,
  ModuleSlots: ModuleSlots,
  GL: AsciiGL,
  Gui: GuiElements,
  Utility: Utility,
};

export default AsciiEngine;
export { Component, Components, Engine, Entity, AsciiGL as GL, GuiElements as Gui, ModuleSlots, Modules, System, DefaultSystems as Systems };
