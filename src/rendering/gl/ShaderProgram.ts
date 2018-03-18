import {vec2, vec3, vec4, mat4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number; // This time, it's an instanced rendering attribute, so each particle can have a unique color. Not per-vertex, but per-instance.
  attrUV: number;
  attrTranslate: number; // Used in the vertex shader during instanced rendering to offset the vertex positions to the particle's drawn position.

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifCameraAxes: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifdeltaTime: WebGLUniformLocation;
  unifmaxSpeed : WebGLUniformLocation;

  unifparticleSize : WebGLUniformLocation;
  unifparticleAlpha : WebGLUniformLocation;
  unifBackGround : WebGLUniformLocation;

  unifcolor00 : WebGLUniformLocation;
  unifcolor01 : WebGLUniformLocation;
  unifcolor02 : WebGLUniformLocation;
  unifcolor03 : WebGLUniformLocation;
  unifcolor04 : WebGLUniformLocation;
  
  unifBufferSize : WebGLUniformLocation;
  unifClickedPos : WebGLUniformLocation;
  unifParticleTexture: WebGLUniformLocation;


  unifPositionPrimeTexture: WebGLUniformLocation;
  unifVelocityPrimeTexture: WebGLUniformLocation;
  unifprevPositionTexture: WebGLUniformLocation;
  unifprevVelocityTexture: WebGLUniformLocation;

  unifobjInfoTexture : WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
    this.attrTranslate = gl.getAttribLocation(this.prog, "vs_Translate");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifCameraAxes      = gl.getUniformLocation(this.prog, "u_CameraAxes");

    this.unifTime      = gl.getUniformLocation(this.prog, "u_Time");
    this.unifdeltaTime = gl.getUniformLocation(this.prog, "u_DeltaTime");
    this.unifmaxSpeed = gl.getUniformLocation(this.prog, "u_MaxSpeed");

    this.unifparticleSize = gl.getUniformLocation(this.prog, "u_ParticleSize");
    this.unifparticleAlpha = gl.getUniformLocation(this.prog,"u_ParticleAlpha");
    
    this.unifcolor00 = gl.getUniformLocation(this.prog, "u_ParticleColor00");
    this.unifcolor01 = gl.getUniformLocation(this.prog, "u_ParticleColor01");
    this.unifcolor02 = gl.getUniformLocation(this.prog, "u_ParticleColor02");
    this.unifcolor03 = gl.getUniformLocation(this.prog, "u_ParticleColor03");
    this.unifcolor04 = gl.getUniformLocation(this.prog, "u_ParticleColor04");

    this.unifBufferSize = gl.getUniformLocation(this.prog, "u_BufferSize");
    this.unifClickedPos = gl.getUniformLocation(this.prog, "u_ClickedPos");

    this.unifBackGround = gl.getUniformLocation(this.prog, "u_BackGround");

    this.unifParticleTexture = gl.getUniformLocation(this.prog, "u_ParticleTexture");

    this.unifprevPositionTexture = gl.getUniformLocation(this.prog, "u_prevPositionTexture");
    this.unifprevVelocityTexture = gl.getUniformLocation(this.prog, "u_prevVelocityTexture");

    this.unifPositionPrimeTexture = gl.getUniformLocation(this.prog, "u_PositionPrimeTexture");
    this.unifVelocityPrimeTexture = gl.getUniformLocation(this.prog, "u_VelocityPrimeTexture");

    this.unifobjInfoTexture = gl.getUniformLocation(this.prog, "u_objInfoTexture");
    
    
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setCameraAxes(axes: mat3) {
    this.use();
    if (this.unifCameraAxes !== -1) {
      gl.uniformMatrix3fv(this.unifCameraAxes, false, axes);
    }
  }

  setTime(t: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  setAlpha(t: number) {
    this.use();
    if (this.unifparticleAlpha !== -1) {
      gl.uniform1f(this.unifparticleAlpha, t);
    }
  }

  setBackGround(t: number) {
    this.use();
    if (this.unifBackGround !== -1) {
      gl.uniform1f(this.unifBackGround, t);
    }
  }

  setDeltaTime(t: number) {
    this.use();
    if (this.unifdeltaTime !== -1) {
      gl.uniform1f(this.unifdeltaTime, t);
    }
  }

  setMaxSpeed(t: number) {
    this.use();
    if (this.unifmaxSpeed !== -1) {
      gl.uniform1f(this.unifmaxSpeed, t);
    }
  }

  setBufferSize(t: vec2) {
    this.use();
    if (this.unifBufferSize !== -1) {
      gl.uniform2fv(this.unifBufferSize, t);
    }
  }

  setParticleSize(t: number)
  {
    this.use();
    if (this.unifparticleSize !== -1) {
      gl.uniform1f(this.unifparticleSize, t);
    }
  }

  setClickedPos(t: vec4) {
    this.use();
    if (this.unifClickedPos !== -1) {
      gl.uniform4fv(this.unifClickedPos, t);
    }
  }

  setColor00(t: vec4) {
    this.use();
    if (this.unifcolor00 !== -1) {
      gl.uniform4fv(this.unifcolor00, t);
    }
  }

  setColor01(t: vec4) {
    this.use();
    if (this.unifcolor01 !== -1) {
      gl.uniform4fv(this.unifcolor01, t);
    }
  }

  setColor02(t: vec4) {
    this.use();
    if (this.unifcolor02 !== -1) {
      gl.uniform4fv(this.unifcolor02, t);
    }
  }

  setColor03(t: vec4) {
    this.use();
    if (this.unifcolor03 !== -1) {
      gl.uniform4fv(this.unifcolor03, t);
    }
  }

  setColor04(t: vec4) {
    this.use();
    if (this.unifcolor04 !== -1) {
      gl.uniform4fv(this.unifcolor04, t);
    }
  }

  setParticleTexture(texture: WebGLTexture) {
    this.use();
    if (this.unifParticleTexture != -1) {

      gl.uniform1i(this.unifParticleTexture, 0);  

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);           
    }
}

setprevPositionTexture(texture: WebGLTexture) {
  this.use();
  if (this.unifprevPositionTexture != -1) {

    gl.uniform1i(this.unifprevPositionTexture, 0);  

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);  
    
    
  }
}

setprevVelocityTexture(texture: WebGLTexture) {
  this.use();
  if (this.unifprevVelocityTexture != -1) {

    gl.uniform1i(this.unifprevVelocityTexture, 1);  

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);   
    
    
  }
}

setPositionPrimeTexture(texture: WebGLTexture) {
  this.use();
  if (this.unifPositionPrimeTexture != -1) {

    gl.uniform1i(this.unifPositionPrimeTexture, 2);  

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);  
    
    
  }
}

setVelocityPrimeTexture(texture: WebGLTexture) {
  this.use();
  if (this.unifVelocityPrimeTexture != -1) {

    gl.uniform1i(this.unifVelocityPrimeTexture, 3);  

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture);  
    
  }
}

setObjInfoTexture(texture: WebGLTexture) {
  this.use();
  if (this.unifobjInfoTexture != -1) {

    gl.uniform1i(this.unifobjInfoTexture, 2);  

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);  
    
  }
}

  drawIndex(d: Drawable) {
  this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1); // Advance 1 index in col VBO for each drawn instance
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrUV, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1); // Advance 1 index in col VBO for each drawn instance
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrUV, 0);
    }

    if (this.attrTranslate != -1 && d.bindTranslate()) {
      gl.enableVertexAttribArray(this.attrTranslate);
      gl.vertexAttribPointer(this.attrTranslate, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTranslate, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    d.bindIdx();
    gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
    if (this.attrTranslate != -1) gl.disableVertexAttribArray(this.attrTranslate);

  }
};

export default ShaderProgram;
