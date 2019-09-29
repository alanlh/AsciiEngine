"use strict";
function Event(origin, type, callback, repeatInformation) {
  // Needs a name variable. 
}

Event.createRepeatInformation(params) = function() {
  return {
    isRepeating: false,
    delayTime: 0, // Time until first activation. If 0, is run immediately
    
    repeatTime: 0, // exists only if isRepeating is true
  }
}
