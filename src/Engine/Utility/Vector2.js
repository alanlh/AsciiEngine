// Copied from AsciiEngine
"use strict";
const Vector2 = {};

Vector2.create = function(x, y) {
  return Object.freeze({x: x, y: y});
}

Vector2.default = function() {
  return Vector2.create(0, 0);
}

Vector2.createFrom = function(other) {
  if (!Vector2.verify(other)) {
    return Vector2.create(0, 0);
  }
  return Vector2.copy(other);
}

Vector2.copy = function(other) {
  LOGGING.ASSERT(Vector2.verify(other), "Vector2.copy method parameter other is not a Vector2-like: ", other);
  return Vector2.create(other.x, other.y);
}

Vector2.copyAsInteger = function(other) {
  // TODO: Round x, y to integer if not already. 
  LOGGING.ASSERT(Vector2.verify(other), "Vector2.copy method parameter other is not a Vector2-like: ", other);
  return Vector2.create(other.x, other.y);
}

Vector2.add = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.add method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.add method parameter v2 is not Vector2-like: ", v2);
  return Vector2.create(v1.x + v2.x, v1.y + v2.y);
}

Vector2.subtract = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.subtract method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.subtract method parameter v2 is not Vector2-like: ", v2);
  return Vector2.create(v1.x - v2.x, v1.y - v2.y);
}

Vector2.dot = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.dot method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.dot method parameter v2 is not Vector2-like: ", v2);
  return Vector2.create(v1.x * v2.x, v1.y * v2.y);
}

Vector2.takeTopLeft = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.takeTopLeft method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.takeTopLeft method parameter v2 is not Vector2-like: ", v2);
  return Vector2.create(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
}

Vector2.takeBottomRight = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.takeBottomRight method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.takeBottomRight method parameter v2 is not Vector2-like: ", v2);
  return Vector2.create(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
}

Vector2.inBoundingBox = function(vec2, topLeftCoords, boundingBoxDimens) {
  LOGGING.ASSERT(Vector2.verify(vec2), "Vector2.takeBottomRight method parameter vec2 is not Vector2-like: ", vec2);
  LOGGING.ASSERT(Vector2.verify(topLeftCoords), "Vector2.takeBottomRight method parameter topLeftCoords is not Vector2-like: ", topLeftCoords);
  LOGGING.ASSERT(Vector2.verify(boundingBoxDimens), "Vector2.takeBottomRight method parameter boundingBoxDimens is not Vector2-like: ", boundingBoxDimens);
  return vec2.x >= topLeftCoords.x
    && vec2.x < topLeftCoords.x + boundingBoxDimens.x
    && vec2.y >= topLeftCoords.y
    && vec2.y < topLeftCoords.y + boundingBoxDimens.y;
}

Vector2.isInteger = function(v) {
  // TODO: Implement 
  return true;
}

Vector2.verify = function(v) {
  // TODO: Check that v.x and v.y are numbers
  return v && ("x" in v) && ("y" in v);
}

Vector2.verifyInteger = function(v) {
  return Vector2.verify(v) && Vector2.isInteger(v);
}

Object.freeze(Vector2);
