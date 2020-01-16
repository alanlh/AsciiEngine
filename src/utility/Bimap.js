// Currently unused.
// TODO: Delete?
class Bimap {
  constructor() {
    this._forwardMap = {};
    this._backwardMap = {};
  }
  
  add(left, right) {
    if (left in this._forwardMap) {
      LOGGING.LOG("Key", left, "already appears in this bimap.");
    }
    
    if (right in this._backwardMap) {
      LOGGING.LOG("Key", right, "already appears in this bimap.");
    }
    
    this._forwardMap[left] = right;
    this._backwardMap[right] = left;
  }
  
  *[Symbol.iterator]() {
    for (let left in this._forwardMap) {
      yield {left: left, right: this._forwardMap[left]};
    }
  }
  
  has(val) {
    return this.hasLeft(val) || this.hasRight(val);
  }
  
  hasLeft(val) {
    return val in this._forwardMap;
  }
  
  hasRight(val) {
    return val in this._backwardMap;
  }
  
  get(val) {
    if (val in this._forwardMap) {
      // Check if also in _backwardMap
      return this._forwardMap[val];
    }
    return this._backwardMap[val];
  }
  
  getLeft(left) {
    if (left in this._forwardMap) {
      return this._forwardMap[left];
    }
  }
  
  getRight(right) {
    if (right in this._backwardMap) {
      return this._backwardMap[right];
    }
  }
  
  remove(key) {
    // TODO: first or second?
    this.removeLeft(key);
    this.removeRight(key);
  }
  
  removeLeft(left) {
    if (this.hasLeft(left)) {
      delete this._backwardMap[this._forwardMap[left]];
      delete this._forwardMap[left];
    }
  }
  
  removeRight(right) {
    if (this.hasRight(right)) {
      delete this._forwardMap[this._backwardMap[right]];
      delete this._backwardMap[right];
    }
  }
}
