var AsciiEngine = (function () {
  'use strict';

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
    }
  };

  Object.freeze(Functions);

  class Entity {
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
        this._entityManager.requestSetComponent(this, component);
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
      return null;
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
      if (this.initialized && id in this._children) ;
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

  // An implementation of queue that allows the user to access any element in it (but not modify)
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
    constructor(engine) {
      this._engine = engine;
      
      this._entities = new Set();
      
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
    
    [EntityOp.ADD_ENTITY](entity, parent) {
      if (parent) {
        parent._addChild(entity);
      }
      // This notifies any children as well.
      this.initEntity(entity);
    }
    
    notifyAddition(entity) {
      this._added.add(entity);
      this.entities.add(entity);
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
      this.entities.delete(entity);
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

  class System {
    constructor(name) {
      this._engine = undefined;
      this._systemManager = undefined;
      this._entityManager = undefined;
      
      this._name = name;
      
      this._priority = 0;
      
      this._active = false;
      
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
      this._engine = systemManager.getEngine();
      // This should only be accessed in order to directly modify an Entity, rather than component data.
      this._entityManager = this._engine.getEntityManager();
      this.getSystemManager().getMessageBoard().signup(this.name, this.getMessageReceiver());

      this._active = true;
      
      this.startup();
    }
   
    destroy() {
      this.shutdown();
      this.getSystemManager().getMessageBoard().withdraw(this.name);
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
    
    /**
     * A virtual method Systems can override.
     * Passed to a message receiver. To run, call "this.getMessageReceiver().handle();"
     * This should not be an expensive method. Ideally, this should pass the message to another data structure,
     * where it can be handled later. 
     * 
     * @param {String} source The source of the message. Usually the name of the System, or the event type
     * @param {String} tag The tag of the message.
     * @param {Anything} body The message
     */
    receiveMessage(source, tag, body) {}
  }

  class MessageBoard {
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
     * @param {V?} value The value to search for (optional)
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

  class Engine {
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
      this._intervalKey = setInterval(() => { this.update(); }, this._millisecPerUpdate);
    }

    pauseLoop() {
      clearInterval(this._intervalKey);
      this._intervalKey = undefined;
    }

    /**
     * Updates the game by one tick.
     */
    update() {
      for (let system of this._systemManager) {
        system.preUpdate();
      }

      for (let system of this._systemManager) {
        system.update();
      }

      for (let system of this._systemManager) {
        system.postUpdate();
      }

      // Update Entity/System Managers.
      this.getEntityManager().processEntityOperations();
      this.getSystemManager().processEntityOperations();
    }
  }

  Object.freeze(Engine.Modules);

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
    
    get type() {
      return this.constructor.type;
    }
  }

  class AsciiRenderComponent extends Component {
    constructor(spriteNameList, styleNameList, relativePositionList) {
      super();
      // All these arrays should all be of the same length. Otherwise may cause problems.
      // TODO: Replace these properties with getters. Allow for different animations of the same entity.
      this.spriteNameList = spriteNameList || [];
      this.styleNameList = styleNameList || [];
      this.relativePositionList = relativePositionList || [];
      
      this.visible = true;
    }
  }

  AsciiRenderComponent.type = "AsciiRender";

  class AsciiAnimateComponent extends Component {
    constructor() {
      super();
      this._name = undefined;
      this._spriteNameList = {};
      this._styleNameList = {};
      this._relativePositionList = {};
      
      this.visible = true;
    }
    
    get currentFrame() {
      return this._name;
    }
    
    get spriteNameList() {
      return this._spriteNameList[this.currentFrame];
    }
    
    get styleNameList() {
      return this._styleNameList[this.currentFrame];
    }
    
    get relativePositionList() {
      return this._relativePositionList[this.currentFrame];
    }
    
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
    
    setFrame(name) {
      if (name in this._spriteNameList) {
        this._name = name;
      }
    }
  }

  // Utilize the same type so that AsciiRenderSystem recognizes it.
  AsciiAnimateComponent.type = "AsciiAnimate";

  class PositionComponent extends Component {
    constructor(x, y, z) {
      super();
      this.x = x || 0;
      this.y = y || 0;
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
     */
    constructor(name) {
      super(name);
      if (this.constructor === SetSystem) {
        throw new TypeError("SetSystem cannot be instantiated directly!");
      }
      this.entities = new Set();
    }
    
    has(entity) {
      return this.entities.has(entity);
    }
    
    add(entity) {
      this.entities.add(entity);
    }

    remove(entity) {
      this.entities.delete(entity);
    }
  }

  class MapSystem extends System {
    constructor(name) {
      super(name);
      
      this.entities = {};
    }
    
    has(entity) {
      return entity.id in this.entities;
    };
    
    add(entity) {
      this.entities[entity.id] = entity;
    }
    
    remove(entity) {
      delete this.entities[entity.id];
    }
  }

  const ModuleSlots = {
    Graphics: Symbol("GraphicsLibrary"),
    ResourceManager: Symbol("ResourceManager"),
  };

  class AsciiRenderSystem extends SetSystem {
    constructor(name) {
      super(name);
      // Use the default Set container for all entities.
      
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
      let resourceManager = this.getEngine().getModule(ModuleSlots.ResourceManager);
      
      for (let entity of this.entities) {
        let renderComponent = entity.getComponent(AsciiRenderComponent.type) || entity.getComponent(AsciiAnimateComponent.type);
        if (!renderComponent.visible) {
          continue;
        }
        let entityAbsolutePosition = this.getEntityAbsolutePosition(entity);
        for (let i = 0; i < renderComponent.spriteNameList.length; i ++) {
          let sprite = resourceManager.get(renderComponent.spriteNameList[i]);
          let location = [
            entityAbsolutePosition[0] + renderComponent.relativePositionList[i][0],
            entityAbsolutePosition[1] + renderComponent.relativePositionList[i][1],
            entityAbsolutePosition[2] + renderComponent.relativePositionList[i][2],
          ];
          let style = resourceManager.get(renderComponent.styleNameList[i]);
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

  const DefaultSystems = {
    Set: SetSystem,
    Map: MapSystem,
    AsciiRender: AsciiRenderSystem,
  };

  Object.freeze(DefaultSystems);

  class KeyboardInputModule {
    constructor() {
      this.ALL = "ALL_KEYS";
      this._messageBoards = {};
      
      for (let eventType in KeyboardInputModule.EventTypes) {
        let eventName = KeyboardInputModule.EventTypes[eventType];
        this._messageBoards[eventName] = new MessageBoard();
        
        // Use the "key" property of the event as the events to listen for.
        document.addEventListener(eventName, (event) => {
          if (document.activeElement === document.body || document.activeElement === null) {
            // Only listen if nothing else is in focus.
            // TODO: Make it so that it must be focused on the target element.
            // How?
            this._messageBoards[eventName].post(eventName, event.key, event);
            // "" means listen for all events.
            this._messageBoards[eventName].post(eventName, this.ALL, event);
            if (event.keyCode <= 40 && event.keyCode >= 37) {
              event.preventDefault();
            } else if (event.keyCode === 32) {
              event.preventDefault();
            }
          }
        });
      }
    }
    
    signup(id, receiver) {
      for (let eventType in this._messageBoards) {
        this._messageBoards[eventType].signup(id, receiver);
      }
    }
    
    withdraw(id) {
      for (let eventType in this._messageBoards) {
        this._messageBoards[eventType].withdraw(id);
      }
    }
    
    subscribe(id, target, events) {
      for (let event of events) {
        if (event in this._messageBoards) {
          this._messageBoards[event].subscribe(id, [target]);
        } else {
          console.warn("Keyboard event", event, "is not supported");
        }
      }
    }
    
    unsubscribe(id, target, events) {
      for (let event of events) {
        if (event in this._messageBoards) {
          this._messageBoards[event].unsubscribe(id, [target]);
        } else {
          console.warn("Keyboard event", event, "is not supported");
        }
      }
    }
  }

  KeyboardInputModule.EventTypes = {
    KEY_DOWN: "keydown",
    KEY_UP: "keyup",
  };

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
      /** @type {Array<number>} */
      this._rowIndices = [];
      /** @type {Array<number>} */
      this._firstVisibleChar = [];
      this._width = 0;
      this._height = 1;
      /** @type {Array<Array<SegmentData>>} */
      this._segments = undefined;

      // All characters in this set are replaced with a blank space when being drawn.
      // These characters are not transparent.
      this._setAsBlank = "";
      this._setAsBlankRegexp = null;
      // By default, all spaces (in the string) are transparent, 
      // i.e. they take the formatting of the sprite behind them.
      this._spaceIsTransparent = true;
      // By default, leading spaces in each line are ignored.
      this._ignoreLeadingSpaces = true;
      // If ignoreLeadingSpaces is true but spaceIsTransparent is false, leading spaces are still ignored.
      // i.e. ignoreLeadingSpaces takes precedence. 
      this._spaceHasFormatting = false;

      if ("setAsBlank" in settings) {
        this._setAsBlank = settings.setAsBlank;
      }
      this._setAsBlankRegexp = new RegExp("[" + this._setAsBlank + "]", "g");
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

    get text() {
      return this._text;
    }

    get width() {
      return this._width;
    }

    get height() {
      return this._height;
    }

    /**
     * Returns a set containing the characters that should be replaced with a space.
     */
    get setAsBlank() {
      return this._setAsBlank;
    }

    get spaceIsTransparent() {
      return this._spaceIsTransparent;
    }

    get ignoreLeadingSpaces() {
      return this._ignoreLeadingSpaces;
    }

    get spaceHasFormatting() {
      return this._spaceHasFormatting;
    }

    /**
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

    _charHasFormatting(c) {
      return c !== " " || !this.spaceIsTransparent || this.spaceHasFormatting;
    }

    _charHasText(c) {
      return c !== " " || !this.spaceIsTransparent;
    }

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

  const SegmentState = {
    BLANK: 0,
    HAS_FORMATTING: 1,
    HAS_TEXT: 2,
  };

  class SpriteStyle {
    constructor() {
      this._styles = {};
      for (let styleName in SpriteStyle.defaultValues) {
        this._styles[styleName] = null;
      }
    }
    
    /**
     * Prevents this Style from being changed in the future.
     * 
     * Called by AsciiGL after the style has been inserted.
     */
    freeze() {
      Object.freeze(this._styles);
      Object.freeze(this);
    }
    
    clear() {
      for (let styleName in SpriteStyle.defaultValues) {
        this._styles[styleName] = null;
      }
    }
    
    /**
     * Copies the data from the other SpriteStyle object.
     */
    copy(other) {
      this.clear();
      for (let styleName of other) {
        this.setStyle(styleName, other.getStyle(styleName));
      }
    }
    
    // ---- PUBLIC API ---- // 
    
    sameAs(other) {
      for (let styleName in SpriteStyle.defaultValues) {
        if (
          (this.hasStyle(styleName) !== other.hasStyle(styleName)) || 
          (this.getStyle(styleName) !== other.getStyle(styleName))
        ) {
          return false;
        }
      }
      return true;
    }
    
    setStyle(styleName, value) {
      if (!(styleName in SpriteStyle.defaultValues)) {
        console.warn("AsciiGL currently does not support the style", styleName);
      }
      this._styles[styleName] = value || null;
    }
    
    hasStyle(styleName) {
      return this._styles[styleName] !== null;
    }
    
    getStyle(styleName) {
      if (this.hasStyle(styleName)) {
        return this._styles[styleName];
      }
      return "";
    }
    
    /**
     * Allows for iterating over the specified properties of this SpriteStyle.
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
     */
    fillRemainder(base) {
      for (let styleName in SpriteStyle.defaultValues) {
        if (!this.hasStyle(styleName)) {
          if (base && base.hasStyle(styleName)) {
            this.setStyle(styleName, base.getStyle(styleName));
          } else {
            this.setStyle(styleName, SpriteStyle.defaultValues[styleName]);
          }
        }
      }
    }
  }

  SpriteStyle.defaultValues = {
    color: "black",
    backgroundColor: "transparent",
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    cursor: "default",
  };

  SpriteStyle.setDefaultStyle = function(styleName, value) {
    if (styleName in SpriteStyle.defaultValues) {
      // TODO: Verify value.
      SpriteStyle.defaultValues[styleName] = value;
    } else {
      console.warn("SpriteStyle does not support", styleName);
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
    constructor() {
      this.primaryElement = document.createElement("pre");
      this._width = 0;
      this._height = 0;
      
      this.activeRowLength = [];
      
      this.rows = [];
      this.elements = [];
      
      this.primaryElement.style.margin = "0";
    }
    
    init(width, height) {
      this._width = width;
      this._height = height;
      
      for (let y = 0; y < height; y ++) {
        let rowElement = document.createElement("div");
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
    
    get width() {
      return this._width;
    }
    
    get height() {
      return this._height;
    }
    
    getDomElement() {
      return this.primaryElement;
    }
    
    /**
     * Causes the number of span elements attached to a row to change.
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
        domElement.dataset.asciiGlId = this._nextId;
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
      
      this.backgroundStyle = new SpriteStyle();
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
     * @param {SpriteStyle} style The corresponding style
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
     * @param {SpriteStyle} defaultStyle A REFERENCE of the default style.
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
      for (let styleName in SpriteStyle.defaultValues) {
        this._styleValues[styleName] = other._styleValues[styleName];
        this._stylePriorities[styleName] = other._stylePriorities[styleName];
      }
      this._spriteId = other._spriteId;
      this._spritePriority = other._spritePriority;

      this._highestPriority = other._highestPriority;
      this._frontId = other._frontId;
    }
    
    clear() {
      for (let styleName in SpriteStyle.defaultValues) {
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
     * @param {SpriteStyle} style 
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
      
      this._container = container;
      
      // Have two so that only one is modified at any given time.
      // TODO: Later, do more testing on using 2 DOMBuffers.
      this._domBuffer = new DOMBuffer();
      // For now, just use simple objects to hold.
      this._nameBuffers = [{}, {}];
      this._drawBufferIdx = 0;
      this._activeBufferIdx = 1;
      
      this._width = 0;
      this._height = 0;
      
      this._drawBuffer = new DrawBuffer();
      
      this._currMouseOver = undefined;
      this._handler = () => {};
    }
    
    /**
     * Initializes the pre element for rendering.
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
        this._handler(event, "mousedown", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
      });
      
      this._container.addEventListener("mouseup", (event) => {
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
        this._handler(event, "mouseup", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
      });
      
      this._container.addEventListener("click", (event) => {
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
        this._handler(event, "click", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
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
    
    get width() {
      return this._width;
    }
    
    get height() {
      return this._height;
    }
    
    get backgroundStyles() {
      return this._drawBuffer.backgroundStyle;
    }
    
    getBackgroundStyle(styleName) {
      return this._drawBuffer.backgroundStyle.getStyle(styleName);
    }
    
    setBackgroundStyle(styleName, value) {
      this._drawBuffer.backgroundStyle.setStyle(styleName, value);
    }
    
    /**
     * Set by user code. handlerFunc is called when an AsciiGL mouse event occurs. 
     * 
     * handlerFunc takes in (event, target, type, coords).
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
    SpriteStyle: SpriteStyle,
    SpriteBuilder: SpriteBuilder,
    EventTypes: EventTypes,
  };

  Object.freeze(AsciiGL);

  class AsciiMouseInputModule {
    constructor(agl) {
      this.GLOBAL = AsciiMouseInputModule.Global;
      this._agl = agl;
      
      this._registeredTargets = {};
      
      this._messageBoards = {};
      for (let name in AsciiGL.EventTypes) {
        this._messageBoards[AsciiGL.EventTypes[name]] = new MessageBoard();
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
    getSpriteData: function(fileString) {
      let json = JSON.parse(fileString);
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
        let spriteStyle = new SpriteStyle();
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
     */
    getComponentFactories: function(fileString) {
      let json = JSON.parse(fileString);
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
      this.specs = componentSpecs;
    }
    
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
      this.data = {};
    }
    
    add(key, value) {
      this.data[key] = value;
    }
    
    delete(key) {
      if (this.has(key)) {
        delete this.data[key];
      }
    }
    
    has(key) {
      return key in this.data;
    }
    
    get(key) {
      if (!(key in this.data)) {
        console.warn("Resource key: ", key, "not found");
      }
      return this.data[key];
    }
    
    async loadSpriteFiles(fileList) {
      for (let spriteFile of fileList) {
        let fileString = await AssetLoader.loadFileAsString(spriteFile);
        let spriteData = Parser.getSpriteData(fileString);
        for (let spriteName in spriteData.sprites) {
          this.add(spriteName, spriteData.sprites[spriteName]);
        }
        
        for (let styleName in spriteData.styles) {
          this.add(styleName, spriteData.styles[styleName]);
        }
      }
    }
    
    async loadTemplateFiles(fileList) {
      for (let templateFile of fileList) {
        let fileString = await AssetLoader.loadFileAsString(templateFile);
        let templateData = Parser.getComponentFactories(fileString);
        for (let templateName in templateData) {
          this.add(templateName, templateData[templateName]);
        }
      }
    }
  }

  const Modules = {
    KeyboardInput: KeyboardInputModule,
    AsciiMouseInput: AsciiMouseInputModule,
    ResourceManager: ResourceManager,
  };

  Object.freeze(Modules);

  // A selection of tools and data structures to export.
  const Utility = {
    Parser: Parser,
    AssetLoader: AssetLoader,
    MessageBoard: MessageBoard,
    MessageReceiver: MessageReceiver,
  };

  Object.freeze(Utility);

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
    Utility: Utility,
  };

  Object.freeze(AsciiEngine);

  return AsciiEngine;

}());
