import System from "../../engine/systems/System.js";
import Entity from "../../engine/Entity";
import PositionComponent from "../../engine/components/PositionComponent.js";
import AsciiAnimateComponent from "../../engine/components/AsciiAnimateComponent.js";
import Style from "../../graphics/Style.js";

import ButtonComponent from "../components/ButtonComponent.js";
import ButtonInternalComponent from "../components/ButtonInternalComponent";

export default class ButtonSystem extends System {
  constructor() {
    super("Buttons");

    this._handleMouseClick = this._handleMouseClick.bind(this);
    this._handleMouseEnter = this._handleMouseEnter.bind(this);
    this._handleMouseLeave = this._handleMouseLeave.bind(this);
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);

    this.buttonEntities = {};
    this.buttonSubentities = {};
    this.childMap = {};
  }

  check(entity) {
    return entity.hasComponent(ButtonComponent.type)
      || entity.hasComponent(ButtonInternalComponent.type);
  }

  has(entity) {
    return entity.id in this.buttonEntities || entity.id in this.buttonSubentities;
  }

  add(entity) {
    if (entity.hasComponent(ButtonComponent.type)) {
      this.buttonEntities[entity.id] = entity;
      this._constructButtonSubentities(entity);
    } else if (entity.hasComponent(ButtonInternalComponent.type)) {
      this.buttonSubentities[entity.id] = entity;
      this.childMap[entity.getParent().id] = entity.id;
    }
  }

  remove(entity) {
    if (entity.hasComponent(ButtonComponent.type)) {
      this._deconstructButtonSubentities(entity);
      delete this.childMap[entity.id];
      delete this.buttonEntities[entity.id];
    } else if (entity.hasComponent(ButtonInternalComponent.type)) {
      delete this.buttonSubentities[entity.id];
    }
  }

  postUpdate() {
    for (let subEntityId in this.buttonSubentities) {
      let entity = this.buttonSubentities[subEntityId];
      let animateComponent = entity.getComponent(AsciiAnimateComponent.type);
      let buttonInternal = entity.getComponent(ButtonInternalComponent.type);
      animateComponent.setFrame(buttonInternal.mouseState);
    }
  }

  /**
   * Initializes a button.
   * @param {Entity} entity An Entity, which should hold a ButtonComponent 
   *    containing all the data needed to initialize the button.
   */
  _constructButtonSubentities(entity) {
    let buttonData = entity.getComponent(ButtonComponent.type);

    let subEntity = new Entity(entity.id);
    let positionComponent = new PositionComponent(0, 0, 0);
    subEntity.setComponent(positionComponent);
    
    let asciiAnimateComponent = new AsciiAnimateComponent();
    asciiAnimateComponent.dataIsLocal = true;

    let defaultStyle = new Style();
    defaultStyle.setStyle("cursor", "pointer");
    defaultStyle.setStyle("color", buttonData.textColor);
    defaultStyle.setStyle("backgroundColor", buttonData.backgroundColor);
    asciiAnimateComponent.addFrame(ButtonInternalComponent.MouseStates.Default,
      [buttonData.sprite], [defaultStyle], [[0, 0, 0]]);

    let hoverStyle = new Style();
    hoverStyle.setStyle("cursor", "pointer");
    hoverStyle.setStyle("color", buttonData.textColor);
    hoverStyle.setStyle("backgroundColor",
      buttonData.hoverColor || buttonData.backgroundColor);
    asciiAnimateComponent.addFrame(ButtonInternalComponent.MouseStates.Hover,
      [buttonData.sprite], [hoverStyle], [[0, 0, 0]]);

    let activeStyle = new Style();
    activeStyle.setStyle("cursor", "pointer");
    activeStyle.setStyle("color", buttonData.textColor);
    activeStyle.setStyle("backgroundColor",
      buttonData.activeColor || buttonData.hoverColor || buttonData.backgroundColor);
    asciiAnimateComponent.addFrame(ButtonInternalComponent.MouseStates.Active,
      [buttonData.sprite], [activeStyle], [[0, 0, 0]]);
    subEntity.setComponent(asciiAnimateComponent);
    
    let buttonInternalComponent = new ButtonInternalComponent();
    subEntity.setComponent(buttonInternalComponent);

    this.subscribe(["MouseEvent", "click", subEntity.id], this._handleMouseClick, false);
    this.subscribe(["MouseEvent", "mouseenter", subEntity.id], this._handleMouseEnter, false);
    this.subscribe(["MouseEvent", "mouseleave", subEntity.id], this._handleMouseLeave, false);
    this.subscribe(["MouseEvent", "mousedown", subEntity.id], this._handleMouseDown, false);
    this.subscribe(["MouseEvent", "mouseup", subEntity.id], this._handleMouseUp, false);
    
    entity.addChild(subEntity);
  }

  /**
   * Performs cleanup operations when a button is removed.
   * For now, removes event listeners.
   * @param {Entity} entity The parent entity being removed.
   */
  _deconstructButtonSubentities(entity) {
    let childId = this.childMap[entity.id];
    this.unsubscribe(["MouseEvent", "click", childId]);
    this.unsubscribe(["MouseEvent", "mouseenter", childId]);
    this.unsubscribe(["MouseEvent", "mouseleave", childId]);
    this.unsubscribe(["MouseEvent", "mousedown", childId]);
    this.unsubscribe(["MouseEvent", "mouseup", childId]);
  }

  _handleMouseClick(_event, descriptor) {
    let parentId = this.buttonSubentities[descriptor[2]].getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "click"]);
  }

  _handleMouseEnter(_event, descriptor) {
    let childId = descriptor[2];
    let childEntity = this.buttonSubentities[childId];
    let parentId = childEntity.getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "mouseenter"]);
    let buttonInternalComponent = childEntity.getComponent(ButtonInternalComponent.type);
    buttonInternalComponent.mouseState = ButtonInternalComponent.MouseStates.Hover;
  }

  _handleMouseLeave(_event, descriptor) {
    let childId = descriptor[2];
    let childEntity = this.buttonSubentities[childId];
    let parentId = childEntity.getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "mouseleave"]);
    let buttonInternalComponent = childEntity.getComponent(ButtonInternalComponent.type);
    buttonInternalComponent.mouseState = ButtonInternalComponent.MouseStates.Default;
  }

  _handleMouseDown(_event, descriptor) {
    let childId = descriptor[2];
    let childEntity = this.buttonSubentities[childId];
    let parentId = childEntity.getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "mousedown"]);
    let buttonInternalComponent = childEntity.getComponent(ButtonInternalComponent.type);
    buttonInternalComponent.mouseState = ButtonInternalComponent.MouseStates.Active;

  }

  _handleMouseUp(_event, descriptor) {
    let childId = descriptor[2];
    let childEntity = this.buttonSubentities[childId];
    let parentId = childEntity.getParent().id;
    this.postMessage(["AsciiButtonElement", parentId, "mouseup"]);
    let buttonInternalComponent = childEntity.getComponent(ButtonInternalComponent.type);
    buttonInternalComponent.mouseState = ButtonInternalComponent.MouseStates.Hover;
  }
}