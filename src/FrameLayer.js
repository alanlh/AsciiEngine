function FrameLayer(textStr, options) {
  "use strict"
  let thisFrameLayer = this;
  let text_ = textStr;
  let width_ = 0;
  let height_ = 1;
  let rowIndices = [0];

  options = options || {};

  let coords = options.coords || {x: 0, y: 0};
  let x_ = coords.x || 0;
  let y_ = coords.y || 0;

  for (let i = 1; i < text_.length; i ++) {
    if (text_.charAt(i) === '\n') {
      if (i - rowIndices[rowIndices.length - 1] > width_) {
        width_ = Math.max(width_, i - rowIndices[rowIndices.length - 1]);
      }
      rowIndices.push(i + 1);
    }
    if (text_.charAt(i - 1) === '\n') {
      height_ ++;
    }
  }

  if (text_.charAt(text_.length - 1) !== '\n') {
    width_ = Math.max(width_, text_.length - rowIndices[rowIndices.length - 1]);
  }
  rowIndices.push(text_.length + 1);

  this.getCoords = function() {
    return {x: x_, y: y_};
  }

  this.getDimens = function() {
    return {width: width_, height: height_};
  }

  // Default settings must be completely filled out (set as default values if not)
  let multipleFormattingOptions = false;
  let formattingOptions_ = options.formatting || {};
  let defaultFormatting_ = {};
  if ("default" in formattingOptions_) {
    multipleFormattingOptions = Object.keys(formattingOptions_).length > 1;
    defaultFormatting_ = {
      textColor: formattingOptions_.default.textColor || "#000000",
      backgroundColor: formattingOptions_.default.backgroundColor || "transparent",
      fontWeight: formattingOptions_.default.fontWeight || "normal",
      fontStyle: formattingOptions_.default.fontStyle || "normal",
      textDecoration: formattingOptions_.default.textDecoration || "normal"
    };
    formattingOptions_.default = defaultFormatting_;
  } else {
    defaultFormatting_ = {
      textColor: formattingOptions_.textColor || "#000000",
      backgroundColor: formattingOptions_.backgroundColor || "transparent",
      fontWeight: formattingOptions_.fontWeight || "normal",
      fontStyle: formattingOptions_.fontStyle || "normal",
      textDecoration: formattingOptions_.textDecoration || "normal"
    };
    formattingOptions_ = {
      default: defaultFormatting_
    };
  }
  
  // TODO: These values shouldn't be undefined, but add check just in case. 
  let currentFormatting_ = {
    textColor: defaultFormatting_.textColor,
    backgroundColor: defaultFormatting_.backgroundColor,
    fontWeight: defaultFormatting_.fontWeight,
    fontStyle: defaultFormatting_.fontStyle,
    textDecoration: defaultFormatting_.textDecoration
  };
  
  this.triggerFormattingKey = function(key) {
    // Avoid check if only one format.
    if (multipleFormattingOptions && key in formattingOptions_) {
      currentFormatting_.textColor = formattingOptions_[key].textColor || currentFormatting_.textColor;
      currentFormatting_.backgroundColor = formattingOptions_[key].backgroundColor || currentFormatting_.backgroundColor;
      currentFormatting_.fontWeight = formattingOptions_[key].fontWeight || currentFormatting_.fontWeight;
      currentFormatting_.fontStyle = formattingOptions_[key].fontStyle || currentFormatting_.fontStyle;
      currentFormatting_.textDecoration = formattingOptions_[key].textDecoration || currentFormatting_.textDecoration;
    } else {
      // TODO: Handle? It might be possible that key isn't added on purpose. 
    }
  }
  
  this.revertToDefaultFormat = function() {
    currentFormatting_ = {
      textColor: defaultFormatting_.textColor,
      backgroundColor: defaultFormatting_.backgroundColor,
      fontWeight: defaultFormatting_.fontWeight,
      fontStyle: defaultFormatting_.fontStyle,
      textDecoration: defaultFormatting_.textDecoration
    };
  }

  let settings = options.settings || {};
  let settings_ = {
    spaceIsTransparent: settings.spaceIsTransparent === undefined || settings.spaceIsTransparent,
    spaceHasFormatting: !(settings.spaceHasFormatting === undefined || !settings.spaceHasFormatting),
    setAsBlank: settings.setAsBlank || ' ',
    leadingSpaceIgnored: settings.leadingSpaceIgnored === undefined || settings.leadingSpaceIgnored
  }
  
  let events_ = options.events || {};
  
  this.getEvents = function() {
    return events_;
  }

  this.copy = function() {
    return new FrameLayer(text_, {coords: {x: x_, y: y_}, 
      formatting: formattingOptions_, 
      settings: settings_,
      events: events_
    });
  }

  this.getCharPixel = function(x, y) {
    let charPixel = this.getCharData(x, y);
    charPixel.setFrameLayerReference(thisFrameLayer);
    return charPixel;
  }

  this.getCharData = function(x, y) {
    let layerX = x - x_;
    let layerY = y - y_;
    if (layerX < 0 || layerX > width_ || layerY < 0 || layerY > height_) {
      // If outside of Layer boundaries, immediately return false
      return new CharPixel();
    }

    rowStart = rowIndices[layerY];
    nextRow = rowIndices[layerY + 1];

    let char = text_.charAt(rowStart + layerX);
    if (layerX >= nextRow - rowStart - 1) {
      return new CharPixel();
    } else if (char !== ' ' && char !== settings_.setAsBlank) {
      return new CharPixel({
        char: char,
        textColor: currentFormatting_.textColor,
        backgroundColor: currentFormatting_.backgroundColor,
        fontWeight: currentFormatting_.fontWeight,
        fontStyle: currentFormatting_.fontStyle,
        textDecoration: currentFormatting_.textDecoration,
        events: events_
      });
    } else if (char === settings_.setAsBlank) {
      if (currentFormatting_.backgroundColor === "transparent") {
        return new CharPixel({
          char: ' ',
          textColor: currentFormatting_.textColor,
          backgroundColor: "#FFFFFF",
          fontWeight: currentFormatting_.fontWeight,
          fontStyle: currentFormatting_.fontStyle,
          textDecoration: currentFormatting_.textDecoration,
          events: events_
        });
      }
      return new CharPixel({
        char: ' ',
        textColor: currentFormatting_.textColor,
        backgroundColor: currentFormatting_.backgroundColor,
        fontWeight: currentFormatting_.fontWeight,
        fontStyle: currentFormatting_.fontStyle,
        textDecoration: currentFormatting_.textDecoration,
        events: events_
      });
    } else if (settings_.spaceHasFormatting) {
      // At this point, must be a blank
      return new CharPixel({
        char: ' ',
        textColor: currentFormatting_.textColor,
        backgroundColor: currentFormatting_.backgroundColor,
        fontWeight: currentFormatting_.fontWeight,
        fontStyle: currentFormatting_.fontStyle,
        textDecoration: currentFormatting_.textDecoration,
        events: events_
      });
    } else if (!settings_.spaceIsTransparent) {
      return new CharPixel({
        char: ' ',
        backgroundColor: "#FFFFFF"
      });
    }
    return new CharPixel();
  }
}

function CharPixel(charData) {
  "use strict"
  charData = charData || {};
  this.char = charData.char || ' ';
  this.textColor = charData.textColor || "#000000";
  this.backgroundColor = charData.backgroundColor || "transparent";
  this.fontWeight = charData.fontWeight || "normal";
  this.fontStyle = charData.fontStyle || "normal";
  this.textDecoration = charData.textDecoration || "normal";

  this.isTransparent = function() {
    return this.char === ' ' && this.backgroundColor === "transparent"
      && this.textDecoration === "normal";
  }
  
  this.sameAs = function(other) {
    return this.char === other.char && 
      this.sameFormatting(other) &&
      this.sameEvents(other) &&
      this.sameContainersAs(other);
  }
  
  this.sameFormatting = function(other) {
    return this.textColor === other.textColor &&
      this.backgroundColor === other.backgroundColor &&
      this.fontWeight === other.fontWeight &&
      this.fontStyle === other.fontStyle &&
      this.textDecoration === other.textDecoration;
  }
  
  this.sameEvents = function(other) {
    for (let myEvent in this.events) {
      if (!(myEvent in other.events) || 
        this.events[myEvent] !== other.events[myEvent]) {
        return false;
      }
    }
    for (let otherEvent in other.events) {
      if (!(otherEvent in this.events)) {
        return false;
      }
    }
    return true;
  }
  
  // TODD: Make private
  const containerReferences = {
    animation: undefined,
    frame: undefined,
    frameLayer: undefined
  };
  
  this.setAnimationReference = function(animation) {
    // TODO: Check to make sure animation is valid. 
    containerReferences.animation = animation;
  }
  
  this.setFrameReference = function(frame) {
    // TODO: Check to make sure animation is valid. 
    containerReferences.frame = frame;
  }

  this.setFrameLayerReference = function(frameLayer) {
    // TODO: Check to make sure animation is valid. 
    containerReferences.frameLayer = frameLayer;
  }

  this.getContainerReferences = function() {
    // TODO: Check if this is necessary and correct. 
    return containerReferences;
  }
  
  this.sameContainersAs = function(other) {
    let otherContainers = other.getContainerReferences();
    return containerReferences.animation == otherContainers.animation
      && containerReferences.frame == otherContainers.frame
      && containerReferences.frameLayer == otherContainers.frameLayer;
  }
  
  // TODO: Make private.
  this.events = charData.events || {};
  
  this.addHigherLevelEventListeners = function(otherEvents) {
    for (newEvent in otherEvents) {
      if (!(newEvent in this.events)) {
        this.events[newevent] = otherEvents[newEvent];
      }
    }
  }
  
  // TODO: Make private. 
  this.activeListeners = {};
  this.addActiveListenerRecord = function(eventType, func) {
    if (eventType in this.activeListeners) {
      console.warn("Multiple handlers for the same event: \n", 
        "Event Type: ", eventType
      );
    }
    
    this.activeListeners[eventType] = func;
  }
  
  this.removeActiveListenerRecord = function(eventType) {
    if (!(eventType in this.activeListeners)) {
      console.warn("Event type: ", eventType, " not found.");
    }
    delete this.activeListeners[eventType];
  }
}
