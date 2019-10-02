"use strict";
class EventBase {
  constructor(origin, type, controller, callback, repeatInformation) {
    // Needs a name variable. 
    this.origin = origin;
    this.type = type;
    this.controller = controller;
    this.callback = callback;
    this.repeatInformation = EventBase.createRepeatInformation(repeatInformation);
    
    this.paused = false;
  }
  
  shouldContinueRunning() {
    // Should be repeating, and 
  }
}

EventBase.createRepeatInformation(params) = function() {
  return {
    isRepeating: false,
    indefiniteRepeat: 
    delayTime: 0, // Time until first activation. If 0, is run immediately
    
    repeatCount: count, // exists only if isRepeating is true
  }
};


EventBase.TYPES = {
  STATE_CHANGE_EVENT: "State Change Event",
  DISPLAY_CHANGE_EVENT: "Display Change Event"
};
