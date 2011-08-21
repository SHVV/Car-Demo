//==============================================================================
// Base class for game application
//==============================================================================

//==============================================================================
// C-tor
function BaseApplication() {
  this.m_ctx_id = "";
  this.m_ctx = null;
  this.m_canvas_elm = null;
  this.m_canvas_width = 0;
  this.m_canvas_height = 0;
  this.m_canvas_buffer = null;
  this.m_buf_ctx = null;
  this.m_last_tick = 0;
  this.m_keys = new Array();
  this.m_double_buffering = false;
}

//==============================================================================
// Pre-init function (before document load)
BaseApplication.prototype.pre_init = function(a_ctx_id) {
  this.m_ctx_id = a_ctx_id;
  var _self = this;
  window.onload = function() {_self.init_int()}
  document.onkeydown = function(e) {_self.key_down(e)}
  document.onkeyup = function(e) {_self.key_up(e)}
}

//==============================================================================
// Init function (after document load)
BaseApplication.prototype.init_int = function() {
  // Setup canvas
  this.m_canvas_elm = document.getElementById(this.m_ctx_id);
  this.m_ctx = this.m_canvas_elm.getContext('2d');
  this.m_canvas_width = parseInt(this.m_canvas_elm.width);
  this.m_canvas_height = parseInt(this.m_canvas_elm.height);
  
  if (this.m_double_buffering) {
    this.m_canvas_buffer = document.createElement('canvas');
    this.m_canvas_buffer.width = this.m_canvas_width;
    this.m_canvas_buffer.height = this.m_canvas_height;
    this.m_buf_ctx = this.m_canvas_buffer.getContext('2d');
  } else {
    this.m_buf_ctx = this.m_ctx;
  }
  this.m_ctx_ex = new ContextEx(this.m_buf_ctx, this.m_canvas_width, this.m_canvas_height);
  
  // Init time
  var d = new Date();
  this.m_last_tick = d.getTime();
  
  // Init actual application
  this.init();

  // Run
  var on_frame = window.requestAnimationFrame ||
  		window.webkitRequestAnimationFrame ||
  		window.mozRequestAnimationFrame ||
  		window.oRequestAnimationFrame ||
  		window.msRequestAnimationFrame ||
  		null;
  
  var _self = this;
  if (on_frame) {
		_step = function() { 
			_self.step();
			tickID = on_frame(_step); 
		}
  	_step();
  } else {
    _step = function() {_self.step()}
  	setInterval(_step, 0);
  }
}

//==============================================================================
// Returns key code from keyboard event
BaseApplication.prototype.get_key = function(e) {
  // TODO: add filtering for registered keys only.
  if(window.event) {    // IE
    e.returnValue = false;
    return e.keyCode;
  } else if(e.which) {  // Netscape/Firefox/Opera
    e.preventDefault();
    return e.which;
  }
}

//==============================================================================
// On key down Handler
BaseApplication.prototype.key_down = function(e) {
  this.m_keys[this.get_key(e)] = true;
}

//==============================================================================
// On key up Handler
BaseApplication.prototype.key_up = function(e) {
  this.m_keys[this.get_key(e)] = false;
}

//==============================================================================
// Step function internal
BaseApplication.prototype.step = function() {
  // calculate step
  var d = new Date();
  var cur_tick = d.getTime();
  var dt = (cur_tick - this.m_last_tick) / 1000;
  if (isNaN(dt) || (dt > 0.1)) {
    dt = 0.1;
  };
  this.m_last_tick = cur_tick;

  // Draw FPS
  if (dt > 0) {
    Debug.output("FPS: " + Math.floor(1 / dt));
  } else {
    Debug.output("FPS: inf");
  }
  
  // Process keys        
  this.process_keys(dt);
  
  // Run for dt
  this.run(dt);
  
  // Run extended context
  this.m_ctx_ex.run(dt);

  // Draw
  this.draw(dt);

  // Copy buffer
  if (this.m_double_buffering) {
    this.m_ctx.drawImage(this.m_canvas_buffer, 0, 0);
  }
}

//==============================================================================
// Overloads
//==============================================================================

//==============================================================================
// Init function (after document load) for overloading
BaseApplication.prototype.init = function() {
  // Empty, should be overloaded
}

//==============================================================================
// Process keys        
BaseApplication.prototype.process_keys = function(dt) {
  // Empty, should be overloaded
}

//==============================================================================
// Run objects        
BaseApplication.prototype.run = function(dt) {
  // Empty, should be overloaded
}

//==============================================================================
// Draw
BaseApplication.prototype.draw = function(dt) {
  // Empty, should be overloaded
}
