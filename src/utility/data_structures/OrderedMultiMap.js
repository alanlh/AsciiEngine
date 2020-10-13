/**
   * A map but with sorted keys.
   * @template K Key type
   * @template V Value Type
 */
export default class OrderedMultiMap {
  /**
   * Creates an OrderedMultiMap instance.
   * @param {function(K, K) => number} comparator A comparator for two keys
   */
  constructor(comparator) {
    /**
     * @type {Map.<K, Set<V>>}
     * @private
     */
    this._data = new Map();
    /**
     * @type {K[]}
     * @private
     */
    this._sortedKeys = [];

    this._comparator = comparator;
  }

  /**
   * Checks if the key and value appear in this collection.
   * If value is not specified, only searches for the key.
   * @param {K} key The key to search for
   * @param {V} [value] The value to search for (optional)
   * @returns {boolean}
   */
  has(key, value) {
    return this._data.has(key) && (value === undefined || this._data.get(key).has(value));
  }

  /**
   * Iterates over all values corresponding to the given key
   * @param {K} key The key whose values to iterate over
   */
  *getIt(key) {
    if (!this.has(key)) {
      return;
    }
    for (let value of this._data.get(key)) {
      yield value;
    }
  }

  /**
   * Returns all values corresponding to a key
   * @param {K} key The key whose values to get
   * @returns {Set<V>} The set of values, or an empty set.
   */
  get(key) {
    let vals = new Set();
    for (let val of this.getIt()) {
      vals.add(val);
    }
    return val;
  }

  /**
   * @generator
   * @yields {V}
   */
  *[Symbol.iterator]() {
    for (let sortedKey of this._sortedKeys) {
      for (let value of this._data.get(sortedKey)) {
        yield value;
      }
    }
  }

  /**
   * Adds a new key/value to the multimap.
   * @param {K} key The key to insert
   * @param {V} value The value to insert
   */
  add(key, value) {
    if (!this._data.has(key)) {
      this._data.set(key, new Set());
      // TODO: OPTIMIZE
      this._sortedKeys.push(key);
      this._sortedKeys.sort(this._comparator);
    }
    this._data.get(key).add(value);
  }

  /**
   * Removes a value from the map.
   * @param {K} key The key for the value to remove
   * @param {V} value The value to remove
   */
  delete(key, value) {
    if (!this._data.has(key)) {
      return;
    }
    this._data.get(key).delete(value);
    if (this._data.get(key).size === 0) {
      this._data.delete(key);
      // TODO: Optimize
      this._sortedKeys.splice(this._sortedKeys.indexOf(key), 1);
    }
  }
}

OrderedMultiMap.NumericComparator = (n1, n2) => {
  return n1 - n2;
}