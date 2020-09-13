import { System, Entity, Components, Gui, GL } from "../../dist/engine.js";

export default class FormManager extends System {
  constructor() {
    super("FormManager");

    this.title = this._createTextBoxEntity(
      "TitleLabel", "A Short MadLib", 14, 1, [23, 0, 0]);

    this.nameLabel = this._createTextBoxEntity(
      "NameLabel", "Enter a name: ", 15, 1, [10, 2, 0]);
    this.nameField = this._createInputFieldEntity(
      "NameField", "Bob", 20, [30, 2, 0]);

    this.foodLabel = this._createTextBoxEntity(
      "FoodLabel", "Enter a food (plural): ", 20, 2, [10, 4, 0]);
    this.foodField = this._createInputFieldEntity(
      "FoodField", "pizzas", 20, [30, 5, 0]);
    
    this.countLabel = this._createTextBoxEntity(
      "CountLabel", "Enter a positive number: ", 20, 2, [10, 7, 0]);
    this.countField = this._createInputFieldEntity(
      "CountField", "1", 20, [30, 8, 0]);
    
    this.feelingLabel = this._createTextBoxEntity(
      "FeelingLabel", "Enter a feeling: ", 20, 1, [10, 10, 0]);
    this.feelingField = this._createInputFieldEntity(
      "FeelingField", "happy", 20, [30, 10, 0]);
    
    this.submitButton = this._createButtonEntity("Submit", "Submit", [30, 12, 0]);

    this.result = undefined;
  }

  startup() {
    this.getEntityManager().requestAddEntity(this.title);
    this.getEntityManager().requestAddEntity(this.nameLabel);
    this.getEntityManager().requestAddEntity(this.nameField);
    this.getEntityManager().requestAddEntity(this.foodLabel);
    this.getEntityManager().requestAddEntity(this.foodField);
    this.getEntityManager().requestAddEntity(this.countLabel);
    this.getEntityManager().requestAddEntity(this.countField);
    this.getEntityManager().requestAddEntity(this.feelingLabel);
    this.getEntityManager().requestAddEntity(this.feelingField);
    this.getEntityManager().requestAddEntity(this.submitButton);

    this.subscribe(["AsciiButtonElement", this.submitButton.id, "click"], this._onSubmit, true);
  }

  _onSubmit() {
    if (this.result !== undefined) {
      this.getEntityManager().requestDeleteEntity(this.result);
    }
    let name = this._getInputFieldEntityText(this.nameField);
    let food = this._getInputFieldEntityText(this.foodField);
    let count = this._getInputFieldEntityText(this.countField);
    let feeling = this._getInputFieldEntityText(this.feelingField);
    let text =
      `There once was a person named ${name} who loved eating ${food}. `
      + `One day, ${name} ate ${count} ${food}. `
      + `And ${name} was very ${feeling}.`;
    this.result = this._createTextBoxEntity("Result", text, 40, 20, [10, 15, 0]);
    this.getEntityManager().requestAddEntity(this.result);
  }

  _createButtonEntity(name, text, position) {
    let buttonEntity = new Entity(name);
    let submitButtonPosition = new Components.Position(...position);
    buttonEntity.setComponent(submitButtonPosition);

    let submitButtonComponent = new Gui.Components.Button();
    submitButtonComponent.sprite = new GL.Sprite(text);
    buttonEntity.setComponent(submitButtonComponent);
    return buttonEntity;
  }

  _createInputFieldEntity(name, initialText, width, position) {
    let inputFieldEntity = new Entity(name);
    let nameFieldPosition = new Components.Position(...position);
    inputFieldEntity.setComponent(nameFieldPosition);

    let nameFieldComponent = new Gui.Components.InputField();
    nameFieldComponent.width = width;
    nameFieldComponent.initialText = initialText;
    inputFieldEntity.setComponent(nameFieldComponent);
    return inputFieldEntity;
  }

  /**
   * 
   * @param {Entity} entity An entity with an InputFieldComponent
   */
  _getInputFieldEntityText(entity) {
    let inputFieldData = entity.getComponent(Gui.Components.InputField.type);
    return inputFieldData.currentText;
  }

  _createTextBoxEntity(name, text, width, height, position) {
    let textBoxEntity = new Entity(name);
    let textBoxPosition = new Components.Position(...position);
    textBoxEntity.setComponent(textBoxPosition);

    let textBoxComponent = new Gui.Components.TextBox();
    textBoxComponent.text = text;
    textBoxComponent.width = width;
    textBoxComponent.height = height;
    textBoxEntity.setComponent(textBoxComponent);
    return textBoxEntity;
  }
}