"use strict";
function FormattingModule(data) {
  BaseModule.call(this, data.layerId, FormattingModule.type);

  this.properties = {
    textColor: new FormattingData("textColor", "#000000"),
    backgroundColor: new FormattingData("backgroundColor", "transparent"),
    fontStyle: new FormattingData("fontStyle", "normal"),
    fontWeight: new FormattingData("fontWeight", "normal"),
    textDecoration: new FormattingData("textDecoration", "normal"),
    cursor: new FormattingData("cursor", "default")
  }

  for (let key in data.formatting) {
    if (key in this.properties) {
      this.properties[key].value = data.formatting[key];
    } else {
      this.properties[key] = new FormattingData(key, "");
      this.properties[key].value = data.formatting[key];
    }
  }
}

FormattingModule.isEqual = function(f1, f2) {
  // TODO: Verify that f1, f2 are FormattingModules
  for (let key1 in f1.properties) {
    if (!(key1 in f2.properties) || f1.properties[key].value != f2.properties[key].value) {
      return false;
    }
  }
  for (let key2 in f2.properties) {
    if (!(key2 in f1.properties)) {
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

FormattingModule.EmptyModule = function() {
  return new FormattingModule({});
}

Object.defineProperty(BaseModule, FormattingModule.type, {
  value: FormattingModule.prototype.constructor
});

FormattingModule.prototype.hasVisibleFormatting = function() {
  return !this.hasInvisibleFormatting();
}

FormattingModule.prototype.hasInvisibleFormatting = function() {
  return this.properties.backgroundColor.value === "transparent"
    && this.properties.textDecoration.value === "normal";
}
