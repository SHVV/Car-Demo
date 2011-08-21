//==============================================================================
// 2D Context extended with camera.
//==============================================================================

//==============================================================================
// C-tor
function ContextEx(a_ctx, a_width, a_height) {
  this.m_ctx = a_ctx;
  this.m_width = a_width;
  this.m_height = a_height;
  this.m_camera = {
    x: 0.0,     // Position in meters x
    y: 0.0,     // y
    z: 50.0,    // z
    FOV: 0.5    // view width / z ratio
  };
  this.m_zoom = 1;
  this.m_trans = new Trans2({x:0,y:0}, 0, null);
};

//==============================================================================
// Set current output transform
ContextEx.prototype.set_trans = function(t) {
  this.m_trans.SetT(t);
}

//==============================================================================
// Run context
ContextEx.prototype.run = function(dt) {
  this.m_zoom = this.m_width / (this.m_camera.z * this.m_camera.FOV);
}

//==============================================================================
// Convert world coordinates to screen
ContextEx.prototype.world2screen = function(wp) {
  var p = {x: wp.x - this.m_camera.x, y: wp.y - this.m_camera.y};
  p.x *= this.m_zoom;
  p.y *= -this.m_zoom;
  p.x += this.m_width * 0.5;
  p.y += this.m_height * 0.5;
  return p;
}

//==============================================================================
// Convert screen coordinates to world
ContextEx.prototype.screen2world = function(sp) {
  var p = {
    x: sp.x - this.m_width * 0.5, 
    y: sp.y - this.m_height * 0.5
  };
  p.x /= this.m_zoom;
  p.y /= -this.m_zoom;
  p.x += this.m_camera.x;
  p.y += this.m_camera.y;
  return p;
}

//==============================================================================
// Draw polyline
ContextEx.prototype.draw_poly = function(a_points, a_stroke, a_fill) {
  this.m_ctx.beginPath();
  var p = this.m_trans.TransFromV(a_points[0]);
  var sp = this.world2screen(p);
  this.m_ctx.moveTo(sp.x + 0.5, sp.y + 0.5);
  for (var i = 1; i < a_points.length; ++i) {
    p = this.m_trans.TransFromV(a_points[i]);
    sp = this.world2screen(p);
    this.m_ctx.lineTo(sp.x + 0.5, sp.y + 0.5);
  }
  if (a_stroke != null) {
    this.m_ctx.strokeStyle = a_stroke;
    this.m_ctx.stroke();
  }
  if (a_fill != null) {
    this.m_ctx.fillStyle = a_fill;
    this.m_ctx.fill();
  }
}

//==============================================================================
// Draw polyline
ContextEx.prototype.draw_circle = function(a_point, a_r, a_stroke, a_fill) {
  this.m_ctx.beginPath();
  var p = this.m_trans.TransFromV(a_point);
  var sp = this.world2screen(p);
  this.m_ctx.arc(sp.x + 0.5, sp.y + 0.5, a_r * this.m_zoom, 0, 2 * Math.PI, false);
  if (a_stroke != null) {
    this.m_ctx.strokeStyle = a_stroke;
    this.m_ctx.stroke();
  }
  if (a_fill != null) {
    this.m_ctx.fillStyle = a_fill;
    this.m_ctx.fill();
  }
}

//==============================================================================
// Draw grid
ContextEx.prototype.draw_grid = function() {
  this.m_ctx.fillStyle = "#FFFFFF";
  //this.m_ctx.clearRect(0, 0, this.m_width, this.m_height);
  this.m_ctx.fillRect(0, 0, this.m_width, this.m_height);
  
  var p0 = {x: 0, y: 0};
  p0 = this.screen2world(p0);
  var p1 = {x: this.m_width, y: this.m_height};
  p1 = this.screen2world(p1);
  this.m_ctx.lineWidth = 1;

  // Grid color dependend on index.
  grid_color = function(a) {
    if (a == 0) {
      return '#000000';    
    }
    if (a % 1000 == 0) {
      return '#606060';    
    }
    if (a % 100 == 0) {
      return '#909090';    
    }
    if (a % 10 == 0) {
      return '#C0C0C0';    
    }
    return '#F0F0F0';
  }

  var dp = (this.m_zoom < 15) ? 5 : 1;
  // Draw vertical lines
  for (var x = Math.round(p0.x / dp) * dp; x < p1.x; x += dp) {
    var p = this.world2screen({x: x, y: 0});
    this.m_ctx.beginPath();
    this.m_ctx.strokeStyle = grid_color(x);
    this.m_ctx.moveTo(p.x + 0.5, 0);
    this.m_ctx.lineTo(p.x + 0.5, this.m_height);
    this.m_ctx.stroke();
  }

  // Draw horizontal lines
  for (var y = Math.round(p1.y / dp) * dp; y < p0.y; y += dp) {
    var p = this.world2screen({x: 0, y: y});
    this.m_ctx.beginPath();
    this.m_ctx.strokeStyle = grid_color(y);
    this.m_ctx.moveTo(0, p.y + 0.5);
    this.m_ctx.lineTo(this.m_width, p.y + 0.5);
    this.m_ctx.stroke();
  }

  var p = this.world2screen({x: 0, y: 0});
  this.m_ctx.beginPath();
  this.m_ctx.lineWidth = 1;
  this.m_ctx.strokeStyle = '#000000';
  this.m_ctx.arc(p.x + 0.5, p.y + 0.5, 0.5 * this.m_zoom, 0, 2 * Math.PI, false);
  this.m_ctx.stroke();  
}
