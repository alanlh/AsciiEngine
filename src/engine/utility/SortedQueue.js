"use strict";
// TODO: Maybe switch to Heap implementation? For normal Queue as well if we don't need arbitrary access
// Current implementation inserts into the middle of array, which is bad.
function SortedQueue extends Queue {
  constructor(sorter) {
    super();
    this.sorter = sorter;
  }
  
  enqueue(newElement) {
    for (let i = 0; i < this.size; i ++) {
      if (sorter(newElement) < sorter(this._storage[i])) {
        this._storage.splice(i, 0, newElement);
      }
    }
    this._size ++;
    // TODO: Improve to binary speed.
  }
}
