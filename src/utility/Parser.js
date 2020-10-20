import Sprite from "../graphics/Sprite.js";
import Style from "../graphics/Style.js";
import AsciiAnimateComponentFactory from "../engine/components/AsciiAnimateComponentFactory.js";

/**
 * There are two main types of files to parse.
 * 
 * The first is raw Sprite/Style data.
 * These should be loaded directly into the resource manager.
 * 
 * The second is a AsciiAnimateComponent template.
 * These specify how to construct specific classes of AsciiAnimateComponents.
 */
const Parser = {
  /**
   * 
   * @param {string} fileString The file data as a string
   * @returns {{sprites: Object<string, Sprite>, styles: Object<string, Style}}
   */
  getSpriteDataFromString: function (fileString) {
    let json = JSON.parse(fileString);
    Parser.getSpriteDataFromJson(json);
  },

  /**
   * 
   * @param {any} json The sprite data as json
   */
  getSpriteDataFromJson: function (json) {
    //  JSON structure:
    //  {
    //    sprites: {
    //      spriteName: {
    //        text: "sprite text",
    //        settings: { sprite settings }
    //      }
    //    },
    //    styles: {
    //      styleName: { style data }
    //    }
    //  }
    let spriteData = json.sprites;
    let sprites = {};
    for (let spriteName in spriteData) {
      sprites[spriteName] = new Sprite(
        spriteData[spriteName].text,
        spriteData[spriteName].settings,
      );
    }
    let styleData = json.styles;
    let styles = {};
    for (let styleName in styleData) {
      let spriteStyle = new Style();
      for (let style in styleData[styleName]) {
        spriteStyle.setStyle(style, styleData[styleName][style]);
      }
      styles[styleName] = spriteStyle;
    }
    return {
      sprites: sprites,
      styles: styles,
    }
  },
  /**
   * Returns a function that builds AsciiAnimateComponents specified by fileString.
   * @param {string} fileString The file data as a string
   * @returns {Object<string, AsciiAnimateComponentFactory>}
   */
  getComponentFactoriesFromString: function (fileString) {
    let json = JSON.parse(fileString);
    Parser.getComponentFactoriesFromJson(json);
  },
  /**
   * 
   * @param {any} json The component factory data in json format
   */
  getComponentFactoriesFromJson: function(json) {
    // JSON structure:
    // {
    //    componentName: {
    //      frameName: {
    //        spriteNameList: [],
    //        styleNameList: [],
    //        relativePositionList: []
    //      }, ...
    //    }, ...
    // }
    let factories = {};
    for (let componentName in json) {
      let componentSpecs = json[componentName];
      factories[componentName] = new AsciiAnimateComponentFactory(componentSpecs);
    }
    return factories;
  }
}

Object.freeze(Parser);
export default Parser;
