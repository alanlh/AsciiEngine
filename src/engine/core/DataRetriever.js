class DataRetriever {
  constructor() {
    this.data = {};
  }
  
  loadData(data) {
    for (let newKey in data) {
      if (newKey in this.data) {
        LOGGING.WARN("Key ", newKey, "already found in data with value ", this.data[newKey], " Overwriting...");
      }
      this.data[newKey] = data[newKey];
    }
  }
  
  get(key) {
    if (!(key in this.data)) {
      LOGGING.WARN("Key ", key, "not found in Data");
    }
    
    return this.data[key];
  }
}
