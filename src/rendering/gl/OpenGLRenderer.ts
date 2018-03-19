import {mat4, vec2, vec3, vec4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {

  fbos : Array<WebGLFramebuffer> = [];
  stateDotattaches : Array<WebGLTexture> = [];
  stateAttaches : Array<WebGLTexture> = [];
  objAttaches  : Array<WebGLTexture> = [];
  constructor(public canvas: HTMLCanvasElement) {
  }


  createFBO(size:number, width : number, height : number)
  {
    //for stateDot stage
    this.fbos.push(gl.createFramebuffer());
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos[0]);    
    

    for(var i = 0; i<4; i++)
    {
      this.stateDotattaches.push(gl.createTexture());
      gl.bindTexture(gl.TEXTURE_2D, this.stateDotattaches[i]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
      //gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, width, height);
    
      if(i == 0)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.stateDotattaches[0], 0); 
      else if(i == 1)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.stateDotattaches[1], 0); 
      else if(i == 2)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this.stateDotattaches[2], 0); 
      else if(i == 3)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, this.stateDotattaches[3], 0);       
      
      
    }

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      throw "Framebuffer incomplete";
    }

    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1,
      gl.COLOR_ATTACHMENT2,
      gl.COLOR_ATTACHMENT3
  ]);

    //for state stage
    this.fbos.push(gl.createFramebuffer());
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos[1]);


    let velsArray = [];
    let posArray = [];
    for(var i = 0; i < width * height; i++)
    {
      velsArray.push(0.0);
      velsArray.push(0.0);
      velsArray.push(0.0);
      velsArray.push(1.0); // Alpha channel

      let xyz : vec3 = vec3.create();
      vec3.normalize(xyz, vec3.fromValues( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5) );

      var len = Math.random();
      len = Math.sqrt(len);
      posArray.push(xyz[0] * len * 100.0);
      posArray.push(xyz[1] * len * 100.0);
      posArray.push(xyz[2] * len * 100.0);
      posArray.push(1.0); // Alpha channel
    }
    let vels: Float32Array = new Float32Array(velsArray);
    let poss: Float32Array = new Float32Array(posArray);

    for(var i = 0; i<2; i++)
    {
      this.stateAttaches.push(gl.createTexture());
      gl.bindTexture(gl.TEXTURE_2D, this.stateAttaches[i]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      //gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, width, height);
    
      if(i == 0) // vel
      {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, vels);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.stateAttaches[0], 0); 
      }
      else if(i == 1) // pos
      {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, poss);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.stateAttaches[1], 0);
      }
    }

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      throw "Framebuffer incomplete";
    }

    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1
  ]);

  //for Obj stage
  this.fbos.push(gl.createFramebuffer());
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos[2]); 
    
      this.objAttaches.push(gl.createTexture());
      gl.bindTexture(gl.TEXTURE_2D, this.objAttaches[0]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.objAttaches[0], 0); 

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      throw "Framebuffer incomplete";
    }

    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0
  ]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);    
  }

  setFrameBuffer(index:number)
  {
    if(index < 0) //default
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    else
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos[index]);
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  renderDebug(prog: ShaderProgram, drawables: Array<Drawable>, time : number, ColorScheme :Array<vec4>)
  {
    
    //prog.setParticleTexture(this.stateAttaches[1]);
    prog.setTime(time);

    prog.setColor00(ColorScheme[0]);
    prog.setColor01(ColorScheme[1]);
    prog.setColor02(ColorScheme[2]);
    prog.setColor03(ColorScheme[3]);
    prog.setColor04(ColorScheme[4]);
    
    for (let drawable of drawables) {

      prog.drawIndex(drawable);
    }
  }

  renderObjBuffer(prog: ShaderProgram, drawables: Array<Drawable>, bufferSize : vec2)
  {
    prog.setBufferSize(bufferSize);
    let model = mat4.create();
    mat4.identity(model);
    mat4.scale(model, model, vec3.fromValues(2, 2, 2));
    prog.setModelMatrix(model);
    

    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }

  renderStateBuffer(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>, deltaTime : number, bufferSize : vec2)
  {
    prog.setBufferSize(bufferSize);
    prog.setDeltaTime(deltaTime);

    prog.setVelocityPrimeTexture(this.stateDotattaches[0]);
    prog.setPositionPrimeTexture(this.stateDotattaches[1]);

    prog.setprevVelocityTexture(this.stateDotattaches[2]);
    prog.setprevPositionTexture(this.stateDotattaches[3]);

    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }

  renderStateDotBuffer(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>, maxSpeed: number, bufferSize : vec2, clickedPos : vec4, time : number, backGround : number)
  {
    prog.setBufferSize(bufferSize);
    prog.setMaxSpeed(maxSpeed);
    prog.setClickedPos(clickedPos);

    prog.setprevVelocityTexture(this.stateAttaches[0]);
    prog.setprevPositionTexture(this.stateAttaches[1]);
    prog.setObjInfoTexture(this.objAttaches[0]);

    prog.setBackGround(backGround);
    prog.setTime(time);

    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }

  renderParticles(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>, bufferSize : vec2, elapseTime : number, maxSpeed : number, particleSize : number,
    ColorScheme :Array<vec4>, particleAlpha : number, backGround : number)
  {
    let model = mat4.create();
    let viewProj = mat4.create();
    let color = vec4.fromValues(1, 0, 0, 1);
    // Each column of the axes matrix is an axis. Right, Up, Forward.
    let axes = mat3.fromValues(camera.right[0], camera.right[1], camera.right[2],
                               camera.up[0], camera.up[1], camera.up[2],
                               camera.forward[0], camera.forward[1], camera.forward[2]);


    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    
    mat4.rotateY(model, model,elapseTime );

    prog.setModelMatrix( model);

    prog.setViewProjMatrix(viewProj);
    prog.setCameraAxes(axes);
    
    prog.setBufferSize(bufferSize);
    prog.setParticleSize(particleSize)
    prog.setBackGround(backGround);
    prog.setMaxSpeed(maxSpeed);

    prog.setTime(elapseTime * 4.0);
    prog.setColor00(ColorScheme[0]);
    prog.setColor01(ColorScheme[1]);
    prog.setColor02(ColorScheme[2]);
    prog.setColor03(ColorScheme[3]);
    prog.setColor04(ColorScheme[4]);

    prog.setAlpha(particleAlpha);

    prog.setprevVelocityTexture(this.stateAttaches[0]);
    prog.setprevPositionTexture(this.stateAttaches[1]);
    
    for (let drawable of drawables) {

      prog.draw(drawable);
    }
  }

  

  render(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>) {
    let model = mat4.create();
    let viewProj = mat4.create();
    let color = vec4.fromValues(1, 0, 0, 1);
    // Each column of the axes matrix is an axis. Right, Up, Forward.
    let axes = mat3.fromValues(camera.right[0], camera.right[1], camera.right[2],
                               camera.up[0], camera.up[1], camera.up[2],
                               camera.forward[0], camera.forward[1], camera.forward[2]);


    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);
    prog.setCameraAxes(axes);

    for (let drawable of drawables) {

      if(drawable.generateParticleTexture)
        prog.setParticleTexture(drawable.particleTexture);
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
