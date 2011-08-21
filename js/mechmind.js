//==============================================================================
// Mechmind
//==============================================================================

//==============================================================================
// C-tor
function Mechmind() {
  // state
  this.velocity = new Vec2(0,0);
  this.speed = 0;
  this.path = 0.0;
  //this.trans = new Trans2(this.pos, this.angle, null);

  // parameters
  this.c_drag = 1;        // linear resistance
  this.c_turb = 30;       // turbulence resistance
  this.resistance = 0.001;// overall resistance coeff front/back
  this.force = Phys.g * .5;        // engine force (acceleration)
}

//==============================================================================
// Inhereted from ControllableObject
Mechmind.prototype = new ControllableObject();

//==============================================================================
// Run object
Mechmind.prototype.run = function(dt) {
  var side_accel = Math2.Clamp(this.strafe - this.steering, -1, 1);
  var accel = new Vec2(side_accel, this.traction);
  accel.Normalize();
  accel.MulS(this.force);

  var v = this.velocity.Length(); 
   
  var res = (v * this.c_drag + this.c_turb) * this.resistance;
  accel.AddV(Vec2.multiplyScalar(-res, this.velocity));

  this.velocity.AddV(Vec2.multiplyScalar(dt, accel));
  this.speed = this.velocity.Length();
  Debug.write_line("<br/>Speed: " + Math.round(this.speed * 3.6) + "km/h")

  this.pos.AddV(Vec2.multiplyScalar(dt, this.velocity));
}

//==============================================================================
// Draw object
Mechmind.prototype.draw = function(dt) {
  // Shadow
  this.engine.m_ctx_ex.m_trans.pos = Vec2.add(this.pos, {x:.1, y:-.1});
  this.engine.m_ctx_ex.draw_circle({x:0,y:0}, 0.25, null, 'rgba(0,0,0,0.5)');

  // Car
  this.engine.m_ctx_ex.m_trans.pos.SetV(this.pos);
  this.engine.m_ctx_ex.draw_circle({x:0,y:0}, 0.25, '#808080', 'white');
}
