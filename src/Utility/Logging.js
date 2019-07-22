"use strict"
const LOGGING = {
  STATUS: {
    ERROR: true,
    WARN: true,
    LOG: false,
    DEBUG: false,
    DEBUG_VERBOSE: false,
    PERFORMANCE: false
  },
  ASSERT: function(statement) {
    if (!statement && LOGGING.STATUS.ERROR) {
      let message = Array.prototype.slice.call(arguments, 1);
      console.error.apply(console, message);
    }
  },
  ERROR: function() {
    if (LOGGING.STATUS.ERROR) {
      let message = Array.prototype.slice.call(arguments, '');
      console.error.apply(console, message);
    }
  },
  WARN: function() {
    if (LOGGING.STATUS.WARN) {
      let message = Array.prototype.slice.call(arguments, '');
      console.warn.apply(console, message);
    }
  },
  LOG: function() {
    if (LOGGING.STATUS.LOG) {
      let message = Array.prototype.slice.call(arguments, '');
      console.log.apply(console, message);
    }
  },
  DEBUG: function() {
    if (LOGGING.STATUS.DEBUG) {
      let message = Array.prototype.slice.call(arguments, '');
      console.debug.apply(console, message);
    }
  },
  DEBUG_VERBOSE: function() {
    if (LOGGING.STATUS.DEBUG_VERBOSE) {
      // Debugging information, but for heavily repeated messages (e.g. rendering)
      let message = Array.prototype.slice.call(arguments, '');
      console.debug.apply(console, message);
    }
  },
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
  })()
}

Object.seal(LOGGING.STATUS);
Object.freeze(LOGGING);
