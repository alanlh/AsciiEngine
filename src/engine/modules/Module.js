/**
 * TODO: Delete...
 */

import RAQueue from "../utility/data_structures/RAQueue.js";

export default class Module {
  init(game, config) {
    this._game = game;
    this._config = config;
  }
  
  /**
   * Gets the first request to handle from the inbound queue. Called by derived modules.
   */
  getRequest() {
    return this._inboundQueue.dequeue();
  }
  
  /**
   * Pushes a event to the outbound queue. Called by derived modules.
   */
  notifyEvent(message) {
    this._outboundQueue.enqueue(message);
  }
  
  // -------- PUBLIC API -------- //
  
  /**
   * Called by Systems to get an event. 
   * Returns the first event and removes it from the queue.
   */ 
  pullEvent() {
    return this._outboundQueue.dequeue();
  }
  
  /**
   * Called by Systems to get an event.
   * Returns the event specified by the index without removing it from the queue.
   * 
   * @param {Number} index the index to access (default 0)
   * @return The indexth event in the queue. 
   */
  peekEvent(index) {
    if (index === undefined) {
      index = 0;
    }
    return this._outboundQueue.peek(index);
  }
  
  pushRequest(request) {
    this._inboundQueue.enqueue(request);
  }
  
  // ---------- PUBLIC INTERFACE ---------- //
  // Methods above should not be overriden. Methods below should be.
  
  /**
   * Runs when the game is started.
   */ 
  startup() {}
    
  /**
   * A virtual method that modules can override.
   * Run at the beginning of each game loop.
   */
  preUpdate() {}
  
  /**
   * A virtual method that modules can override.
   * Run at the end of each game loop.
   */
  postUpdate() {}
}
