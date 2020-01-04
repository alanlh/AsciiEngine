"use strict";
// TODO: Move this to some centralized location?
const ComponentNames = {
  Clock: "CLOCK",
  Display: "DISPLAY",
  PanelManager: "PANEL_MANAGER",
  StoryManager: "STORY_MANAGER",
}

const MessageTags = {
  // A single place to organize all these...
  ClockTick: "CLOCK_TICK", // Timer --> All
  GameStatus: "GAME_STATUS", // 
  SpeedChange: "SPEED_CHANGE", // 
  TimerRequest: "TIMER_REQUEST", // Any component --> Clock
  TimerAlarm: "TIMER_ALARM", // Timer --> All (but should be ignored by most)
  ChangeActiveScreen: "CHANGE_ACTIVE_SCREEN", // Input --> PanelManager
  
  BLANK: "BLANK"
}

/** Flags to include:
  firstRender: Tells display to insert a new object. Flag should not exist or be undefined afterwards.
    The value is the spriteId
  topLeft: x, y coordinates within the sceen. Up to display to offset by screen x, y.
  stateKey: The key which to set the AsciiEngine element.
  visible: true or false.
  shouldRemove: True if should remove. Otherwise shouldn't even be present.
**/

const RenderElementChanges = {
  firstrender: "FIRST_RENDER", // Add a new element to the scene.
  topLeft: "TOP_LEFT", // Specify the top left coordinate
  stateKey: "STATE_KEY", // Specify the state key.
  visible: "VISIBLE", // Toggle the visibility to the specified value.
  shouldRemove: "SHOULD_REMOVE" // If true, remove from scene completely.
}

Object.freeze(MessageTags);
