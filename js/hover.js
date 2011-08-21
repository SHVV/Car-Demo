//==============================================================================
// Hover
//==============================================================================

//==============================================================================
// C-tor
function Hover() {
  // state
  this.velocity = new Vec2(0,0);
  this.speed = 0;
  this.angular_vel = 0;
  this.path = 0.0;
  this.trans = new Trans2(this.pos, this.angle, null);

  // parameters
  this.c_drag = 1;        // linear resistance
  this.c_turb = 30;       // turbulence resistance
  this.resistance = 0.003;// overall resistance coeff front/back
  this.side_res = 0.015;  // overall resistance coeff side
  this.force = 10;        // engine force (acceleration)
  this.strafe_force = 10; // strafe engine force N/kg
  this.rotation = 10;     // angular force for rotation / 
  this.angular_res = 0.5; // angular res
}

//==============================================================================
// Inhereted from ControllableObject
Hover.prototype = new ControllableObject();

//==============================================================================
// Run object
Hover.prototype.run = function(dt) {
  var accel = Vec2.multiplyScalar(this.traction * this.force, this.trans.m_r.col2);
  accel.AddV(Vec2.multiplyScalar(this.strafe * this.strafe_force, this.trans.m_r.col1));
  var angular_accel = this.steering * this.rotation - this.angular_vel * this.angular_res * (this.speed + 1);
  this.angular_vel += angular_accel * dt;

  var v_front = Vec2.dot(this.trans.m_r.col2, this.velocity); 
  var v_side = Vec2.dot(this.trans.m_r.col1, this.velocity);
   
  var res_front = (Math.abs(v_front) * this.c_drag + this.c_turb) * v_front * this.resistance;
  accel.AddV(Vec2.multiplyScalar(-res_front, this.trans.m_r.col2));
  var res_side = (Math.abs(v_side) * this.c_drag + this.c_turb) * v_side * this.side_res;
  accel.AddV(Vec2.multiplyScalar(-res_side, this.trans.m_r.col1));

  this.velocity.AddV(Vec2.multiplyScalar(dt, accel));
  this.speed = this.velocity.Length();
  Debug.write_line("<br/>Speed: " + Math.round(this.speed * 3.6) + "km/h")

  this.angle += dt * this.angular_vel;
  this.pos.AddV(Vec2.multiplyScalar(dt, this.velocity));

  this.trans = new Trans2(this.pos, this.angle, null);
}

//==============================================================================
// Draw object
Hover.prototype.draw = function(dt) {
  var car_shape = [{x:0,y:-2},{x:0.5,y:-1.9},{x:1.5,y:-2.2},{x:1.5,y:-1.5},{x:0.6,y:0},{x:0,y:2},
    {x:-0.6,y:0},{x:-1.5,y:-1.5},{x:-1.5,y:-2.2},{x:-0.5,y:-1.9},{x:0,y:-2}];
  var car_shape2 = [{x:0.5,y:-1.9},{x:0.6,y:0},{x:0,y:.5},{x:-0.6,y:0},{x:-0.5,y:-1.9},{x:0,y:-2},{x:0,y:2}];

  // Shadow
  this.engine.m_ctx_ex.set_trans(this.trans);
  this.engine.m_ctx_ex.m_trans.pos = Vec2.add(this.engine.m_ctx_ex.m_trans.pos, {x:.3, y:-.3});
  this.engine.m_ctx_ex.draw_poly(car_shape, null, 'rgba(0,0,0,0.5)');

  // Car
  this.engine.m_ctx_ex.set_trans(this.trans);
  this.engine.m_ctx_ex.draw_poly(car_shape, '#808080', 'white');
  this.engine.m_ctx_ex.draw_poly(car_shape2, '#808080', null);
}
