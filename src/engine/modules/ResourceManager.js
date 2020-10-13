import AssetLoader from "../../utility/AssetLoader.js";
import Parser from "../../utility/Parser.js";

export default class ResourceManager {
  constructor() {
    /**
     * @private
     */
    this.data = {};
  }
  
  /**
   * 
   * @param {string | symbol} key The key of the item to store
   * @param {any} value The value to store
   */
  add(key, value) {
    this.data[key] = value;
  }
  
  /**
   * Deletes an item
   * @param {string | symbol} key 
   */
  delete(key) {
    if (this.has(key)) {
      delete this.data[key];
    }
  }
  
  /**
   * 
   * @param {string | symbol} key 
   * @returns {boolean}
   */
  has(key) {
    return key in this.data;
  }
  
  /**
   * 
   * @param {string | symbol} key 
   * @returns {any}
   */
  get(key) {
    if (!(key in this.data)) {
      console.warn("Resource key: ", key, "not found");
    }
    return this.data[key];
  }
  
  /**
   * 
   * @param {Array<string>} fileList 
   */
  async loadSpriteFiles(fileList) {
    for (let spriteFile of fileList) {
      let fileString = await AssetLoader.loadFileAsString(spriteFile);
      this.loadSpriteFileJson(JSON.parse(fileString));
    }
  }

  /**
   * Loads JSON which contains sprite/style data from one file
   * @param {Object} json 
   */
  loadSpriteFileJson(json) {
    let spriteData = Parser.getSpriteDataFromJson(json);
    for (let spriteName in spriteData.sprites) {
      this.add(spriteName, spriteData.sprites[spriteName]);
    }

    for (let styleName in spriteData.styles) {
      this.add(styleName, spriteData.styles[styleName]);
    }
  }
  
  /**
   * 
   * @param {Array<string>} fileList 
   */
  async loadTemplateFiles(fileList) {
    for (let templateFile of fileList) {
      let fileString = await AssetLoader.loadFileAsString(templateFile);
      this.loadTemplateJson(JSON.parse(fileString));
    }
  }

  /**
   * 
   * @param {Object} json The json data for one template
   */
  loadTemplateJson(json) {
    let templateData = Parser.getComponentFactoriesFromJson(json);
    for (let templateName in templateData) {
      this.add(templateName, templateData[templateName]);
    }
  }
}
