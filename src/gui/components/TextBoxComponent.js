import Component from "../../engine/components/Component.js";

export default class TextBoxComponent extends Component {
  constructor() {
    super();

    this.text = "";
    this.width = 0;
    this.height = 1;

    this.textColor = undefined;
    this.backgroundColor = undefined;
  }
}

TextBoxComponent.type = "TextBox";