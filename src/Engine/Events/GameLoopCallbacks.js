class GameLoopCallbacks {
  constructor(controller, intervalTime) {
    this.collection = {};
    this.intervalTime = intervalTime;
    this.controller = controller;
    
    this.intervalId = -1;
    this.size = 0;
    this.on = false;
  }
  
  start() {
    if (this.size > 0) {
      this.intervalId = window.setInterval(this.fire, this.intervalTime);
    }
    this.on = true;
  }
  
  stop() {
    if (this.intervalId != -1) {
      window.clearInterval(this.intervalId);
      this.intervalId = -1;
    }
    // Should already be cleared if size = 0;
    this.on = false;
  }
  
  fire() {
    for (let callbackId in this.collection) {
      let eventData = this.collection[callbackId];
      this.controller.triggerEvent(eventData);
      // Check if eventData is repeating, etc. If not remove. 
    }
  }
  
  add(eventData) {
    this.collection[eventData.id] = eventData;
    if (eventData.id in this.collection) {
      LOGGING.WARN("Callback Collection ", name, " is getting two callbacks with id ", eventData);
    }
    if (this.on && this.size == 0) {
      this.intervalId = window.setInterval(this.fire, this.intervalTime);
    }
    this.size ++;
  }
  
  remove(eventDataId) {
    if (!(eventDataId in this.collection)) {
      LOGGING.WARN("Callback Collection ", name, " does not have id ", eventDataId);
    }
    delete this.collection(eventDataId);
    // If size == 0, stop
    this.size --;
    if (this.size == 0) {
      window.clearInterval(this.intervalId);
      this.intervalId = -1;
    }
  }
}
