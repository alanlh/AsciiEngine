function FrameLayer(textStr, options) {
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

  let formatting = options.formatting || {};
  let formatting_ = {
    textColor: formatting.textColor || "#000000",
    backgroundColor: formatting.backgroundColor || "transparent",
    fontWeight: formatting.fontWeight || "normal",
    fontStyle: formatting.fontStyle || "normal",
    textDecoration: formatting.textDecoration || "normal"
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
      formatting: formatting_, 
      settings: settings_,
      events: events_
    });
  }

  this.getCharData = function(x, y) {
    layerX = x - x_;
    layerY = y - y_;
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
        textColor: formatting_.textColor,
        backgroundColor: formatting_.backgroundColor,
        fontWeight: formatting_.fontWeight,
        fontStyle: formatting_.fontStyle,
        textDecoration: formatting_.textDecoration,
        events: events_
      });
    } else if (char === settings_.setAsBlank) {
      if (formatting_.backgroundColor === "transparent") {
        return new CharPixel({
          char: ' ',
          textColor: formatting_.textColor,
          backgroundColor: "#FFFFFF",
          fontWeight: formatting_.fontWeight,
          fontStyle: formatting_.fontStyle,
          textDecoration: formatting_.textDecoration,
          events: events_
        });
      }
      return new CharPixel({
        char: ' ',
        textColor: formatting_.textColor,
        backgroundColor: formatting_.backgroundColor,
        fontWeight: formatting_.fontWeight,
        fontStyle: formatting_.fontStyle,
        textDecoration: formatting_.textDecoration,
        events: events_
      });
    } else if (settings_.spaceHasFormatting) {
      // At this point, must be a blank
      return new CharPixel({
        char: ' ',
        textColor: formatting_.textColor,
        backgroundColor: formatting_.backgroundColor,
        fontWeight: formatting_.fontWeight,
        fontStyle: formatting_.fontStyle,
        textDecoration: formatting_.textDecoration,
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
      this.sameEvents(other);
  }
  
  this.sameFormatting = function(other) {
    return this.textColor === other.textColor &&
      this.backgroundColor === other.backgroundColor &&
      this.fontWeight === other.fontWeight &&
      this.fontStyle === other.fontStyle &&
      this.textDecoration === other.textDecoration;
  }
  
  this.sameEvents = function(other) {
    for (myEvent in this.events) {
      if (!(myEvent in other.events) || 
        this.events[myEvent] !== other.events[myEvent]) {
        return false;
      }
    }
    for (otherEvent in other.events) {
      if (!(otherEvent in this.events)) {
        return false;
      }
    }
    return true;
  }
  
  // TODD: Make private
  this.animationId = undefined;
  
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
