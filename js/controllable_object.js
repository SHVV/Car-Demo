//==============================================================================
// Base controllable object
//==============================================================================

//==============================================================================
// C-tor
function ControllableObject() {
  this.traction = 0.0;
  this.steering = 0.0;
  this.strafe = 0.0;
  this.hand_brake = false;
  this.flags = GameObject.DRAWABLE | GameObject.RUNABLE | GameObject.MOVABLE;
}

//==============================================================================
// Inhereted from GameObject
ControllableObject.prototype = new GameObject();

//==============================================================================
// Run object
ControllableObject.prototype.run = function(dt) {
  
}

//==============================================================================
// Draw object
ControllableObject.prototype.draw = function(dt) {
  
}
