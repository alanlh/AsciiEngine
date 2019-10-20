class Set2D {
  constructor() {
    this._data = {};
    this._size = 0;
  }
  
  add(vec2) {
    if (!(vec2.x in this._data)) {
      this._data[vec2.x] = new Set();
    }
    this._size -= this._data[vec2.x].size;
    this._data[vec2.x].add(vec2.y);
    this._size += this._data[vec2.x].size;
  }
  
  contains(vec2) {
    return (vec2.x in this._data && vec2.y in this._data[vec2.x]);
  }
  
  copy(other) {
    this.clear();
    this.unionWith(other);
  }
  
  unionWith(other) {
    // Should be another Set2D object
    for (let x in other._data) {
      if (!(x in this._data)) {
        this._data[x] = new Set();
      }
      this._size -= this._data[x].size;
      for (let y of other._data[x]) {
        this._data[x].add(y);
      }
      this._size += this._data[x].size;
    }
  }
  
  delete(vec2) {
    if (!this.contains(vec2)) {
      return false;
    }
    this._data[vec2.x].delete(vec2.y);
    if (this._data[vec2.x].size == 0) {
      delete this._data[vec2.x];
    }
    this._size --;
    return true;
  }
  
  clear() {
    this._data = {};
    this._size = 0;
  }
  
  get size() {
    return this._size;
  }
  
  get empty() {
    return this.size == 0;
  }
}
