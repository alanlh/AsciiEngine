// TODO: Is this necessary?

class PersistentData {
  constructor() {
    this.values = {};
    // TODO: Other possible features: 
    // Changed since last viewed
    // Last modifier
  }
  
  getValue(key) {
    if (!(key in this.values)) {
      LOGGING.WARN("Key ", key, " not in Global Data.");
    }
    return this.values[key];
  }
  
  postValue(key, value) {
    this.values[key] = value;
  }
}
