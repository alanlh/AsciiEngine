"use strict";
function Vector2(x, y) {
  // TODO: Check if x and y are integers. 
  // TODO: Round if x, y aren't integers. (?)
  Object.defineProperty(this, "x", {
    value: x
  });
  Object.defineProperty(this, "y", {
    value: y
  });
}

Vector2.createFrom = function(other) {
  if (!Vector2.verify(other)) {
    return new Vector2(0, 0);
  }
  return Vector2.copy(other);
}

Vector2.copy = function(other) {
  LOGGING.ASSERT(Vector2.verify(other), "Vector2.copy method parameter other is not a Vector2-like: ", other);
  return new Vector2(other.x, other.y);
}

Vector2.copyAsInteger = function(other) {
  // TODO: Round x, y to integer if not already. 
  LOGGING.ASSERT(Vector2.verify(other), "Vector2.copy method parameter other is not a Vector2-like: ", other);
  return new Vector2(other.x, other.y);
}

Vector2.add = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.add method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.add method parameter v2 is not Vector2-like: ", v2);
  return new Vector2(v1.x + v2.x, v1.y + v2.y);
}

Vector2.subtract = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.subtract method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.subtract method parameter v2 is not Vector2-like: ", v2);
  return new Vector2(v1.x - v2.x, v1.y - v2.y);
}

Vector2.dot = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.dot method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.dot method parameter v2 is not Vector2-like: ", v2);
  return new Vector2(v1.x * v2.x, v1.y * v2.y);
}

Vector2.takeTopLeft = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.takeTopLeft method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.takeTopLeft method parameter v2 is not Vector2-like: ", v2);
  return new Vector2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
}

Vector2.takeBottomRight = function(v1, v2) {
  LOGGING.ASSERT(Vector2.verify(v1), "Vector2.takeBottomRight method parameter v1 is not Vector2-like: ", v1);
  LOGGING.ASSERT(Vector2.verify(v2), "Vector2.takeBottomRight method parameter v2 is not Vector2-like: ", v2);
  return new Vector2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
}

Vector2.prototype.inBoundingBox = function(topLeftCoords, boundingBoxDimens) {
  let bottomRight = Vector2.add(topLeftCoords, boundingBoxDimens);
  return this.x >= topLeftCoords.x
    && this.x < bottomRight.x
    && this.y >= topLeftCoords.y
    && this.y < bottomRight.y;
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
