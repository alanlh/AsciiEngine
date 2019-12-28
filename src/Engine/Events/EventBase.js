"use strict";
class EventBase {
  constructor(id, eventClass, type, controller, data, callback, repeatInformation) {
    // Needs a name variable. 
    this.id = id;
    this.class = eventClass; // State Change or Display Change? 
    this.type = type;
    this.controller = controller;
    this.data = data; // Data format depends on what type of event
    this.callback = callback;
    this.repeatInformation = EventBase.createRepeatInformation(repeatInformation);
    
    this.paused = false;
    this.executeImmediately = false;
  }
  
  shouldContinueRunning() {
    // Should be repeating, and 
  }
}

EventBase.createRepeatInformation(params) = function() {
  return {
    isRepeating: false,
    indefiniteRepeat: true,
    repeatCount: 0, // matters only if isRepeating is true and indefiniteRepeat is false
    
    repeatTime: 1000
  }
};


EventBase.TYPES = {
  INPUT_CLICK: "Input Cick", // e.g. buttons
  TIMER: "Timer",
  QUEST: "Quest"
};
