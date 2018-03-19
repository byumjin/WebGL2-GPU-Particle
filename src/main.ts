import {vec2, vec3, vec4, mat2, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Triangular from './geometry/Triangular';
import Particle from './Particle';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import * as MinimalGLTFLoader from '../thirdparty/minimal-gltf-loader-master/build/minimal-gltf-loader';
import * as WEBGLOBJLOADER from 'webgl-obj-loader';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  AutoPlay: true,
  MaxSpeed: 25,
  ParticleSize : 12.0,
  Shape: 1,
  ColorScheme: 0,
  Alpha: 0.4,
  Background : 0,
};

let particles: Array<Particle> = [];
let square: Square;
let physicSquare: Square;
let objSquare: Square;
let screen: Triangular;
let time: number = 0.0;

let oldTime : number = 0.0;
let currentTime : number = 0.0;
let elapsedTime : number = 0.0;
let deltaTime : number = 0.0;

let shapeChangeTime : number = 0.0;
let bgChangeTime : number = 0.0;
let colorChangeTime : number = 0.0;

let mousePosition: Array<number> = [250, 250];
let currentAngle: Array<number> = [0,0];
let bLeftDragged: boolean = false;
let bRightDragged: boolean = false;
let bMidDragged: boolean = false;

let particleInfoBufferSize: number = 1024;
let particleInfoBufferResolution: vec2 = vec2.create();
let clickedPos: vec4 = vec4.fromValues(0,0,0,1);

let MeshManager : Array<string> = [];

let noneArray : Array<number> = [];
let noneFloatArray : Float32Array;
let cubeArray : Array<number> = [];
let cubeFloatArray : Float32Array;
let suzanneArray : Array<number> = [];
let suzanneFloatArray : Float32Array;
let femaleArray : Array<number> = [];
let femaleFloatArray : Float32Array;
let dragonArray : Array<number> = [];
let dragonFloatArray : Float32Array;
let sheepArray : Array<number> = [];
let sheepFloatArray : Float32Array;
let elinArray : Array<number> = [];
let elinFloatArray : Float32Array;



let colorScheme00 : Array<vec4> = [];
let colorScheme01 : Array<vec4> = [];
let colorScheme02 : Array<vec4> = [];

function play_single_sound() {
  var JukeBox = new AudioContext();
  fetch('./src/music/01. Free Somebody.mp3')
    .then(r=>r.arrayBuffer())
    .then(b=>JukeBox.decodeAudioData(b))
    .then(data=>{
        const audio_buf = JukeBox.createBufferSource();
        audio_buf.buffer = data;
        audio_buf.loop = true;
        audio_buf.connect(JukeBox.destination);
        audio_buf.start(0);
        });

        console.log(`Music On!`);
}

function mulMat4Vec4(inMat:mat4, inVec:vec4): vec4
{
    var outVec = vec4.create();

    vec4.fromValues(inMat[0], inMat[4], inMat[8], inMat[12]);

    outVec[0] = inMat[0] * inVec[0] + inMat[4] * inVec[1] + inMat[8] * inVec[2] + inMat[12] * inVec[3];
    outVec[1] = inMat[1] * inVec[0] + inMat[5] * inVec[1] + inMat[9] * inVec[2] + inMat[13] * inVec[3];
    outVec[2] = inMat[2] * inVec[0] + inMat[6] * inVec[1] + inMat[10] * inVec[2] + inMat[14] * inVec[3];
    outVec[3] = inMat[3] * inVec[0] + inMat[7] * inVec[1] + inMat[11] * inVec[2] + inMat[15] * inVec[3];

    return outVec;
}

  function getDeritives(p0 : vec3, p1 : vec3, p2 : vec3, uv0 : vec2, uv1 : vec2, uv2 : vec2) : Array<vec3>
  {
    let p02 : vec3 = vec3.create();
    let p12 : vec3 = vec3.create();

    let dpdu : vec3 = vec3.create();
    let dpdv : vec3 = vec3.create();

    //let inverMat : mat2 = mat2.create();
    //mat2.invert(inverMat, mat2.fromValues(uv0[0] - uv2[0], uv1[0] - uv2[0], uv0[1] - uv2[1], uv1[1] - uv2[1]) );

    vec3.subtract(p02, p0, p2);
    vec3.subtract(p12, p1, p2);
    
    //dpdu = vec3.fromValues(inverMat[0] * p02[0] + inverMat[2] * p12[0], inverMat[0] * p02[1] + inverMat[2] * p12[1], inverMat[0] * p02[2] + inverMat[2] * p12[2]);
    //dpdv = vec3.fromValues(inverMat[1] * p02[0] + inverMat[3] * p12[0], inverMat[1] * p02[1] + inverMat[3] * p12[1], inverMat[1] * p02[2] + inverMat[3] * p12[2]);

    dpdu = p02;
    dpdv = p12;

    let result : Array<vec3> = [];
    result.push(dpdu);
    result.push(dpdv);

    return result;
  }


  function createdByLoader( stringParam : string, verticesArray : Array<number>, numNewVerteices : number )
  {
    var outResult;
    let errMsg : string;

    let posArray : Array<number>;
    posArray = [];
    let norArray : Array<number>;
    norArray = [];
    let indexArray : Array<number>;
    indexArray = [];
    let uvArray : Array<number>;
    uvArray = [];


    let bLoaded = false;
    var mesh = new WEBGLOBJLOADER.Mesh(stringParam);
    
    indexArray = mesh.indices;

    posArray = mesh.vertices;
   
    
    //console.log(stringParam + indexArray.length);

    //console.log(stringParam + mesh.vertices.length);
    //console.log(stringParam + mesh.textures.length);

    var t = 0;
    while( t < indexArray.length/3 )
    {
      var index0 = mesh.indices[3*t];
      var index1 = mesh.indices[3*t + 1];
      var index2 = mesh.indices[3*t + 2];

      var p0 = vec3.fromValues(mesh.vertices[ (3*index0) ], mesh.vertices[ (3*index0) + 1], mesh.vertices[ (3*index0) + 2]);
      var p1 = vec3.fromValues(mesh.vertices[ (3*index1) ], mesh.vertices[ (3*index1) + 1], mesh.vertices[ (3*index1) + 2]);
      var p2 = vec3.fromValues(mesh.vertices[ (3*index2) ], mesh.vertices[ (3*index2) + 1], mesh.vertices[ (3*index2) + 2]);

      var uv0 = vec2.fromValues( mesh.textures[ (2*index0) ], mesh.textures[ (2*index0) + 1] );
      var uv1 = vec2.fromValues( mesh.textures[ (2*index1) ], mesh.textures[ (2*index1) + 1] );
      var uv2 = vec2.fromValues( mesh.textures[ (2*index2) ], mesh.textures[ (2*index2) + 1] );

      //store Original
      verticesArray.push(p0[0]);
      verticesArray.push(p0[1]);
      verticesArray.push(p0[2]);
      verticesArray.push(1);

      verticesArray.push(p1[0]);
      verticesArray.push(p1[1]);
      verticesArray.push(p1[2]);
      verticesArray.push(1);

      verticesArray.push(p2[0]);
      verticesArray.push(p2[1]);
      verticesArray.push(p2[2]);
      verticesArray.push(1);


      var derive = getDeritives(p0, p1, p2, uv0, uv1, uv2);

      for(var i = 0; i < numNewVerteices; i++)
      {
        var x = Math.random();
        var y = Math.random();
  
        let newUV : vec2 = vec2.fromValues(1.0 - Math.sqrt(x), y * Math.sqrt(x) );
        
        var newPos = vec3.fromValues(p2[0] + newUV[0] * derive[0][0] + newUV[1] * derive[1][0],
                                     p2[1] + newUV[0] * derive[0][1] + newUV[1] * derive[1][1],
                                     p2[2] + newUV[0] * derive[0][2] + newUV[1] * derive[1][2]);

        verticesArray.push(newPos[0]);
        verticesArray.push(newPos[1]);
        verticesArray.push(newPos[2]);
        verticesArray.push(1);
      }

      t++;
    }

    //fill vacant vertex
    while(verticesArray.length < particleInfoBufferSize * particleInfoBufferSize * 4)
    {
      verticesArray.push(0);
      verticesArray.push(0);
      verticesArray.push(0);
      verticesArray.push(0);
    }

    norArray = mesh.vertexNormals;
    
    uvArray  = mesh.textures;
  }

function loadScene() {
  square = new Square();
  square.create();
  square.generateParticleTexture();
  square.bindTexture(square.particleTextureGenerated, 0, "src/textures/cloud.png"); 


  physicSquare = new Square();
  physicSquare.create();

  objSquare = new Square();
  objSquare.create();

  screen = new Triangular();
  screen.create();  

  for(let i = 0; i < particleInfoBufferSize; i++) {
    for(let j = 0; j < particleInfoBufferSize; j++) {

      var tempParticle = new Particle();
      tempParticle.acceleration = vec3.fromValues(0, 0, 0.0);
      tempParticle.position = vec3.fromValues(i - particleInfoBufferSize/2 , j - particleInfoBufferSize/2, 0);
      tempParticle.color = vec4.fromValues(i / particleInfoBufferSize, j / particleInfoBufferSize, 1.0, 1.0);

      tempParticle.initialize();
      particles.push(tempParticle);
    }
  }

  square.setNumInstances(particleInfoBufferSize * particleInfoBufferSize);


  let offsetsArray = [];
  let colorsArray = [];

  for(let i = 0; i < particleInfoBufferSize; i++) {
    for(let j = 0; j < particleInfoBufferSize; j++) {

      let xyz : vec3 = vec3.create();
      vec3.normalize(xyz, vec3.fromValues( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5) );

      var len = Math.random();
      len = Math.sqrt(len);
      
      offsetsArray.push(j);
      offsetsArray.push(i);
      offsetsArray.push(0.5);

      colorsArray.push(xyz[0] * len * 100.0);
      colorsArray.push(xyz[1] * len * 100.0);
      colorsArray.push(xyz[2] * len * 100.0);
      colorsArray.push(1);
    }
  }

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);

  physicSquare.setNumInstances(particleInfoBufferSize * particleInfoBufferSize);
  physicSquare.setInstanceVBOs(offsets, colors);
  //updateParticles(1.0);

  noneFloatArray = new Float32Array(colorsArray);
  cubeFloatArray = new Float32Array(cubeArray);
  suzanneFloatArray = new Float32Array(suzanneArray);  
  femaleFloatArray = new Float32Array(femaleArray);
  dragonFloatArray = new Float32Array(dragonArray);
  sheepFloatArray = new Float32Array(sheepArray);
  elinFloatArray = new Float32Array(elinArray);
  
  objSquare.setNumInstances(particleInfoBufferSize * particleInfoBufferSize);
  objSquare.setInstanceVBOs(offsets, cubeFloatArray);
  
}

function setInstanceColor(index: number)
{
  if(index == 0)
    objSquare.setInstanceColor(noneFloatArray);
  else if(index == 1)
    objSquare.setInstanceColor(cubeFloatArray);
  else if(index == 2)
    objSquare.setInstanceColor(suzanneFloatArray);
  else if(index == 3)
    objSquare.setInstanceColor(femaleFloatArray);
  else if(index == 4)
    objSquare.setInstanceColor(dragonFloatArray);
  else if(index == 5)
    objSquare.setInstanceColor(sheepFloatArray);
  else if(index == 6)
    objSquare.setInstanceColor(elinFloatArray);
}

function updateParticles(deltaTime: number)
{
  let offsetsArray = [];
  let colorsArray = [];

  for(var i = 0; i < particles.length; i++)
  {
    
    particles[i].update(deltaTime);

    offsetsArray.push(particles[i].position[0]);
    offsetsArray.push(particles[i].position[1]);
    offsetsArray.push(particles[i].position[2]);

    colorsArray.push(particles[i].color[0]);
    colorsArray.push(particles[i].color[1]);
    colorsArray.push(particles[i].color[2]);
    colorsArray.push(particles[i].color[3]); // Alpha channel
  }

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);

  square.setInstanceVBOs(offsets, colors);

  
}

function setColorSchemes()
{
  colorScheme00.push(vec4.fromValues(0.93725490196078431372549019607843, 0.97647058823529411764705882352941, 0.97647058823529411764705882352941, 1.0));
  colorScheme00.push(vec4.fromValues(0.4, 0.74509803921568627450980392156863, 0.69803921568627450980392156862745, 1.0));
  colorScheme00.push(vec4.fromValues(0.8078431372549019607843137254902, 0.7960784313725490196078431372549, 0.7960784313725490196078431372549, 1.0));
  colorScheme00.push(vec4.fromValues(0.8, 0.4, 0.4, 1.0));
  colorScheme00.push(vec4.fromValues(0.4, 0.8, 0.6, 1.0));

  colorScheme01.push(vec4.fromValues(0.34117647058823529411764705882353, 0.09411764705882352941176470588235, 0.27058823529411764705882352941176, 1.0));
  colorScheme01.push(vec4.fromValues(0.56470588235294117647058823529412, 0.04705882352941176470588235294118, 0.24313725490196078431372549019608, 1.0));
  colorScheme01.push(vec4.fromValues(0.78039215686274509803921568627451, 0.0, 0.22352941176470588235294117647059, 1.0));
  colorScheme01.push(vec4.fromValues(1.0, 0.34117647058823529411764705882353, 0.2, 1.0));
  colorScheme01.push(vec4.fromValues(1.0, 0.76470588235294117647058823529412, 0.0, 1.0));

  colorScheme02.push(vec4.fromValues(0.63137254901960784313725490196078, 0.30980392156862745098039215686275, 0.0, 1.0));
  colorScheme02.push(vec4.fromValues(0.84313725490196078431372549019608, 0.70196078431372549019607843137255, 0.0, 1.0));
  colorScheme02.push(vec4.fromValues(0.31764705882352941176470588235294, 0.70196078431372549019607843137255, 0.21176470588235294117647058823529, 1.0));
  colorScheme02.push(vec4.fromValues(0.34901960784313725490196078431373, 0.30980392156862745098039215686275, 0.10588235294117647058823529411765, 1.0));
  colorScheme02.push(vec4.fromValues(0.34901960784313725490196078431373, 0.10588235294117647058823529411765, 0.13725490196078431372549019607843, 1.0));
}

function main() {

  setColorSchemes();

  play_single_sound();

  oldTime = Date.now();

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  gui.add(controls, 'AutoPlay');

  var PAR = gui.addFolder('Particle');  

  PAR.add(controls, 'MaxSpeed', 10, 100).step(1);
  PAR.add(controls, 'ParticleSize', 1.0, 30.0).step(0.1);
  PAR.add(controls, 'Alpha', 0.0, 1.0).step(0.01);
 
  
  gui.add(controls, 'ColorScheme', { Macaroon: 0, Magenta: 1, Jungle: 2});

  gui.add(controls, 'Shape', { None: 0, Cube: 1, Suzanne: 2, Female: 3, Dragon: 4, Sheep: 5, Chromie: 6 }).onChange(function()
  {
    setInstanceColor(controls.Shape);
  });

  gui.add(controls, 'Background', { None: 0, Waves: 1, Steps: 2, TurnTable: 3, DNA : 4} );

  //gui.close();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  particleInfoBufferResolution = vec2.fromValues(particleInfoBufferSize, particleInfoBufferSize);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 60), vec3.fromValues(0, 0, 0));

  const particlePhysic = new OpenGLRenderer(canvas);
  particlePhysic.createFBO(2, particleInfoBufferSize, particleInfoBufferSize); 
  particlePhysic.setFrameBuffer(-1);
  
  //const renderer = new OpenGLRenderer(canvas);
  //renderer.setFrameBuffer(-1);
  //renderer.setClearColor(0.2, 0.2, 0.2, 1);

  const particleRender = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/render-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/render-frag.glsl')),
  ]);

  const stateDot = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/stateDot-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/stateDot-frag.glsl')),
  ]);

  
  const objInfo = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/objInfo-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/objInfo-frag.glsl')),
  ]);
  

  const state = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/state-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/state-frag.glsl')),
  ]);

  const debugRender = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/debug-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/debug-frag.glsl')),
  ]);

  
  function updateTime()
  {
    currentTime = Date.now();

    deltaTime = currentTime - oldTime;
    elapsedTime += deltaTime;    

    oldTime = currentTime;
  }

  initEventHandlers(canvas, mousePosition, currentAngle);

  function rayTracing(rO : vec3, rD : vec3, centerPoint : vec3, planeNormal : vec3 ) : boolean
  { 
    var denom = vec3.dot(planeNormal, rD); 

    
    if (denom < 0.0)
    { 
      let p0l0: vec3 = vec3.create();
      vec3.subtract(p0l0, centerPoint, rO); 
      var t = vec3.dot(planeNormal, p0l0) / denom; 

      if(t <= 0.0)
      {
        return false;
      }
      else
      {
        clickedPos = vec4.fromValues(rO[0] + rD[0] * t, rO[1] + rD[1] * t, rO[2] + rD[2] *t, 0.0);	
        return true;
      }
      
    }
    else
      return false;
  } 

  function addForces( elapseTime : number )
  {
    let desiredVelocity : vec3 = vec3.create();

    if(bLeftDragged || bRightDragged)
    { 
      let ScreenSpace : vec2 = vec2.fromValues(mousePosition[0]/canvas.width * 2.0 - 1.0, (1.0 - mousePosition[1]/canvas.height) * 2.0 - 1.0);
      let targetPos : vec4 = vec4.create();
      targetPos = mulMat4Vec4( camera.invViewProjMat, vec4.fromValues(ScreenSpace[0], ScreenSpace[1], 1.0, 1.0)); 
      targetPos = vec4.fromValues(targetPos[0] / targetPos[3], targetPos[1] / targetPos[3], targetPos[2] / targetPos[3], 1.0);

     

      let dir : vec3 = vec3.create();
      let isHit : boolean;
      if( ScreenSpace[0] >= -1.0 && ScreenSpace[0] <= 1.0 &&  ScreenSpace[1] >= -1.0 && ScreenSpace[1] <= 1.0 )
      {
        vec3.normalize(dir, vec3.fromValues(targetPos[0] - camera.position[0], targetPos[1] - camera.position[1], targetPos[2] - camera.position[2]));
        isHit = rayTracing(camera.position, dir, vec3.fromValues(0,0,0), vec3.fromValues( -camera.forward[0], -camera.forward[1], -camera.forward[2] ));
      }
      else
      {
        isHit = false;
      }
      
      if(!isHit)
        clickedPos = vec4.fromValues(0, 0, 0, 0);
      else
      {

        let clickVector : vec4 = vec4.create();
        let rotMat : mat4 = mat4.create();
        mat4.rotateY(rotMat, mat4.identity(rotMat), -elapseTime );
        clickVector = mulMat4Vec4(rotMat, vec4.fromValues(  clickedPos[0], clickedPos[1], clickedPos[2], 1.0 ));

        if(bLeftDragged)
        { 
          clickedPos = vec4.fromValues(clickVector[0], clickVector[1], clickVector[2], 1.0);
        }
        if(bRightDragged)
        {
          clickedPos = vec4.fromValues(clickVector[0], clickVector[1], clickVector[2], 2.0);
        }
      }
    }
    else
    {
      clickedPos = vec4.fromValues(0, 0, 0, -1);
    }    
  }

  

  // This function will be called every frame
  function tick() {

    updateTime();

   
    addForces( elapsedTime*0.0001 );

    
    camera.update();

    if(controls.AutoPlay)
    {
      var localDeltaTime = deltaTime * 0.001;
      
      shapeChangeTime += localDeltaTime;
      bgChangeTime += localDeltaTime;
      colorChangeTime += localDeltaTime;

      if( shapeChangeTime >= 8.0)
      {
        
        controls.Shape = (controls.Shape + 1) % 7;

        if(controls.Shape == 0)
          controls.Shape = 1;
          
        setInstanceColor(controls.Shape);
        shapeChangeTime = 0.0;
      }

      if( bgChangeTime >= 14.0)
      {
        controls.Background = (controls.Background + 1) % 5;
        bgChangeTime = 0.0;
      }

      /*
      if( colorChangeTime >= 11.0)
      {
        controls.ColorScheme = (controls.ColorScheme + 1) % 3;
        colorChangeTime = 0.0;
      }
      */
    }

    stats.begin();
    //particleRender.setTime(currentTime * 0.001);

    
    //updateParticles(deltaTime * 0.001);

    gl.disable(gl.BLEND);
    
    
    gl.viewport(0, 0, particleInfoBufferSize, particleInfoBufferSize);
    

    particlePhysic.setFrameBuffer(2);

    particlePhysic.renderObjBuffer( objInfo, [
      objSquare,
  ], particleInfoBufferResolution
);

    particlePhysic.setFrameBuffer(0);

    particlePhysic.renderStateDotBuffer(camera, stateDot, [
      physicSquare,
    ], controls.MaxSpeed, particleInfoBufferResolution, clickedPos, elapsedTime * 0.001, controls.Background
  );

    particlePhysic.setFrameBuffer(1);

    particlePhysic.renderStateBuffer(camera, state, [
    physicSquare,
  ], deltaTime * 0.001, particleInfoBufferResolution
);
    particlePhysic.setFrameBuffer(-1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
    
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    
    particlePhysic.setClearColor(0.0, 0.0, 0.0, 1);
    particlePhysic.clear();
    
    

    let colorScheme : Array<vec4> = [];

    if(controls.ColorScheme == 0)
      colorScheme = colorScheme00;
    else if(controls.ColorScheme == 1)
      colorScheme = colorScheme01;
    else
      colorScheme = colorScheme02;

    particlePhysic.renderParticles(camera, particleRender, [
      physicSquare,
    ], particleInfoBufferResolution, elapsedTime * 0.0001, controls.MaxSpeed, controls.ParticleSize * 0.01, colorScheme, controls.Alpha, controls.Background);
    

    
    particlePhysic.renderDebug(debugRender, [
      screen,
    ], elapsedTime * 0.001, colorScheme );
   

    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    particlePhysic.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  particlePhysic.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

function readTextFile(file : string) : string
{
   console.log("Download" + file + "...");
    var rawFile = new XMLHttpRequest();
    let resultText : string;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                resultText= rawFile.responseText;                
            }
        }
    }
    rawFile.send(null);

    return resultText;
}

function initEventHandlers(canvas : HTMLCanvasElement, mousePosition : Array<number> , currentAngle : Array<number> )
 {
   var lastX = -1;
   var lastY = -1;
 
   canvas.onmousedown = function(ev) {  //Mouse is pressed
     var x = ev.clientX;
     var y = ev.clientY;

     switch (ev.button) {
      case 0:
        bLeftDragged = true; 
      break;

      case 1:
        bMidDragged = true;        
      break;

      case 2:
        bRightDragged = true; 
      break;

      default:
          console.log('Unexpected code: ' + ev.button);
      }
     
       mousePosition[0] = x;
       mousePosition[1] = y;      
     
   };
 
   canvas.onmouseup = function(ev){ //Mouse is released
     
     switch (ev.button) {
      case 0:
        bLeftDragged = false; 
      break;

      case 1:
        bMidDragged = false; 
      break;

      case 2:
        bRightDragged = false; 
      break;

      default:
          console.log('Unexpected code: ' + ev.button);
      }
   }
 
   canvas.onmousemove = function(ev) { //Mouse is moved
     var x = ev.clientX;
     var y = ev.clientY;
     if(bLeftDragged || bMidDragged || bRightDragged)
     {
       //put some kind of dragging logic in here
       //Here is a roation example
       var factor = 100/canvas.height;
       var dx = factor * (x - lastX);
       var dy = factor * (y - lastY);
       //Limit x-axis roation angle to -90 to 90 degrees
       currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90), -90);
       currentAngle[1] = currentAngle[1] + dx;
 
       mousePosition[0] = x;
       mousePosition[1] = y; 
     }

     lastX = x;
     lastY = y;
 
   }
 }

 function createMeshes()
{
  createdByLoader(MeshManager[0], cubeArray, 30000);
  createdByLoader(MeshManager[1], suzanneArray, 500);
  createdByLoader(MeshManager[2], femaleArray, 80);
  createdByLoader(MeshManager[3], dragonArray, 5);
  createdByLoader(MeshManager[4], sheepArray, 100);
  createdByLoader(MeshManager[5], elinArray, 50);
  main();
}

 function DownloadMeshes()
{  
  MeshManager.push(readTextFile("./src/models/cube.obj"));
  MeshManager.push(readTextFile("./src/models/suzanne.obj"));
  MeshManager.push(readTextFile("./src/models/female.obj"));
  MeshManager.push(readTextFile("./src/models/dragon.obj"));
  MeshManager.push(readTextFile("./src/models/sheep.obj"));
  MeshManager.push(readTextFile("./src/models/chromie.obj"));
  createMeshes();  
  
}

DownloadMeshes();
//main();  
