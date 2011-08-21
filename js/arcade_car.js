//==============================================================================
// Arcade car
//==============================================================================

//==============================================================================
// C-tor Wheel
function CarWheel(a_car, a_pos, a_drive, a_steer) {
  this.car = a_car;           // link to car
  this.pos = a_pos.Copy();    // position in car coordinates
  this.drive = a_drive;       // driving wheel
  this.steer = a_steer;       // steering wheel
  this.angle = 0;             // steering angle
  this.sliding = false;       // wheel is sliding
  this.blocked = false;       // wheel is blocked
  this.buget = 0;             // last friction buget
  this.old_force = new Vec2();// old force
  this.sliding_coef = 0.5;    // Sliding coefficient
  this.trail = new Array();   // Wheel trails
}

//==============================================================================
// Calculates wheel force
CarWheel.prototype.calc_force = function(a_force, a_brake, a_vel, dt) {
  // Perpendicular for position vector
  var pt = this.pos.Copy();
  pt.CrossFV(1);

  // Force accumulator
  var force;

  // Wheel is blocked if brake force is more then possible static friction
  this.blocked = Math.abs(a_brake) > this.buget;
  
  // ABS with main brakes
  if (this.blocked && !this.car.hand_brake && this.car.abs) {
    a_brake = this.buget;
    this.blocked = false;
  }

  if (this.blocked) { // wheel is blocked - anisotropic friction
    var vn = a_vel.Copy();
    vn.Normalize();
    var pv = Vec2.dot(pt, vn);

    // j - impulse to compensate summary velocity 
    var j = Vec2.multiplyScalar(1 / (1 / this.car.mass + pv * pv / this.car.inertia), a_vel);
    // force to compensae velicity divided by 2 (for front and rear wheels)
    force = Vec2.multiplyScalar(-1 / dt / 2, j);
  } else { // wheel is not blocked
    var m = new Mat22(this.angle);
    // wheel side vector
    var n = m.col1;
    var pn = Vec2.dot(pt, n);

    // Lateral impulse to compensate lateral velocity
    var j = -Vec2.dot(n, a_vel) / (1/this.car.mass + pn * pn / this.car.inertia);
    // Lateral force divided by 2 wheels
    force = Vec2.multiplyScalar(j / dt / 2, n);
    
    // Traction force for drive wheel
    if (this.drive) {
      // Clip traction to buget, if traction control is enabled
      if ((Math.abs(a_force) > this.buget) && this.car.tcs) {
        a_force = this.buget * Math2.Sign(a_force);
      }
      // Add traction
      force.AddV(Vec2.multiplyScalar(a_force, m.col2));
    }
  
    // Brakes
    if (Vec2.dot(a_vel, m.col2) > 0) {
      force.AddV(Vec2.multiplyScalar(-a_brake, m.col2));
    } else {
      force.AddV(Vec2.multiplyScalar(a_brake, m.col2));
    }
  }
  
  // Clip to friction circle
  var l = force.Length();
  this.sliding = l > this.buget;
  if (this.sliding) { // Sliding
    // Simple interpretation of Pacejka formula
    if (l > 3 * this.buget) {
      force.MulS(this.sliding_coef * this.buget / l);
    } else {
      force.MulS((1 - (1 - this.sliding_coef) * ((l - this.buget) / (2 * this.buget))) * this.buget / l);
    }
  }
  
  // Save force
  this.old_force.SetV(force);
  return force;
}

//==============================================================================
// C-tor
function ArcadeCar() {
  // state
  this.steer_angle = 0.0;           // Steer angle
  this.velocity = new Vec2(0, 0);   // current velocity
  this.angular_vel = 0;             // Angular velocity
  this.prev_accel = new Vec2(0, 0); // Acceleration on previus step

  this.speed = 0.0;                 // Scalar speed
  this.trans = new Trans2(this.pos, this.angle, null);  // Transformation

  // flags
  this.abs = true;                  // ABS flag
  this.tcs = true;                  // Traction control system flag
  this.steer_control = true;        // steering control system flag

  // parameters
  this.mass = 1000;                 // Mass 1 ton
  this.inertia = this.mass / 12 * (2*2 + 4*4);  // Inertia momentum for box destribution

  this.friction = 1;                // wheels friction coeffecient
  this.buget = this.friction * Phys.g * this.mass;  // Summary friction buget
  this.braking_coef = 2;            // Braking coefficient
  this.front_braking = 0.3;         // Front braking coefficient
  this.c_sqr = 0.5;                 // Coefficient of Sqr part of air resistance
  this.c_lin = this.c_sqr * 30;     // Coefficient of linear part of resistance
  this.power = 100000;              // engine power W (134 H.P.)
  this.max_steer = Math.PI / 4;     // Max steering angle
  this.mass_height = 0.5;           // Height of mass center.

  this.back_wheels = 1.2;           // distance from rear wheels to object center
  this.front_wheels = 1.5;          // distance from front wheels to object center
  this.wheel_base = this.back_wheels + this.front_wheels;  // wheels base
  this.wheel_shift = 0.85;
  
  this.trails_len = 60 * 5;         // Trails length

  // Wheels
  this.wheels = new Array();
  this.wheels[0] = new Array(); // Front wheels
  this.wheels[0][0] = new CarWheel(this, new Vec2(-this.wheel_shift, this.front_wheels), false, true); // Left
  this.wheels[0][1] = new CarWheel(this, new Vec2(this.wheel_shift, this.front_wheels), false, true);  // Right
  this.wheels[1] = new Array(); // Rear wheels
  this.wheels[1][0] = new CarWheel(this, new Vec2(-this.wheel_shift, -this.back_wheels), true, false); // Left
  this.wheels[1][1] = new CarWheel(this, new Vec2(this.wheel_shift, -this.back_wheels), true, false);  // Right
}

//==============================================================================
// Inhereted from ControllableObject
ArcadeCar.prototype = new ControllableObject();

//==============================================================================
// Set drive wheels
ArcadeCar.prototype.set_drive = function(a_front, a_rear) {
  this.wheels[0][0].drive = a_front;
  this.wheels[0][1].drive = a_front;

  this.wheels[1][0].drive = a_rear;
  this.wheels[1][1].drive = a_rear;
}

//==============================================================================
// Run object
ArcadeCar.prototype.run = function(dt) {
  if (dt < 0.001) return;
  // Force accumulator
  var force = new Vec2();
  // Torque accumulator
  var torque = 0;
  
  // Engine & brakes
  var driving_force = 0;
  var braking_force = 0;
  var braking = [0, 0];

  // velocity in local frame
  var local_vel = this.velocity.Copy();
  local_vel.MulTM(this.trans.m_r);
  var front_speed = local_vel.y;
  
  // Selecting between traction and braking
  if (((this.traction > 0) || (front_speed * this.traction >= 0)) && !this.hand_brake) {
    var abs_speed = Math.abs(front_speed);
    // simple Gear box (variator)
    driving_force = (abs_speed > 1) ? this.power / abs_speed : this.power;
    driving_force *= this.traction;
  } else {
    if (this.hand_brake) {
      // hand brake is always maximum
      braking_force = 1 * this.buget * this.braking_coef;
    } else {
      braking_force = Math.abs(this.traction) * this.buget * this.braking_coef;
    } 
    // front/rear braking ballance
    braking[0] = this.front_braking * braking_force;
    braking[1] = (1 - this.front_braking) * braking_force;
  }

  // Weight transfer
  var local_accel = this.prev_accel.Copy();
  local_accel.MulTM(this.trans.m_r);
  // First - between front and rear wheels
  var weights = new Array();
  weights[0] = this.mass / this.wheel_base * (this.back_wheels * Phys.g - this.mass_height * local_accel.y);
  weights[1] = this.mass / this.wheel_base * (this.front_wheels * Phys.g + this.mass_height * local_accel.y);
  var drive_wheels = 0;
  // Second - between left and right wheels
  for (var i = 0; i < this.wheels.length; ++i) {
    if (this.wheels[i][0].drive) ++drive_wheels;
    this.wheels[i][0].buget = (this.wheel_shift * weights[i] + this.mass_height * local_accel.x * this.mass) / (this.wheel_shift * 2);
    this.wheels[i][1].buget = (this.wheel_shift * weights[i] - this.mass_height * local_accel.x * this.mass) / (this.wheel_shift * 2);
  }
  // Divide driving force for all wheels
  driving_force /= drive_wheels * 2;  

  // Steering control
  var max_steer = this.max_steer;
  if (this.steer_control) {
    // Maximum steering angle from sliding angle for drifting control
    var sliding_ang = Math.abs(Math.atan2(local_vel.x, local_vel.y)) / 0.9;
    max_steer = sliding_ang;
    
    // Maximum steering angle from buget acceleration
    if ((this.speed > 0.0001) || (this.speed < -0.0001)) {
      var r = this.speed * this.speed / this.buget * this.mass;
      var steer = Math.atan(this.wheel_base / r);
      if (steer > max_steer) {
        max_steer = steer * 0.9;
      }
    } else {
      max_steer = this.max_steer;
    }
    if (max_steer > this.max_steer) {
      max_steer = this.max_steer;
    }
  } 
  // Steering
  this.steer_angle = this.steering * max_steer;

  // Wheels circle
  for (var i = 0; i < this.wheels.length; ++i) {
    for (var j = 0; j < this.wheels[i].length; ++j) {
      var wheel = this.wheels[i][j];
      if (wheel.buget < 0) {
        wheel.buget = 0;      
      }
      // Set steering angle for steering wheels
      if (wheel.steer) {
        wheel.angle = (wheel.pos.y > 0) ? this.steer_angle : -this.steer_angle;
      }
      // Calculate full wheel velocity
      wheel_vel = local_vel.Copy();
      wheel_vel.AddV(Vec2.crossScalar(this.angular_vel, wheel.pos));
      
      // Calculate force
      var wheel_force = wheel.calc_force(driving_force, braking[i] / 2, wheel_vel, dt);
      
      // Add force and torque to accumulators
      torque += Vec2.cross(wheel.pos, wheel_force);
      wheel_force.MulM(this.trans.m_r);
      force.AddV(wheel_force);
    }
  }
  
  // Isotropic Air resistance
  force.AddV(Vec2.multiplyScalar(-(this.velocity.Length() * this.c_sqr + this.c_lin), this.velocity));
  
  // Integrating
  
  // linear
  force.MulS(1/this.mass);
  this.prev_accel.SetV(force);
  this.velocity.AddV(force.MulS(dt));
  this.speed = this.velocity.Length();
  Debug.write_line("<br/>Speed: " + Math.round(this.speed * 3.6) + "km/h")
  this.pos.AddV(Vec2.multiplyScalar(dt, this.velocity));

  // angular
  torque *= dt/this.inertia;
  this.angular_vel += torque;
  this.angle += this.angular_vel * dt;
  
  // update transformation
  this.trans = new Trans2(this.pos, this.angle, null);
  
  // Add wheel trails
  for (var i = 0; i < this.wheels.length; ++i) {
    for (var j = 0; j < this.wheels[i].length; ++j) {
      var wheel = this.wheels[i][j];
      var pos = this.trans.TransFromV(wheel.pos);
      wheel.trail.push({p: pos, w: wheel.sliding ? wheel.buget : 0});
      if (wheel.trail.length > 2 * this.trails_len) {
        wheel.trail = wheel.trail.slice(this.trails_len, wheel.trail.length - 1);
      }
    }
  }
}

//==============================================================================
// Draw object
ArcadeCar.prototype.draw = function(dt) {
  var car_shape = [{x:-.9,y:-2}, {x:.9,y:-2}, {x:.9,y:2}, {x:0,y:2.2}, {x:-.9,y:2}, {x:-.9,y:-2}];
  var car_shape2 = [{x:0,y:1.2}, {x:-.8,y:1}, {x:-.8,y:0}, {x:.8,y:0}, {x:.8,y:1}, {x:0,y:1.2}, {x:0, y:2}];
  var car_shape3 = [{x:-.7,y:0}, {x:-.7,y:-1.9}, {x:.7,y:-1.9}, {x:.7,y:0}];
  var car_shape4 = [{x:0,y:.7}, {x:-.7,y:0.6}, {x:-.7,y:0}, {x:.7,y:0}, {x:.7,y:.6}, {x:0,y:.7}];
  var wheel_shape = [{x:-.12,y:-.3}, {x:.12,y:-.3}, {x:.12,y:.3}, {x:-.12,y:.3},{x:-.12,y:-.3}];

  // Shadow
  this.engine.m_ctx_ex.set_trans(this.trans);
  this.engine.m_ctx_ex.m_trans.pos = Vec2.add(this.engine.m_ctx_ex.m_trans.pos, {x:.3, y:-.3});
  this.engine.m_ctx_ex.draw_poly(car_shape, null, 'rgba(0,0,0,0.1)');
                          
  // Wheels
  for (var i = 0; i < this.wheels.length; ++i) {
    for (var j = 0; j < this.wheels[i].length; ++j) {
      var wheel = this.wheels[i][j];

      this.engine.m_ctx_ex.set_trans(new Trans2({x:0, y:0}, 0));
      this.engine.m_ctx_ex.m_ctx.lineWidth = 0.24 * this.engine.m_ctx_ex.m_zoom;
      this.engine.m_ctx_ex.m_ctx.lineJoin = 'bevel';
      var len = wheel.trail.length;
      var started = false;
      var part = new Array();
      for (var k = len - 1; (k > 0) && (k > (len - this.trails_len)); --k) {
        var point = wheel.trail[k];
        if (point.w > 1000) {
          started = true;
          part.push(point.p);
        } else {
          if (started) {
            started = false;
            this.engine.m_ctx_ex.draw_poly(part, 'rgba(0,0,0,0.5)', null);
            part = new Array();
          } 
        }
      }
      if (started) {
        this.engine.m_ctx_ex.draw_poly(part, 'rgba(0,0,0,0.5)', null);
      } 
      this.engine.m_ctx_ex.m_ctx.lineWidth = 1;

      this.engine.m_ctx_ex.set_trans(this.trans);
      var force = Vec2.multiplyScalar(1 / 4000, wheel.old_force);
      this.engine.m_ctx_ex.draw_poly([wheel.pos, Vec2.add(wheel.pos, force)], '#808080', null);
      
      var wheel_trans = new Trans2(wheel.pos, wheel.angle);
      this.engine.m_ctx_ex.set_trans(this.trans.TransFromT(wheel_trans));
      this.engine.m_ctx_ex.draw_circle({x:0,y:0}, wheel.buget / 4000, '#808080', wheel.blocked ? 'rgba(0,0,0,0.2)' : null);
      this.engine.m_ctx_ex.draw_poly(wheel_shape, null, '#404040');
    }
  }

  // Car
  this.engine.m_ctx_ex.set_trans(this.trans);
  this.engine.m_ctx_ex.draw_poly(car_shape, '#808080',  'rgba(255,255,255,0.8)'/*'white'*/);
  this.engine.m_ctx_ex.draw_poly(car_shape2, '#808080', null);
  this.engine.m_ctx_ex.draw_poly(car_shape3, '#808080', null);
  this.engine.m_ctx_ex.draw_poly(car_shape4, '#808080', null);
}
