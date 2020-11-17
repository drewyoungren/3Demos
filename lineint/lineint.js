/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import { GUI} from '../base/dat.gui.module.js';
import { colorBufferVertices, blueUpRedDown, addColorBar } from "../base/utils.js";

/* Some constants */
const nX = 30; // resolution for surfaces
const xmin = -1; // domain of function
const xmax = 1;
const ymin = -1;
const ymax = 1;
const gridMax = Math.max(...[xmin,xmax,ymin,ymax].map(Math.abs));
const gridStep = gridMax / 10;



const scene = new THREE.Scene();
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({antialias: true, alpha : true,canvas: canvas});

scene.background = new THREE.Color( 0xddddef );

const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);

camera.position.z = gridMax/2;
camera.position.y = gridMax*4 ;
camera.position.x = -gridMax*2;
camera.lookAt( 0,0,0 );

// Lights


// soft white light
scene.add( new THREE.AmbientLight( 0xA0A0A0 ) );
let directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
directionalLight.position.set(0,50,0)
scene.add( directionalLight );
directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
directionalLight.position.set(0,-50,0)
scene.add( directionalLight );
directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
directionalLight.position.set(50,0,50)
scene.add( directionalLight );
directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
directionalLight.position.set(-50,0,-50)
scene.add( directionalLight );
directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
directionalLight.position.set(50,0,-50)
scene.add( directionalLight );
directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
directionalLight.position.set(-50,0,50)
scene.add( directionalLight );

//something to make shiny things shine
// let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
// light.position.set(0,30,0);
// scene.add(light);
// let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
// light.position.set(0,0,-10);
// scene.add(light);
// light = new THREE.PointLight(0xFFFFFF, 1, 1000);
// light.position.set(30,30,5);
// scene.add(light);

// controls 

const controls = new OrbitControls (camera, renderer.domElement);
controls.autoRotate = false;
controls.target.set( 0,0,0);
controls.addEventListener('change',render);

window.addEventListener('resize', render);

//axes

const ii = new THREE.Vector3( 0, 0, 1 );
const jj = new THREE.Vector3( 1, 0, 0 );
const kk = new THREE.Vector3( 0, 1, 0 );
const axesArray = [ii,jj,kk];

const lineMaterial = new THREE.LineBasicMaterial( { color: 0x551122, transparent: true, opacity: 0.8 } );

let gridMeshes = new THREE.Object3D();
function drawGrid(coords='rect') {
  let points = [];
  for (let index = gridMeshes.children.length-1; index >= 0; index++) {
    const element = gridMeshes.children[index];
    element.geometry.dispose();
    gridMeshes.remove(element);
  }
  let geometry;
  if (coords == 'rect'){
    for (let j = -(10*gridMax); j <= (10*gridMax); j += gridStep) {
        points.push( new THREE.Vector3( j, 0, -(10*gridMax) ) );
        points.push( new THREE.Vector3( j, 0, (10*gridMax) ) );

        // let geometry = new THREE.BufferGeometry().setFromPoints( points );
        // gridMeshes.add(new THREE.Line(geometry,lineMaterial));
        
        // points = [];

        points.push( new THREE.Vector3( -(10*gridMax), 0, j ) );
        points.push( new THREE.Vector3( (10*gridMax), 0, j ) );

      }
    } else {
      for (let i = 0; i <= 10*gridMax; i += gridStep) {
        for (let j = 0; j <= 100; j++) {
          points.push( new THREE.Vector3( i*Math.sin(2*Math.PI*j/100), 0, i*Math.cos(2*Math.PI*j/100) ) );
        }
      }
      for (let i = 0; i < 16 ; i++) {
        points.push( new THREE.Vector3( 10*gridMax*Math.sin(Math.PI*i/8), 0, 10*gridMax*Math.cos(Math.PI*i/8) ) );
        points.push( new THREE.Vector3( 0, 0, 0 ) );
      }
    }
    geometry = new THREE.BufferGeometry().setFromPoints( points );
    gridMeshes.add(new THREE.LineSegments(geometry,lineMaterial));
}

scene.add(gridMeshes);
drawGrid('rect');

// Axes
const axesHolder = new THREE.Object3D();
scene.add(axesHolder);
const axesMaterial = new THREE.MeshLambertMaterial( {color: 0x320032} );
for (let index = 0; index < axesArray.length; index++) {
  const ax = axesArray[index];
  let geometry = new THREE.CylinderGeometry( gridStep/16, gridStep/16, gridMax*3, 12 );
  let coneGeometry = new THREE.ConeGeometry( gridStep/10, gridStep/3, 12 );
  let cylinder = new THREE.Mesh( geometry, axesMaterial );
  // cylinder.position.y = gridMax*1.1/2;
  let cone = new THREE.Mesh(coneGeometry,axesMaterial);
  if (ax == ii) {
    cylinder.rotation.x = Math.PI/2;
  } else { if (ax == jj) {
    cylinder.rotation.z = -Math.PI/2;
  }}
  cone.position.y = gridMax*3/2 + gridStep/6;
  cylinder.add(cone);
  axesHolder.add( cylinder );
}


// Fonts
var axesText = [];
var loader = new THREE.FontLoader();
var font = loader.load(
	// resource URL
	'../fonts/P052_Italic.json',
  function (font) {
    var xyz = ['x','y','z'];
    var tPos = 1.7*gridMax;
    for (var i = 0; i < 3; i++) {
      var textGeo = new THREE.TextGeometry( xyz[i], {
      font: font,
      size: gridStep,
      height: 0,
      curveSegments: 12,
      bevelEnabled: false
    } );
      // var textMaterial = new THREE.MeshBasicMaterial({color: axesMaterial})
      var textHolder = new THREE.Object3D();
      var text = new THREE.Mesh(textGeo,axesMaterial);
      // text.computeBoundingBox();
      
      textGeo.computeBoundingBox();
      textGeo.boundingBox.getCenter(text.position).multiplyScalar(-1);

      if (i == 0) { textHolder.position.z = tPos; } else {
        if (i ==1) {
          textHolder.position.x = tPos;
        } else { textHolder.position.y = tPos; }
      }
      scene.add(textHolder);
      textHolder.add(text);

      axesText.push(textHolder);
      // console.log("pushed: ",'xyz'[i])
    }
  },
  // onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
);

function disposeArray() {
  this.array = null;
}


let gui = new GUI();

let graphWorld = new THREE.Object3D();
graphWorld.rotation.x += Math.PI/2;
graphWorld.rotation.y += Math.PI;
graphWorld.rotation.z += Math.PI/2;
scene.add(graphWorld);

const material = new THREE.MeshPhongMaterial({color: 0xffffff,shininess: 60,side: THREE.FrontSide,vertexColors: true});
const materialRandom = new THREE.MeshPhongMaterial({color: 0x0000ff,shininess: 70,side: THREE.FrontSide,vertexColors: false});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});
const redLineMaterial = new THREE.LineBasicMaterial({color: 0xbb0000,linewidth: 14});


const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true } );
const minusMaterial = new THREE.MeshPhongMaterial({color: 0xff3232, shininess: 80, side: THREE.BackSide,vertexColors: false, transparent: true, opacity: 0.4});
const plusMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.4});



class ParametricCurve extends THREE.Curve {

	constructor( scale = 1, r = (t) => new THREE.Vector3(t,t,t), a = 0, b = 1 ) {

		super();

    this.scale = scale;
    
    this.r = r;

    this.a = a;

    this.b = b;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

    const s = this.a + (this.b - this.a)*t;

    const {x,y,z} = this.r(s);

		return optionalTarget.set( x,y,z ).multiplyScalar( this.scale );

	}

}

const pi = Math.PI;

const r1 = ((t) => new THREE.Vector3(t,t**2,t**3));
const r2 = ((t) => new THREE.Vector3((1+t/4)*Math.cos(4*pi*t),2*t - Math.sin(8*t)/2,0));


const curves = {
  parabola: {
    func: (t) => new THREE.Vector3(t,t*t - 1,0),
    a: -1,
    b: 2,
    tex: {
      x: "t",
      y: "t^2 -1",
      xPrime: "1",
      yPrime: "2t"
    }
  },
  swirl: {
    func: (t) => new THREE.Vector3((1+t/4)*Math.cos(4*pi*t),2*t - Math.sin(8*t)/2,0),
    a: 0,
    b: 1,
    tex: {
      x: "(1+t/4)\\cos(4 \\pi t)",
      y: "2t - \\sin(8t)/2",
      xPrime: "\\cos(4 \\pi t)/4 - (1+t/4)\\sin(4 \\pi t)4\\pi",
      yPrime: "2 - 4\\sin(8t)"
    }
  },
  line: {
    func: (t) => new THREE.Vector3(-1+ 2*t,-1 + 3*t,0),
    a: 0,
    b: 1,
    tex: {
      x: "2t - 1",
      y: "3t -1",
      xPrime: "2",
      yPrime: "3"
    }
  },
  circle: {
    func: (t) => new THREE.Vector3(Math.cos(t),Math.sin(t),0),
    a: 0,
    b: 2*Math.PI,
    tex: {
      x: "\\cos t",
      y: "\\sin t",
      xPrime: "-\\sin t",
      yPrime: "\\cos t",
      b: "2\\pi",
    }
  },
}

const zFunctions = {
  'wave': {
    func: (x,y) => 1 + Math.sin((x + y)*2)/3,
    tex: "1 + \\sin(2(x+y))/3",
  },
  'paraboloid': {
    func: (x,y) => x*x/2 + y * y/2,
    tex: "x^2/2 + y^2/2",
  },
  'plane': {
    func: (x,y) => x/10 + y/7 + 1,
    tex: "x/10 + y/7 + 1",
  },
}

const data = {
  r: 'parabola',
  f: 'wave',
  tMode: 0, // interpolate between dy (-1), ds (0), and dx (1)
  sMode: 0, // fill in wall from 0 to 1
}

let tube,topTube;
function updateCurve() {
  const {a,b,func} = curves[data.r];
  let path = new ParametricCurve( 1 , func, a, b);
  let geometry = new THREE.TubeBufferGeometry( path, 500, gridStep/10, 8, false );
  if ( tube ) {
    tube.geometry.dispose();
    tube.geometry = geometry;
  } else {
    tube = new THREE.Mesh( geometry, material );
    graphWorld.add( tube );
    colorBufferVertices( tube, (x,y,z) => blueUpRedDown(1));
  }
  if (data.sMode > 0) {
    path = new ParametricCurve( 1 , 
      (t) => new THREE.Vector3(func(t).x,func(t).y,zFunctions[data.f].func(func(t).x,func(t).y)),
      a, data.sMode*(b - a) + a);
    geometry = new THREE.TubeBufferGeometry( path, Math.round(500*data.sMode), gridStep/10, 8, false );
    if ( topTube ) {
      topTube.geometry.dispose();
      topTube.geometry = geometry;
    } else {
      topTube = new THREE.Mesh( geometry, material );
      graphWorld.add( topTube );
      colorBufferVertices( topTube, (x,y,z) => blueUpRedDown(1));
    }
  } else {
    if (topTube) {
      topTube.geometry.dispose();
      graphWorld.remove(topTube);
      topTube = undefined;
    }
  }
}



// graph of zFunction


let zMesh;
function updateZMesh() {
  const {func} = zFunctions[data.f];
  const geometry = new THREE.ParametricBufferGeometry( (u,v,vec) =>{
    const x = -2*gridMax + u*(4*gridMax);
    const y = -2*gridMax + v*(4*gridMax);
    vec.set(x,y,func(x,y));
  },nX/2,nX/2);
  if ( zMesh ) {
    zMesh.geometry.dispose();
    zMesh.geometry = geometry;
  } else {
    zMesh = new THREE.Mesh( geometry, wireMaterial );
    graphWorld.add( zMesh );
  }
}


//
function updateFormula() {
  let element = document.getElementById("r-formula");
  element.innerHTML = "$$ \\mathbf{r}(t) = \\langle ";
  element.innerHTML += curves[data.r].tex.x + ",";
  element.innerHTML += curves[data.r].tex.y;
  element.innerHTML += "\\rangle $$";

  element = document.getElementById("r-range");
  const a = curves[data.r].tex.a ? curves[data.r].tex.a : curves[data.r].a.toString();
  const b = curves[data.r].tex.b ? curves[data.r].tex.b : curves[data.r].b.toString();
  element.innerHTML = "$" + a + "\\leq t \\leq " + b + "$";
  // element.innerHTML = "$ f(x,y) = ";
  // element.innerHTML += zFunctions[data.f].tex
  updateFormulaT();
  MathJax.typeset();
}

function updateFormulaF() {
  let element = document.getElementById("f-formula");
  let {tex} = zFunctions[data.f];
  element.innerHTML = "$$ f(x,y) = " + tex + " .$$";

  updateFormulaT();
  MathJax.typeset();
}

function updateFormulaT() {
  const element = document.getElementById("t-formula");
  let {tex} = zFunctions[data.f];

  let dSymbol, dExpI, dExpT;

  switch (data.tMode) {
    case 0:
      [dSymbol,dExpI] = [" \\,ds "," \\sqrt{(x'(t))^2 + (y'(t))^2}\\,dt "];
      break;
    case 1:
      [dSymbol,dExpI] = [" \\,dx "," x'(t) \\,dt "];
      break;
    case -1:
      [dSymbol,dExpI] = [" \\,dy "," y'(t) \\,dt "];
      break;
    default:
      [dSymbol,dExpI] = [" \\,ds "," \\sqrt{(x'(t))^2 + (y'(t))^2}\\,dt "];
      break;
  }

  dExpT = dExpI.replace(new RegExp("\\(?x'\\(t\\)\\)?"), "(" + curves[data.r].tex.xPrime + ")");
  dExpT = dExpT.replace(new RegExp("\\(?y'\\(t\\)\\)?"), "(" + curves[data.r].tex.yPrime + ")");

  let formI = "$$ \\int_C f " + dSymbol + " = \\int_{a}^{b} f(x(t),y(t)) " + dExpI +" $$\n";
  let form = "$$ = \\int_{ a }^{ b } \\left(" + tex + "\\right) " + dExpT + " $$ ";
  const vars = "xyab";
  let regex;



  for (let i = 0; i < vars.length; i++) {
    const el = vars[i];
    regex = new RegExp(el,"g");
    const expr = curves[data.r].tex[el] ? curves[data.r].tex[el] : curves[data.r][el].toString();
    form = i < 2 ? form.replace(regex, "(" + expr + ")") : form.replace(regex, expr );
  } 
  element.innerHTML = formI + form;
}


// update Running total of integral

function dsSelect(tMode) {
  if (tMode < -1/2) {
    return (x,y) => y;
  } else {
    if (tMode > 1/2) {
      return (x,y) => x;
    } else {
      return (x,y) => Math.sqrt(x*x + y*y)
    }
  }
}

function updateRunningIntegral() {
  const s = data.sMode;
  const N = 2*Math.round(s / 2 * 100);
  const {a,b,func} = curves[data.r];
  const f = zFunctions[data.f].func;
  const ds = dsSelect(data.tMode);
  let r,dr,xp,yp;

  let total = 0, dt = s/N*(b - a);

  if (N > 0) {
  for (let i = 1; i < N; i++) {
    r = func(a + i * dt);
    dr = func(a + (i + 1)*dt).sub(r);
    xp = dr.x; 
    yp = dr.y;
    total += (3 - Math.pow(-1,i))*f(r.x,r.y)*ds(xp,yp);
  }

  // end points
  r = func(a);
  dr = func(a + dt).sub(r);
  xp = dr.x; 
  yp = dr.y;
  total += f(r.x,r.y)*ds(xp,yp); 

  r = func(b);
  dr = func(b + dt).sub(r);
  xp = dr.x; 
  yp = dr.y;
  total += f(r.x,r.y)*ds(xp,yp);

  total *= 1/3;
  }
  // if (! (total)) {console.log(N,dt,total)}
  document.getElementById("running-score").innerText = (Math.round(1000*total)/1000).toString()
}

let walls = [new THREE.Mesh( new THREE.BufferGeometry(), plusMaterial),new THREE.Mesh( new THREE.BufferGeometry(), minusMaterial)];

graphWorld.add(walls[0]);
graphWorld.add(walls[1]);


function updateWall() {
  updateCurve();
  updateZMesh();
  const geometry = new THREE.ParametricBufferGeometry( 
    function(u,v,vec) {
      const {a,b,func} = curves[data.r];
      const t = a + data.sMode*u*(b - a);
      const {x,y} = func(t);
      const z = v*zFunctions[data.f].func(x,y);
      if (data.tMode < 0){
        const s = -data.tMode;
        vec.set(x*(1-s) + s*u*0.001,y,z);
      } else {
        const s = data.tMode;
        vec.set(x,y*(1-s) + s*u*0.001,z);
      }
    },
    nX*10,nX);
    

  walls.forEach(wall => {
    // console.log(wall);
    if ( wall ) {
      wall.geometry.dispose();
      wall.geometry = geometry;
    } else {
      wall = new THREE.Mesh( geometry, minusMaterial);
      graphWorld.add(wall);
      walls.push( wall )
    }
  });
  updateRunningIntegral();
  render();
}

updateWall();

// gui.add(data,'r',Object.keys(curves)).listen().name("where").onChange(updateWall);
// gui.add(data,'f',Object.keys(zFunctions)).listen().name("what").onChange(updateWall);
// gui.add(data,'tMode',-1.0,1.0).listen().name("how").onChange(updateWall);
gui.add(data,'sMode',0.0,1.0).listen().name("fill").onChange(() => {
  if (myReq) {
    cancelAnimationFrame(myReq);
  }
  myReq = requestAnimationFrame(
    () => {
      // updateRunningIntegral();
      updateWall();
    }
  );
});
gui.add(zMesh,'visible').listen().name("graph of f").onChange(updateWall);

let last = 0,myReq;
function animateToDx(time) {
    data.tMode = Math.min(1,data.tMode + (time*0.001 - last)/2);
    updateWall();
    if (data.tMode < 1) {
      myReq = requestAnimationFrame(animateToDx);
    } else {
      updateFormula();
    }
  }

const dxElement = document.getElementById("dx");
dxElement.onclick = () => {
  requestAnimationFrame((time) => {
    last = time*0.001;
    if ( myReq ) {
      cancelAnimationFrame(myReq);
    }
    myReq = requestAnimationFrame(animateToDx);
  });
  dsElement.classList.remove("choices-selected");
  dxElement.classList.add("choices-selected");
  dyElement.classList.remove("choices-selected"); 
}

function animateToDy(time) {
    data.tMode = Math.max(-1,data.tMode - (time*0.001 - last)/2);
    updateWall();
    if (data.tMode > -1) {
      myReq = requestAnimationFrame(animateToDy);
    } else {
      updateFormula();
    }
  }

const dyElement = document.getElementById("dy");
dyElement.onclick = () => {
  requestAnimationFrame((time) => {
    last = time*0.001;
    if ( myReq ) {
      cancelAnimationFrame(myReq);
    }
    myReq = requestAnimationFrame(animateToDy);
  });
  dsElement.classList.remove("choices-selected");
  dxElement.classList.remove("choices-selected");
  dyElement.classList.add("choices-selected");
}

function animateToDs(time) {
  if (data.tMode > 0) {
    data.tMode = Math.max(0,data.tMode - (time*0.001 - last)/2);
  } else {
    data.tMode = Math.min(0,data.tMode + (time*0.001 - last)/2);
  }
  updateWall();
  if (Math.abs(data.tMode) > 0) {
    myReq = requestAnimationFrame(animateToDs);
  } else {
    updateFormula();
  }
}

const dsElement = document.getElementById("ds");
dsElement.onclick = () => {
requestAnimationFrame((time) => {
  last = time*0.001;
  if ( myReq ) {
    cancelAnimationFrame(myReq);
  }
  myReq = requestAnimationFrame(animateToDs);
});
dsElement.classList.add("choices-selected");
dxElement.classList.remove("choices-selected");
dyElement.classList.remove("choices-selected");
}


const surfs = ["paraboloid","plane","wave"];
for (let i = 0; i < surfs.length; i++) {
  const surf = surfs[i];
  const element = document.getElementById(surf);

  element.onclick = () => {
    data.f = surf;
    updateFormulaF();
    updateWall();
    for (let j = 0; j < surfs.length; j++) {
      const el = document.getElementById(surfs[j]);
      i == j ? el.classList.add("choices-selected") : el.classList.remove("choices-selected");
    }
  }
}

const paths = ["parabola","line","circle","swirl"];
for (let i = 0; i < paths.length; i++) {
  const name = paths[i];
  const element = document.getElementById(name);

  element.onclick = () => {
    data.r = name;
    updateFormula();
    updateWall();
    for (let j = 0; j < paths.length; j++) {
      const el = document.getElementById(paths[j]);
      i == j ? el.classList.add("choices-selected") : el.classList.remove("choices-selected");
    }
  }
}


// from https://threejsfundamentals.org 
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

function render() {
    // controls.update();
    for (let index = 0; index < axesText.length; index++) {
      const element = axesText[index];
      element.lookAt(camera.position);
    }

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        const colorBarCanvas = document.querySelector("#colorbar");
        colorBarCanvas.width = colorBarCanvas.clientWidth;
        colorBarCanvas.height = colorBarCanvas.clientHeight;
      }
    
    renderer.render(scene, camera);
    // requestAnimationFrame(render);
  }

zMesh.visible = false;

render();





// {
//   const colorBarCanvas = document.createElement("canvas");
//   colorBarCanvas.classList.add("colorBar");
//   document.body.appendChild(colorBarCanvas);
//   colorBarCanvas.width = colorBarCanvas.clientWidth;
//   colorBarCanvas.height = colorBarCanvas.clientHeight;
//   let context = colorBarCanvas.getContext('2d');
//   // context.rect(0, 0, colorBarCanvas.clientWidth, colorBarCanvas.clientHeight);

//   // colorBarCanvas.style.width = "1100px";

//   // add linear gradient
//   let grd = context.createLinearGradient( 0, colorBarCanvas.height,0,0);

//   for (let x = 0; x <= 1; x += 0.1) {
//     const hexString = blueUpRedDown(x*2 - 1).getHexString();
//     console.log("#" + hexString);
//     grd.addColorStop(x, "#" + hexString);   
//   }
//   // grd.addColorStop(0,"#3D003D");
//   // grd.addColorStop(0.5,"#FFFFFF")
//   // grd.addColorStop(1,"#8E1400");
//   console.log(grd,colorBarCanvas.width,colorBarCanvas.height,colorBarCanvas.clientHeight);
//   // light blue
//   // dark blue
//   // grd.addColorStop(1, '#004CB3');
//   context.fillStyle = grd;
//   context.fillRect(0,0,colorBarCanvas.width/2,colorBarCanvas.height);
//   context.font = "20pt Monaco, monospace";
//   context.fillStyle = "black";
//   context.textAlign = "center";
//   context.fillText("Hello Lorem Ipsum How are you?", colorBarCanvas.width/2, colorBarCanvas.height/2);
//   colorBarCanvas.style.display = 'block';
// }

// addColorBar(-1,1);

gui.domElement.style.zIndex = 2000;
// clearAllButPie();
// requestAnimationFrame(render);