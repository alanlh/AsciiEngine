import { System, Entity, Components, Gui, GL, Component } from "../../dist/engine.js";

export default class FormManager extends System {
  constructor() {
    super("FormManager");

    this.button = new Entity("SubmitButton");
    let buttonComponent = new Gui.Components.Button();
    buttonComponent.sprite = new GL.Sprite("Submit");

    let positionComponent = new Components.Position(2, 3, 2);
    this.button.setComponent(positionComponent);

    this.button.setComponent(buttonComponent);
  }

  startup() {
    this.getEntityManager().requestAddEntity(this.button);

    this.subscribe(["AsciiButtonElement", this.button.id, "click"], this._onSubmit, true);
  }

  _onSubmit() {
    console.log("Form submitted!!!");
    this.getEntityManager().requestDeleteEntity(this.button);
    this.unsubscribe(["AsciiButtonElement", this.button.id, "click"]);
  }
}