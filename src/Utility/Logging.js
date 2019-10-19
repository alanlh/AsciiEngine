"use strict";
const LOGGING = {
  _CALL_MAPS: {
    ASSERT: console.assert,
    ERROR: console.error,
    WARN: console.warn,
    LOG: console.log,
    DEBUG: console.debug,
    DEBUG_VERBOSE: console.debug
  },
  STATUS: {
    ASSERT: true,
    ERROR: true,
    WARN: true,
    LOG: false,
    DEBUG: false,
    DEBUG_VERBOSE: false,
    PERFORMANCE: false,
  },
  IGNORE: function() {return;},
  PERFORMANCE: (function() {
    let time = {};
    let levels = {};
    // Rough guide to levels
    // 0: Good performance required (e.g. rendering)
    // 1: Important, one-time items (e.g. constructors)
    // 2: Large count (e.g. update individual cells). Enabling may cause performance decrease.
    // 3: ??
    // Default: 1
    let performanceLevel = 1;
    return {
      START: function(key, level) {
        // TODO: Make sure level is a number. 
        if (level == undefined || level <= performanceLevel) {
          time[key] = performance.now();
          if (level != undefined) {
            levels[key] = level;
          }
        }
      },
      STOP: function(key) {
        // TODO: Keep safe if performance level changes. 
        if (LOGGING.PERFORMANCE && levels[key] != undefined && levels[key] <= performanceLevel) {
          let duration = performance.now() - time[key];
          if (key) {
            console.log("Performance: ", key, ": ", duration);
          } else {
            console.log("Performance: ", duration);
          }
        }
      },
      CLEAR: function() {
        time = {};
      },
      get LEVEL() {
        return level; 
      },
      set LEVEL(newLevel) {
        // TODO: Make sure that newLevel is a non-negative integer.
        // If not a non-negative integer, don't set. 
        performanceLevel = newLevel;
      }
    } 
  })(),
};

for (let logType in LOGGING._CALL_MAPS) {
  Object.defineProperty(LOGGING, logType, {
    get: function() {
      if (LOGGING.STATUS[logType]) {
        return LOGGING._CALL_MAPS[logType];
      }
      return LOGGING.IGNORE;
    },
  });
}
Object.seal(LOGGING.STATUS);
Object.freeze(LOGGING);
