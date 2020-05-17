import Sprite from "../graphics/Sprite.js";
import SpriteStyle from "../graphics/SpriteStyle.js";
import AsciiAnimateComponent from "../engine/components/AsciiAnimateComponent.js";

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
  getSpriteData: function(fileString) {
    let json = JSON.parse(fileString);
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
        spriteData.text,
        spriteData.settings,
      );
    }
    let styleData = json.styles;
    let styles = {};
    for (let styleName in styleData) {
      let spriteStyle = new SpriteStyle();
      for (let style in styleData[styleName]) {
        spriteStyle.setStyle(style, styleData[styleName][style]);
      }
    }
    return {
      sprites: sprites,
      styles: styles,
    }
  },
  /**
   * Returns a function that builds AsciiAnimateComponents specified by fileString.
   */
  getComponentFactories: function(fileString) {
    let json = JSON.parse(fileString);
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
      factories[componentName] = function() {
        let animateComponent = new AsciiAnimateComponent();
        for (let frameName in componentSpecs) {
          // Need to create a copy to prevent (accidental?) changes.
          animateComponent.addFrame(
            frameName,
            [...componentSpecs[frameName].spriteNameList],
            [...componentSpecs[frameName].styleNameList],
            [...componentSpecs[frameName].relativePositionList],
          );
        }
        return animateComponent;
      }
    }
    return factories;
  }
}

Object.freeze(Parser);
export default Parser;
