import Queue from "./Queue.js";

/**
 * A queue that also allows for random access to elements.
 * 
 * For now relies on implementation of Queue. If Queue significantly changes, will break this.
 */
export default class RAQueue extends Queue {  
  /**
   * Returns the element at the idxth place, without modifying the queue.
   * Returns null for bad indexes.
   */
  peek(idx) {
    if (idx >= 0 && idx < this.size) {
      return this._data[this._currIdx + idx];
    }
  }
}
