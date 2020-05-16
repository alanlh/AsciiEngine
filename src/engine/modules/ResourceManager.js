export default class ResourceManager {
  constructor() {
    this.data = {};
  }
  
  add(key, value) {
    this.data[key] = value;
  }
  
  delete(key) {
    if (this.has(key)) {
      delete this.data[key];
    }
  }
  
  has(key) {
    return key in this.data;
  }
  
  get(key) {
    if (!(key in this.data)) {
      console.warn("Resource key: ", key, "not found");
    }
    return this.data[key];
  }
}
