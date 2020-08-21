var AsciiGL = (function () {
  'use strict';

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
  class Sprite {
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

  class SpriteStyle {
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
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    cursor: "default",
  };

  SpriteStyle.setDefaultStyle = function(styleName, value) {
    if (styleName in SpriteStyle.defaultValues) {
      // TODO: Verify value.
      SpriteStyle.defaultValues[styleName] = value;
    } else {
      console.warn("SpriteStyle does not support", styleName);
    }
  };

  class SpriteBuilder {
    /**
     * A template to create sprites (usually for text)
     * 
     * @param {Array} templateArray An array of strings.
     */
    constructor(templateArray) {
      this._template = templateArray;
      this._paramCount = templateArray.length - 1;
    }
    
    construct(paramArray) {
      // TODO: Optimize.
      let result = "";
      for (let i = 0; i < this._template.length; i ++) {
        result += this._template[i];
        if (i < this._paramCount) {
          result += paramArray[i];
        }
      }
      return new Sprite(result);
    }
  }

  class DOMBuffer {
    constructor() {
      this.primaryElement = document.createElement("pre");
      this._width = 0;
      this._height = 0;
      
      this.activeRowLength = [];
      
      this.rows = [];
      this.elements = [];
      
      this.primaryElement.style.margin = "0";
    }
    
    init(width, height) {
      this._width = width;
      this._height = height;
      
      for (let y = 0; y < height; y ++) {
        let rowElement = document.createElement("div");
        rowElement.dataset.asciiGlRow = y;
        
        this.primaryElement.appendChild(rowElement);
        this.rows.push(rowElement);
        this.elements.push([]);
        this.activeRowLength.push(0);
        for (let x = 0; x < width; x ++) {
          this.elements[y].push(document.createElement("span"));
        }
      }
    }
    
    get width() {
      return this._width;
    }
    
    get height() {
      return this._height;
    }
    
    getDomElement() {
      return this.primaryElement;
    }
    
    /**
     * Causes the number of span elements attached to a row to change.
     */
    setRowLength(row, length) {
      if (length < this.activeRowLength[row]) {
        for (let x = this.activeRowLength[row] - 1; x >= length; x --) {
          this.rows[row].removeChild(this.elements[row][x]);
        }
      } else if (length > this.activeRowLength[row]) {
        for (let x = this.activeRowLength[row]; x < length; x ++) {
          this.rows[row].appendChild(this.elements[row][x]);
        }
      }
      this.activeRowLength[row] = length;
    }
    
    bind(drawBuffer) {
      for (let y = 0; y < this.height; y ++) {
        let x = 0;
        let cellsUsed = 0;
        while (x < this.width) {
          let domElement = this.elements[y][cellsUsed];
          
          let segmentLength = drawBuffer.getSegmentLengthAt(x, y);
          let frontTextId = drawBuffer.getSpriteIdAt(x, y);
          let text = undefined;
          if (frontTextId === undefined) {
            text = " ".repeat(segmentLength);
          } else {
            text = drawBuffer.sprites[frontTextId].segmentAt(
              x - drawBuffer.locations[frontTextId][0],
              y - drawBuffer.locations[frontTextId][1],
              segmentLength
            );
          }
          domElement.textContent = text;
          
          let style = drawBuffer.getStyleAt(x, y);
          if (!style.completed) {
            style.fillRemainder(drawBuffer.backgroundStyle);
          }
          for (let styleName of style) {
            domElement.style[styleName] = style.getStyle(styleName);
          }
          domElement.dataset.asciiGlId = style.front;

          cellsUsed ++;
          x += segmentLength;
        }
        
        this.setRowLength(y, cellsUsed);
      }
    }
  }

  // Only importing Sprite due to type checking in vs code...

  class DrawBuffer {
    constructor() {
      this._width = 0;
      this._height = 0;
      
      this.rowComputedData = [];
      this.sprites = {};
      this.locations = {};
      
      this.backgroundStyle = new SpriteStyle();
      this.backgroundStyle.fillRemainder();
    }
    
    init(width, height) {
      this._width = width;
      this._height = height;
      
      for (let y = 0; y < height; y ++) {
        this.rowComputedData.push(new RowSegmentBuffer(y, width));
      }
    }
    
    get width() {
      return this._width;
    }
    
    get height() {
      return this._height;
    }
    
    clear() {
      for (let y = 0; y < this.height; y ++) {
        this.rowComputedData[y].clear();
      }
      this.sprites = {};
      this.locations = {};
    }
    
    /**
     * 
     * @param {Sprite} sprite The sprite to draw
     * @param {Array<number>} location The position to draw at
     * @param {SpriteStyle} style The corresponding style
     * @param {string} id The unique id associated with the draw
     */
    draw(sprite, location, style, id) {
      for (let segment of sprite.getItScreenPos(location[0], location[1], 0, 0, this.width, this.height)) {
        let y = segment.y;
        this.rowComputedData[y].loadSegment(segment.length, segment.x, style, location[2], id, segment.visibleText);
      }
      
      this.sprites[id] = sprite;
      this.locations[id] = location;
    }
    
    getStyleAt(x, y) {
      return this.rowComputedData[y].getStyleAt(x);
    }
    
    getSegmentLengthAt(x, y) {
      return this.rowComputedData[y].getSegmentLengthAt(x);
    }

    getSpriteIdAt(x, y) {
      return this.rowComputedData[y].getSpriteIdAt(x);
    }
  }

  class RowSegmentBuffer {
    constructor(rowNumber, width) {
      this._width = width;
      this._rowNumber = rowNumber;
      
      this._textIds = new Array(width);
      this._textPriority = new Array(width);
      this._computedStyles = new Array(width);
      this._nextPointer = new Array(width);
      
      for (let i = 0; i < this.width; i++) {
        this._textIds[i] = undefined;
        this._textPriority[i] = Number.POSITIVE_INFINITY;
        this._computedStyles[i] = new ComputedStyle();
        this._nextPointer[i] = -1;
      }
      this._nextPointer[0] = this.width;
    }
    
    clear() {
      // Don't actually need to clear the old data.
      for (let i = 1; i < this.width; i ++) {
        this._nextPointer[i] = -1;
      }
      this._nextPointer[0] = this.width;
      this._computedStyles[0].clear();
      this._textIds[0] = undefined;
      this._textPriority[0] = Number.POSITIVE_INFINITY;
    }
    
    get row() {
      return this._rowNumber;
    }
    
    get width() {
      return this._width;
    }
    
    insertSegmentStart(startX) {
      if (this._nextPointer[startX] === -1) {
        // If it's not a segment start point already,
        // Find the previous segment and copy it.
        this._computedStyles[startX].clear();
        this._textIds[startX] = undefined;
        let prevActiveStyle = startX - 1;
        while (this._nextPointer[prevActiveStyle] === -1) {
          prevActiveStyle --;
        }
        this._nextPointer[startX] = this._nextPointer[prevActiveStyle];
        this._nextPointer[prevActiveStyle] = startX;
        this._computedStyles[startX].copy(this._computedStyles[prevActiveStyle]);
        this._textIds[startX] = this._textIds[prevActiveStyle];
        this._textPriority[startX] = this._textPriority[prevActiveStyle];
      }
    }
    
    loadSegment(segmentLength, startX, style, priority, id, visibleText) {
      let endX = startX + segmentLength;

      this.insertSegmentStart(startX);
      this.insertSegmentStart(endX);
      
      let currPointer = startX;
      do {
        this._computedStyles[currPointer].addStyle(style, priority, id);
        if (visibleText && this._textPriority[currPointer] > priority) {
          this._textIds[currPointer] = id;
          this._textPriority[currPointer] = priority;
        } else if (!visibleText) {
          visibleText = false;
        }
        currPointer = this._nextPointer[currPointer];
      }
      while (currPointer < this.width && currPointer < endX);
    }
    
    getStyleAt(x) {
      while(this._nextPointer[x] === -1) {
        x --;
      }
      return this._computedStyles[x];
    }
    
    getSegmentLengthAt(x) {
      let prevActive = x;
      while(this._nextPointer[prevActive] === -1) {
        prevActive --;
      }
      return this._nextPointer[prevActive] - x;
    }

    getSpriteIdAt(x) {
      while (this._nextPointer[x] === -1) {
        x--;
      }
      return this._textIds[x];
    }
  }

  class ComputedStyle extends SpriteStyle {
    /**
     * A helper class to manage the resulting style.
     */
    constructor() {
      super();
      this._priorities = {};
      this._highestPriority = Number.POSITIVE_INFINITY;
      this._frontId = null;
      this.clear();
    }
    
    copy(other) {
      for (let styleName in SpriteStyle.defaultValues) {
        this._styles[styleName] = other._styles[styleName];
        this._priorities[styleName] = other._priorities[styleName];
      }
      this._frontId = other._frontId;
      this._highestPriority = other._highestPriority;
    }
    
    clear() {
      for (let styleName in SpriteStyle.defaultValues) {
        this._styles[styleName] = null;
        this._priorities[styleName] = Number.POSITIVE_INFINITY;
      }
      this._highestPriority = Number.POSITIVE_INFINITY;
      this._frontId = null;
    }
    
    get completed() {
      for (let styleName in SpriteStyle.defaultValues) {
        if (this._styles[styleName] === null) {
          return false;
        }
      }
      return true;
    }
    
    get front() {
      return this._frontId;
    }
    
    /**
     * Adds a new style at the specified priority.
     */
    addStyle(style, priority, id) {
      for (let styleName of style) {
        if (this._priorities[styleName] > priority) {
          this.setStyle(styleName, style.getStyle(styleName));
          this._priorities[styleName] = priority;
        }
      }
      if (priority < this._highestPriority) {
        this._highestPriority = priority;
        this._frontId = id;
      }
    }
    
    sameAs(other) {
      return super.sameAs(other) && this.front === other.front;
    }
  }

  const Functions = {
    generateId: (function() {
      let currId = 0;
      
      return function(name) {
        if (name === undefined) {
          name = "AsciiEngine";
        }
        currId ++;
        return name + "_" + currId;
      }
    })(),
    clamp: function(num, min, max) {
      return Math.max(min, Math.min(num, max));
    }
  };

  Object.freeze(Functions);

  class AsciiGLInstance {
    /**
     * Creates a new AsciiGL instance and attaches it to a div and prepares it for use.
     */
    constructor(containerId) {
      console.assert(containerId, "AsciiGL constructor requires a valid HTML element id parameter.");
      let outerContainer = document.getElementById(containerId);
      console.assert(outerContainer, "AsciiGL constructor parameter containerId does not correspond to a valid HTML element.");
      console.assert(
        (outerContainer.tagName === "DIV"),
        "Container element must be a DIV"
      );
      
      while (outerContainer.lastChild) {
        outerContainer.removeChild(outerContainer.lastChild);
      }
      
      outerContainer.style.textAlign = "center";
      
      let container = document.createElement("DIV");
      
      container.style.display = "inline-block";
      container.style.fontFamily = "Courier New";
      container.style.fontSize = "1em";
      container.style.userSelect = "none";
      container.style.margin = "0";
      
      outerContainer.appendChild(container);
      
      this._container = container;
      
      // Have two so that only one is modified at any given time.
      // TODO: Later, do more testing on using 2 DOMBuffers.
      this._domBuffer = new DOMBuffer();
      // For now, just use simple objects to hold.
      this._nameBuffers = [{}, {}];
      this._drawBufferIdx = 0;
      this._activeBufferIdx = 1;
      
      this._width = 0;
      this._height = 0;
      
      this._drawBuffer = new DrawBuffer();
      
      this._currMouseOver = undefined;
      this._handler = () => {};
    }
    
    /**
     * Initializes the pre element for rendering.
     */
    init(width, height) {
      console.assert(width > 0 && height > 0, "AsciiGL must have positive dimensions.");
      
      this._width = width;
      this._height = height;
      
      this._drawBuffer.init(width, height);

      this._domBuffer.init(width, height);
      this._nameBuffers[0] = {};
      this._nameBuffers[1] = {};
      
      this._container.appendChild(this._domBuffer.getDomElement());
      
      this._setupEventListeners();
      this.render();
    }
    
    /**
     * A helper method to set up event listeners on the container.
     */
    _setupEventListeners() {
      // See below for list of event types:
      // https://www.w3schools.com/jsref/obj_mouseevent.asp
      this._container.addEventListener("mouseenter", (event) => {
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
        this._handler(event, "mouseentercanvas", undefined, mouseCoords);
        let target = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
        this._currMouseOver = target;
        if (target) {
          this._handler(event, "mouseenter", this._currMouseOver, mouseCoords);
        }
      });
      
      this._container.addEventListener("mouseleave", (event) => {
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
        // This should partially alleviate glitches where mousemove isn't triggered after the mouse leaves the canvas.
        if (this._currMouseOver) {
          this._handler(event, "mouseleave", this._currMouseOver, mouseCoords);
        }
        this._currMouseOver = undefined;
        this._handler(event, "mouseleavecanvas", undefined, mouseCoords);
      });

      this._container.addEventListener("mousemove", (event) => {
        let target = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);

        if (target !== this._currMouseOver) {
          if (this._currMouseOver) {
            this._handler(event, "mouseleave", this._currMouseOver, mouseCoords);
          }
          this._currMouseOver = target;
          if (target) {
            this._handler(event, "mouseenter", this._currMouseOver,  mouseCoords);
          }
        }
        this._handler(event, "mousemove", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
      });

      this._container.addEventListener("mousedown", (event) => {
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
        this._handler(event, "mousedown", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
      });
      
      this._container.addEventListener("mouseup", (event) => {
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
        this._handler(event, "mouseup", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
      });
      
      this._container.addEventListener("click", (event) => {
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
        this._handler(event, "click", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
      });
      
      this._container.addEventListener("contextmenu", (event) => {
        // TODO: Perhaps let user customize behavior?
        event.preventDefault();
        let mouseCoords = this.mousePositionToCoordinates(event.clientX, event.clientY);
        this._handler(event, "contextmenu", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId], mouseCoords);
      });
    }
    
    /**
     * Converts mouse position viewport coordinates into asciiengine coordinates.
     */
    mousePositionToCoordinates(mouseX, mouseY) {
      // TODO: Find a more efficient method.
      let bounds = this._container.getBoundingClientRect();
      
      let x = Math.floor((mouseX - bounds.x) * this.width / bounds.width);
      let y = Math.floor((mouseY - bounds.y) * this.height / bounds.height);
      return {x: x, y: y}
    }
    
    _flipBuffers() {
      this._drawBufferIdx = 1 - this._drawBufferIdx;
      this._activeBufferIdx = 1 - this._activeBufferIdx;
    }
    
    get width() {
      return this._width;
    }
    
    get height() {
      return this._height;
    }
    
    get backgroundStyles() {
      return this._drawBuffer.backgroundStyle;
    }
    
    getBackgroundStyle(styleName) {
      return this._drawBuffer.backgroundStyle.getStyle(styleName);
    }
    
    setBackgroundStyle(styleName, value) {
      this._drawBuffer.backgroundStyle.setStyle(styleName, value);
    }
    
    /**
     * Set by user code. handlerFunc is called when an AsciiGL mouse event occurs. 
     * 
     * handlerFunc takes in (event, target, type, coords).
     * event is the original MouseEvent object that triggered the AsiiGL event.
     * type is the name of the triggered event, with respect to AsciiGL.
     * target is the name of the element which the event was triggered on (may be undefined)
     * coords is the coordinate of the character that the mouse is currently over.
     * 
     * The type parameter does not necessarily correspond to the type of MouseEvent.
     * AsciiGL currently reports the current events:
     * 
     * mousemove: Mouse is in the AsciiGL canvas, and has moved.
     *  The coordinates of the mouse are in the MouseEvent object. 
     * mouseenter: Mouse entered the space belonging to a new target
     * mouseleave: Mouse leaves the space belonging to the current target
     * mouseentercanvas: Mouse enters the AsciiGL canvas
     * mouseleavecanvas: Mouse leaves the AsciiGL canvas
     * mousedown: Mouse button is pressed in the AsciiGL canvas
     * mouseup: Mousebutton is released in the AsciiGL canvas
     * click: A click event was registered in the AsciiGL canvas
     * 
     */
    setHandler(handlerFunc) {
      this._handler = handlerFunc;
    }
    
    /**
     * Draws a sprite onto the canvas. 
     * Must specify a location to draw to.
     * Style determines what the text looks like.
     * name is optional, and allows it to be referenced in event listeners.
     * Different sprites may share the same name.
     */
    draw(sprite, location, style, name) {
      let id = Functions.generateId(name);
      this._drawBuffer.draw(sprite, location, style, id);
      if (name) {
        this._nameBuffers[this._drawBufferIdx][id] = name;
      }
    }
    
    /**
     * Displays the current buffer and hides the displayed one.
     * 
     * All changes until the next call to flip will be on the other buffer. 
     */
    render() {
      this._domBuffer.bind(this._drawBuffer);
      // NOTE: Intitial tests suggest having only one buffer may be more optimal...
      // If so, move the appendChild line to init.
      // 
      // Clear the current elements and attach new ones. 
      // while (this._container.lastChild) {
      //   this._container.removeChild(this._container.lastChild);
      // }
      // this._container.appendChild(this._buffers[this._drawDOMBufferIdx].getDomElement());    
      //this._flipDomBuffers();
      this._drawBuffer.clear();
      this._nameBuffers[this._activeBufferIdx] = {};
      this._flipBuffers();
    }
  }

  const EventTypes = {
    MOUSE_ENTER_CANVAS: "mouseentercanvas",
    MOUSE_LEAVE_CANVAS: "mouseleavecanvas",
    MOUSE_ENTER: "mouseenter",
    MOUSE_LEAVE: "mouseleave",
    MOUSE_MOVE: "mousemove",
    MOUSE_ENTER: "mouseenter",
    MOUSE_DOWN: "mousedown",
    MOUSE_UP: "mouseup",
    CLICK: "click",
    CONTEXT_MENU: "contextmenu",
  };

  Object.freeze(EventTypes);


  const AsciiGL = {
    Instance: AsciiGLInstance,
    Sprite: Sprite,
    SpriteStyle: SpriteStyle,
    SpriteBuilder: SpriteBuilder,
    EventTypes: EventTypes,
  };

  Object.freeze(AsciiGL);

  return AsciiGL;

}());
