import Component from "../../engine/components/Component";

export default class InputFieldComponent extends Component {
  constructor() {
    super();

    this.width = 0;
    this.height = 1;

    this.initialText = "";

    this._currentText = "";

    this.textColor = undefined;
    this.backgroundColor = undefined;
    this.focusedColor = undefined;
    this.cursorColor = undefined;

    this.editable = false;

    this.maxLength = 0;
  }

  get currentText() {
    return this._currentText;
  }
}

InputFieldComponent.type = "AsciiInputField";