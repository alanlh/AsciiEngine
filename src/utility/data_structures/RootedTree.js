/**
 * @template T
 * @todo OPTIMIZE!!!!!!!
 */
export default class RootedSearchTreeNode {
  constructor() {
    /** @type {Object.<string, RootedSearchTreeNode<T>>} */
    this.children = {};
    /** @type {Set<T>} */
    this.data = new Set();
    /**
     * @type {number}
     * Keeps track of the number of values in this and all child nodes.
     */
    this.size = 0;
  }

  /**
   * Checks if the value appears in the subtree specified by the path.
   * If undefined, only checks if the path exists.
   * @param {Array<string>} path The path descriptor
   * @param {T} [value] The value to check
   */
  has(path, value) {
    this._has(path, 0, value);
  }

  _has(path, index, value) {
    if (index >= path.length) {
      if (value === undefined || this.data.has(value)) {
        return true;
      }
      for (let key in this.children) {
        if (this.children[key]._has(path, index + 1, value)) {
          return true;
        }
      }
      return MATCH_ANY in this.children
        && this.children[MATCH_ANY]._has(path, index + 1, value);
    }
    if (path[index] === undefined) {
      for (let key in this.children) {
        if (this.children[key]._has(path, index + 1, value)) {
          return true;
        }
      }
      return MATCH_ANY in this.children
        && this.children[MATCH_ANY]._has(path, index + 1, value);
    }
    if (path[index] in this.children
      && this.children[path[index]]._has(path, index + 1, value)) {
      return true;
    }
    return MATCH_ANY in this.children
      && this.children[MATCH_ANY]._has(path, index + 1, value);
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
    if (key === undefined) {
      key = MATCH_ANY;
    }
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
   * @param {T} [value] The value to remove
   */
  delete(path, value) {
    if (path.length === 0 && value === undefined) {
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
   * @param {T} [value] If undefined, removes everything.
   * @returns {number} The number of times value was deleted.
   */
  _delete(path, index, value) {
    let deleted = 0;
    if (index >= path.length) {
      if (value === undefined) {
        // Quick way to have the parent completely remove it. 
        let deleted = this.size;
        this.size = 0;
        return deleted;
      }
      if (this.data.delete(value)) {
        deleted++;
      }
      this.size -= deleted;
      for (let childKey in this.children) {
        deleted += this._deleteHelper(path, index + 1, value, childKey);
      }
      if (MATCH_ANY in this.children) {
        deleted += this._deleteHelper(path, index + 1, value, MATCH_ANY);
      }
      return deleted;
    }
    if (path[index] === undefined) {
      for (let key in this.children) {
        deleted += this._deleteHelper(path, index + 1, value, key);
      }
      if (MATCH_ANY in this.children) {
        deleted += this._deleteHelper(path, index + 1, value, MATCH_ANY);
      }
      return deleted;
    }
    if (path[index] in this.children) {
      deleted += this._deleteHelper(path, index + 1, value, path[index]);
    }
    if (MATCH_ANY in this.children) {
      deleted += this._deleteHelper(path, index + 1, value, MATCH_ANY);
    }
    return deleted;
  }

  _deleteHelper(path, index, value, key) {
    let deleted = this.children[key]._delete(path, index + 1, value);
    if (this.children[key].size === 0) {
      delete this.children[key];
    }
    this.size -= deleted;
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
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getDescIt(path, index + 1);
      }
      return;
    }
    if (path[index] === undefined) {
      for (let key in this.children) {
        yield* this.children[key]._getDescIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getDescIt(path, index + 1);
      }
    } else {
      if (path[index] in this.children) {
        yield* this.children[path[index]]._getDescIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getDescIt(path, index + 1);
      }
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
    if (path[index] === undefined) {
      for (let key in this.children) {
        yield* this.children[key]._getAnscIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getAnscIt(path, index + 1);
      }
    } else {
      if (path[index] in this.children) {
        yield* this.children[path[index]]._getAnscIt(path, index + 1);
      }
      if (MATCH_ANY in this.children) {
        yield* this.children[MATCH_ANY]._getAnscIt(path, index + 1);
      }
    }
    for (let value of this.data) {
      yield value;
    }
  }
}

const MATCH_ANY = Symbol("ANY");