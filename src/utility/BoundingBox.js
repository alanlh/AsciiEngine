"use strict";
const BoundingBox = {};

BoundingBox.create = function(topLeft, dimens) {
  return Object.freeze({topLeft: Vector2.copy(topLeft), dimens: Vector2.copy(dimens)});
}

BoundingBox.default = function() {
  return BoundingBox.create(Vector2.default(), Vector2.default());
}

BoundingBox.createFrom = function(other) {
  // TODO: Verify.
  return BoundingBox.copy(other.topLeft, other.dimens);
}

BoundingBox.copy = function(other) {
  return BoundingBox.create(other.topLeft, other.dimens);
}

BoundingBox.getTopLeft = function(bb) {
  return bb.topLeft;
}

BoundingBox.getBottomRight = function(bb) {
  return Vector2.add(bb.topLeft, bb.dimens);
}

BoundingBox.inBoundingBox = function(bb, vec2) {
  return vec2.x >= bb.topLeft.x
    && vec2.x < bb.topLeft.x + bb.dimens.x
    && vec2.y >= bb.topLeft.y
    && vec2.y < bb.topLeft.y + bb.dimens.y;
}
