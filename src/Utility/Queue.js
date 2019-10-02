// An implementation of queue that allows the user to access any element in it (but not modify)
class Queue {
  constructor() {
    this._storage = [];
    this._size = 0;
    
    this._currIdx = 0;
  }
  
  enqueue(newElement) {
    this._storage.push(newElement);
    this._size ++;
  }
  
  // Removes n (default 1) elements. Returns the top one.
  dequeue(n) {
    let front = this.front();
    if (n === undefined) {
      n = 1;
    }
    if (this.size <= n) {
      this._storage = [];
      this._size = 0;
      this._currIdx = 0;
    } else if (this.size - n < this._storage.length / 2) {
      this._storage = this._storage.slice(this._currIdx + n);
      this._currIdx = 0;
      this._size -= n;
    } else {
      let removed = 0;
      while (removed < n) {
        this._storage[this._currIdx] = undefined;
        this._size --;
        this._currIdx ++;
        removed ++;
      }
    }
    return front;
  }
  
  front() {
    if (this._size > 0) {
      return this._storage[this._currIdx];
    }
  }
  
  back() {
    if (this._size > 0) {
      return this._storage[this._storage.length - 1];
    }
  }
  
  at(idx) {
    if (idx >= this._size || idx < 0) {
      return undefined;
    }
    return this._storage[this._currIdx + idx];
  }
  
  get size() {
    return this._size;
  }
}
