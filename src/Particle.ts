import {vec3, vec4} from 'gl-matrix';
import {gl} from './globals';

class Particle {
  
  color: vec4 = vec4.create();
  position: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
  velocity: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
  acceleration: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
  elapsedTime: number = 0.0;
  mass : number = 1.0;

  state: Array<number> = [0, 0, 0, 0, 0, 0];
  stateDot: Array<number> = [0, 0, 0, 0, 0, 0];

  initialize()
  {
    this.state[0] = this.position[0];
    this.state[1] = this.position[1];
    this.state[2] = this.position[2];

    this.state[3] = this.velocity[0];
    this.state[4] = this.velocity[1];
    this.state[5] = this.velocity[2];
  }

  

  computeDynamics()
  {
    this.stateDot[3] = this.acceleration[0] / this.mass;
    this.stateDot[4] = this.acceleration[1] / this.mass;
    this.stateDot[5] = this.acceleration[2] / this.mass;

    this.stateDot[0] = this.state[3];
    this.stateDot[1] = this.state[4];
    this.stateDot[2] = this.state[5];
  }

  runge_kutta_2nd(deltaTime: number)
  {
    //calculate Vel
    let PredictVel : vec3 = vec3.create();
    PredictVel = vec3.fromValues(this.state[3] + (this.stateDot[3] * deltaTime), this.state[4] + (this.stateDot[4] * deltaTime), this.state[5] + (this.stateDot[5] * deltaTime)); 

    let PredictVelPrime : vec3 = vec3.create();
    PredictVelPrime = vec3.fromValues( (PredictVel[0] - this.state[3]) / deltaTime, (PredictVel[1] - this.state[4]) / deltaTime, (PredictVel[2] - this.state[5]) / deltaTime );

    this.state[3] += (deltaTime / 2.0)*(this.stateDot[3] + PredictVelPrime[0]);
		this.state[4] += (deltaTime / 2.0)*(this.stateDot[4] + PredictVelPrime[1]);
		this.state[5] += (deltaTime / 2.0)*(this.stateDot[5] + PredictVelPrime[2]);

    //calculate Pos
    let PredictPos : vec3 = vec3.create();
    PredictPos = vec3.fromValues(this.state[0] + (this.stateDot[0] * deltaTime), this.state[1] + (this.stateDot[1] * deltaTime), this.state[2] + (this.stateDot[2] * deltaTime));
    
    let PredictPosPrime : vec3 = vec3.create();
    PredictPosPrime = vec3.fromValues( (PredictPos[0] - this.state[0]) / deltaTime, (PredictPos[1] - this.state[1]) / deltaTime, (PredictPos[2] - this.state[2]) / deltaTime );

    this.state[0] +=  (deltaTime/2.0)*(this.stateDot[0] + PredictPosPrime[0]);
		this.state[1] +=  (deltaTime/2.0)*(this.stateDot[1] + PredictPosPrime[1]);
    this.state[2] +=  (deltaTime/2.0)*(this.stateDot[2] + PredictPosPrime[2]);
    
    this.position = vec3.fromValues(this.state[0], this.state[1], this.state[2]);
    this.velocity = vec3.fromValues(this.state[3], this.state[4], this.state[5]);

    //console.log(this.velocity);

  }

  setDesiredVelocity(desiredVelocity : vec3)
  {   
    var speed = vec3.length(desiredVelocity);

    vec3.mul(desiredVelocity, vec3.normalize(desiredVelocity, desiredVelocity) , vec3.fromValues(25.0, 25.0, 25.0));
    /*
    if(speed > 5.0)
    {
      vec3.mul(desiredVelocity, vec3.normalize(desiredVelocity, desiredVelocity) , vec3.fromValues(5.0, 5.0, 5.0));
    }
    else if(speed < 2.0)
    {
      desiredVelocity = vec3.fromValues(0,0,0);
    }
    */

    let resultForce : vec3 = vec3.create();
    vec3.subtract(resultForce , desiredVelocity, vec3.fromValues( this.state[3], this.state[4], this.state[5]));
    vec3.multiply(this.acceleration, resultForce, vec3.fromValues(this.mass, this.mass, this.mass));

    //this.acceleration = vec3.multiply(this.acceleration, vec3.normalize(this.acceleration, this.acceleration), vec3.fromValues(10.0, 10.0, 10.0));

    /*
    if( vec3.length(this.acceleration) > 10.0 )
    {
      this.acceleration = vec3.multiply(this.acceleration, vec3.normalize(this.acceleration, this.acceleration), vec3.fromValues(10.0, 10.0, 10.0));
    }
    */
  }

  updateAcceleration(force : vec3)
  {
    vec3.div(this.acceleration, force, vec3.fromValues(this.mass, this.mass, this.mass));
  }

  update(deltaTime: number)
  {    
    this.computeDynamics();

    this.runge_kutta_2nd(deltaTime);

    this.elapsedTime += deltaTime;
  }
  
};

export default Particle;
