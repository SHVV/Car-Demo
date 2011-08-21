//==============================================================================
// Game application class
//==============================================================================

//==============================================================================
// C-tor
function Application(a_ctx) {
  //this.car = new ArcadeCar();
  this.car = new ArcadeCar();
  this.car.init(this, {x:0, y:0}, 0);
  this.pre_init(a_ctx);
}

Application.prototype = new BaseApplication();

//==============================================================================
// Init function (after document load) for overloading
Application.prototype.init = function() {
  var _self = this;
  document.getElementById('chABS').onchange = function() {
    if (_self.car.abs !== undefined) _self.car.abs = this.checked;
  }
  document.getElementById('chTCS').onchange = function() {
    if (_self.car.tcs !== undefined) _self.car.tcs = this.checked;
  }
  document.getElementById('chSTEER').onchange = function() {
    if (_self.car.steer_control !== undefined) _self.car.steer_control = this.checked;
  }
  document.getElementById('selDRIVE').onchange = function() {
    if (_self.car.set_drive !== undefined) {
      switch (this.value) {
        case 'RWD': _self.car.set_drive(false, true); break;
        case 'FWD': _self.car.set_drive(true, false); break;
        case 'AWD': _self.car.set_drive(true, true); break;
      }
    }
  }
}

function drive_val(d_val, cur_val, dt) {
  if (Math.abs(d_val - cur_val) < dt) {
    return d_val;
  }
  d_val = ((d_val - cur_val) > 0 ? 1 : -1) * dt;
  cur_val += d_val;
  return Math2.Clamp(cur_val, -1, 1);
}

//==============================================================================
// Process keys        
Application.prototype.process_keys = function(dt) {
  this.car.hand_brake = false;
  
  var d_val = 0;
  if (this.m_keys[key_code.UP] || this.m_keys[key_code.W]) {
    d_val = 1;
  }
  if (this.m_keys[key_code.DOWN] || this.m_keys[key_code.S]) {
    d_val -= 1;
  }
  this.car.traction = drive_val(d_val, this.car.traction, dt * 2);

  d_val = 0;
  if (this.m_keys[key_code.LEFT]) {
    d_val = 1;
  }
  if (this.m_keys[key_code.RIGHT]) {
    d_val -= 1;
  }
  this.car.steering = drive_val(d_val, this.car.steering, dt * 4);

  if (this.m_keys[key_code.SPACE]) {
    this.car.hand_brake = true;
  }
  
  d_val = 0;
  if (this.m_keys[key_code.A]) {
    d_val = -1;
  }
  if (this.m_keys[key_code.D]) {
    d_val += 1;
  }
  this.car.strafe = drive_val(d_val, this.car.strafe, dt * 4);
 
  var new_car = null;
  if (this.m_keys[key_code['1']]) {
    new_car = new ArcadeCar();
    new_car.abs = document.getElementById('chABS').checked;
    new_car.tcs = document.getElementById('chTCS').checked;
    new_car.steer_control = document.getElementById('chSTEER').checked;
    switch (document.getElementById('selDRIVE').value) {
      case 'RWD': new_car.set_drive(false, true); break;
      case 'FWD': new_car.set_drive(true, false); break;
      case 'AWD': new_car.set_drive(true, true); break;
    }
  }
  if (this.m_keys[key_code['2']]) {
    new_car = new SimpleCar();
  }
  if (this.m_keys[key_code['3']]) {
    new_car = new Hover();
  }
  if (this.m_keys[key_code['4']]) {
    new_car = new Mechmind();
  }
  if (new_car != null) {
    new_car.init(this, this.car.pos, this.car.angle);
    this.car = new_car;
  }
}

//==============================================================================
// Run objects        
Application.prototype.run = function(dt) {
  this.car.run(dt);  
  
  this.m_ctx_ex.m_camera.x = this.car.pos.x;
  this.m_ctx_ex.m_camera.y = this.car.pos.y;
  this.m_ctx_ex.m_camera.z = 50 + this.car.speed * this.car.speed * 0.25;
}

//==============================================================================
// Draw
Application.prototype.draw = function(dt) {
  this.m_ctx_ex.draw_grid();
  
  this.car.draw(dt);
}

// Entry point
new Application('canvas');