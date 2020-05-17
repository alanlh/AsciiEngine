const Functions = {
  generateId: (function() {
    let currId = 0;
    
    return function(name) {
      if (name === undefined) {
        name = "AsciiEngine"
      }
      currId ++;
      return name + "_" + currId;
    }
  })(),
  clamp: function(num, min, max) {
    return Math.max(min, Math.min(num, max));
  }
}

Object.freeze(Functions);
export default Functions;
