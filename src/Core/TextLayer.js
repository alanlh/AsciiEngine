"use strict";
function TextLayer(text, data) {
  LOGGING.PERFORMANCE.START("TextLayer Constructor");
  let self = this;
  LOGGING.ASSERT(data, "TextLayer constructor parameter 'data' is missing or invalid.");
  LOGGING.ASSERT(text, "TextLayer constructor parameter 'text' is missing or invalid.");
  // TODO: Check that text is string

  let textShapeData = TextLayer.parseTextShape(text);
  LOGGING.DEBUG("TextLayer constructor value textShape: ", textShapeData);
  // TODO: Verify boundingBoxDimens, topLeftCoords
  BaseLayer.call(this, {
    boundingBoxDimens: textShapeData.boundingBoxDimens,
    topLeftCoords: data.topLeftCoords,
    priority: data.priority,
    events: data.events,
    formatting: data.formatting
  });

  // TODO: Verify that string itself cannot be modified. 
  Object.defineProperty(this, "text", {
    value: textShapeData.text
  });

  // NOTE: Not sure if this should be public or not, even though it can't be changed. 
  Object.defineProperty(this, "rowIndices", {
    value: textShapeData.rowIndices
  });
  
  // TODO: Verify data.setAsBlank
  Object.defineProperty(this, "setAsBlank", {
    value: data.setAsBlank || false
  });
  
  // TODO: Verify data.spaceHasFormatting
  Object.defineProperty(this, "spaceHasFormatting", {
    value: !(data.spaceHasFormatting === undefined || !data.spaceHasFormatting)
  });
  
  // TODO: Verify data.spaceIsTransparent
  Object.defineProperty(this, "spaceIsTransparent", {
    value: data.spaceIsTransparent === undefined || data.spaceIsTransparent
  });
  
  // TODO: Verify data.leadingSpaceIgnored
  Object.defineProperty(this, "leadingSpaceIgnored", {
    value: data.leadingSpaceIgnored === undefined || data.leadingSpaceIgnored
  });

  this.copy = function() {
    // TODO: Improve 
    return new TextLayer(self.text, {
      topLeftCoords: self.topLeftCoords,
      priority: self.priority,
      events: this.events,
      setAsBlank: self.setAsBlank,
      spaceIsTransparent: self.spaceIsTransparent,
      spaceHasFormatting: self.spaceHasFormatting,
      leadingSpaceIgnored: self.leadingSpaceIgnored,
      formatting: self.formatting
    });
  }
  
  LOGGING.PERFORMANCE.STOP("TextLayer Constructor");
}

TextLayer.prototype = Object.create(BaseLayer.prototype);
TextLayer.prototype.constructor = TextLayer;

TextLayer.parseTextShape = function(text) {
  // TODO: Remove bad characters in text
  let rowIndices = [0];
  let width = 0;
  let height = 1;
  // Ignore first character 
  for (let i = 0; i < text.length; i ++) {
    if (text.charAt(i) === '\n') {
      if (i - rowIndices[rowIndices.length - 1] > width) {
        width = Math.max(width, i - rowIndices[rowIndices.length - 1]);
      }
      rowIndices.push(i + 1);
    }
    if (i > 0 && text.charAt(i - 1) === '\n') {
      height ++;
    }
  }

  if (text.charAt(text.length - 1) !== '\n') {
    width = Math.max(width, text.length - rowIndices[rowIndices.length - 1]);
  }
  rowIndices.push(text.length + 1);
  
  Object.freeze(rowIndices);
  
  return {
    text: text,
    boundingBoxDimens: Vector2.create(width, height),
    rowIndices: rowIndices
  }
}

TextLayer.prototype.getCharAt = function(vec2) {
  LOGGING.ASSERT(Vector2.verifyInteger(vec2), "ContainerLayer getCharAt of instance", self.id, " is not Vector2-like: ", vec2);
  let x = vec2.x || 0;
  let y = vec2.y || 0;
  LOGGING.ASSERT(x < this.boundingBoxDimens.x && x >= 0,
    "TextLayer.getCharAt received input coordinate x which is outside of the bounding box. ",
    "Bounding Box Dimens: ", this.boundingBoxDimens, " ",
    "x: ", x
  );
  LOGGING.ASSERT(y < this.boundingBoxDimens.y && y >= 0,
    "TextLayer.getCharAt received input coordinate y which is outside of the bounding box. ",
    "Bounding Box Dimens: ", this.boundingBoxDimens, " ",
    "y: ", y
  );
  let rowStart = this.rowIndices[y];
  let nextRow = rowIndices[y + 1];
  if (x + rowStart + 1 >= nextRow) {
    // Empty coordinates. Not wrong given bounding box, but no characters. 
    LOGGING.DEBUG("TextLayer.getCharAt: Empty coordinates.");
    return false;
  }

  return this.text.charAt(rowStart + x);
}

TextLayer.prototype.isOpaqueChar = function (c) {
  // TODO: Handle leading space ignored. 
  return !(c === ' ' && this.spaceIsTransparent);
}

TextLayer.prototype.hasFormatting = function(c) {
  return c !== ' ' || (!this.spaceIsTransparent && this.spaceHasFormatting);
}

// Returns a PixelData starting at the coordinates given.
TextLayer.prototype.getPixelDataAt = function(vec2) {
  LOGGING.DEBUG("TextLayer.getPixelDataAt called with parameter vec2: ", vec2);
  let x = vec2.x || 0;
  let y = vec2.y || 0;
  LOGGING.ASSERT(x < this.boundingBoxDimens.x && x >= 0,
    "TextLayer.getPixelDataAt received input coordinate x which is outside of the bounding box. ",
    "Bounding Box Dimens: ", this.boundingBoxDimens, " ",
    "x: ", x
  );
  LOGGING.ASSERT(y < this.boundingBoxDimens.y && y >= 0,
    "TextLayer.getPixelDataAt received input coordinate y which is outside of the bounding box. ",
    "Bounding Box Dimens: ", this.boundingBoxDimens, " ",
    "y: ", y
  );
  let rowStart = this.rowIndices[y];
  let nextRow = this.rowIndices[y + 1];
  if (x + rowStart + 1 >= nextRow) {
    // Empty coordinates. Not wrong given bounding box, but no characters. 
    LOGGING.DEBUG("TextLayer.getPixelDataAt: Empty coordinates.");
    return PixelData.Empty;
  }
  let startPos = rowStart + x;
  let startChar = this.text.charAt(startPos);
  if (!this.isOpaqueChar(startChar)) {
    LOGGING.DEBUG("TextLayer.getPixelDataAt: Found transparent char: ", startChar, ".");
    return PixelData.Empty;
  }

  let startCharHasFormatting = this.hasFormatting(startChar);
  let endPos = startPos;
  let currText = "";
  for (; endPos + 1 < nextRow; endPos ++) {
    if (!this.isOpaqueChar(this.text.charAt(endPos))
      || (this.hasFormatting(this.text.charAt(endPos)) !== startCharHasFormatting)
    ) {
      // This char has different formatting from startChar. Must end PixelData at this point.
      break;
    }
    // TODO: Check if c is in this.setAsBlank
    if (this.text.charAt(endPos) === this.setAsBlank) {
      currText += this.text.substring(startPos, endPos);
      currText += " ";
      startPos = endPos + 1;
    }
  }
  currText += this.text.substring(startPos, endPos);
  if (startCharHasFormatting) {
    LOGGING.DEBUG("TextLayer.getPixelDataAt: Returning PixelData with formatting and text block: ", currText);
    return new PixelData({
      text: currText,
      formatting: this[FormattingModule.type],
      events: this[EventModule.type],
      id: this.id
    });
  } else {
    LOGGING.DEBUG("TextLayer.getPixelDataAt: Returning PixelData without formatting and text block: ", currText);
    return new PixelData({
      text: currText,
      id: this.id
    });
  }

  LOGGING.WARN("TextLayer.getPixelDataAt: Returning default.");
  return PixelData.Empty;
}