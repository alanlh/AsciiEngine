import RootedSearchTreeNode from "../utility/data_structures/RootedTree.js";
import Functions from "../utility/Functions.js";
import Queue from "../utility/data_structures/Queue.js";

/**
 * @typedef {(event: any, descriptor: Array<string>) => void} EventHandler
 * @typedef {{
 * name: string,
 * handler: EventHandler,
 * source?: string,
 * }} ListenerInfo
 * @typedef {string} ListenerKey
 * @typedef {[string, Array<string>, any, string?]} Message
 */
export default class MessageBoard {
  /**
   * A central message board implementation for Systems.
   */
  constructor() {
    /**
     * Keeps track of the information associated with each key.
     * @type {Object.<ListenerKey, ListenerInfo>}
     */
    this._listeners = {};
    /**
     * Keeps track of the events each system is listening to,
     * @type {Object.<string, RootedSearchTreeNode<ListenerKey>>}
     */
    this._subscribers = {};
    /** 
     * Keeps track of the event descriptorss that can trigger an event. 
     * @type {RootedSearchTreeNode<ListenerKey>} 
     */
    this._descriptors = new RootedSearchTreeNode();

    /**
     * @type {Queue<Message>}
     */
    this._messageQueue = new Queue();
    this._processImmediately = false;
    this._currentlyProcessing = false;
  }

  get processImmediately() {
    return this._processImmediately;
  }

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
   * @param {string?} target The target system's name, or undefined for all systems
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
        
        handler(body, descriptor);
      }
    }
    this._currentlyProcessing = false;
  }
}