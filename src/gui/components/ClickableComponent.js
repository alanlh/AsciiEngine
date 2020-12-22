import Component from "../../engine/components/Component.js";

export default class ClickableComponent extends Component {
  constructor() {
    super();
    /**
     * @private
     */
    this._defaultFrame = undefined;
    /**
     * @private
     */
    this._hoverFrame = undefined;
    /**
     * @private
     */
    this._activeFrame = undefined;
  }

  get defaultFrame() {
    return this._defaultFrame;
  }

  set defaultFrame(value) {
    this._defaultFrame = value;
  }

  get hoverFrame() {
    // Fall back if not specified.
    return this._hoverFrame || this.defaultFrame;
  }

  set hoverFrame(value) {
    this._hoverFrame = value;
  }

  get activeFrame() {
    // Fallback if not specified.
    return this._activeFrame || this.hoverFrame;
  }

  set activeFrame(value) {
    this._activeFrame = value;
  }
}

ClickableComponent.type = "Clickable";