import { System, Entity, Components, Gui, GL, Component } from "../../dist/engine.js";

export default class FormManager extends System {
  constructor() {
    super("FormManager");

    this.submitButton = this._createButtonEntity("Submit", "Submit", [20, 20, 0]);

    this.nameField = this._createInputFieldEntity(
      "NameField", "Bob", 20, [30, 10, 0]);

    this.foodField = this._createInputFieldEntity(
      "FoodField", "Pizza", 20, [30, 12, 0]);
  }

  startup() {
    this.getEntityManager().requestAddEntity(this.submitButton);
    this.getEntityManager().requestAddEntity(this.nameField);
    this.getEntityManager().requestAddEntity(this.foodField);

    this.subscribe(["AsciiButtonElement", this.submitButton.id, "click"], this._onSubmit, true);
  }

  _onSubmit() {
    console.log("Mad Lib submitted!!!");
  }

  _createButtonEntity(name, text, [x, y, z]) {
    let buttonEntity = new Entity(name);
    let submitButtonPosition = new Components.Position(x, y, z);
    buttonEntity.setComponent(submitButtonPosition);

    let submitButtonComponent = new Gui.Components.Button();
    submitButtonComponent.sprite = new GL.Sprite(text);
    buttonEntity.setComponent(submitButtonComponent);
    return buttonEntity;
  }

  _createInputFieldEntity(name, initialText, width, [x, y, z]) {
    let inputFieldEntity = new Entity(name);
    let nameFieldPosition = new Components.Position(x, y, z);
    inputFieldEntity.setComponent(nameFieldPosition);

    let nameFieldComponent = new Gui.Components.InputField();
    nameFieldComponent.width = width;
    nameFieldComponent.initialText = initialText;
    inputFieldEntity.setComponent(nameFieldComponent);
    return inputFieldEntity;
  }
}