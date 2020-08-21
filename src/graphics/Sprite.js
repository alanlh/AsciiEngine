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
    /** @type {Array<number>} */
    this._rowIndices = [];
    /** @type {Array<number>} */
    this._firstVisibleChar = [];
    this._width = 0;
    this._height = 1;
    /** @type {Array<Array<SegmentData>>} */
    this._segments = undefined;

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

    this._parseSpriteShape();

    /** Parse and store segment data */
    this._parseSegmentData();
    Object.freeze(this);
  }

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

  _charHasFormatting(c) {
    return c !== " " || !this.spaceIsTransparent || this.spaceHasFormatting;
  }

  _charHasText(c) {
    return c !== " " || !this.spaceIsTransparent;
  }

  _charState(c) {
    return this._charHasText(c) ? SegmentState.HAS_TEXT :
      this._charHasFormatting(c) ? SegmentState.HAS_FORMATTING :
        SegmentState.BLANK;
  }

  /**
   * Retrieves a substring from the sprite.
   * Does not do lengths checking to make sure the substring exists, is on the same line, or visible.
   * The retrieved section should only belong within a segment from getIt().
   * @param {number} x The x-coordinate of the first character
   * @param {number} y The y-coordinate of the first character
   * @param {number} length The length of the substring to retrieve
   * @returns {string}
   */
  substring(x, y, length) {
    let rawString = this.text.substr(this._rowIndices[y] + x, length);
    return rawString.replace(this._setAsBlankRegexp, " ");
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
   * If the starting character has neither text nor formatting, returns 0.
   * 
   * TODO: REPLACE WITH METHOD THAT USES this._segments
   */
  segmentLengthAt(x, y) {
    // TODO: Store this data?
    let rowStart = this._rowIndices[y];
    let rowEnd = this._rowIndices[y + 1] - 1;
    if (rowStart + x < this._firstVisibleChar[y]) {
      return 0;
    }
    let startState = this._charState(this.text[rowStart + x]);
    if (startState === SegmentState.BLANK) {
      return 0;
    }
    let startX = x;
    x++;
    while (rowStart + x < rowEnd) {
      let currState = this._charState(this.text[rowStart + x]);
      if (currState !== startState) {
        break;
      }
      x++;
    }
    return x - startX;
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
    let rawString = this.text.substring(rowStart + x, rowStart + x + strLength);
    // Note: This solution SHOULD work even if setAsBlank is the empty string.
    return rawString.replace(this._setAsBlankRegexp, " ");
  }
}

const SegmentState = {
  BLANK: 0,
  HAS_FORMATTING: 1,
  HAS_TEXT: 2,
};