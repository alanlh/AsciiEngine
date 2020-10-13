export default class Style {
  /**
   * Creates a new blank Style object
   */
  constructor() {
    /**
     * @private
     */
    this._styles = {};
    for (let styleName in Style.defaultValues) {
      this._styles[styleName] = null;
    }
  }
  
  /**
   * Prevents this Style from being changed in the future.
   */
  freeze() {
    Object.freeze(this._styles);
    Object.freeze(this);
  }
  
  /**
   * Resets all of the properties in the Style
   */
  clear() {
    for (let styleName in Style.defaultValues) {
      this._styles[styleName] = null;
    }
  }
  
  /**
   * Copies the data from the other Style object.
   * 
   * @param {Style} other The Style to copy from
   */
  copy(other) {
    this.clear();
    for (let styleName of other) {
      this.setStyle(styleName, other.getStyle(styleName));
    }
  }
  
  // ---- PUBLIC API ---- // 
  
  /**
   * Checks if the two styles are the same
   * @param {Style} other The Style to compare to
   * @returns {boolean} True if they are the same, false otherwise
   */
  sameAs(other) {
    for (let styleName in Style.defaultValues) {
      if (
        (this.hasStyle(styleName) !== other.hasStyle(styleName)) || 
        (this.getStyle(styleName) !== other.getStyle(styleName))
      ) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Sets a single property in the Style
   * @param {string} styleName The name of the property to set
   * @param {string} value The value to set to
   */
  setStyle(styleName, value) {
    if (!(styleName in Style.defaultValues)) {
      console.warn("AsciiGL currently does not support the style", styleName);
    }
    this._styles[styleName] = value || null;
  }
  
  /**
   * Checks if the property is specified
   * @param {string} styleName The name of a Style property
   * @returns {boolean} True if the property is set, false otherwise
   */
  hasStyle(styleName) {
    return this._styles[styleName] !== null;
  }
  
  /**
   * Returns the value of the a single Style property
   * @param {string} styleName The name of the Style property
   * @returns {string} The property value, or "" if it's not set
   */
  getStyle(styleName) {
    if (this.hasStyle(styleName)) {
      return this._styles[styleName];
    }
    return "";
  }
  
  /**
   * Allows for iterating over the specified properties of this Style.
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
   * 
   * @param {Style} base The style to copy from
   */
  fillRemainder(base) {
    for (let styleName in Style.defaultValues) {
      if (!this.hasStyle(styleName)) {
        if (base && base.hasStyle(styleName)) {
          this.setStyle(styleName, base.getStyle(styleName));
        } else {
          this.setStyle(styleName, Style.defaultValues[styleName]);
        }
      }
    }
  }
}

/**
 * @enum {String} A list of supported style properties
 */
Style.defaultValues = {
  color: "black",
  backgroundColor: "transparent",
  fontWeight: "normal",
  fontStyle: "normal",
  textDecoration: "none",
  cursor: "default",
}

/**
 * Sets the default property value for ALL Styles
 * @param {string} styleName The style property
 * @param {string} value The value to set to
 */
Style.setDefaultStyle = function(styleName, value) {
  if (styleName in Style.defaultValues) {
    // TODO: Verify value.
    Style.defaultValues[styleName] = value;
  } else {
    console.warn("Style does not support", styleName);
  }
}
