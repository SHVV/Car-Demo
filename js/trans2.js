//==============================================================================
// Transform 2D
//==============================================================================

//==============================================================================
// C-tor
Trans2 = function(pos, angle, m) {
  if (angle == null) angle = 0;

  this.pos = new Vec2();
  this.m_r = new Mat22();

  if (pos != null) {
    this.pos.SetV(pos);
  }
  
  if (m != null) {
    this.m_r.SetM(m);
  } else {
    this.m_r.Set(angle);
  }
};

//==============================================================================
Trans2.prototype.SetT = function(t) {
  this.pos.SetV(t.pos);
  this.m_r.SetM(t.m_r);
}

//==============================================================================
Trans2.prototype.TransFromV = function(v) {
  return Vec2.add(this.pos, Math2.MulMV(this.m_r, v));
}

//==============================================================================
Trans2.prototype.TransToV = function(v) {
  return Math2.MulTMV(this.m_r, Vec2.subtract(v, this.pos));
}

//==============================================================================
Trans2.prototype.TransFromM = function(M) {
  return Math2.MulMM(this.m_r, M);
}

//==============================================================================
Trans2.prototype.TransFromT = function(T) {
  var pos = this.TransFromV(T.pos);
  var m = this.TransFromM(T.m_r);
  return new Trans2(pos, 0, m);
}
