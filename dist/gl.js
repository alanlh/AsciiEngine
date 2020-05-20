var AsciiGL = (function () {
  'use strict';

  class Sprite {
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
      let i = 0;
      if (text[0] === '\n') {
        // Ignore the first character if it is a newline.
        i = 1;
      }
      this._rowIndices.push(i);
      for (; i < text.length; i ++) {
        if (text[i] === '\n') {
          if (i - this._rowIndices[this._rowIndices.length - 1] > this._width) {
            this._width = Math.max(this._width, i - this._rowIndices[this._rowIndices.length - 1]);
          }
          this._rowIndices.push(i + 1);
          visibleCharFound = false;
        } else if (!visibleCharFound && text[i] !== ' ') {
          visibleCharFound = true;
          this._firstVisibleChar.push(i);
        }
        // TODO: Handle any other bad characters (\t, \b, etc.)
        if (i > 1 && text[i - 1] === '\n') {
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
        result += this._template.length;
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
    }
    
    init(width, height) {
      this._width = width;
      this._height = height;
      
      for (let y = 0; y < height; y ++) {
        let rowElement = document.createElement("div");
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
          let style = drawBuffer.getStyleAt(x, y);
          let front = style.front;
          let text = null;
          if (front === null) {
            text = " ".repeat(segmentLength);
          } else {
            text = drawBuffer.sprites[front].segmentAt(
              x - drawBuffer.locations[front][0],
              y - drawBuffer.locations[front][1],
              segmentLength
            );
          }
          domElement.textContent = text;
          domElement.dataset.asciiGlId = front;
          
          if (!style.completed) {
            style.fillRemainder(drawBuffer.backgroundStyle);
          }
          for (let styleName of style) {
            domElement.style[styleName] = style.getStyle(styleName);
          }
          
          cellsUsed ++;
          x += segmentLength;
        }
        
        this.setRowLength(y, cellsUsed);
      }
    }
  }

  class DrawBuffer {
    constructor() {
      this._width = 0;
      this._height = 0;
      
      this.computedStyles = [];
      this.sprites = {};
      this.locations = {};
      
      this.backgroundStyle = new SpriteStyle();
      this.backgroundStyle.fillRemainder();
    }
    
    init(width, height) {
      this._width = width;
      this._height = height;
      
      for (let y = 0; y < height; y ++) {
        this.computedStyles.push(new RowSegmentBuffer(y, width));
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
        this.computedStyles[y].clear();
      }
      this.sprites = {};
      this.locations = {};
    }
    
    draw(sprite, location, style, id) {
      let startX = Math.max(location[0], 0);
      let startY = Math.max(location[1], 0);
      let endX = Math.min(location[0] + sprite.width, this.width);
      let endY = Math.min(location[1] + sprite.height, this.height);
      
      for (let y = startY; y < endY; y ++) {
        let x = startX;
        while (x < endX) {
          let segmentLength = sprite.segmentLengthAt(x - location[0], y - location[1]);
          if (segmentLength > 0) {
            this.computedStyles[y].loadSegment(segmentLength, x, style, location[2], id);
            x += segmentLength;
          } else {
            x ++;
          }
        }
        // for (let x = startX; x < endX; x ++) {
        //   if (sprite.charAt(x - location[0], y - location[1]).length > 0) {
        //     this.computedStyles[y][x].addStyle(style, location[2], id);
        //   }
        // }
      }
      
      this.sprites[id] = sprite;
      this.locations[id] = location;
    }
    
    getStyleAt(x, y) {
      return this.computedStyles[y].getStyleAt(x);
    }
    
    getSegmentLengthAt(x, y) {
      return this.computedStyles[y].getSegmentLengthAt(x);
    }
  }

  class RowSegmentBuffer {
    constructor(rowNumber, width) {
      this._width = width;
      this._rowNumber = rowNumber;
      
      this._computedStyles = new Array(width);
      this._nextPointer = new Array(width);
      
      for (let i = 0; i < this.width; i ++) {
        this._computedStyles[i] = new ComputedStyle();
        this._nextPointer[i] = -1;
      }
      this._nextPointer[0] = this.width;
    }
    
    clear() {
      for (let i = 1; i < this.width; i ++) {
        this._nextPointer[i] = -1;
      }
      this._nextPointer[0] = this.width;
      this._computedStyles[0].clear();
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
        let prevActiveStyle = startX - 1;
        while (this._nextPointer[prevActiveStyle] === -1) {
          prevActiveStyle --;
        }
        this._nextPointer[startX] = this._nextPointer[prevActiveStyle];
        this._nextPointer[prevActiveStyle] = startX;
        this._computedStyles[startX].copy(this._computedStyles[prevActiveStyle]);
      }
    }
    
    loadSegment(segmentLength, startX, style, priority, id) {
      let endX = startX + segmentLength;

      this.insertSegmentStart(startX);
      this.insertSegmentStart(endX);
      
      this._computedStyles[startX].addStyle(style, priority, id);
      let currPointer = this._nextPointer[startX];
      while (currPointer < this.width && currPointer < endX) {
        this._computedStyles[currPointer].addStyle(style, priority, id);
        currPointer = this._nextPointer[currPointer];
      }
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
        this._handler(event, "mouseentercanvas");
        let target = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
        this._currMouseOver = target;
        if (target) {
          this._handler(event, "mouseenter", this._currMouseOver);
        }
      });
      
      this._container.addEventListener("mouseleave", (event) => {
        // This should partially alleviate glitches where mousemove isn't triggered after the mouse leaves the canvas.
        if (this._currMouseOver) {
          this._handler(event, "mouseleave", this._currMouseOver);
        }
        this._currMouseOver = undefined;
        this._handler(event, "mouseleavecanvas");
      });

      this._container.addEventListener("mousemove", (event) => {
        let target = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
        
        if (target !== this._currMouseOver) {
          if (this._currMouseOver) {
            this._handler(event, "mouseleave", this._currMouseOver);
          }
          this._currMouseOver = target;
          if (target) {
            this._handler(event, "mouseenter", this._currMouseOver);
          }
        }
        this._handler(event, "mousemove", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId]);
      });

      this._container.addEventListener("mousedown", (event) => {
        this._handler(event, "mousedown", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId]);
      });
      
      this._container.addEventListener("mouseup", (event) => {
        this._handler(event, "mouseup", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId]);
      });
      
      this._container.addEventListener("click", (event) => {
        this._handler(event, "click", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId]);
      });
      
      this._container.addEventListener("contextmenu", (event) => {
        // TODO: Perhaps let user customize behavior?
        event.preventDefault();
        this._handler(event, "contextmenu", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId]);
      });
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
     * handlerFunc takes in (event, target, type).
     * event is the original MouseEvent object that triggered the AsiiGL event.
     * type is the name of the triggered event, with respect to AsciiGL.
     * target is the name of the element which the event was triggered on (may be undefined)
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
