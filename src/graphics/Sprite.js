/**
 * @typedef {{
 * setAsBlank?: string,
 * spaceIsTransparent?: boolean,
 * ignoreLeadingSpaces?: boolean,
 * spaceHasFormatting?: boolean,
 * }} SpriteSettings
 */
export default class Sprite {
  /**
   * Creates a new Sprite that can be used by AsciiGL.
   * @param {string} text The text which the sprite is composed of
   * @param {SpriteSettings} settings Controls how the sprite is displayed
   */
  constructor(text, settings) {
    // TODO: Verify text.
    text = text || "";
    settings = settings || {};
    
    this._text = text;
    this._rowIndices = [];
    this._firstVisibleChar = [];
    this._width = 0;
    this._height = 1;
    
    let visibleCharFound = false;
    let textIdx = 0;
    if (text[0] === '\n') {
      // Ignore the first character if it is a newline.
      textIdx = 1;
    }
    this._rowIndices.push(textIdx);
    this._firstVisibleChar.push(undefined);
    for (; textIdx < text.length; textIdx ++) {
      if (text[textIdx] === '\n') {
        if (textIdx - this._rowIndices[this._rowIndices.length - 1] > this._width) {
          this._width = Math.max(this._width, textIdx - this._rowIndices[this._rowIndices.length - 1]);
        }
        this._rowIndices.push(textIdx + 1);
        this._firstVisibleChar.push(undefined);
        visibleCharFound = false;
      } else if (!visibleCharFound && text[textIdx] !== ' ') {
        visibleCharFound = true;
        this._firstVisibleChar[this._firstVisibleChar.length - 1] = textIdx;
      }
      // TODO: Handle any other bad characters (\t, \b, etc.)
      if (textIdx > 1 && text[textIdx - 1] === '\n') {
        this._height ++;
      }
    }

    if (text.charAt(text.length - 1) !== '\n') {
      this._width = Math.max(this._width, text.length - this._rowIndices[this._rowIndices.length - 1]);
      this._rowIndices.push(text.length + 1);
    } else {
      this._rowIndices.push(text.length);
    }
    
    // All characters in this set are replaced with a blank space when being drawn.
    // These characters are not transparent.
    this._setAsBlank = "";
    this._setAsBlankRegexp = null;
    // By default, all spaces (in the string) are transparent, 
    // i.e. they take the formatting of the sprite behind them.
    this._spaceIsTransparent = true;
    // By default, leading spaces in each line are ignored.
    this._ignoreLeadingSpaces = true;
    // If ignoreLeadingSpaces is true but spaceIsTransparent is false, leading spaces are still ignored.
    // i.e. ignoreLeadingSpaces takes precedence. 
    this._spaceHasFormatting = false;
    
    if ("setAsBlank" in settings) {
      this._setAsBlank = settings.setAsBlank;
    }
    this._setAsBlankRegexp = new RegExp("[" + this._setAsBlank + "]", "g");
    
    if ("spaceIsTransparent" in settings) {
      this._spaceIsTransparent = settings.spaceIsTransparent;
    }
    
    if ("ignoreLeadingSpaces" in settings) {
      this._ignoreLeadingSpaces = settings.ignoreLeadingSpaces;
    }

    if ("spaceHasFormatting" in settings) {
      this._spaceHasFormatting = settings.spaceHasFormatting;
    }
    
    Object.freeze(this);
  }
  
  get text() {
    return this._text;
  }
  
  get width() {
    return this._width;
  }
  
  get height() {
    return this._height;
  }
  
  /**
   * Returns a set containing the characters that should be replaced with a space.
   */
  get setAsBlank() {
    return this._setAsBlank;
  }
  
  get spaceIsTransparent() {
    return this._spaceIsTransparent;
  }
  
  get ignoreLeadingSpaces() {
    return this._ignoreLeadingSpaces;
  }
  
  get spaceHasFormatting() {
    return this._spaceHasFormatting;
  }

  /**
   * Returns the character at the specified location.
   * If the location is invalid or transparent, returns the empty string.
   * 
   * Otherwise, returns the character to display (space if the character is in setAsBlank)
   */
  charAt(x, y) {
    // TODO: Verify values. (Integers)
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return "";
    }
    
    let rowStart = this._rowIndices[y];
    if (rowStart === undefined) {
      return "";
    }
    let nextRow = this._rowIndices[y + 1];
    if (x + rowStart + 1 >= nextRow) {
      return "";
    }
    
    if (this.ignoreLeadingSpaces && x + rowStart < this._firstVisibleChar[y]) {
      // Leading space, and should ignore.
      return "";
    }
    
    let c = this.text[rowStart + x];
    if (this.spaceIsTransparent && c === " ") {
      return "";
    }
    return this.text[rowStart + x];
  }

  /**
   * Computes the length of the segment starting at the the specified location.
   * 
   * If the starting character is not visible, returns 0.
   * 
   * TODO: Cache this data?
   */
  segmentLengthAt(x, y) {
    // TODO: Store this data?
    let initialChar = this.charAt(x, y);
    if (initialChar.length === 0) {
      return 0;
    }
    // The above check guarantees that either x is past the leading spaces, 
    // or leading spaces aren't ignored.
    const rowStart = this._rowIndices[y];
    const strStart = rowStart + x;
    while (rowStart + x + 1 < this._rowIndices[y + 1]) {
      x ++;
      let c = this.text[rowStart + x];
      
      if (c === '\n') {
        break;
      } else if (c === ' ' && this.spaceIsTransparent) {
        break;
      } // TODO: Any other conditions?
    }
    return rowStart + x - strStart;
  }

  /**
   * Returns a substring of the row starting at the specified location.
   * Stops when it encounters a non-visible character (and spaceIsTransparent), or a new line.
   * 
   * If the starting character is not visible, returns an empty string.
   * 
   * maxLength specifies the maximum length of the returned string.
   * Used if caller wants a shorter string.
   */
  segmentAt(x, y, maxLength) {
    // TODO: Store this data?
    const rowStart = this._rowIndices[y];
    let strLength = this.segmentLengthAt(x, y);
    strLength = (maxLength && maxLength < strLength) ? maxLength : strLength;
    let rawString = this.text.substring(rowStart + x, rowStart + x + strLength);
    // Note: This solution SHOULD work even if setAsBlank is the empty string.
    return rawString.replace(this._setAsBlankRegexp, " ");
  }
}

Sprite.RENDER_LEVELS = {
  
}
