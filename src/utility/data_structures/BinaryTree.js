export default class BinaryTree {
  /**
   * A binary tree data structure.
   * 
   * @param {function} comparator A function that takes in two key arguments
   *    returns a positive number if the left < right
   *            0 if left == right
   *            a negative number if left > right
   */
  constructor(comparator) {
    // A binary tree data structure.
    this._root = null;
    this._comparator = comparator;
  }
  
  /**
   * Inserts a new node into the tree.
   * 
   * Key can be anything that can be compared by the given comparator. 
   * Data can be any object.
   */
  insert(key, data) {
    // TODO: Rotate for efficiency.
    if (this._root === null) {
      this._root = new Node(null, key, data);
    }
    let currNode = this._root;
    while (currNode.left !== null || currNode.right !== null) {
      let compared = this._comparator(currNode.key, key);
      if (compared > 0) {
        if (currNode.right === null) {
          currNode.right = new Node(currNode, key, data);
        }
        currNode = currNode.right;
      } else if (compared < 0) {
        if (currNode.left === null) {
          currNode.left = new Node(currNode, key, data);
        }
        currNode = currNode.left;
      } else if (compared === 0) {
        // Just change the data...
        currNode._data = data;
      } else {
        // Should never happen.
      }
    }
  }
  
  /**
   * Deletes the specified node from the tree.
   * 
   * Returns true if successful.
   */
  deleteNode(key) {
    let toDelete = this._getNode(key);
    if (toDelete === undefined) {
      return false;
    }
    
    let replacementNode = toDelete.left;
    if (replacementNode === null) {
      replacementNode = toDelete.right;
    } else {
      while (replacementNode.right !== null) {
        replacementNode = replacementNode.right;
      }
      replacementNode.right = toDelete.right;
    }
    if (toDelete.parent) {
      // Not root.
      if (toDelete === toDelete.parent.right) {
        toDelete.parent.right = replacementNode;
      } else {
        toDelete.parent.left = replacementNode;
      }
    } else {
      this._root = replacementNode;
    }
    return true;
  }
  
  /**
   * Returns the node if the key exists.
   * Should not be called publicly.
   */
  _getNode(key) {
    if (this._root === null) {
      return undefined;
    }
    let currNode = this._root;
    while (currNode !== null) {
      let compared = this._comparator(currNode.key, key);
      if (compared > 0) {
        currNode = currNode.right;
      } else if (compared < 0) {
        currNode = currNode.left;
      } else if (compared === 0) {
        return currNode;
      }
    }
  }
  
  /**
   * Returns true if the key exists in the tree.
   */
  has(key) {
    return this._getNode(key) != undefined;
  }
  
  /**
   * Returns the data at the node specified by key, if it exists.
   * If key is not in the BinaryTree, returns null
   */
  find(key) {
    let node = this._getNode(key);
    if (node !== undefined) {
      return node.data;
    }
  }
}

/**
 * A helper Node class for the Binary Tree.
 * 
 * Should never be accessed directly by user code.
 */
class Node {
  constructor(parent, key, data) {
    this._key = key;
    this._data = data;
    
    this.left = null;
    this.right = null;
    this.parent = null;
  }
  
  get key() {
    return this._key;
  }
  
  get data() {
    return this._data;
  }
}
