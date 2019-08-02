function FormattingData(type, defaultValue) {
  let _currentValue = defaultValue;
  let _set = false;
  Object.defineProperty(this, "value", {
    get: function() {
      return _currentValue;
    },
    set: function(newValue) {
      _currentValue = newValue;
      _set = true;
    }
  });
  Object.defineProperty(this, "set", {
    get: function() {
      return _set;
    }
  });
}
