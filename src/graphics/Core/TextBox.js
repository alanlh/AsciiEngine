"use strict";
function TextBox(text, data) {
  LOGGING.PERFORMANCE.START("TextBox Constructor", 1);
  let self = this;
  
  let size = Vector2.createFrom(data.boundingBoxDimens);
  let shapedText = TextBox.shapeText(text, size);
  TextLayer.call(self, shapedText, {
    topLeftCoords: data.topLeftCoords,
    priority: data.priority,
    events: data.events,
    formatting: data.formattting
  });
  
  LOGGING.PERFORMANCE.STOP("TextBox Constructor");
}

TextBox.prototype = Object.create(TextLayer.prototype);
TextBox.prototype.constructor = TextBox;

// NOTE: Uses the TextLayer copy constructor.

// Given the input 'text', applies wrapping to make the wrapping 
TextBox.shapeText = function(text, dimens) {
  if (dimens.y < 1) {
    return "";
  }
  if (dimens.x < 1) {
    // Then simply use the input's format.
    return text;
  }
    
  let currPos = 0;
  for (; currPos < text.length; currPos ++) {
    if (text.charAt(currPos) === ' ' || text.charAt(currPos) === '\n') {
      break;
    }
  }
  
  let shapedText = text.substring(0, currPos);
  let lineCount = 1;
  let currentLineLength = shapedText.length;
  while (currPos < text.length) {
    let wordStart = currPos + 1;
    for(; wordStart < text.length; wordStart ++) {
      if (text.charAt(wordStart) === ' ' || text.charAt(wordStart) === '\n') {
        break;
      }
    }
    let wordLength = wordStart - currPos - 1;
    if (text.charAt(currPos) == '\n' || currentLineLength + wordLength + 1 > dimens.x) {
      if (lineCount >= dimens.y) {
        // Have met line count. Should not add new line.
        break;
      }
      shapedText += '\n';
      shapedText += text.substring(currPos + 1, wordStart);
      currentLineLength = wordLength;
      lineCount ++;
    } else if (text.charAt(currPos) == ' ') {
      shapedText += text.substring(currPos, wordStart);
      currentLineLength += wordLength + 1;
    } else {
      // TODO: Assert this shouldn't happen?
    }
    currPos = wordStart;
  }
  
  shapedText += '\n';
  
  return shapedText;
}
