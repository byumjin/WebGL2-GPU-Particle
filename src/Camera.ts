import * as CameraControls from '3d-view-controls';
import {vec3, mat4} from 'gl-matrix';

class Camera {
  controls: any;
  projectionMatrix: mat4 = mat4.create();  
  viewMatrix: mat4 = mat4.create();

  viewProjMat: mat4 = mat4.create();
  invViewProjMat: mat4 = mat4.create();

  fovy: number = 45;
  aspectRatio: number = 1;
  near: number = 0.1;
  far: number = 1000;
  position: vec3 = vec3.create();
  direction: vec3 = vec3.create();
  target: vec3 = vec3.create();
  up: vec3 = vec3.create();
  right: vec3 = vec3.create();
  forward: vec3 = vec3.create();

  constructor(position: vec3, target: vec3) {
    const canvas = <HTMLCanvasElement> document.getElementById('canvas');

    this.controls = CameraControls(canvas, {
      eye: position,
      center: target,
    });

    //this.controls.translate(position[0], position[1], position[2]);

    this.controls.mode = 'turntable';

    vec3.add(this.target, this.position, this.direction);

    mat4.lookAt(this.viewMatrix, this.controls.eye, this.controls.center, this.controls.up);

    this.up = this.controls.up;
    vec3.subtract(this.forward, this.target, this.position);
    vec3.normalize(this.forward, this.forward);
    vec3.cross(this.right, this.forward, this.up);
    vec3.normalize(this.right, this.right);
  }

  setAspectRatio(aspectRatio: number) {
    this.aspectRatio = aspectRatio;
  }

  updateProjectionMatrix() {
    mat4.perspective(this.projectionMatrix, this.fovy, this.aspectRatio, this.near, this.far);
  }

  setPosition(pos:vec3)
  {
    this.controls.eye[0] = pos[0];
    this.controls.eye[1] = pos[1];
    this.controls.eye[2] = pos[2];
    this.position = this.controls.eye;    
  }

  update() {
    
    this.controls.tick();

    this.target = vec3.fromValues(this.controls.center[0], this.controls.center[1], this.controls.center[2]);

    mat4.lookAt(this.viewMatrix, this.controls.eye, this.controls.center, this.controls.up);
    
    mat4.multiply(this.viewProjMat, this.projectionMatrix, this.viewMatrix );
    mat4.invert(this.invViewProjMat, this.viewProjMat);

    this.position = this.controls.eye;

    

    this.up = vec3.fromValues(this.controls.up[0], this.controls.up[1], this.controls.up[2]);
    vec3.normalize(this.up, this.up);
    vec3.subtract(this.forward, this.target, this.position);
    vec3.normalize(this.forward, this.forward);
    vec3.cross(this.right, this.forward, this.up);
    vec3.normalize(this.right, this.right);
    vec3.cross(this.up, this.right, this.forward);
    vec3.normalize(this.up, this.up);
  }
};

export default Camera;
