class Map2D {
  constructor() {
    this._data = {};
    this._idMap = {};
    this._size = 0;
  }
  
  insert(id, vec2) {
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
    if (this.contains(vec2)) {
      return this._data[x][y];
    }
  }
  
  removePoint(vec2) {
    if (!this.contains(vec2)) {
      return false;
    }
    let correspondingId = this._data[vec2.x][vec2.y];
    this._idMap[correspondingId].remove(vec2);
    if (this._idMap[correspondingId].size == 0) {
      delete this._idMap[correspondingId];
    }
    delete this._data[vec2.x][vec2.y];
    this.size --;
    for (let key in this._data[vec2.x]) {
      // Not empty.
      return true;
    }
    delete this._data[vec2.x];
    return true;
  }
  
  removeId(id) {
    if (id in this._idMap) {
      for (let pt of this._idMap[id]) {
        if (this.contains(pt)) {
          delete this._data[vec2.x][vec2.y];
          this.size --;
          if (this._data[vec2.x].length == 0) {
            delete this._data[vec2.x];
          }
        }
      }
      let idVecs = this._idMap[id];
      delete this._idMap[id];
      return idVecs;
    }
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
    for (let x in other.data) {
      if (!(x in this._data)) {
        this._data[x] = {};
      }
      for (let y in other.data) {
        if (!(y in this._data)) {
          // Only union elements that aren't already in the map.
          this.insert(other.data[x][y], {x: x, y: y});
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
