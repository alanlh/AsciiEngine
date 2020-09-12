import Component from "../../engine/components/Component.js";

import Functions from "../../utility/Functions.js";

export default class InputFieldInternalComponent extends Component {
  constructor(data) {
    super();

    this.width = data.width;
    this.height = data.height;

    this.defaultStyle = undefined;
    this.focusedStyle = undefined;
    this.cursorStyle = undefined;

    /**
     * Hard-coded to false for now because we don't support multi-line input fields.
     */
    this.multiLine = false;

    this.lines = [];
    this.data = "";
    this.changed = true;

    this.viewX = 0;
    this.viewY = 0;

    this.cursorX = 0;
    this.cursorY = 0;

    if (this.multiLine) {
      this.initRows(data.initialText);
    } else {
      this.data = data.initialText.replace("\n", " ");
    }
  }

  /**
   * 
   * @param {string} text 
   */
  initRows(text) {
    let lines = text.split("\n");
    for (let y = 0; y < lines.length; y++) {
      this.rows.push(Functions.breakLineIntoRows(lines[y], this.width));
    }
    this.changed = true;
  }

  /**
   * Gets the text to display as an array of strings.
   * Each string is less than the width of the input field.
   * 
   * @returns {string} The string used to generate the output sprite
   */
  getDisplayString() {
    if (this.multiLine) {
      return this.lines.slice(this.viewY, this.viewY + this.height)
        .map((value) => {
          let rowStr = value.join(" ").substr(this.viewX, this.width);
          if (rowStr.length < this.width) {
            rowStr += " ".repeat(this.width - rowStr.length);
          }
          return rowStr;
        })
        .join("\n");
    }
    // No special formatting needed if only one line.
    let filledString = this.data.substr(this.viewX, this.width)
    return filledString + " ".repeat(this.width - filledString.length);
  }

  getTextString() {
    if (this.multiLine) {
      return this.lines.map((value) => value.join(" ")).join("\n");
    }
    // No special formatting needed if only one line.
    return this.data;
  }

  handleCharacterInput(body) {
    if (this.multiLine) {

    } else {
      this.data = Functions.stringSplice(this.data, this.cursorX, 0, body.event.key);
      this.shiftCursor(1, 0);
      this.changed = true;
    }
  }

  handleArrowInput(body, descriptor) {
    if (this.multiLine) {

    } else {
      if (body.event.key === "ArrowLeft") {
        this.shiftCursor(-1, 0);
        this.changed = true;
      } else if (body.event.key === "ArrowRight") {
        this.shiftCursor(1, 0);
        this.changed = true;
      }
    }
  }

  handleBackspaceInput() {
    if (this.multiLine) {

    } else {
      if (this.cursorX > 0) {
        this.shiftCursor(-1, 0);
        if (this.viewX === this.cursorX && this.viewX > 0) {
          this.viewX--;
        }
        this.data = Functions.stringSplice(this.data, this.cursorX, 1);
        this.changed = true;
      }
    }
  }

  handleEnterInput() {
    if (this.multiLine) {

    } else {
      // Do nothing on enter. No new lines!
    }
  }

  handleDeleteInput() {
    if (this.multiLine) {

    } else {
      if (this.cursorX < this.data.length) {
        this.data = Functions.stringSplice(this.data, this.cursorX, 1);
        this.changed = true;
      }
    }
  }

  shiftCursor(x, y) {
    if (this.multiLine) {

    } else {
      // Not this.data.length - 1 because we want cursor to go behind text.
      this.cursorX = Math.max(0, Math.min(this.data.length, this.cursorX + x));
      if (this.cursorX < this.viewX) {
        this.viewX = this.cursorX;
      } else if (this.cursorX >= this.viewX + this.width) {
        this.viewX = this.cursorX - this.width + 1;
      }
    }
  }

  placeCursor(x, y) {
    if (this.multiLine) {

    } else {
      this.cursorX = Math.max(0, Math.min(this.data.length, x));
      this.cursorY = 0;
    }
  }
}

InputFieldInternalComponent.type = "AsciiInputFieldInternal";