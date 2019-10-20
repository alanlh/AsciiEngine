class Map2D {
  constructor() {
    this._data = {};
    this._idMap = {};
    this._size = 0;
  }
  
  insert(vec2, id) {
    if (!vec2.x in this._data) {
      this._data[vec2.x] = {};
    }
    if (vec2.y in this._data[vec2.x]) {
      return false;
    }
    this._data[vec2.x][vec2.y] = id;
    this._size ++;
    if (!(id in this._idMap)) {
      this._idMap[id] = new Set2D();
    }
    this._idMap[id].add(vec2);
    return true;
  }
  
  contains(vec2) {
    return (vec2.x in this._data && vec2.y in this._data[x]);
  }
  
  get(vec2) {
    if (vec2.x in this._data && vec2.y in this._data[x]) {
      return this._data[x][y];
    }
  }
  
  remove(vec2) {
    if (!this.contains(vec2)) {
      return false;
    }
    this._idMap[this._data[vec2.x][vec2.y]].remove(vec2);
    delete this._data[vec2.x][vec2.y];
    this.size --;
    for (let key in this._data[vec2.x]) {
      // Not empty.
      return true;
    }
    delete this._data[vec2.x];
    return true;
  }
  
  clear() {
    this._data = {};
    this._size = 0;
  }
  
  copy(other) {
    // Other is a Map2D
    this.clear();
    this.unionFrom(other);
  }
  
  unionWith(other) {
    for (let x in other_.data) {
      if (!(x in this._data)) {
        this._data[x] = {};
      }
      for (let y in other_.data) {
        if (!(y in this._data)) {
          // Only union elements that aren't already in the map.
          this._data[x][y] = other._data[x][y];
          this._size ++;
        }
      }
    }
  }
  
  get size() {
    return this._size;
  }
  
  get empty() {
    return this.size == 0;
  }
}
