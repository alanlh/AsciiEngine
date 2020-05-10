export default class SpriteStyle {
  constructor() {
    this._styles = {};
    for (let styleName in SpriteStyle.defaultValues) {
      this._styles[styleName] = null;
    }
  }
  
  /**
   * Prevents this Style from being changed in the future.
   * 
   * Called by AsciiGL after the style has been inserted.
   */
  freeze() {
    Object.freeze(this._styles);
    Object.freeze(this);
  }
  
  clear() {
    for (let styleName in SpriteStyle.defaultValues) {
      this._styles[styleName] = null;
    }
  }
  
  /**
   * Copies the data from the other SpriteStyle object.
   */
  copy(other) {
    this.clear();
    for (let styleName of other) {
      this.setStyle(styleName, other.getStyle(styleName));
    }
  }
  
  // ---- PUBLIC API ---- // 
  
  sameAs(other) {
    for (let styleName in SpriteStyle.defaultValues) {
      if (
        (this.hasStyle(styleName) !== other.hasStyle(styleName)) || 
        (this.getStyle(styleName) !== other.getStyle(styleName))
      ) {
        return false;
      }
    }
    return true;
  }
  
  setStyle(styleName, value) {
    if (!(styleName in SpriteStyle.defaultValues)) {
      console.warn("AsciiGL currently does not support the style", styleName);
    }
    this._styles[styleName] = value || null;
  }
  
  hasStyle(styleName) {
    return this._styles[styleName] !== null;
  }
  
  getStyle(styleName) {
    if (this.hasStyle(styleName)) {
      return this._styles[styleName];
    }
    return "";
  }
  
  /**
   * Allows for iterating over the specified properties of this SpriteStyle.
   */
  *[Symbol.iterator]() {
    for (let styleName in this._styles) {
      if (this.hasStyle(styleName)) {
        yield styleName;
      }
    }
  }
  
  /**
   * Fills in all used style fields.
   * 
   * Ensures that all formatting comes from the current sprite, not ones behind it.
   * 
   * The parameter, if passed, specifies the default values to use.
   */
  fillRemainder(base) {
    for (let styleName in SpriteStyle.defaultValues) {
      if (!this.hasStyle(styleName)) {
        if (base && base.hasStyle(styleName)) {
          this.setStyle(styleName, base.getStyle(styleName));
        } else {
          this.setStyle(styleName, SpriteStyle.defaultValues[styleName]);
        }
      }
    }
  }
}

SpriteStyle.defaultValues = {
  color: "black",
  backgroundColor: "transparent",
}

SpriteStyle.setDefaultStyle = function(styleName, value) {
  if (styleName in SpriteStyle.defaultValues) {
    // TODO: Verify value.
    SpriteStyle.defaultValues[styleName] = value;
  } else {
    console.warn("SpriteStyle does not support", styleName);
  }
}
