/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
// import {Stats} from 'https://unpkg.com/stats.js@0.17.0/build/stats.min.js';



// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import { GUI} from '../base/dat.gui.module.js';
import {
  colorBufferVertices,
  blueUpRedDown,
  addColorBar,
  marchingSegments,
  drawAxes,
  drawGrid,
  labelAxes,
  ArrowBufferGeometry,
  vMaxMin,
  gaussLegendre,
  marchingSquares,
  marchingCubes,
} from "../base/utils.js";

// Make z the default up
THREE.Object3D.DefaultUp.set(0,0,1);

/* Some constants */
const tol = 1e-12 //tolerance for comparisons
let gridMax = 1;
let gridStep = gridMax / 10;
const pi = Math.PI;



const scene = new THREE.Scene();
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({antialias: true, alpha : true,canvas: canvas});

scene.background = new THREE.Color( 0xddddef );

const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);

camera.position.x = gridMax*2/2;
camera.position.y = -gridMax*3/2 ;
camera.position.z = gridMax*4.5/2;
camera.up.set(0,0,1);
camera.lookAt( 0,0,0 );

// Lights


// soft white light
scene.add( new THREE.AmbientLight( 0xA0A0A0 ) );

//something to make shiny things shine - a chandelier
const chandelier = new THREE.Object3D();
const candles = 2;
for (let i=0; i < candles; i++) {
  for (let j=0; j < 2; j++) {
    const light = new THREE.PointLight(0xFFFFFF, .5, 1000);
    light.position.set(20*Math.cos(i*2*pi/candles + Math.pow(-1,j) * 1/2),20*Math.sin(i*2*pi/candles + Math.pow(-1,j)*1/2),Math.pow(-1,j)*10);
    chandelier.add(light);
  }
}
scene.add(chandelier);

// controls 

const controls = new OrbitControls(camera, renderer.domElement);

// controls.rotateSpeed = 1.0;
// controls.zoomSpeed = 1.2;
// controls.panSpeed = 0.8;

// controls.keys = [ 65, 83, 68 ];

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.target.set( 0,0,0);
controls.addEventListener('change', requestFrameIfNotRequested);

window.addEventListener('resize', requestFrameIfNotRequested);

//axes

const lineMaterial = new THREE.LineBasicMaterial( { color: 0x551122, transparent: true, opacity: 0.8 } );

// Grid

let gridMeshes = new THREE.Object3D();
// gridMeshes = drawGrid( {lineMaterial});
gridMeshes.renderDepth = -1;
scene.add(gridMeshes);

// Axes
const axesMaterial = new THREE.MeshLambertMaterial( {color: 0x320032} );
let axesHolder = drawAxes( {gridMax, gridStep, axesMaterial});
scene.add(axesHolder)

// Fonts
let [axesText, font] = labelAxes( { scene , render: requestFrameIfNotRequested } );

function rescale(newGridMax=1) {
  const oldGridMax = gridMax;
  gridMax = newGridMax;
  gridStep = gridMax / 10;

  freeBalls(gridMeshes);

  // gridMeshes.copy(drawGrid( {lineMaterial, gridMax, gridStep}));

  freeBalls(axesHolder)
  // Axes
  axesHolder.copy(drawAxes( {gridMax, gridStep, axesMaterial}));
  
  // Fonts

  // for (let index = axesText.length - 1; index >= 0 ; index--) {
  //   const textObject = axesText[index];
  //   freeBalls(textObject);
  //   scene.remove(textObject);
  //   axesText.remove(textObject);
  // }
   
  [axesText, font] = labelAxes( { scene , gridMax, gridStep, render: requestFrameIfNotRequested, axesText } );

  camera.position.multiplyScalar(newGridMax / oldGridMax);
}


const material = new THREE.MeshPhongMaterial({color: 0x121212,shininess: 60,side: THREE.FrontSide,vertexColors: false});
const materialColors = new THREE.MeshPhongMaterial({color: 0xffffff,shininess: 70,side: THREE.DoubleSide, vertexColors: true});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});

// whiteLineMaterial.depthTest = false;

// whiteLineMaterial.polygonOffset = true;
// whiteLineMaterial.polygonOffsetFactor = 0.1;

const redLineMaterial = new THREE.LineBasicMaterial({color: 0xbb0000,linewidth: 14});


const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true } );
const minusMaterial = new THREE.MeshPhongMaterial({color: 0xff3232, shininess: 80, side: THREE.BackSide,vertexColors: false, transparent: true, opacity: 0.7});
const plusMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.7});



const surfaces = {
  cube: {
    z: "x + y + z",
    a: "0",
    b: "1",
    c: "0",
    d: "1",
    e: "0",
    f: "1",
  },
  example1: {
    z: "z",
    a: "0",
    b: "1",
    c: "0",
    d: "1 - x",
    e: "0",
    f: "1 - x^2",
  },
  example2: {
    z: "2*z",
    a: "1 - sqrt(2)",
    b: "1 + sqrt(2)",
    c: "-sqrt(2 - (x - 1)^2)",
    d: "sqrt(2 - (x - 1)^2)",
    e: "x^2 + y^2",
    f: "2*x + 1",
  },
  example3: {
    z: "y",
    a: "-1",
    b: "1 ",
    c: "-1",
    d: "1",
    e: "-2",
    f: "2^x",
  },  
}






const rData = {
  a: math.parse("0"),
  b: math.parse("1"),
  c: math.parse("0"),
  d: math.parse("1 - x"),
  e: math.parse("0"),
  f: math.parse("1 - x - y"),
  z: math.parse("z^2"),
}

const data = {
  S: 'mtns',
  nX: 30,
  rNum: 10,
  cNum: 10,
  shards: 0,
  nVec: 0,
  shiftLevel: 0.0,
  nL: 10,
  levelDelta: -1,
}

let debug = false;
function processURLSearch() {
  const urlParams = new URLSearchParams(location.search)
  // console.log(urlParams.keys() ? true : false);
  if (urlParams.keys()) {
    urlParams.forEach((val, key) => {
      let element = document.querySelector(`input#custom${key.toUpperCase()}`);
      if (element) {
        rData[key] = math.parse(val);
        element.value = val.toString();
        return;
      } 
      if (["nX", "rNum", "cNum"].indexOf(key) > -1) {
        data[key] = parseInt(val);
        return console.log(key, val);
      }
      if (key === 'debug') {
        debug = val.toLowerCase() === 'true';
        return;
      }
      element = document.querySelector(`input[name=${key}]`);
      if (element) {
        element.checked = val.toLowerCase() === 'true';
        element.oninput();
        
      }
      // const [s,c] = key.split("camera");
      // if (!s) {
      //   camera.position[c.toLowerCase()] = parseFloat(val);
      // }
      
    });
  }
}

function makeQueryStringObject() {
  let query = {};
  Object.keys(rData).forEach( (key) => {
    const element = document.querySelector(`#custom${key.toUpperCase()}`);
    if (element) {
      query[key] = element.value;
    }
  });
  document.querySelectorAll('input[type=checkbox]').forEach( el => {
    query[el.name] = el.checked;
  });
  query = {
    ...query,
    ...data,
    // cameraX: camera.position.x,
    // cameraY: camera.position.y,
    // cameraZ: camera.position.z,
  };
  return query;
}

document
  .querySelectorAll(`.setting-thing>input[type="range"]`)
  .forEach((element) => {
    if (element.id === "scale") {
      element.onchange = () => {
        const val = parseFloat(element.value);
        data[element.name] = val;
        let scala = Math.pow(10, Math.floor(val)) * Math.floor(Math.pow(10,val) / Math.pow(10,Math.floor(val)) );
        scala = Math.round(100 * scala) / 100;
        console.log("Scale to ", scala);
        rescale( scala );
      };
      element.oninput = () => {
        const val = element.value;
        let scala = Math.pow(10, Math.floor(val)) * Math.floor(Math.pow(10,val) / Math.pow(10,Math.floor(val)) );
        scala = Math.round(100 * scala) / 100
        // console.log(scala, "oninput")
        element.nextElementSibling.innerText =  scala.toString() ;
        // rescale (scala);
      }
    } else {
      element.oninput = () => {
        if (element.name === "shiftLevel") {
          data[element.name] = parseFloat(element.value);

          changeLevels( data.shiftLevel );
          requestFrameIfNotRequested();
          
          // if (faucet) initBalls(balls, gridMax);
        } else {
          data[element.name] = parseInt(element.value);
          updateSurface();
        }
        if (debug) {
          let element = document.querySelector("div#dataLog");
          if (!element) {
            element = document.createElement("div");
            element.id = "dataLog";
            debugLog.appendChild(element);
          }
          element.innerText = JSON.stringify(data, null, " ");
        }
        element.nextElementSibling.value = element.value;
      };
    }
  });

document.querySelectorAll("#shards").forEach( (element) => {
  element.oninput = () => {
    data[element.name] = parseInt(element.value);
    updateSurface();

    element.nextElementSibling.value = element.value;
  }
});

let stats;
if (debug) {
  stats = new Stats();
  stats.showPanel( 2 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );
  stats.dom.style.left = 'unset';
  stats.dom.style.top = 'unset';
  stats.dom.style.bottom = '60px';
  stats.dom.style.right = '10px';

}

// Try to determine the order

function hasVariable(expr, name) {
  let outcome;
  expr.traverse(function (node, path, parent) {
    if (node.type == 'SymbolNode' && node.name == name) {
      outcome = true;
    }
  });
  if (outcome) {
    return true;
  } else {
    return false;
  }
}

const variableOrder = ["x","y","z"];
const varTranslate = {"x": "ab", "y": "cd", "z": "ef"};

function orderVariables() {
  const depTree = {x: [], y: [], z: []};
  const {a,b,c,d,e,f} = rData; 
  for (const v of "yz") {
    if (hasVariable(a,v) || hasVariable(b,v)) {
      depTree.x.push(v);
    }
  }
  for (const v of "xz") {
    if (hasVariable(c,v) || hasVariable(d,v)) {
      depTree.y.push(v);
    }
  }
  for (const v of "xy") {
    if (hasVariable(e,v) || hasVariable(f,v)) {
      depTree.z.push(v);
    }
  }
  
  variableOrder.sort((a,b) => {
    if (depTree[a].includes(b)) {
      return 1;
    }
    if (depTree[b].includes(a)) {
      return -1;
    }
    return depTree[a].length - depTree[b].length;
  });
}

const integralTexElement = document.createElement("div");
integralTexElement.classList.add("w3-padding");
integralTexElement.classList.add("integralbox");
document.body.appendChild(integralTexElement);



// integralTexElement.style.width = "400px";

function updateTexElement() {
  integralTexElement.innerHTML = "$$\\int_{" + rData[varTranslate[variableOrder[0]][0]].toTex() + "}^{" + rData[varTranslate[variableOrder[0]][1]].toTex() + "}\\int_{" 
  + rData[varTranslate[variableOrder[1]][0]].toTex() + "}^{" + rData[varTranslate[variableOrder[1]][1]].toTex() + "}\\int_{" + rData[varTranslate[variableOrder[2]][0]].toTex() + "}^{" + rData[varTranslate[variableOrder[2]][1]].toTex() + "} " + rData.z.toTex() + ` \\,d${variableOrder[2]}\\,d${variableOrder[1]}\\,d${variableOrder[0]} $$`;
  MathJax.typeset();
}



// {
//   const element = document.querySelector("input#frameBallVisible");
//   element.oninput = () => {
//     frameBall.visible = element.checked;
//     requestFrameIfNotRequested();
//   }
// }

// {
//   for (let i = 0; i < 3; i++) {
//     const c = "xyz"[i];
    
//     const element = document.querySelector(`input#${c}Traces`);
//     element.oninput = () => {
//       tracesHolder.children[i].visible = element.checked;
//       requestFrameIfNotRequested();
//     }
//   }
// }

// {
//   const element = document.querySelector("input#flattenContours");
//   element.oninput = () => {
//     data.levelDelta = element.checked ? 1 : -1;

//     if ( frameRequested ) {
//       cancelAnimationFrame( myReq );
//     }
//     frameRequested = true;
//     requestAnimationFrame( animateLevel );
//   }
// }



let surfaceMesh;
const tracesHolder = new THREE.Object3D();
scene.add(tracesHolder);

function updateSurface() {
  orderVariables();
  const {z} = rData;
  const a = rData[varTranslate[variableOrder[0]][0]], b = rData[varTranslate[variableOrder[0]][1]], 
        c = rData[varTranslate[variableOrder[1]][0]], d = rData[varTranslate[variableOrder[1]][1]],
        e = rData[varTranslate[variableOrder[2]][0]], f = rData[varTranslate[variableOrder[2]][1]];
  const [X,Y,Z] = variableOrder;

  const A = a.evaluate(), B = b.evaluate();

  // let [vMax, vMin] = [1,-1];
  let [vMax, vMin] = [0,0];
  {
    const N = 10;
    const params = {};
    for (let i = 0; i <= N; i++) {
      params[X] = A + (B - A)/N * (i);
      if (i == 0) params[X] += .0001; // stay away from edge cases
      if (i == N) params[X] -= .0001; // stay away from edge cases
      const C = c.evaluate( params ), D = d.evaluate(params);
      for (let j = 0; j <= N; j++) {
        params[Y] = C + (D - C) / N * (j);
        if (j == 0) params[Y] += .0001; // stay away from edge cases
        if (j == N) params[Y] -= .0001; // stay away from edge cases
        const E = e.evaluate( params ), F = f.evaluate(params);
        for (let k = 0; k <= N; k++) {
          params[Z] = E + (F - E)*(k)/N;
          if (k == 0) params[Z] += .0001; // stay away from edge cases
          if (k == N) params[Z] -= .0001; // stay away from edge cases
          const val = z.evaluate( params )
          vMax = Math.max(vMax, val );
          vMin = Math.min(vMin, val );
        }
      }
    }
    console.log("vmaxmin", vMax, vMin)
    if (vMax == vMin) { 
      if (vMax == 0) {
        vMax = 1;
        vMin = -1;
      } else {
        vMax = 4/3*Math.abs(vMax);
        vMin = -4/3*Math.abs(vMin);
      }
    }
  }
  const colorBar = document.querySelector(".colorBar");
  if (colorBar) document.body.removeChild(colorBar);
  addColorBar(vMin, vMax);

  if (surfaceMesh) {
    for (let i = surfaceMesh.children.length - 1; i >= 0; i--) {
      const mesh = surfaceMesh.children[i];
      mesh.geometry.dispose()
      surfaceMesh.remove(mesh);
    }
  } else {
    surfaceMesh = new THREE.Object3D();
    scene.add(surfaceMesh);
  }

  // Top
  {
    const geometry = new THREE.ParametricBufferGeometry( (u,v,vec) => {
      const U = A + (B - A)*u;
      const params = {};
      params[X] = U;
      params[Y] = (1 - v)*c.evaluate( params ) + v*d.evaluate( params ); 
      params[Z] = f.evaluate( params );

      vec[X] = params[X];
      vec[Y] = params[Y];
      vec[Z] = params[Z];

    }, data.nX, data.nX);

    const mesh = new THREE.Mesh(geometry, materialColors);
    colorBufferVertices(mesh, (u,v,w) => blueUpRedDown( 2*(z.evaluate({x: u, y: v, z: w}) - vMin) / (vMax - vMin) - 1) );


    surfaceMesh.add(mesh);

  }

  // Bottom
  {
    const geometry = new THREE.ParametricBufferGeometry( (u,v,vec) => {
      const U = A + (B - A)*u;
      const params = {};

      params[X] = U;
      params[Y] = (1 - v)*c.evaluate( params ) + v*d.evaluate( params ); 
      params[Z] = e.evaluate( params );

      vec[X] = params[X];
      vec[Y] = params[Y];
      vec[Z] = params[Z];

    }, data.nX, data.nX);

    const mesh = new THREE.Mesh(geometry, materialColors);
    colorBufferVertices(mesh, (u,v,w) => blueUpRedDown( 2*(z.evaluate({x: u, y: v, z: w}) - vMin) / (vMax - vMin) - 1) );


    surfaceMesh.add(mesh);

  }

  // "Front" 
  {
    const geometry = new THREE.ParametricBufferGeometry( (u,v,vec) => {
      const U = A + (B - A)*u;
      const params = {};

      params[X] = U;
      params[Y] = d.evaluate( params );
      params[Z] = (1 - v)*e.evaluate( params ) + v*f.evaluate( params )

      vec[X] = params[X];
      vec[Y] = params[Y];
      vec[Z] = params[Z];

    }, data.nX, data.nX);

    const mesh = new THREE.Mesh(geometry, materialColors);
    colorBufferVertices(mesh, (u,v,w) => blueUpRedDown( 2*(z.evaluate({x: u, y: v, z: w}) - vMin) / (vMax - vMin) - 1) );


    surfaceMesh.add(mesh);
  }

  // "Back" 
  {
    const geometry = new THREE.ParametricBufferGeometry( (u,v,vec) => {
      const U = A + (B - A)*u;
      const params = {};

      params[X] = U;
      params[Y] = c.evaluate( params );
      params[Z] = (1 - v)*e.evaluate( params ) + v*f.evaluate( params )

      vec[X] = params[X];
      vec[Y] = params[Y];
      vec[Z] = params[Z];

    }, data.nX, data.nX);

    const mesh = new THREE.Mesh(geometry, materialColors);
    colorBufferVertices(mesh, (u,v,w) => blueUpRedDown( 2*(z.evaluate({x: u, y: v, z: w}) - vMin) / (vMax - vMin) - 1) );


    surfaceMesh.add(mesh);
  }


  // "Left" 
  {
    const params = {};

    params[X] = A;
    const C = c.evaluate( params ), D = d.evaluate( params );
    if (D > C + 1e-10) {
      const geometry = new THREE.ParametricBufferGeometry( (u,v,vec) => {
        params[Y] = (1 - u)*C + u*D;
        params[Z] =  (1 - v)*e.evaluate( params ) + v*f.evaluate( params ),

        vec[X] = params[X];
        vec[Y] = params[Y];
        vec[Z] = params[Z];

      }, data.nX, data.nX);

      const mesh = new THREE.Mesh(geometry, materialColors);
      colorBufferVertices(mesh, (u,v,w) => blueUpRedDown( 2*(z.evaluate({x: u, y: v, z: w}) - vMin) / (vMax - vMin) - 1) );


      surfaceMesh.add(mesh);
    } else {
      console.log("Empty side A")
    }
  }

  // "Right" 
  {
    const params = {};

    params[X] = B;
    const C = c.evaluate( params ), D = d.evaluate( params );
    if (D > C + 1e-10) {
      const geometry = new THREE.ParametricBufferGeometry( (u,v,vec) => {

        params[Y] = (1 - u)*C + u*D;
        params[Z] =  (1 - v)*e.evaluate( params ) + v*f.evaluate( params ),

        vec[X] = params[X];
        vec[Y] = params[Y];
        vec[Z] = params[Z];

      }, data.nX, data.nX);

      const mesh = new THREE.Mesh(geometry, materialColors);
      colorBufferVertices(mesh, (u,v,w) => blueUpRedDown( 2*(z.evaluate({x: u, y: v, z: w}) - vMin) / (vMax - vMin) - 1) );


      surfaceMesh.add(mesh);
    } else {
      console.log("Empty side B")
    }
  }

  updateTexElement();

  requestFrameIfNotRequested();
   
}


function makeTraces( {xN = 10, yN = 10, zN = 10} = {}) {
  const {a,b,c,d,e,f,z,k} = rData;
  const [xMin,xMax, yMin, yMax, zMin, zMax] = [a,b,c,d,e,f].map(x => x.evaluate())

  const dx = (xMax - xMin) / xN, dy = (yMax - yMin) / yN, dz = (zMax - zMin) / zN;

  for (let index = tracesHolder.children.length - 1; index >= 0; index--) {
    const child = tracesHolder.children[index];
    child.geometry.dispose();
    tracesHolder.remove(child);    
  }

  // x-traces
  {
    const pts = [];

    for (let i = 0; i < xN; i++) {
      const zLevel = xMin + i * dx;
      pts.push(
        ...marchingSquares({
          f: (x, y) => z.evaluate({ x: zLevel, y: x, z: y }),
          level: k.evaluate(),
          xmin: yMin,
          xmax: yMax,
          ymin: zMin,
          ymax: zMax,
          zLevel: zLevel,
          nX: data.nX,
          nY: data.nX,
        })
      );
    }

    // console.log(pts.length, " Points starting with ", pts[0]);

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);

    const trace = new THREE.LineSegments(geometry, whiteLineMaterial);

    trace.rotation.y = Math.PI / 2;
    trace.rotation.z = Math.PI / 2;


    tracesHolder.add(trace);
  }

  // y-traces
  {
    const pts = [];

    for (let i = 0; i < yN; i++) {
      const zLevel = yMin + i * dy;
      pts.push(
        ...marchingSquares({
          f: (x, y) => z.evaluate({ x: y, y: zLevel, z: x }),
          level: k.evaluate(),
          xmin: zMin,
          xmax: zMax,
          ymin: xMin,
          ymax: xMax,
          zLevel: zLevel,
          nX: data.nX,
          nY: data.nX,
        })
      );
    }

    // console.log(pts.length, " Points starting with ", pts[0]);

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);

    const trace = new THREE.LineSegments(geometry, whiteLineMaterial);

    trace.rotation.x = -Math.PI / 2;
    trace.rotation.z = -Math.PI / 2;


    tracesHolder.add(trace);
  }

  // z-traces  
  {
    const pts = [];

    for (let i = 0; i < zN; i++) {
      const zLevel = zMin + i * dz;
      pts.push(
        ...marchingSquares({
          f: (x, y) => z.evaluate({ x: x, y: y, z: zLevel }),
          level: k.evaluate(),
          xmin: xMin,
          xmax: xMax,
          ymin: yMin,
          ymax: yMax,
          zLevel: zLevel,
        })
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);

    tracesHolder.add(new THREE.LineSegments(geometry, whiteLineMaterial));
  }
  

}

// makeTraces();

// Exercises
// 

// function simpleMathString(s) {return math.simplify(math.parse(s)).toTex()}


// const ghostMesh = new THREE.Mesh(undefined, wireMaterial);
// scene.add(ghostMesh);

{
  const element = document.querySelector("input#surfaceVisible");
  element.oninput = () => {
    surfaceMesh.visible = element.checked;
    requestFrameIfNotRequested();
  }
}



// let [vMax, vMin] = vMaxMin(surfaceMesh.children[0])

function lcm(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number')) 
   return false;
 return (!x || !y) ? 0 : Math.abs((x * y) / gcd(x, y));
}

function gcd(x, y) {
 x = Math.abs(x);
 y = Math.abs(y);
 while(y) {
   var t = y;
   y = x % y;
   x = t;
 }
 return x;
}



const surfs = Object.keys(surfaces);
for (let i = 0; i < surfs.length; i++) {
  const surf = surfs[i];
  let element = document.getElementById(surf);

  if (! element) {
    element = document.createElement("span");
    parent = document.querySelector("#surfaceMenu");
    element.innerHTML = `<span id="${surf}">${surf}</span>`;
    if (parent.children.length > 0) {
      const pipeSpan = document.createElement("span");
      pipeSpan.innerText = " | ";
      parent.appendChild(pipeSpan);
    }
    parent.appendChild(element);
  }

  element.onclick = () => {
    data.S = surf;
    const sf = surfaces[surf];
    let el;
    for (let i = 0; i < Object.keys(sf).length; i++) {;
      const c = Object.keys(sf)[i];
      // console.log(surf, c);
      el = document.querySelector(`#custom${c.toUpperCase()}`);
      el.value = sf[c];
      rData[c] = math.parse(sf[c]);
      // el.dispatchEvent(new Event('change'));
    }
    updateSurface();
    for (let j = 0; j < surfs.length; j++) {
      const el = document.getElementById(surfs[j]);
      const elForm = document.querySelector(`.surface-choices-item#${surfs[j]}-formula`)
      if (i === j) {
        el.classList.add("choices-selected");
        if (elForm) elForm.style.visibility = 'visible';
      } else {
        el.classList.remove("choices-selected");
        if (elForm) elForm.style.visibility = 'hidden';
      }
    }
  }
}

{
  const XYZ = "ZABCDEF";
  for (let i = 0; i < XYZ.length; i++) {
    const ch = XYZ[i];
    const id = `custom${ch}`;
    const element = document.querySelector(`#${id}`);

    element.onchange = () => {
      const c = ch.toLowerCase();
      // console.log(element.value, "is the value of" + ch);
      const form = document.querySelector(`#${id} + .form-warning`);
      try {
        const expr = math.parse(element.value);
        expr.evaluate({ x: 0, y: 0, z: 0});
        rData[c] = expr;
        form.innerText = '';
      } catch (e) {
        console.error( e );
        form.innerText = ' ' + e.name;
        return;
      }
      // console.log(expr.evaluate( {u: 2, v: 1} ));
      updateSurface();
    };
  }
}




// const balls = new THREE.Object3D();
// const fieldMaterial = new THREE.MeshLambertMaterial( {color: 0x373765 } )
// const curlMaterial = new THREE.MeshLambertMaterial( {color: 0x653737 } )
// const trailMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, vertexColors: true } );
// const trails = new THREE.LineSegments(new THREE.BufferGeometry(), trailMaterial );
// const arrowGeometries = [], heightResolution = 150, vfScale = gridStep*5;
// const arrowArgs = {radiusTop: vfScale/30, radiusBottom: vfScale/100, heightTop: vfScale/8};
// let trailColors = [], trailPoints = [], colors = [];
// const trailLength = 250; 
// // scene.add(trails);



// for (let i = 1; i <= heightResolution; i++) {
//   const geometry = new ArrowBufferGeometry( {
//     radiusBottom: vfScale/100, 
//     height: i/heightResolution*vfScale, 
//     heightTop: Math.min(i/heightResolution*vfScale/3,vfScale/8) ,
//     radiusTop: Math.min(vfScale/30, i/heightResolution*vfScale/6)
//   });
//   arrowGeometries.push(geometry)
// }




function freeBalls(objectHolder) {
  for (let i = objectHolder.children.length - 1; i >= 0 ; i--) {
    const element = objectHolder.children[i];
    if (element.geometry.dispose) element.geometry.dispose();
    objectHolder.remove(element);
  }
}

function freeTrails() {
  trailPoints = [];
}

 



//
//   UI for field
//





// Select a point
const frameBall = new THREE.Object3D();
const arrows = {u: new THREE.Mesh(), v: new THREE.Mesh(), n: new THREE.Mesh()};
const ruColors = {u: 0x992525, v: 0x252599, n: 0xb6b6b6};
for (let key of Object.keys(arrows)) {
  arrows[key].material = new THREE.MeshBasicMaterial( {color: ruColors[key] });
  frameBall.add(arrows[key])
}

const pointMaterial = new THREE.MeshLambertMaterial( { color: 0xffff33});
const point = new THREE.Mesh( new THREE.SphereGeometry(gridStep/8, 16,16),pointMaterial);

frameBall.add(point);

const planeBall = new THREE.Mesh();
frameBall.add(planeBall);

frameBall.visible = false;

scene.add(frameBall);

function nFrame({f = (x,y,z) => rData.z.evaluate( {x,y,z} ), point = point, eps = 1e-4, du = 1, dv = 1 } = {} ) {
  
  const [u,v,w] = [point.position.x, point.position.y, point.position.z];
 
  let h;

  h = Math.max( u*eps, (2*eps)**2 );
  const fx = (f(u + h/2, v, w) - f(u - h/2, v, w)) / h;
  h = Math.max( v*eps, (2*eps)**2 );
  const fy = (f(u, v + h/2, w) - f(u, v - h/2, w)) / h;
  h = Math.max( w*eps, (2*eps)**2 );
  const fz = (f(u, v, w + h/2) - f(u, v, w - h/2)) / h;

  return {p: point.position, n: new THREE.Vector3(fx, fy, fz) }
}

// Construct tangent vectors at a point u,v (both 0 to 1)
function tangentVectors( { point, eps = 1e-4, plane = true } = {} ) {

  const {p, n} = nFrame( { point, eps, du: 1/data.rNum, dv: 1/data.cNum});

  // point.position.copy(dr.p);


  const arrowParams = { radiusTop: gridStep / 10,  radiusBottom: gridStep / 20, heightTop: gridStep/7 }

  const arrow = arrows.n;
  const pos = p.clone();
  arrow.position.copy(pos);
  if ( arrow.geometry ) arrow.geometry.dispose();
  arrow.geometry = new ArrowBufferGeometry( { ...arrowParams, height: n.length() } )
  arrow.lookAt(pos.add(n));
  

  planeBall.geometry.dispose();

  if (plane) {
    const {a,b,c,d,e,f} = rData;

    const tangentPlaneGeometry = marchingCubes({
      f: (x,y,z) => {
        const xVec = new THREE.Vector3(x,y,z);
        return xVec.dot(n);
      },
      level: n.dot(p) + 1e-8,
      xMin: a.evaluate(),
      xMax: b.evaluate(),
      yMin: c.evaluate(),
      yMax: d.evaluate(),
      zMin: e.evaluate(),
      zMax: f.evaluate(),
      N: 2,
    });

    // console.log(tangentPlaneGeometry);

    planeBall.geometry = tangentPlaneGeometry;
    planeBall.material = shardMaterial;
  }
}







const raycaster = new THREE.Raycaster();

let mouseVector = new THREE.Vector2();


function onMouseMove( e ) {
    // normalized mouse coordinates
    if (selectNewPoint) {
      mouseVector.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouseVector.y = 1 - 2 * ( e.clientY / window.innerHeight );
    
      raycaster.setFromCamera( mouseVector, camera );

      const intersects = raycaster.intersectObjects( [ surfaceMesh.children[0], surfaceMesh.children[1] ], true );

      if ( intersects.length > 0 ) {
        const intersect = intersects[0];
        // console.log(intersect.uv);
        point.position.copy(intersect.point)
        // point.position.y = intersect.point.y;
        // point.position.z = intersect.point.z;

        // const u = intersect.uv.x, v = intersect.uv.y;
        tangentVectors( {point} );
      }    
    }
	}


let selectNewPoint = false;


window.addEventListener('mousemove',onMouseMove,false);
window.addEventListener('keydown',(e) => {
  if (e.key === "Shift") {
    selectNewPoint = true;
    cancelAnimationFrame(myReq);
    frameRequested = true;
    myReq = requestAnimationFrame(animateLevel);
    // frameBall.visible = true;
  }
},false);
window.addEventListener('keyup',(e) => {
  if (e.key === "Shift") {
    selectNewPoint = false;
    cancelAnimationFrame(myReq);
    frameRequested = false;
    last = null;
    // frameBall.visible = false;
  }
},false);


// Add surface area pieces

const shards = new THREE.Object3D();
const shardMaterial = new THREE.MeshPhongMaterial( {color: 0x4b4b4b, shininess: 80, side: THREE.DoubleSide, transparent: true, opacity: 0.5})
scene.add(shards);


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

let myReq,last,frameRequested = false;

function requestFrameIfNotRequested() {
  if (!frameRequested) {
    frameRequested = true;
    myReq = requestAnimationFrame(render);
  }
}

function animateLevel(time) {
  controls.update();
  for (let index = 0; index < axesText.length; index++) {
    const element = axesText[index];
    element.lookAt(camera.position);
  }

  if (! last) {
    last = time;
  }

  if (debug) {
    stats.begin() ;
    const element = document.querySelector("div#timeLog");
    timeLog.innerText = (Math.round((time - last)*1000)/1000).toString();
  }

  if (((data.shiftLevel < 3) && data.levelDelta > 0 ) || ((data.shiftLevel > 0) && data.levelDelta < 0)) {
    const newLevel = data.shiftLevel + data.levelDelta*(time - last)*0.001;
    data.shiftLevel = Math.max(0,Math.min(3,newLevel));
    changeLevels( data.shiftLevel );

    myReq = requestAnimationFrame(animateLevel);
    last = time;
  } else {
    if (selectNewPoint) {
      myReq = requestAnimationFrame(animateLevel);
      last = time;
    } else {
      frameRequested = false;
      last = null;
    }
  }


  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

  }


  renderer.render(scene, camera);

  if (debug) stats.end();
}

let debugLog;
if (debug) {
  debugLog = document.createElement('div');
  const timeLog = document.createElement('div');
  debugLog.classList.add('debugger');
  document.body.appendChild(debugLog);
  debugLog.appendChild(timeLog);
  timeLog.id = "timeLog";
  }

// start the tap closed
let faucet = false;



document.getElementById("encodeURL").onclick = () => {
    // console.log();
    const qString = new URLSearchParams( makeQueryStringObject() );
    // console.log(qString.toString());
    window.location.search = qString.toString();
};

document.querySelector("#cameraReset").onclick = () => {
  // console.log();
  controls.target.set(0,0,0);
  requestFrameIfNotRequested();
};

{

  const saveBlob = (function() {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    return function saveData(blob, fileName) {
       const url = window.URL.createObjectURL(blob);
       a.href = url;
       a.download = fileName;
       a.click();
    };
  }());

  const elem = document.querySelector('#screenshot');
  elem.addEventListener('click', () => {
    renderer.render(scene, camera);
    canvas.toBlob((blob) => {
      saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
    });
  });
}

// gui.domElement.style.zIndex = 2000;


function render() {
    frameRequested = false;

    for (let index = 0; index < axesText.length; index++) {
      const element = axesText[index];
      element.lookAt(camera.position);
    }

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
  
    }

    controls.update();
    renderer.render(scene, camera);
}

//initialize frame
// {
//   const uv = {x: 0.5, y: 0.5};
//   point.position.set(rData.x.evaluate(uv));
//   // tangentVectors();
// }

const levelHolder = new THREE.Object3D();
scene.add(levelHolder)

let shiftLevel = 0;

function shiftInterpolation(t,L) {
  if (t < 2) {
    return L - L/2*t;
  }
  else {
    return L/2*((3 - t)**3 - (3 - t)**2);
  }
}

function changeLevels( t ) {
  for (let index = 0; index < levelHolder.children.length; index++) {
    const element = levelHolder.children[index];
    element.position.set(0, 0, shiftInterpolation( t, element.level ))
  }
}

function updateLevels() {
  for (let index = levelHolder.children.length - 1; index >= 0; index--) {
    const element = levelHolder.children[index];
    element.geometry.dispose();
    levelHolder.remove(element);
  }
  const {a,b,c,d,z} = rData;
  let C=0, D=0, zMin = 0, zMax = 0;
  const [A,B] = [a.evaluate(),b.evaluate()];
  for (let i=0; i <= data.nL; i++) {
    C = Math.min(C,c.evaluate({x: A + (B - A)*i/data.nL}));
    D = Math.max(D,d.evaluate({x: A + (B - A)*i/data.nL}));
    for (let j=0; j <= data.nL; j++) {
      const Z = z.evaluate( {x: A + (B - A)*i/data.nL, y:C + (D - C)*j/data.nL});
      zMin = Math.min(zMin, Z);
      zMax = Math.max(zMax, Z)
    }
  }

  for (let lev = zMin; lev <= zMax; lev += Math.max((zMax - zMin) / data.nL ), 0.01) {

    const points = marchingSquares( {
      f: (x,y) =>  { return z.evaluate( {x, y} ); },
      xmin: A,
      xmax: B,
      ymin: C,
      ymax: D,
      level: lev,
      zLevel: 0,
      nX: data.nX,
      nY: data.nX,
    } );

    // console.log(points[2]);

    if (points.length > 1) {
      const levelGeometry = new THREE.BufferGeometry();

      levelGeometry.setFromPoints( points );
      
      const levelMesh = new THREE.LineSegments( levelGeometry, new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 3, transparent: false } ));
      
      levelMesh.level = lev;
      levelMesh.position.set(0,0,shiftInterpolation(data.shiftLevel, lev))

      levelHolder.add(levelMesh);
    }
  }
}

processURLSearch()


// updateLevels();
updateSurface();
// changeLevels( 2.5 );


// setTimeout(() => {
//   console.log(axesText, "first");
//   rescale(4);
//   setTimeout(() => {
//     console.log(axesText, "second");
//     rescale(7);
//     setTimeout(() => {
//       console.log(axesText, "third");
//       rescale(3)
//     }, 5000);
//   }, 5000);
// }, 5000);
// go
// requestAnimationFrame(animate);
requestFrameIfNotRequested();