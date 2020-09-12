import Component from "../../engine/components/Component.js";

export default class CursorComponent extends Component {
  constructor() {
    super();

    this.screenX = undefined;
    this.screenY = undefined;
    this.fieldX = undefined;
    this.fieldY = undefined;
    this.placedEntityKey = undefined;
  }
}

CursorComponent.type = "TextFieldCursor";