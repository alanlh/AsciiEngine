"use strict";
function FormattingModule(data) {
  BaseModule.call(this, data.layerId, FormattingModule.type);

  this.properties = {};

  for (let key in data.formatting) {
    this.properties[key] = data.formatting[key];
  }
}

FormattingModule.isEqual = function(f1, f2) {
  // TODO: Verify that f1, f2 are FormattingModules
  for (let key1 in f1) {
    if (!(key1 in f2) || f1[key1] != f2[key1]) {
      return false;
    }
  }
  for (let key2 in f2) {
    if (!(key2 in f1)) {
      return false;
    }
  }
  return true;
}

FormattingModule.prototype = Object.create(BaseModule.prototype);
FormattingModule.prototype.constructor = FormattingModule;

Object.defineProperty(FormattingModule, "type", {
  value: "FORMATTING"
});

FormattingModule.EmptyModule = new FormattingModule({});
Object.freeze(FormattingModule.EmptyModule);

Object.defineProperty(BaseModule, FormattingModule.type, {
  value: FormattingModule.prototype.constructor
});

FormattingModule.prototype.hasVisibleFormatting = function() {
  return !this.hasInvisibleFormatting();
}

FormattingModule.prototype.hasInvisibleFormatting = function() {
  return (!this.properties.backgroundColor
    || this.properties.backgroundColor === "transparent")
    && (!this.properties.textDecoration
    || this.properties.textDecoration === "normal");
}

// Figure out a way to keep this separate for each Scene instance?
FormattingModule.DEFAULTS = {
  color: "#000000",
  backgroundColor: "transparent",
  fontStyle: "normal",
  fontWeight: "normal",
  textDecoration: "normal",
  cursor: "default"
};
