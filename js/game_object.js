//==============================================================================
// Base game object
//==============================================================================

//==============================================================================
// C-tor
function GameObject() {
  this.pos = new Vec2(0, 0);  // position
  this.z = 0;                 // z-position
  this.angle = 0;             // rotation angle
  this.flags = 0;             // object flags
  this.engine = null;
}

//==============================================================================
// GameObject flags
GameObject.DRAWABLE = 1;
GameObject.RUNABLE = 2;
GameObject.MOVABLE = 4;

//==============================================================================
// Init game object
GameObject.prototype.init = function(engine, pos, angle) {
  this.engine = engine;       // link to game engine
  this.pos.SetV(pos);
  this.angle = angle;
}

//==============================================================================
// Run object
GameObject.prototype.run = function(dt) {
  
}

//==============================================================================
// Draw object
GameObject.prototype.draw = function(dt) {
  
}
