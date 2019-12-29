let UtilityMethods = {
  IGNORE: function() {}, // Do nothing
  unionIntoFirst: function(first, second, logMethod) {
    logMethod = logMethod || UtilityMethods.IGNORE;
    for (let key in second) {
      if (key in first) {
        logMethod("Key: ", key, " appears in both ", first, " and ", second);
      }
      if (!(key in first)) {
        first[key] = second[key];
      }
    }
  },
  insertWithKey: function(container, keyName, objectsArray) {
    for (let object of objectsArray) {
      container[object[keyName]] = object;
    }
    return container;
  },
  checkForKeys: function(object, keys, returnCopy, logMethod) {
    logMethod = logMethod || UtilityMethods.IGNORE;
    for (let key of keys) {
      if (!(key in object)) {
        logMethod("Required key: ", key, " does not appear in ", object);
        return false;
      }
    }
    return true;
  },
  initializeArgs: function(defaultArgs, passedArgs) {
    for (let key in defaultArgs) {
      if (key in passedArgs) {
        defaultArgs[key] = passedArgs[key];
      } else if (defaultArgs[key] == undefined) {
        LOGGING.WARN("Argument ", key, " is not passed in: ", passedArgs);
      }
    }
    return defaultArgs;
  },
  generateRandom: function() {
    return Math.random();
  },
  generateRandomInt: function(a, b) {
    return a + Math.floor(Math.random() * (b - a));
  }
};

Object.freeze(UtilityMethods);
