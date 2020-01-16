class ClassMap {
  constructor() {
    this._size = 0;
    this._idMap = {}; // ids to elements
    this._classes = {}; // class names to set of ids
    this._classLists = {}; // ids to sets of classes
  }
  
  _assertId(id) {
    if (!(id in this._idMap)) {
      LOGGING.WARN("Id", id, "not in this ClassMap.");
      return false;
    }
    return true;
  }
  
  add(id, element, classes) {
    // TODO: Make safe.
    this._idMap[id] = element;
    this._classLists[id] = new Set();
    this.addClasses(id, classes);
    this._size ++;
  }
  
  addClasses(id, classNames) {
    if (!this._assertId(id)) {
      return;
    }
    
    for (const className of classNames) {
      if (!(className in this._classes)) {
        this._classes[className] = new Set();
      }
      this._classes[className].add(id);
      this._classLists[id].add(className);
    }
  }
  
  get size() {
    return this._size;
  }
  
  getElementById(id) {
    if (!this._assertId(id)) {
      return;
    }
    
    return this._idMap[id];
  }
  
  getIdsByClass(className) {
    if (!(className in this._classes)) {
      // LOGGING.WARN("Class", className, "not in this ClassMap.");
      return new Set();
    }
    
    let ids = new Set();
    for (const id of this._classes[className]) {
      // TODO: Should a copy be created?
      ids.add(id);
    }
    return ids;
  }
  
  getElementsByClass(className) {
    let elements = {};
    for (const id in this._classes[className]) {
      elements[id] = this._idMap[id];
    }
    return elements;
  }
  
  getElementClassList(id) {
    if (!this._assertId(id)) {
      return;
    }
    // TODO: Make safe.
    return this._classLists[id];
  }
  
  hasId(id) {
    return id in this._idMap;
  }
  
  *[Symbol.iterator]() {
    for (const id in this._idMap) {
      yield id;
    }
  }
  
  removeClass(id, classNames) {
    if (!this._assertId(id)) {
      return;
    }

    for (const className of classNames) {
      if (!(className in this._classLists[id])) {
        LOGGING.WARN("Attempting to remove class", className, "which does not belong to id", id);
      }
      
      this._classLists[id].delete(className);
      this._classes[className].delete(id);
      if (this._classes[className].size === 0) {
        delete this._classes[className];
      }
    }
  }
  
  deleteId(id) {
    if (!this._assertId(id)) {
      return;
    }
    
    for (const className of this._classLists[id]) {
      this._classes[className].delete(id);
      if (this._classes[className].size === 0) {
        delete this._classes[className];
      }
    }
    delete this._idMap[id];
    delete this._classLists[id];
    this._size --;
  }
  
  deleteClass(className) {
    if (!(className in this._classes)) {
      LOGGING.WARN("Class", className, "not in this ClassMap.");
      return;
    }
    
    while (this._classes[className].size > 0) {
      for (const id in this._classes[className]) {
        this.deleteId(id);
        break;
      }
      this._size --;
    }
  }
}
