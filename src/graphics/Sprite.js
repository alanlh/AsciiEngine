/**
 * @typedef {{
 * setAsBlank?: string,
 * spaceIsTransparent?: boolean,
 * ignoreLeadingSpaces?: boolean,
 * spaceHasFormatting?: boolean,
 * }} SpriteSettings
 * 
 *
 * @typedef {{
 * x: number,
 * y: number,
 * length: number,
 * visibleText: boolean,
 * }} SegmentData
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
    /** 
     * @type {Array<number>} 
     * @private
     */
    this._rowIndices = [];
    /**
     * @type {Array<number>}
     * @private
     */
    this._firstVisibleChar = [];
    /**
     * @private
     */
    this._width = 0;
    /**
     * @private
     */
    this._height = 1;
    /** 
     * @type {Array<Array<SegmentData>>}
     * @private 
     */
    this._segments = undefined;

    // All characters in this set are replaced with a blank space when being drawn.
    // These characters are not transparent.
    /**
     * @private
     */
    this._setAsBlank = "";
    /**
     * @private
     */
    this._setAsBlankRegexp = null;
    // By default, all spaces (in the string) are transparent, 
    // i.e. they take the formatting of the sprite behind them.
    /**
     * @private
     */
    this._spaceIsTransparent = true;
    // By default, leading spaces in each line are ignored.
    /**
     * @private
     */
    this._ignoreLeadingSpaces = true;
    // If ignoreLeadingSpaces is true but spaceIsTransparent is false, leading spaces are still ignored.
    // i.e. ignoreLeadingSpaces takes precedence. 
    /**
     * @private
     */
    this._spaceHasFormatting = false;

    if ("setAsBlank" in settings) {
      this._setAsBlank = settings.setAsBlank;
    }
    this._setAsBlankRegexp = new RegExp("[" + this._setAsBlank + "]", "g");
    /**
     * @private
     */
    this._processedText = this._text.replace(this._setAsBlankRegexp, " ");

    if ("spaceIsTransparent" in settings) {
      this._spaceIsTransparent = settings.spaceIsTransparent;
    }

    if ("ignoreLeadingSpaces" in settings) {
      this._ignoreLeadingSpaces = settings.ignoreLeadingSpaces;
    }

    if ("spaceHasFormatting" in settings) {
      this._spaceHasFormatting = settings.spaceHasFormatting;
    }

    this._parseSpriteShape();

    /** Parse and store segment data */
    this._parseSegmentData();
    Object.freeze(this);
  }

  /**
   * @private
   */
  _parseSpriteShape() {
    let visibleCharFound = false;
    let textIdx = 0;
    if (this.text[0] === '\n') {
      // Ignore the first character if it is a newline.
      textIdx = 1;
    }
    this._rowIndices.push(textIdx);
    this._firstVisibleChar.push(this.ignoreLeadingSpaces ? undefined : textIdx);
    for (; textIdx < this.text.length; textIdx++) {
      if (this.text[textIdx] === '\n') {
        if (textIdx - this._rowIndices[this._rowIndices.length - 1] > this._width) {
          this._width = Math.max(this._width, textIdx - this._rowIndices[this._rowIndices.length - 1]);
        }
        this._rowIndices.push(textIdx + 1);
        this._firstVisibleChar.push(this.ignoreLeadingSpaces ? undefined : textIdx);
        visibleCharFound = false;
      } else if (!visibleCharFound && this.text[textIdx] !== ' ') {
        visibleCharFound = true;
        this._firstVisibleChar[this._firstVisibleChar.length - 1] = textIdx;
      }
      // TODO: Handle any other bad characters (\t, \b, etc.)
      if (textIdx > 1 && this.text[textIdx - 1] === '\n') {
        this._height++;
      }
    }
    if (this.text.charAt(this.text.length - 1) !== '\n') {
      this._width = Math.max(
        this._width,
        this.text.length - this._rowIndices[this._rowIndices.length - 1]
      );
      this._rowIndices.push(this.text.length + 1);
    } else {
      this._rowIndices.push(this.text.length);
    }

  }

  /**
   * @private
   */
  _parseSegmentData() {
    this._segments = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      this._segments[y] = [];

      let rowStart = this._rowIndices[y];
      let rowEnd = this._rowIndices[y + 1] - 1; // Subtract 1 because last character is a new line.
      let rowLength = rowEnd - rowStart;

      let firstUsedX = this.ignoreLeadingSpaces ? this._firstVisibleChar[y] - rowStart : 0;
      let x = firstUsedX;
      let currSegmentStart = x;
      let currSegmentState = SegmentState.BLANK;
      while (x < rowLength) {
        let charIdx = rowStart + x;
        let char = this.text[charIdx];
        let charState = this._charState(char);
        if (charState !== currSegmentState) {
          this._addSegment(currSegmentStart, x, y, currSegmentState);
          currSegmentStart = x;
          currSegmentState = charState;
        }
        x++;
      }
      this._addSegment(currSegmentStart, x, y, currSegmentState);
    }
  }

  /**
   * 
   * @private
   * @param {number} startX 
   * @param {number} currX 
   * @param {number} y 
   * @param {SegmentState} state 
   */
  _addSegment(startX, currX, y, state) {
    if (state !== SegmentState.BLANK) {
      this._segments[y].push({
        x: startX,
        y: y,
        length: currX - startX,
        visibleText: state === SegmentState.HAS_TEXT,
      });
    }
  }

  /**
   * @returns {String} The original text within the Sprite
   */
  get text() {
    return this._text;
  }

  /**
   * @returns {number} The width of the Sprite
   */
  get width() {
    return this._width;
  }

  /**
   * @returns {number} The height of the Sprite
   */
  get height() {
    return this._height;
  }

  /**
   * @returns {string} The set of characters in the Sprite which will be rendered as blanks.
   */
  get setAsBlank() {
    return this._setAsBlank;
  }

  /**
   * @returns {boolean} Whether or not spaces are rendered in the Sprite
   */
  get spaceIsTransparent() {
    return this._spaceIsTransparent;
  }

  /**
   * @returns {boolean} Whether or not leading spaces are rendered
   */
  get ignoreLeadingSpaces() {
    return this._ignoreLeadingSpaces;
  }

  /**
   * @returns {boolean} Whether or not the associated Style is still rendered, if spaceIsTransparent is true
   */
  get spaceHasFormatting() {
    return this._spaceHasFormatting;
  }

  /**
   * Iterates over the segments of the Sprite
   * 
   * @param {number} left The leftmost allowed column in sprite coordinates
   * @param {number} right 
   * @param {number} top 
   * @param {number} bottom 
   * @yields {SegmentData} 
   */
  *getItSpritePos(left, right, top, bottom) {
    let minY = Math.max(top, 0);
    let maxY = Math.min(bottom, this.height);

    if (top >= this.height || bottom <= 0) {
      // The sprite is above or below the screen, respectively;
      return;
    }

    for (let y = minY; y < maxY; y++) {
      if (this._firstVisibleChar[y] === undefined) {
        continue;
      }
      let rowStart = this._rowIndices[y];
      let rowEnd = this._rowIndices[y + 1] - 1; // Subtract 1 because last character is a new line.
      let rowLength = rowEnd - rowStart;
      let firstUsedX = this.ignoreLeadingSpaces ? this._firstVisibleChar[y] - rowStart : 0;

      if (left >= rowLength || right <= firstUsedX) {
        // This row is to the right or left of the screen, respectively.
        continue;
      }

      for (let segment of this._segments[y]) {
        let segmentLeft = Math.max(segment.x, left);
        let segmentRight = Math.min(segment.x + segment.length, right);
        if (right <= segmentLeft) {
          break;
        }
        if (segmentRight <= left) {
          continue;
        }
        yield {
          x: segmentLeft,
          y: y,
          length: segmentRight - segmentLeft,
          visibleText: segment.visibleText,
        };
      }
    }
  }

  /**
   * 
   * @param {number} spriteX 
   * @param {number} spriteY 
   * @param {number} screenX 
   * @param {number} screenY 
   * @param {number} screenWidth 
   * @param {number} screenHeight 
   * 
   * @yields {SegmentData}
   */
  *getItScreenPos(spriteX, spriteY, screenX, screenY, screenWidth, screenHeight) {
    for (let segmentData of this.getItSpritePos(
      screenX - spriteX,
      screenX + screenWidth - spriteX,
      screenY - spriteY,
      screenY + screenHeight - spriteY)
    ) {
      segmentData.x += spriteX;
      segmentData.y += spriteY;
      yield segmentData;
    }
  }

  /**
   * @private
   * @param {string} c A string of length one
   */
  _charHasFormatting(c) {
    return c !== " " || !this.spaceIsTransparent || this.spaceHasFormatting;
  }

  /**
   * @private
   * @param {string} c
   * @returns {boolean}
   */
  _charHasText(c) {
    return c !== " " || !this.spaceIsTransparent;
  }

  /**
   * @private
   * @param {string} c 
   * @returns {boolean}
   */
  _charState(c) {
    return this._charHasText(c) ? SegmentState.HAS_TEXT :
      this._charHasFormatting(c) ? SegmentState.HAS_FORMATTING :
        SegmentState.BLANK;
  }

  /**
   * Computes the length of the segment starting at the the specified location.
   * 
   * If the starting character has neither text nor formatting, returns 0.
   * 
   * TODO: REPLACE WITH METHOD THAT USES this._segments
   * @deprecated
   */
  segmentLengthAt(x, y) {
    // TODO: Store this data?
    if (y < 0 || y >= this.height) {
      return 0;
    }
    if (x < 0 || x >= this.width) {
      return 0;
    }
    // TODO: Binary search?
    for (let segment of this._segments[y]) {
      if (segment.x + segment.length <= x) {
        continue;
      }
      if (x < segment.x) {
        return 0;
      }
      return segment.x + segment.length - x;
    }
    return 0;
  }

  /**
   * Returns a substring of the row starting at the specified location.
   * Stops when it encounters a non-visible character, or a new line.
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
    return this._processedText.substring(rowStart + x, rowStart + x + strLength);
  }
}

/**
 * @enum
 */
const SegmentState = {
  BLANK: 0,
  HAS_FORMATTING: 1,
  HAS_TEXT: 2,
};