//==============================================================================
// 2D vector class
//==============================================================================

//==============================================================================
// C-tor
function Vec2(a_x, a_y) {
  if (a_x === undefined) {
    a_x = 0;
  }
  this.x = a_x;

  if (a_y === undefined) {
    a_y = 0;
  }
  this.y = a_y;
};

//==============================================================================
// Set vecor to zero
Vec2.prototype.SetZero = function() {
  this.x = 0.0;
  this.y = 0.0;
};

//==============================================================================
Vec2.prototype.Set = function(x, y) {
  this.x = x;
  this.y = y;
};

//==============================================================================
Vec2.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y;
};

//==============================================================================
Vec2.prototype.Negative = function() {
  return new Vec2(-this.x, -this.y);
};

//==============================================================================
Vec2.prototype.Copy = function() {
  return new Vec2(this.x, this.y);
};

//==============================================================================
Vec2.prototype.MulM = function(A) {
  var tX = this.x;
  this.x = A.col1.x * tX + A.col2.x * this.y;
  this.y = A.col1.y * tX + A.col2.y * this.y;
};

//==============================================================================
Vec2.prototype.MulTM = function(A) {
  var tX = Vec2.dot(this, A.col1);
  this.y = Vec2.dot(this, A.col2);
  this.x = tX;
};

//==============================================================================
Vec2.prototype.AddV = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

//==============================================================================
Vec2.prototype.MulS = function(s) {
  this.x *= s;
  this.y *= s;
  return this;
};

//==============================================================================
Vec2.prototype.CrossVF = function(s) {
  var tX = this.x;
  this.x = s * this.y;
  this.y = -s * tX;
};

//==============================================================================
Vec2.prototype.CrossFV = function(s) {
  var tX = this.x;
  this.x = -s * this.y;
  this.y = s * tX;
};

//==============================================================================
Vec2.prototype.MinV = function(b) {
  this.x = this.x < b.x ? this.x : b.x;
  this.y = this.y < b.y ? this.y : b.y;
};

//==============================================================================
Vec2.prototype.MaxV = function(b) {
  this.x = this.x > b.x ? this.x : b.x;
  this.y = this.y > b.y ? this.y : b.y;
};

//==============================================================================
Vec2.prototype.Abs = function() {
  this.x = Math.abs(this.x);
  this.y = Math.abs(this.y);
};

//==============================================================================
Vec2.prototype.Length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

//==============================================================================
Vec2.prototype.Normalize = function() {
  var length = this.Length();
  if (length < Number.MIN_VALUE) {
    return 0.0;
  }
  var invLength = 1.0 / length;
  this.x *= invLength;
  this.y *= invLength;

  return length;
};

//==============================================================================
Vec2.prototype.IsValid = function() {
  return isFinite(this.x) && isFinite(this.y);
};

//==============================================================================
Vec2.dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
}

//==============================================================================
Vec2.cross = function(a, b) {
  return a.x * b.y - a.y * b.x;
};

//==============================================================================
Vec2.crossScalar = function(s, a) {
  return new Vec2(-s * a.y, s * a.x);
};

//==============================================================================
Vec2.add = function(a, b) {
  return new Vec2(a.x + b.x, a.y + b.y);
};

//==============================================================================
Vec2.subtract = function(a, b) {
  return new Vec2(a.x - b.x, a.y - b.y);
};

//==============================================================================
Vec2.multiplyScalar = function(s, a) {
  return new Vec2(s * a.x, s * a.y);
};

//==============================================================================
Vec2.abs = function(a) {
  return new Vec2(Math.abs(a.x), Math.abs(a.y));
};
