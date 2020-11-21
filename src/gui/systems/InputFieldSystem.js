import System from "../../engine/systems/System.js";
import Entity from "../../engine/Entity.js";
import PositionComponent from "../../engine/components/PositionComponent.js";
import AsciiRenderComponent from "../../engine/components/AsciiRenderComponent.js";
import Style from "../../graphics/Style.js";
import Sprite from "../../graphics/Sprite.js";

import InputFieldComponent from "../components/InputFieldComponent.js";
import InputFieldInternalComponent from "../components/InputFieldInternalComponent.js";
import CursorComponent from "../components/CursorComponent.js";

/**
 * Controls all text fields.
 * 
 * Listens for three types of events from AsciiInputHandler.
 * Focus events decide the background UI and whether the cursor appears.
 * Mouse events determine where the cursor appears, if it should appear.
 *    It also controls where keyboard events take effect.
 * Keyboard events control the text in the focused keyboard event.
 */
export default class InputFieldSystem extends System {
  constructor() {
    super("InputFields");

    /**
     * @private
     */
    this.parentEntities = {};
    /**
     * @private
     */
    this.childEntities = {};
    /**
     * @private
     */
    this.childMap = {};

    /**
     * @type {string}
     */
    this.defaultTextColor = "#222222";
    /**
     * @type {string}
     */
    this.defaultBackgroundColor = "#dddddd";
    /**
     * @type {string}
     */
    this.defaultFocusedColor = "#bbbbbb";
    /**
     * @type {string}
     */
    this.defaultCursorColor = "#888888";

    /**
     * @private
     */
    this.cursorEntity = new Entity("AsciiCursor");
    /**
     * @private
     */
    this.cursorComponent = new CursorComponent();
    this.cursorEntity.setComponent(this.cursorComponent);

    let cursorPositionComponent = new PositionComponent(0, 0, 0);
    this.cursorEntity.setComponent(cursorPositionComponent);

    let cursorStyle = new Style();
    cursorStyle.setStyle("backgroundColor", this.defaultCursorColor);
    let cursorRenderComponent = new AsciiRenderComponent([
      new Sprite(" ", {
        ignoreLeadingSpaces: false,
        spaceIsTransparent: true,
        spaceHasFormatting: true,
      })
    ], [
      cursorStyle
    ], [
      [0, 0, 0]
    ]);
    cursorRenderComponent.visible = false;
    cursorRenderComponent.dataIsLocal = true;
    this.cursorEntity.setComponent(cursorRenderComponent);

    /**
     * @private
     */
    this._focusSet = this._focusSet.bind(this);
    /**
     * @private
     */
    this._focusLost = this._focusLost.bind(this);

    /**
     * @private
     */
    this._handleMouseClick = this._handleMouseClick.bind(this);
  }

  check(entity) {
    return entity.hasComponent(InputFieldComponent.type)
      || entity.hasComponent(InputFieldInternalComponent.type)
      || (entity.hasComponent(CursorComponent.type)
      && entity.id === this.cursorEntity.id);
  }

  has(entity) {
    return entity.id in this.parentEntities || entity.id in this.childEntities;
  }

  add(entity) {
    if (entity.hasComponent(InputFieldComponent.type)) {
      this.parentEntities[entity.id] = entity;
      this._constructChildEntity(entity);
    } else if (entity.hasComponent(InputFieldInternalComponent.type)) {
      this.childEntities[entity.id] = entity;
      this.childMap[entity.getParent().id] = entity.id;
    }
  }

  remove(entity) {
    if (entity.id in this.parentEntities) {
      this._deconstructChildEntity(entity);
      if (this.childMap[entity.id] in this.childEntities) {
        this.getEntityManager()
          .requestDeleteEntity(this.childEntities[this.childMap[entity.id]]);
      }
      delete this.childMap[entity.id];
      delete this.parentEntities[entity.id];
    } else if (entity.id in this.childEntities) {
      delete this.childEntities[entity.id];
    }
  }

  startup() {
    this.getEntityManager().requestAddEntity(this.cursorEntity);
  }

  shutdown() {
    this.getEntityManager().requestDeleteEntity(this.cursorEntity);
  }

  postUpdate() {
    // TODO: Do we need to iterate over all fields?
    // Is it possible for anything other than the entity which the cursor is on/previously on to be changed?
    for (let parentId in this.childMap) {
      let childId = this.childMap[parentId];
      let childEntity = this.childEntities[childId];
      let parentEntity = this.parentEntities[parentId];

      let publicComponent = parentEntity.getComponent(InputFieldComponent.type);
      let internalComponent = childEntity.getComponent(InputFieldInternalComponent.type);

      // If cursor placed on entity, still need to update because the field's position could be changed via a parent.
      // If so, we need to also update the position of the cursor.
      if (!internalComponent.changed && this.cursorComponent.placedEntityKey !== childId) {
        continue;
      }

      publicComponent._currentText = internalComponent.getTextString();

      let renderComponent = childEntity.getComponent(AsciiRenderComponent.type);
      renderComponent.spriteNameList[0] = new Sprite(
        internalComponent.getDisplayString(), {
        ignoreLeadingSpaces: false,
        spaceIsTransparent: false,
      });
      let style = internalComponent.defaultStyle;
      if (this.cursorComponent.placedEntityKey === childId) {
        style = internalComponent.focusedStyle;
      }
      renderComponent.styleNameList[0] = style;

      if (this.cursorComponent.placedEntityKey !== childEntity.id) {
        continue;
      }

      let position = this._getChildGlobalPosition(childId);
      let globalCursorX = position.x + internalComponent.cursorX - internalComponent.viewX;
      let globalCursorY = position.y + internalComponent.cursorY - internalComponent.viewY;
      
      let cursorPosition = this.cursorEntity.getComponent(PositionComponent.type);
      cursorPosition.x = globalCursorX;
      cursorPosition.y = globalCursorY;
      // Subtract one so that the cursor is always on top.
      cursorPosition.z = position.z - 1;

      internalComponent.changed = false;
    }
  }

  /**
   * Performs setup work for a newly registered Text Field.
   * The child entity should only be managed by TextFieldSystem. 
   * @private
   * @param {Entity} entity The newly added entity to initialize
   */
  _constructChildEntity(entity) {
    let textFieldData = entity.getComponent(InputFieldComponent.type);

    let child = new Entity(entity.id);
    let positionComponent = new PositionComponent(0, 0, 0);
    child.setComponent(positionComponent);

    let internalComponent = new InputFieldInternalComponent(textFieldData);
    child.setComponent(internalComponent);

    let sprite = new Sprite(internalComponent.getDisplayString(), {
      ignoreLeadingSpaces: false,
      spaceIsTransparent: false,
    });

    let textColor = textFieldData.textColor || this.defaultTextColor;
    let backgroundColor = textFieldData.backgroundColor || this.defaultBackgroundColor;
    let focusedColor = textFieldData.focusedColor || this.defaultFocusedColor;
    let cursorColor = textFieldData.cursorColor || this.defaultCursorColor;

    let defaultStyle = new Style();
    defaultStyle.setStyle("cursor", "text");
    defaultStyle.setStyle("color", textColor);
    defaultStyle.setStyle("backgroundColor", backgroundColor);
    
    let focusedStyle = new Style();
    focusedStyle.setStyle("cursor", "text");
    focusedStyle.setStyle("color", textColor);
    focusedStyle.setStyle("backgroundColor", focusedColor);

    let cursorStyle = new Style();
    cursorStyle.setStyle("backgroundColor", cursorColor);

    internalComponent.defaultStyle = defaultStyle;
    internalComponent.focusedStyle = focusedStyle;
    internalComponent.cursorStyle = cursorStyle;

    let asciiRenderComponent = new AsciiRenderComponent([sprite], [defaultStyle], [[0, 0, 0]]);
    asciiRenderComponent.dataIsLocal = true;
    child.setComponent(asciiRenderComponent);

    entity.addChild(child);

    this.postMessage(["InputHandlerRequest", "AddFocusable"], child.id);
    this.subscribe(["InputHandlerFocusEvent", child.id, "FocusSet"], this._focusSet);
    this.subscribe(["InputHandlerFocusEvent", child.id, "FocusLost"], this._focusLost);
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Visible"], 
      internalComponent.handleCharacterInput.bind(internalComponent));
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Arrow"], 
      internalComponent.handleArrowInput.bind(internalComponent));
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Enter"], 
      this._handleEnterInput, true);
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Backspace"], 
      internalComponent.handleBackspaceInput.bind(internalComponent));
    this.subscribe(["KeyboardEvent", child.id, "keydown", "Delete"], 
      internalComponent.handleDeleteInput.bind(internalComponent));
    this.subscribe(["MouseEvent", child.id, "click"], this._handleMouseClick);
  }

  /**
   * @private
   * @param {Entity} entity 
   */
  _deconstructChildEntity(entity) {
    let childId = this.childMap[entity.id];
    this.unsubscribe(["InputHandlerFocusEvent", childId]);
    this.unsubscribe(["KeyboardEvent", childId]);
    this.postMessage(["InputHandlerRequest", "RemoveFocusable"], childId);
    if (this.cursorComponent.placedEntityKey === childId) {
      this.cursorComponent.placedEntityKey = undefined;
      let cursorRender = this.cursorEntity.getComponent(AsciiRenderComponent.type);
      cursorRender.visible = false;
    }
  }

  /**
   * @private
   * @param {any} _ The body of the message. Unused.
   * @param {Array<string>} descriptor The message path descriptor
   */
  _handleEnterInput(_, descriptor) {
    let targetId = descriptor[1];
    if (!(targetId in this.childEntities)) {
      // This shouldn't happen.
      throw new Error("InputFieldSystem received a message for an internal entity that no longer exists in the system:", targetId);
    }
    /** @type {Entity} */
    let childEntity = this.childEntities[targetId];
    let internalComponent = childEntity.getComponent(InputFieldInternalComponent.type);
    internalComponent.handleEnterInput();
    if (!internalComponent.multiLine) {
      let parentEntityId = childEntity.getParent().id;
      this.postMessage(["InputFieldEvent", parentEntityId, "submit"], {});
    }
  }

  /**
   * @private
   * @param {any} entity 
   */
  _focusSet(body) {
    let focusedEntityId = body.entityId;
    this.cursorComponent.placedEntityKey = focusedEntityId;
    let cursorRender = this.cursorEntity.getComponent(AsciiRenderComponent.type);
    cursorRender.visible = true;
    let focusedEntity = this.childEntities[focusedEntityId];
    this._placeCursor(body.coords, focusedEntity);
    this._markChildEntityChanged(focusedEntityId);
  }

  /**
   * @private
   * @param {any} entity 
   */
  _focusLost() {
    this._markChildEntityChanged(this.cursorComponent.placedEntityKey);
    this.cursorComponent.placedEntityKey = undefined;
    let cursorRender = this.cursorEntity.getComponent(AsciiRenderComponent.type);
    cursorRender.visible = false;
  }

  /**
   * @private
   * @param {any} entity 
   */
  _handleMouseClick(body) {
    if (this.cursorComponent.placedEntityKey) {
      let placedEntity = this.childEntities[this.cursorComponent.placedEntityKey];
      this._placeCursor(body.coords, placedEntity);
      this._markChildEntityChanged(this.cursorComponent.placedEntityKey);
    }
  }

  /**
   * 
   * @param {[number, number]} clickPosition The global click position
   * @param {Entity} targetEntity The child entity being clicked
   */
  _placeCursor(clickPosition, targetEntity) {
    let targetData = targetEntity.getComponent(InputFieldInternalComponent.type);
    let targetPosition = this._getChildGlobalPosition(targetEntity.id);

    targetData.placeCursor(clickPosition.x - targetPosition.x,
      clickPosition.y - targetPosition.y);
  }

  /**
   * @private
   * @param {any} entity 
   */
  _markChildEntityChanged(entityId) {
    let childEntity = this.childEntities[entityId];
    let internalComponent = childEntity.getComponent(InputFieldInternalComponent.type);
    internalComponent.changed = true;
  }

  /**
   * @private
   * @param {any} entity 
   */
  _getChildGlobalPosition(childId) {
    let childEntity = this.childEntities[childId];
    let parentEntity = childEntity.getParent();

    let position = {
      x: 0,
      y: 0,
      z: 0,
    };
    while (parentEntity) {
      if (parentEntity.hasComponent(PositionComponent.type)) {
        let relativePosition = parentEntity.getComponent(PositionComponent.type);
        position.x += relativePosition.x;
        position.y += relativePosition.y;
        position.z += relativePosition.z;
      }
      parentEntity = parentEntity.getParent();
    }
    return position;
  }
}