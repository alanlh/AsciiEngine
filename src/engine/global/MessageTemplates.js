"use strict";

// For messages that can be created by multiple places.
const MessageTemplate = {
  /** Timer and game state related **/
  // TODO: Move this somewhere else
  GameState: {
    PAUSED = 0,
    PLAYING = 1,
  },
  
  TimerRequest: function(component, key, measureBySeconds, count) {
    return new Message(
      component.id, // Use the id to determine what to send back. 
      MessageTags.TimerRequest,
      {
        key: key, // Used by 
        measureBySeconds: measureBySeconds,
        count: count
      }
    )
  },
}

Object.freeze(MessageTemplate);
