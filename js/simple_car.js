//==============================================================================
// Simple car
//==============================================================================

//==============================================================================
// C-tor
function SimpleCar() {
  // state
  this.speed = 0.0;
  this.steer_angle = 0.0;
  this.path = 0.0;

  // parameters
  this.friction = 1;      // wheels friction coeffecient
  this.buget = this.friction * Phys.g;
  this.c_drag = 1;        // linear resistance
  this.c_turb = 30;       // turbulence resistance
  this.resistance = 0.001;// overall resistance coeff
  this.power = 100;       // engine power W/kg
  this.max_speed1 = this.power / this.buget; 
  this.max_steer = Math.PI / 4;

  this.back_wheels = 1.2; // distance from back wheels to object center
  this.front_wheels = 1.5;// distance from front wheels to object center
  this.wheel_base = this.back_wheels + this.front_wheels;  // wheels base
}

//==============================================================================
// Inhereted from ControllableObject
SimpleCar.prototype = new ControllableObject();

//==============================================================================
// Run object
SimpleCar.prototype.run = function(dt) {
  var accel = 0;
  if (this.hand_brake) {
    accel = (this.speed < 0) ? this.buget : ((this.speed > 0) ? -this.buget : 0);
  } else {
    accel = this.traction * this.buget;
    if ((accel * this.speed > 0) && Math.abs(this.speed) > this.max_speed1) {
      accel /= Math.abs(this.speed) / this.max_speed1;
    }
  }
  accel -= (Math.abs(this.speed) * this.c_drag + this.c_turb) * this.speed * this.resistance;
  if (this.hand_brake && (Math.abs(accel * dt) > Math.abs(this.speed))) {
    this.speed = 0;
  } else {
    this.speed += accel * dt;
  }
  
  Debug.write_line("<br/>Speed: " + Math.round(this.speed * 3.6) + "km/h")
  
  var max_steer = this.max_steer;
  if ((this.speed > 0.0001) || (this.speed < -0.0001)) {
    var r = this.speed * this.speed / this.buget;
    var steer = Math.atan(this.wheel_base / r);
    if (steer < max_steer) {
      max_steer = steer;
    }
  }
  this.steer_angle = this.steering * max_steer;
  
  var ca = Math.cos(this.angle);
  var sa = Math.sin(this.angle);
  var d_pos = new Vec2(-sa, ca);
  d_pos = Vec2.multiplyScalar(this.speed * dt, d_pos);
  this.pos = Vec2.add(this.pos, d_pos);
  
  this.path += Math.abs(this.speed * dt);
  Debug.write_line("Path: " + Math.round(this.path) + "m")

  if (!this.hand_brake) {
    this.angle += max_steer * dt * this.steering * this.speed / 2.7;
  }
}

//==============================================================================
// Draw object
SimpleCar.prototype.draw = function(dt) {
  var car_shape = [{x:-.9,y:-2}, {x:.9,y:-2}, {x:.9,y:2}, {x:0,y:2.2}, {x:-.9,y:2}, {x:-.9,y:-2}];
  var car_shape2 = [{x:0,y:1.2}, {x:-.8,y:1}, {x:-.8,y:0}, {x:.8,y:0}, {x:.8,y:1}, {x:0,y:1.2}, {x:0, y:2}];
  var car_shape3 = [{x:-.7,y:0}, {x:-.7,y:-1.9}, {x:.7,y:-1.9}, {x:.7,y:0}];
  var wheel_shape = [{x:-.12,y:-.3}, {x:.12,y:-.3}, {x:.12,y:.3}, {x:-.12,y:.3},{x:-.12,y:-.3}];

  var car_trans = new Trans2(this.pos, this.angle, null);

  // Shadow
  this.engine.m_ctx_ex.set_trans(car_trans);
  this.engine.m_ctx_ex.m_trans.pos = Vec2.add(this.engine.m_ctx_ex.m_trans.pos, {x:.3, y:-.3});
  this.engine.m_ctx_ex.draw_poly(car_shape, null, 'rgba(0,0,0,0.5)');

  // Wheels
  var wheel_trans = new Trans2({x:.85, y:this.front_wheels}, this.steer_angle);
  this.engine.m_ctx_ex.set_trans(car_trans.TransFromT(wheel_trans));
  this.engine.m_ctx_ex.draw_poly(wheel_shape, null, '#404040');
  wheel_trans.pos.x = -wheel_trans.pos.x;
  this.engine.m_ctx_ex.set_trans(car_trans.TransFromT(wheel_trans));
  this.engine.m_ctx_ex.draw_poly(wheel_shape, null, '#404040');
  wheel_trans.m_r.Set(0);
  wheel_trans.pos.x = 0.85;
  wheel_trans.pos.y = -this.back_wheels;
  this.engine.m_ctx_ex.set_trans(car_trans.TransFromT(wheel_trans));
  this.engine.m_ctx_ex.draw_poly(wheel_shape, null, '#404040');
  wheel_trans.pos.x = -wheel_trans.pos.x;
  this.engine.m_ctx_ex.set_trans(car_trans.TransFromT(wheel_trans));
  this.engine.m_ctx_ex.draw_poly(wheel_shape, null, '#404040');

  // Car
  this.engine.m_ctx_ex.set_trans(car_trans);
  this.engine.m_ctx_ex.draw_poly(car_shape, '#808080', 'white');
  this.engine.m_ctx_ex.draw_poly(car_shape2, '#808080', null);
  this.engine.m_ctx_ex.draw_poly(car_shape3, '#808080', null);
}
