/**
 * @template T
 */
export default class RootedSearchTreeNode {
  constructor() {
    /** @type {Object.<string, RootedSearchTreeNode>} */
    this.children = {};
    /** @type {Set<T>} */
    this.data = new Set();
    /**
     * @type {number}
     * Keeps track of the number of values in this and all child nodes.
     */
    this.size = 0;
  }

  has(path, value) {
    this._has(path, 0, value);
  }

  _has(path, index, value) {
    if (index === path.length) {
      return this.data.has(value);
    }
    return path[index] in this.children
      && this.children[path[index]]._has(path, index + 1, value);
  }

  /**
   * 
   * @param {Array<string>} path The path to add to
   * @param {T} value The value to add
   */
  add(path, value) {
    this._add(path, 0, value);
  }

  /**
   * 
   * @param {Array<string>} path The path to add to
   * @param {number} index The current index of the path
   * @param {T} value The value to add
   */
  _add(path, index, value) {
    if (index === path.length) {
      this.data.add(value);
      this.size++;
      return;
    }
    let key = path[index];
    if (!(key in this.children)) {
      this.children[key] = new RootedSearchTreeNode();
    }
    this.children[key]._add(path, index + 1, value);
    this.size++;
  }

  /**
   * Removes all instances of value in the subtree rooted at the specified path.
   * If path is the empty array, will remove all instances of value in the tree.
   * @param {Array<string>} path The path in which to remove the elements
   * @param {T?} value The value to remove
   */
  delete(path, value) {
    if (value === undefined) {
      // This should only be called on the root node. 
      // Must be handled separately because the implementation in _delete
      // relies on a parent node to clean it up.
      this.children = {};
      this.data = new Set();
      this.size = 0;
      return;
    }
    this._delete(path, 0, value);
  }

  /**
   * 
   * @param {Array<string>} path 
   * @param {number} index 
   * @param {T?} value If undefined, removes everything.
   * @returns {number} The number of times value was deleted.
   */
  _delete(path, index, value) {
    let deleted = 0;
    if (index >= path.length) {
      if (value === undefined) {
        // Quick way to have the parent completely remove it. 
        this.size = 0;
        return;
      }
      if (this.data.has(value)) {
        this.data.delete(value);
        deleted++;
      }
      for (let childKey in this.children) {
        deleted += this.children[childKey]._delete(path, index + 1, value);
        if (this.children[childKey].size === 0) {
          delete this.children[childKey];
        }
      }
      this.size -= deleted;
      return deleted;
    }
    if (path[index] in this.children) {
      deleted = this.children[path[index]]._delete(path, index + 1, value);
      this.size -= deleted;
    }
    return deleted;
  }

  /**
   * Iterates over the data at the node specified by path,
   * along with all descendant nodes. 
   * @param {Array<string>} path 
   * @returns {Generator<T, void, any>}
   */
  *getDescIt(path) {
    yield* this._getDescIt(path, 0);
  }

  /**
   * 
   * @param {Array<string>} path 
   * @param {number} index 
   * @returns {Generator<T, void, any>}
   */
  *_getDescIt(path, index) {
    if (index >= path.length) {
      for (let value of this.data) {
        yield value;
      }
      for (let childKey in this.children) {
        yield* this.children[childKey]._getDescIt(path, index + 1);
      }
    }
    if (path[index] in this.children) {
      yield* this.children[path[key]]._getDescIt(path, index + 1);
    }
  }

  /**
   * Iterates over the data at the node specified by path,
   * along with all ancestor nodes. 
   * @param {Array<string>} path 
   */
  *getAnscIt(path) {
    yield* this._getAnscIt(path, 0);
  }

  *_getAnscIt(path, index) {
    if (index >= path.length) {
      for (let value of this.data) {
        yield value;
      }
      return;
    }
    if (path[index] in this.children) {
      yield* this.children[path[index]]._getAnscIt(path, index + 1);
    }
    for (let value of this.data) {
      yield value;
    }
  }
}