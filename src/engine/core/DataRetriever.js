class DataRetriever {
  constructor() {
    this.data = {};
    this.panelTemplates = {};
  }
  
  loadData(data) {
    for (let newKey in data) {
      if (newKey in this.data) {
        LOGGING.WARN("Key ", newKey, "already found in data with value ", this.data[newKey], " Overwriting...");
      }
      this.data[newKey] = data[newKey];
    }
  }
  
  loadPanelTemplates(data) {
    for (let template of data) {
      let newKey = template.parameters.name;
      if (newKey in this.panelTemplates) {
        LOGGING.WARN("Key ", newKey, "already found in data with value ", this.panelTemplates[newKey], " Overwriting...");
      }
      this.panelTemplates[newKey] = template;
    }
  }
  
  get(key) {
    if (key in this.data) {
      return this.data[key];
    }
    if (key in this.panelTemplates) {
      return this.panelTemplates[key];
    }
    
    LOGGING.WARN("Key ", key, "not found in Data");
  }
}
