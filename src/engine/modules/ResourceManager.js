import AssetLoader from "../../utility/AssetLoader.js";
import Parser from "../../utility/Parser.js";

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
  
  async loadSpriteFiles(fileList) {
    for (let spriteFile of fileList) {
      let fileString = await AssetLoader.loadFileAsString(spriteFile);
      let spriteData = Parser.getSpriteData(fileString);
      for (let spriteName in spriteData.sprites) {
        this.add(spriteName, spriteData.sprites[spriteName]);
      }
      
      for (let styleName in spriteData.styles) {
        this.add(styleName, spriteData.styles[styleName]);
      }
    }
  }
  
  async loadTemplateFiles(fileList) {
    for (let templateFile of fileList) {
      let fileString = await AssetLoader.loadFileAsString(templateFile);
      let templateData = Parser.getComponentFactories(fileString);
      for (let templateName in templateData) {
        this.add(templateName, templateData[templateName]);
      }
    }
  }
}
