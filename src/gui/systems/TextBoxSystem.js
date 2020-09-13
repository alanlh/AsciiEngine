import System from "../../engine/systems/System.js";
import Entity from "../../engine/Entity.js";

import TextBoxComponent from "../components/TextBoxComponent.js";
import TextBoxInternalComponent from "../components/TextBoxInternalComponent.js";
import PositionComponent from "../../engine/components/PositionComponent.js";
import AsciiRenderComponent from "../../engine/components/AsciiRenderComponent.js";
import Sprite from "../../graphics/Sprite.js";
import Functions from "../../utility/Functions.js";
import Style from "../../graphics/Style.js";

export default class TextBoxSystem extends System {
  constructor() {
    super("TextBox");

    this.parentEntities = {};
    this.childEntities = {};
    this.childMap = {};

    this.defaultTextColor = "#000000";
    this.defaultBackgroundColor = "#ffffff";
  }

  /**
   * 
   * @param {Entity} entity 
   */
  check(entity) {
    return entity.hasComponent(TextBoxComponent.type)
      || entity.hasComponent(TextBoxInternalComponent.type);
  }

  /**
   * 
   * @param {Entity} entity 
   */
  has(entity) {
    return entity.id in this.parentEntities
      || entity.id in this.childEntities;
  }

  /**
   * 
   * @param {Entity} entity 
   */
  add(entity) {
    if (entity.hasComponent(TextBoxComponent.type)) {
      this.parentEntities[entity.id] = entity;
      this._constructChildEntity(entity)
    } else if (entity.hasComponent(TextBoxInternalComponent.type)) {
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

  /**
   * 
   * @param {Entity} parentEntity 
   */
  _constructChildEntity(parentEntity) {
    let textBoxData = parentEntity.getComponent(TextBoxComponent.type);

    let childEntity = new Entity(parentEntity.id);
    let positionComponent = new PositionComponent(0, 0, 0);
    childEntity.setComponent(positionComponent);

    let lines = textBoxData.text.split("\n");
    let rows = [];
    for (let i = 0; i < lines.length; i++) {
      let lineRows = Functions.breakLineIntoRows(lines[i], textBoxData.width, true);
      if (rows.length + lineRows.length > textBoxData.height) {
        lineRows = lineRows.slice(0, textBoxData.height - rows.length);
      }
      rows.push(...lineRows);
      if (rows.length >= textBoxData.height) {
        break;
      }
    }
    while (rows.length < textBoxData.height) {
      rows.push(" ".repeat(textBoxData.width))
    }
    let text = rows.join("\n");

    let sprite = new Sprite(text, {
      spaceIsTransparent: false,
      ignoreLeadingSpaces: false,
    });

    let textColor = textBoxData.textColor || this.defaultTextColor;
    let backgroundColor = textBoxData.backgroundColor || this.defaultBackgroundColor;
    let style = new Style();
    style.setStyle("color", textColor);
    style.setStyle("backgroundColor", backgroundColor);

    let asciiRenderComponent = new AsciiRenderComponent([sprite], [style], [[0, 0, 0]]);
    asciiRenderComponent.dataIsLocal = true;
    childEntity.setComponent(asciiRenderComponent);

    let internalComponent = new TextBoxInternalComponent();
    childEntity.setComponent(internalComponent);

    parentEntity.addChild(childEntity);
  }

  _deconstructChildEntity(parentEntity) {
    // TODO: Is there anything to do, since it doesn't listen for any events?
  }
}