//==============================================================================
// Extended math
//==============================================================================

//==============================================================================
var Math2 = {};

//==============================================================================
Math2.IsValid = function(x)	{
  return isFinite(x);
};

//==============================================================================
Math2.Dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
};

//==============================================================================
Math2.CrossVV = function(a, b) {
  return a.x * b.y - a.y * b.x;
};

//==============================================================================
Math2.CrossVF = function(a, s) {
  var v = new Vec2(s * a.y, -s * a.x);
  return v;
};

//==============================================================================
Math2.CrossFV = function(s, a) {
  var v = new Vec2(-s * a.y, s * a.x);
  return v;
};

//==============================================================================
Math2.MulMV = function(A, v) {
  var u = new Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
  return u;
};

//==============================================================================
Math2.MulTMV = function(A, v) {
  var u = new Vec2(Math2.Dot(v, A.col1), Math2.Dot(v, A.col2));
  return u;
};

//==============================================================================
Math2.AddVV = function(a, b) {
  var v = new Vec2(a.x + b.x, a.y + b.y);
  return v;
};

//==============================================================================
Math2.SubtractVV = function(a, b){
  var v = new Vec2(a.x - b.x, a.y - b.y);
  return v;
};

//==============================================================================
Math2.MulFV = function(s, a) {
  var v = new Vec2(s * a.x, s * a.y);
  return v;
};

//==============================================================================
Math2.AddMM = function(A, B) {
  var C = new Mat22(0, Math2.AddVV(A.col1, B.col1), Math2.AddVV(A.col2, B.col2));
  return C;
};

//==============================================================================
Math2.MulMM = function(A, B) {
  var C = new Mat22(0, Math2.MulMV(A, B.col1), Math2.MulMV(A, B.col2));
  return C;
};

//==============================================================================
Math2.MulTMM = function(A, B) {
  var c1 = new Vec2(Math2.Dot(A.col1, B.col1), Math2.Dot(A.col2, B.col1));
  var c2 = new Vec2(Math2.Dot(A.col1, B.col2), Math2.Dot(A.col2, B.col2));
  var C = new Mat22(0, c1, c2);
  return C;
};

//==============================================================================
Math2.Abs = function(a) {
  return a > 0.0 ? a : -a;
};

//==============================================================================
Math2.AbsV = function(a) {
  var b = new Vec2(Math2.Abs(a.x), Math2.Abs(a.y));
  return b;
};

//==============================================================================
Math2.AbsM = function(A) {
  var B = new Mat22(0, Math2.AbsV(A.col1), Math2.AbsV(A.col2));
  return B;
};

//==============================================================================
Math2.Min = function(a, b) {
  return a < b ? a : b;
};

//==============================================================================
Math2.MinV = function(a, b) {
  var c = new Vec2(Math2.Min(a.x, b.x), Math2.Min(a.y, b.y));
  return c;
};

//==============================================================================
Math2.Max = function(a, b) {
  return a > b ? a : b;
};

//==============================================================================
Math2.MaxV = function(a, b) {
  var c = new Vec2(Math2.Max(a.x, b.x), Math2.Max(a.y, b.y));
  return c;
};

//==============================================================================
Math2.Clamp= function(a, low, high) {
  return Math2.Max(low, Math2.Min(a, high));
};

//==============================================================================
Math2.ClampV = function(a, low, high) {
  return Math2.MaxV(low, Math2.MinV(a, high));
};

//==============================================================================
Math2.Swap = function(a, b) {
  var tmp = a[0];
  a[0] = b[0];
  b[0] = tmp;
};

//==============================================================================
Math2.Sign = function(a) {
  return (a < 0) ? -1 : ((a > 0) ? 1 : 0);
}

//==============================================================================
Math2.Random = function() {
  return Math.random() * 2 - 1;
};

//==============================================================================
Math2.NextPowerOfTwo = function(x) {
  x |= (x >> 1) & 0x7FFFFFFF;
  x |= (x >> 2) & 0x3FFFFFFF;
  x |= (x >> 4) & 0x0FFFFFFF;
  x |= (x >> 8) & 0x00FFFFFF;
  x |= (x >> 16)& 0x0000FFFF;
  return x + 1;
};

//==============================================================================
Math2.IsPowerOfTwo = function(x) {
  var result = x > 0 && (x & (x - 1)) == 0;
  return result;
};
