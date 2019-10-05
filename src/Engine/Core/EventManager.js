// Introducing this class to help manage callbacks. 
class EventManager {
  constructor(gameControllerInternals) {
    for (let timing in EventManager.TIMINGS) {
      this[timing] = new GameLoopCallbacks(gameControllerInternals, EventManager.TIMINGS[timing]);
    }
    
    this.activeEvents = {};
  }
  
  addEvent(eventData) {
    this[eventData.repeatInformation.repeatTime].add(eventData);
    this.activeEvents[eventData.id] = eventData.repeatInformation.repeatTime;
  }
  
  removeEventId(eventId) {
    this[this.activeEvents[eventId]].remove(eventId);
  }
  
  startAll() {
    for (let timing in EventManager.TIMINGS) {
      this[timing].start();
    }
  }
  
  stopAll() {
    for (let timing in EventManager.TIMINGS) {
      this[timing].stop();
    }
  }
  
  switchSpeed() {
    // TODO: Implement by having multiple EventManager.TIMING values, and just swapping?
    // Will also need to target GameLoopCallbacks. Maybe do a stopAll, and then a startAll?
  }
}

EventManager.TIMINGS = {
  FASTEST: 125,
  FASTER: 250,
  FAST: 500,
  NORMAL: 1000,
  SLOW: 2000,
}

Object.freeze(EventManager.TIMINGS);
