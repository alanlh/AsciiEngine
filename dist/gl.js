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
     * Computes the length of the segment starting at the the specified location.
     * 
     * If the starting character has neither text nor formatting, returns 0.
     * 
     * TODO: REPLACE WITH METHOD THAT USES this._segments
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
          this.elements[y].push(new DOMCellWrapper());
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
          this.rows[row].removeChild(this.elements[row][x].getDomElement());
        }
      } else if (length > this.activeRowLength[row]) {
        for (let x = this.activeRowLength[row]; x < length; x ++) {
          this.rows[row].appendChild(this.elements[row][x].getDomElement());
        }
      }
      this.activeRowLength[row] = length;
    }
    
    bind(drawBuffer) {
      for (let y = 0; y < this.height; y ++) {
        let x = 0;
        let cellsUsed = 0;
        while (x < this.width) {
          let domElementWrapper = this.elements[y][cellsUsed];
          
          let segmentLength = drawBuffer.getSegmentLengthAt(x, y);
          let segmentData = drawBuffer.getSegmentAt(x, y);

          let frontTextId = segmentData.textId;
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
          domElementWrapper.setText(text);
          
          let style = segmentData.styles;
          for (let styleName in style) {
            domElementWrapper.setStyle(styleName, style[styleName]);
          }

          domElementWrapper.setId(segmentData.frontId);

          cellsUsed ++;
          x += segmentLength;
          domElementWrapper.applyChanges();
        }
        
        this.setRowLength(y, cellsUsed);
      }
    }
  }

  class DOMCellWrapper {
    constructor() {
      this._domElement = document.createElement("span");
      this._currText = "";
      this._currStyles = {};

      this._nextText = "";
      this._nextStyles = {};

      this._currId = "";
      this._nextId = "";
    }
    
    getDomElement() {
      return this._domElement;
    }

    setText(value) {
      this._nextText = value;
    }

    setStyle(styleName, value) {
      this._nextStyles[styleName] = value || "";
    }

    setId(value) {
      this._nextId = value;
    }

    applyChanges() {
      let domElement = this._domElement;
      if (this._nextText !== this._currText) {
        domElement.textContent = this._nextText;
      }
      this._currText = this._nextText;
      for (let styleName in this._nextStyles) {
        let styleValue = this._nextStyles[styleName];
        if (styleValue !== this._currStyles[styleName]) {
          domElement.style[styleName] = styleValue;
        }
        this._currStyles[styleName] = styleValue;
      }
      if (this._nextId !== this._currId) {
        domElement.dataset.asciiGlId = this._nextId;
      }
      this._currId = this._nextId;
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
        this.rowComputedData.push(new RowSegmentBuffer(y, width, this.backgroundStyle));
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
    
    getSegmentLengthAt(x, y) {
      return this.rowComputedData[y].getSegmentLengthAt(x);
    }

    getSegmentAt(x, y) {
      return this.rowComputedData[y].getSegmentAt(x);
    }
  }

  class RowSegmentBuffer {
    /**
     * 
     * @param {number} rowNumber The row number of this buffer
     * @param {number} width The width of the row
     * @param {SpriteStyle} defaultStyle A REFERENCE of the default style.
     */
    constructor(rowNumber, width, defaultStyle) {
      this._width = width;
      this._rowNumber = rowNumber;
      
      this._nextPointer = new Array(width);
      /** @type{Array<ComputedSegmentData>} */
      this._computedSegments = new Array(width);

      for (let i = 0; i < this.width; i++) {
        this._computedSegments[i] = new ComputedSegmentData(defaultStyle);
        this._nextPointer[i] = -1;
      }
      this._nextPointer[0] = this.width;
    }
    
    clear() {
      // Don't actually need to clear the old data.
      for (let i = 1; i < this.width; i ++) {
        this._nextPointer[i] = -1;
      }
      this._computedSegments[0].clear();
      this._nextPointer[0] = this.width;
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
        this._computedSegments[startX].clear();
        let prevActiveStyle = startX - 1;
        while (this._nextPointer[prevActiveStyle] === -1) {
          prevActiveStyle --;
        }
        this._nextPointer[startX] = this._nextPointer[prevActiveStyle];
        this._nextPointer[prevActiveStyle] = startX;
        this._computedSegments[startX].copy(this._computedSegments[prevActiveStyle]);
      }
    }
    
    loadSegment(segmentLength, startX, style, priority, id, visibleText) {
      let endX = startX + segmentLength;

      this.insertSegmentStart(startX);
      this.insertSegmentStart(endX);
      
      let currPointer = startX;
      do {
        this._computedSegments[currPointer].addStyle(id, visibleText, style, priority);
        currPointer = this._nextPointer[currPointer];
      }
      while (currPointer < this.width && currPointer < endX);
    }
      
    getSegmentLengthAt(x) {
      let prevActive = x;
      while(this._nextPointer[prevActive] === -1) {
        prevActive --;
      }
      return this._nextPointer[prevActive] - x;
    }

    getSegmentAt(x) {
      // TODO: Is this loop necessary? DOMBuffer elements should perfectly correspond to segments.
      while (this._nextPointer[x] === -1) {
        x--;
      }
      return this._computedSegments[x];
    }
  }

  class ComputedSegmentData {
    /**
     * A helper class to manage the resulting style.
     */
    constructor(defaultStyle) {
      this._default = defaultStyle;

      this._spriteId = undefined;
      this._spritePriority = undefined;

      this._styleValues = {};
      this._stylePriorities = {};
      
      this._highestPriority = Number.POSITIVE_INFINITY;
      this._frontId = undefined;
      this.clear();

      Object.seal(this);
      Object.seal(this._styleValues);
      Object.seal(this._stylePriorities);
    }
    
    copy(other) {
      for (let styleName in SpriteStyle.defaultValues) {
        this._styleValues[styleName] = other._styleValues[styleName];
        this._stylePriorities[styleName] = other._stylePriorities[styleName];
      }
      this._spriteId = other._spriteId;
      this._spritePriority = other._spritePriority;

      this._highestPriority = other._highestPriority;
      this._frontId = other._frontId;
    }
    
    clear() {
      for (let styleName in SpriteStyle.defaultValues) {
        this._styleValues[styleName] = this._default.getStyle(styleName);
        this._stylePriorities[styleName] = Number.POSITIVE_INFINITY;
      }
      this._spriteId = undefined;
      this._spritePriority = Number.POSITIVE_INFINITY;

      this._highestPriority = Number.POSITIVE_INFINITY;
      this._frontId = undefined;
    }
      
    get frontId() {
      return this._frontId;
    }

    get textId() {
      return this._spriteId;
    }

    get styles() {
      return this._styleValues;
    }
    
    /**
     * Adds a new segment at the specified priority.
     * 
     * @param {string} segmentId 
     * @param {boolean} hasText 
     * @param {SpriteStyle} style 
     * @param {number} priority 
     */
    addStyle(segmentId, hasText, style, priority) {
      for (let styleName of style) {
        if (priority < this._stylePriorities[styleName]) {
          let styleValue = style.getStyle(styleName);
          if (styleValue !== undefined) {
            this._styleValues[styleName] = styleValue;
            this._stylePriorities[styleName] = priority;
          }
        }
      }
      if (hasText && priority < this._spritePriority) {
        this._spriteId = segmentId;
        this._spritePriority = priority;
      }
      if (priority < this._highestPriority) {
        this._highestPriority = priority;
        this._frontId = segmentId;
      }
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
