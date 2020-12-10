/* jshint esversion: 6 */


import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
// import {Stats} from 'https://unpkg.com/stats.js@0.17.0/build/stats.min.js';



// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
// import { GUI} from '../base/dat.gui.module.js';
import { colorBufferVertices, blueUpRedDown, addColorBar, marchingSegments, drawAxes, drawGrid, labelAxes, ArrowBufferGeometry, vMaxMin, ParametricCurve } from "../base/utils.js";

let debugLog;
// if (debug) {
  debugLog = document.createElement('div');
  debugLog.classList.add('debugger');
  // document.body.appendChild(debugLog);
  const timeLog = document.createElement('div');
  debugLog.appendChild(timeLog);
  timeLog.id = "timeLog";
  const dataLog = document.createElement('div');
  debugLog.appendChild(dataLog);
  dataLog.id = "dataLog";
// }

// Make z the default up
THREE.Object3D.DefaultUp.set(0,0,1);

/* Some constants */
const nX = 30; // resolution for surfaces
const tol = 1e-12 //tolerance for comparisons
const xmin = -1; // domain of function
const xmax = 1;
const ymin = -1;
const ymax = 1;
const gridMax = Math.max(...[xmin,xmax,ymin,ymax].map(Math.abs));
const gridStep = gridMax / 10;
const pi = Math.PI;



const scene = new THREE.Scene();
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({antialias: true, alpha : true,canvas: canvas});

scene.background = new THREE.Color( 0xddddef );

const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);

camera.position.x = gridMax*.2/2;
camera.position.y = -gridMax*.3/2 ;
camera.position.z = gridMax*.45/2;
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

let gridMeshes = drawGrid( {lineMaterial});
gridMeshes.renderDepth = -1;
scene.add(gridMeshes);

// // Axes
// const axesMaterial = new THREE.MeshLambertMaterial( {color: 0x320032} );
// const axesHolder = drawAxes( {gridMax, gridStep, axesMaterial});
// scene.add(axesHolder)

// Fonts
// const [axesText, font] = labelAxes( { scene , render: requestFrameIfNotRequested } );


const material = new THREE.MeshPhongMaterial({color: 0x121212,shininess: 60,side: THREE.FrontSide,vertexColors: false});
const materialColors = new THREE.MeshPhongMaterial({color: 0xffffff,shininess: 70,side: THREE.DoubleSide, vertexColors: true});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});

whiteLineMaterial.polygonOffset = true;
whiteLineMaterial.polygonOffsetFactor = 0.1;

const redLineMaterial = new THREE.LineBasicMaterial({color: 0xbb0000,linewidth: 14});


const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true } );
const minusMaterial = new THREE.MeshPhongMaterial({color: 0xff3232, shininess: 80, side: THREE.BackSide,vertexColors: false, transparent: true, opacity: 0.7});
const plusMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.7});
const goalPostMaterial = new THREE.MeshPhongMaterial({color: 0xc2c21f, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: false, opacity: 1});

{
  const goalpost = new THREE.Object3D();
  const stand = new ParametricCurve(1, (t) => {
    const vec = new THREE.Vector3();
    return t < 0.5 ? vec.set(0, 0.05, 0.05*t) : vec.set(0, 0.05*Math.cos(Math.PI*(t - 0.5)), 0.05 + 0.05*Math.sin(Math.PI*(t - 0.5)));
  });
  const geometry = new THREE.TubeGeometry( stand, 20, .005, 8, false );
  const crossbar = new THREE.Mesh( new THREE.CylinderGeometry( .005, .005, .18, 32), goalPostMaterial );
  crossbar.rotation.z = Math.PI/2;
  crossbar.position.z = 0.1;
   
  const uprightGeometry = new THREE.CylinderGeometry( .005, .005, .3, 32)
  const leftUp = new THREE.Mesh( uprightGeometry, goalPostMaterial );
  const rightUp = new THREE.Mesh( uprightGeometry, goalPostMaterial );

  leftUp.rotation.x = Math.PI/2;
  rightUp.rotation.x = Math.PI/2;
  leftUp.position.x = .09;
  rightUp.position.x = -.09;
  leftUp.position.z = .25
  rightUp.position.z = .25

  goalpost.add( new THREE.Mesh( geometry, goalPostMaterial ));
  goalpost.add( crossbar );
  goalpost.add( rightUp );
  goalpost.add( leftUp );
  // goalpost.add( new THREE.Mesh( geometry, goalPostMaterial ); );

  scene.add( goalpost );
}




const data = {
  S: 'graphs',
  nX: 30,
  rNum: 10,
  cNum: 10,
  shards: 0,
  nVec: 5,
}

let debug = false;
function processURLSearch() {
  const urlParams = new URLSearchParams(location.search)
  // console.log(urlParams.keys() ? true : false);
  if (urlParams.keys()) {
    urlParams.forEach((val, key) => {
      let element = document.querySelector(`input#custom${key.toUpperCase()}`);
      if (element) {
        rData[key] = math.parse(val).compile();
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

if (debug) document.body.appendChild(debugLog);

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

document.querySelectorAll(`.setting-thing>input[type="range"]`).forEach( (element) => {
  element.oninput = () => {
    data[element.name] = parseInt(element.value);
    if (element.name === 'nVec') {
      freeBalls( balls );
      freeTrails( balls );

      if (faucet) initBalls( balls );
      
    } else {
    updateSurface();
    }
    if (debug) {
      let element = document.querySelector("div#dataLog");
      if (! element) {
        element = document.createElement('div');
        element.id = "dataLog";
        debugLog.appendChild(element);
      }
      element.innerText = JSON.stringify(data, null, " ");
    }
    element.nextElementSibling.value = element.value;
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

// const protonCoords = [];
const protonCoords = [[-1,-1, 1], [1, -1, 0], [0, 0, 0], [-.5, .3, .25],[Math.random(), -Math.random(), Math.random()],[Math.random(), -Math.random(), Math.random()],[Math.random(), -Math.random(), Math.random()]];
const electronCoords = [[-1,0, 0], [0, -1, 0]];
const protons = [];
const electrons = [];


const field = new THREE.Object3D();
const arrowGeometry = new ArrowBufferGeometry( { radiusTop:0.01, radiusBottom:0.002, height:0.1, heightTop:0.01 } );
const N = 10;
const arrows = new THREE.Object3D();
scene.add(arrows)
function updateField() {
  let maxLength = 0;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      for (let k = 0; k <= N; k++) {
        const arrow = new THREE.Mesh(arrowGeometry, material);
        arrow.position.set(2 * (i/N - 1/2), 2 * (j/N - 1/2) + 0.1, 2 * (k/N - 1/2));
        const vec = new THREE.Vector3(...fieldF(arrow.position.x,arrow.position.y,arrow.position.z));
        arrow.mag = vec.length();
        maxLength = Math.max(maxLength, arrow.mag);
        
        arrow.lookAt(vec.add(arrow.position));
        arrows.add(arrow);
        if (debug) dataLog.innerText += JSON.stringify(arrow.position) + JSON.stringify(vec) + JSON.stringify(vec.sub(arrow.position).length()) + "\n";
      }
    }
  }
  for (let arrow of arrows.children) {
    arrow.material = new THREE.MeshLambertMaterial( {color: 0x0000aa, transparent: true, opacity: Math.min(Math.sqrt(arrow.mag/maxLength),1)})
  }
}

updateField();

console.log( fieldF(0,0,0));


function fieldF(x,y,z) {
  let [p,q,r] = [0,0,0];
   
  for (let [x0,y0,z0] of protonCoords) {
    p += (x - x0) / Math.pow( ((x - x0)*(x - x0) + (y - y0)*(y - y0) + (z - z0)*(z - z0)), 1.5);
    q += (y - y0) / Math.pow( ((x - x0)*(x - x0) + (y - y0)*(y - y0) + (z - z0)*(z - z0)), 1.5);
    r += (z - z0) / Math.pow( ((x - x0)*(x - x0) + (y - y0)*(y - y0) + (z - z0)*(z - z0)), 1.5);
  }

  for (let [x0,y0,z0] of electronCoords) {
    p += -(x - x0) / Math.pow( ((x - x0)*(x - x0) + (y - y0)*(y - y0) + (z - z0)*(z - z0)), 1.5);
    q += -(y - y0) / Math.pow( ((x - x0)*(x - x0) + (y - y0)*(y - y0) + (z - z0)*(z - z0)), 1.5);
    r += -(z - z0) / Math.pow( ((x - x0)*(x - x0) + (y - y0)*(y - y0) + (z - z0)*(z - z0)), 1.5);
  }

  return [p,q,r];
   
}

{
  const element = document.querySelector("input#fieldVisible");
  element.oninput = () => {
    field.visible = element.checked;
    requestFrameIfNotRequested();
  }
}

let acidTrails = false;
{
  const element = document.querySelector("input#trailsVisible");
  element.oninput = () => {
    trails.visible = element.checked;
    acidTrails = element.checked;
    
    freeTrails(balls);
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




// Color based on scalar field

const balls = new THREE.Object3D();
const fieldMaterial = new THREE.MeshLambertMaterial( {color: 0x373765 } )
const trailMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, vertexColors: true } );
const trails = new THREE.LineSegments(new THREE.BufferGeometry(), trailMaterial );
const arrowGeometries = [], heightResolution = 150, vfScale = gridStep*5;
const arrowArgs = {radiusTop: vfScale/30, radiusBottom: vfScale/100, heightTop: vfScale/8};
let trailColors = [], trailPoints = [], colors = [];
const trailLength = 250; 
// scene.add(trails);

function resetTrailColors(trailLength = trailLength, N=data.nVec ) {
  trailColors = [];
   
  for (let j = 0; j < trailLength; j++) {
    for (let k = 1; k <= Math.pow(N, 3); k++) {
      trailColors.push(j / trailLength, j / trailLength, 1);
      // trailColors.push(j / trailLength, j / trailLength, 1 - j / trailLength);
      trailColors.push(
        (j + 1) / trailLength,
        (j + 1) / trailLength,
        // 1 - (j + 1) / trailLength
        1,
      );
    }
  }
  trails.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( trailColors, 3 ), )
}



const protonMaterial = new THREE.MeshLambertMaterial( { color: 0xff3333});
const electronMaterial = new THREE.MeshLambertMaterial( { color: 0x3333ff});



for (let [x,y,z] of protonCoords) {
  const point = new THREE.Mesh( new THREE.SphereGeometry(gridStep/4, 16,16), protonMaterial);
  point.position.set(x,y,z);
  scene.add(point);
  protons.push(point);
}



for (let [x,y,z] of electronCoords) {
  const point = new THREE.Mesh( new THREE.SphereGeometry(gridStep/8, 16,16), electronMaterial);
  point.position.set(x,y,z);
  scene.add(point);
  protons.push(point);
}









const raycaster = new THREE.Raycaster();

let mouseVector = new THREE.Vector2();


function onMouseMove( e ) {
    // normalized mouse coordinates
    if (selectNewPoint) {
      mouseVector.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouseVector.y = 1 - 2 * ( e.clientY / window.innerHeight );
    
      raycaster.setFromCamera( mouseVector, camera );

      const intersects = raycaster.intersectObjects( [...protons,...electrons ], true );

      if ( intersects.length > 0 ) {
        const intersect = intersects[0];
        // console.log(intersect.uv);
        point.position.x = intersect.point.x;
        point.position.y = intersect.point.y;
        point.position.z = intersect.point.z;

        const u = intersect.uv.x, v = intersect.uv.y;
        tangentVectors({u,v});
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
    myReq = requestAnimationFrame(animate);
    // frameBall.visible = true;
  }
},false);
window.addEventListener('keyup',(e) => {
  if (e.key === "Shift") {
    selectNewPoint = false;
    cancelAnimationFrame(myReq);
    frameRequested = false;
    // frameBall.visible = false;
  }
},false);




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

function animate(time) {
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

  if (faucet) {
    updateBalls(balls, fieldF, (time - last)*0.001 );
  }

  last = time;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

  }
  myReq = requestAnimationFrame(animate);


  renderer.render(scene, camera);

  if (debug) stats.end();
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



function render() {
    frameRequested = false;

    // for (let index = 0; index < axesText.length; index++) {
    //   const element = axesText[index];
    //   element.lookAt(camera.position);
    // }

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
  
    }

    controls.update();
    renderer.render(scene, camera);
}



// go
// requestAnimationFrame(animate);
requestFrameIfNotRequested();