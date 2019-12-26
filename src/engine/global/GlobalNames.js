"use strict";
const MessageTags = {
  // A single place to organize all these...
  ClockTick: "CLOCK_TICK", // Timer --> All
  GameStatus: "GAME_STATUS", // 
  SpeedChange: "SPEED_CHANGE", // 
  TimerRequest: "TIMER_REQUEST", // Any component --> Clock
  TimerAlarm: "TIMER_ALARM", // Timer --> All (but should be ignored by most)
  ChangeActiveScreen: "CHANGE_ACTIVE_SCREEN", // Input --> LocationManager
  
  BLANK: "BLANK"
}

Object.freeze(MessageTags);
