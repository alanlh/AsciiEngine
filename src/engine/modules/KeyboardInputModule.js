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
export default class KeyboardInputModule {
  constructor() {
    /** @type {Set<KeyboardEventHandler>} */
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
}
