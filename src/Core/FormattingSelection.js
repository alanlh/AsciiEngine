"use strict";
function FormattingSelection(data) {
  data = data || {};
  // TODO: Verify that properties are valid strings
  Object.defineProperty(this, "textColor", {
    value: data.textColor || "#000000"
  });
  
  Object.defineProperty(this, "backgroundColor", {
    value: data.backgroundColor || "transparent"
  });
  
  Object.defineProperty(this, "fontWeight", {
    value: data.fontWeight || "normal"
  });
  
  Object.defineProperty(this, "fontStyle", {
    value: data.fontStyle || "normal"
  });
  
  Object.defineProperty(this, "textDecoration", {
    value: data.textDecoration || "normal"
  });
}

FormattingSelection.isEqual = function(f1, f2) {
  // TODO: Verify that f1, f2 are FormattingSelections
  return f1.textColor === f2.textColor &&
    f1.backgroundColor === f2.backgroundColor &&
    f1.fontWeight === f2.fontWeight &&
    f1.fontStyle === f2.fontStyle &&
    f1.textDecoration === f2.textDecoration;
}

FormattingSelection.prototype.hasVisibleFormatting = function() {
  return !this.hasInvisibleFormatting();
}

FormattingSelection.prototype.hasInvisibleFormatting = function() {
  return this.backgroundColor === "transparent"
    && this.textDecoration === "normal";

}
