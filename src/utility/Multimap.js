class Multimap {
  constructor() {
    this.values = {};
    this._size = 0;
  }
  
  get size() {
    return this._size;
  }
  
  get empty() {
    return this._size === 0;
  }
  
  add(key, value) {
    if (!(key in this.values)) {
      this.values[key] = new Set();
    }
    
    this.values[key].add(value);
  }
  
  has(key) {
    return key in this.values;
  }
  
  *[Symbol.iterator]() {
    for (const key in this.values) {
      for (const value of this.values[key]) {
        yield value;
      }
    }
  }

  getKeys() {
    return Object.keys(this.values);
  }

  getKey(key) {
    if (key in this.values) {
      // TODO: Make this safe?
      return this.values[key];
    }
    LOGGING.LOG("Key", key, "not found in multimap.");
  }
  
  checkKeyValue(key, value) {
    if (key in this.values && this.values[key].has(value)) {
      return value;
    }
    return undefined;
  }
  
  removeKey(key) {
    if (key in this.values) {
      delete this.values[key];
    }
    
    LOGGING.LOG("Key", key, "not found in multimap.");
  }
  
  removeElement(key, value) {
    if (this.checkKeyValue(key, value)) {
      this.values[key].delete(value);
    }
  }
}
