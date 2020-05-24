import Queue from "./data_structures/Queue.js";

export default class MessageReceiver {
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
