import AsciiAnimateComponent from "../../engine/components/AsciiAnimateComponent.js";
import MapSystem from "../../engine/systems/MapSystem.js";
import ClickableComponent from "../components/ClickableComponent.js";
import AsciiRenderComponent from "../../engine/components/AsciiRenderComponent.js";

/**
 * An alternate implementation of ButtonSystem where the user provides the render components.
 * This can be used with both Animate and Render components, but render components will not react to mouse events.
 * Messages will be sent for both Animate and Render components.
 */
export default class ClickableSystem extends MapSystem {
  constructor() {
    super("Clickable Entities");

    /**
    * @private
    */
    this._handleMouseClick = this._handleMouseClick.bind(this);
    /**
     * @private
     */
    this._handleMouseEnter = this._handleMouseEnter.bind(this);
    /**
     * @private
     */
    this._handleMouseLeave = this._handleMouseLeave.bind(this);
    /**
     * @private
     */
    this._handleMouseDown = this._handleMouseDown.bind(this);
    /**
     * @private
     */
    this._handleMouseUp = this._handleMouseUp.bind(this);

    /**
     * @private
     * Keep track of entities that are currently being hovered or clicked.
     * If their visibility is set to false, then their state needs to be reset back to Default.
     */
    this._mousedOverEntities = new Set();
  }

  check(entity) {
    return entity.hasComponent(ClickableComponent.type)
      && (entity.hasComponent(AsciiRenderComponent.type) || entity.hasComponent(AsciiAnimateComponent.type));
  }

  add(entity) {
    super.add(entity);

    // Subscribe to mouse events.
    this.subscribe(["MouseEvent", entity.id, "click"], this._handleMouseClick, false);
    this.subscribe(["MouseEvent", entity.id, "mouseenter"], this._handleMouseEnter, false);
    this.subscribe(["MouseEvent", entity.id, "mouseleave"], this._handleMouseLeave, false);
    this.subscribe(["MouseEvent", entity.id, "mousedown"], this._handleMouseDown, false);
    this.subscribe(["MouseEvent", entity.id, "mouseup"], this._handleMouseUp, false);
  }

  remove(entity) {
    this.unsubscribe(["MouseEvent", entity.id]);
    if (this._mousedOverEntities.has(entity.id)) {
      this._mousedOverEntities.delete(entity.id);
    }
    
    super.remove(entity);
  }

  update() {
    for (let entityId of this._mousedOverEntities) {
      const entity = this.entities[entityId];
      if (entity.hasComponent(AsciiAnimateComponent.type)) {
        const animateComponent = entity.getComponent(AsciiAnimateComponent.type);
        if (animateComponent.visible === false) {
          this._updateClickableMouseState(entityId, ClickableSystem.MouseStates.Default);
        }
      }
    }
  }

  /**
   * Simply forwards the click event to any listeners.
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseClick(_event, descriptor) {
    this.postMessage(["AsciiClickableElement", descriptor[1], "click"]);
  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseEnter(_event, descriptor) {
    let entityId = descriptor[1];
    this.postMessage(["AsciiClickableElement", entityId, "mouseenter"]);
    this._updateClickableMouseState(entityId, ClickableSystem.MouseStates.Hover);
  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseLeave(_event, descriptor) {
    let entityId = descriptor[1];
    this.postMessage(["AsciiClickableElement", entityId, "mouseleave"]);
    this._updateClickableMouseState(entityId, ClickableSystem.MouseStates.Default);
  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseDown(_event, descriptor) {
    let entityId = descriptor[1];
    this.postMessage(["AsciiClickableElement", entityId, "mouseleave"]);
    this._updateClickableMouseState(entityId, ClickableSystem.MouseStates.Active);
  }

  /**
   * 
   * @private
   * @param {any} _event The event body
   * @param {Array<string>} descriptor The event descriptor
   */
  _handleMouseUp(_event, descriptor) {
    let entityId = descriptor[1];
    this.postMessage(["AsciiClickableElement", entityId, "mouseup"]);
    this._updateClickableMouseState(entityId, ClickableSystem.MouseStates.Hover);
  }

  /**
   * @private
   * @param {string} entityId The id of the entity
   * @param {ClickableSystem.MouseState} mouseState 
   */
  _updateClickableMouseState(entityId, mouseState) {
    let entity = this.entities[entityId];
    if (!entity.hasComponent(AsciiAnimateComponent.type)) {
      return;
    }
    let animateComponent = entity.getComponent(AsciiAnimateComponent.type);
    let clickableComponent = entity.getComponent(ClickableComponent.type);
    switch (mouseState) {
      case ClickableSystem.MouseStates.Default:
        animateComponent.setFrame(clickableComponent.defaultFrame);
        this._mousedOverEntities.delete(entityId);
        break;
      case ClickableSystem.MouseStates.Hover:
        animateComponent.setFrame(clickableComponent.hoverFrame);
        this._mousedOverEntities.add(entityId);
        break;
      case ClickableSystem.MouseStates.Active:
        animateComponent.setFrame(clickableComponent.activeFrame);
        break;
    }
  }
}

ClickableSystem.MouseStates = {
  Default: 0,
  Hover: 1,
  Active: 2,
}