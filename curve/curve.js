/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
// import {Stats} from 'https://unpkg.com/stats.js@0.17.0/build/stats.min.js';



// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import { GUI} from '../base/dat.gui.module.js';
import { colorBufferVertices, blueUpRedDown, addColorBar, marchingSegments, drawAxes, drawGrid, labelAxes, ArrowBufferGeometry, vMaxMin, gaussLegendre, ParametricCurve } from "../base/utils.js";

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

let gridMeshes = drawGrid( {lineMaterial});
gridMeshes.renderDepth = -1;
scene.add(gridMeshes);

// Axes
const axesMaterial = new THREE.MeshLambertMaterial( {color: 0x320032} );
let axesHolder = drawAxes( {gridMax, gridStep, axesMaterial});
scene.add(axesHolder)

// Fonts
let [axesText, font] = labelAxes( { scene , render: requestFrameIfNotRequested } );

console.log(axesText, font, "Font");

function rescale(newGridMax=1) {
  const oldGridMax = gridMax;
  gridMax = newGridMax;
  gridStep = gridMax / 10;

  freeThreeObjects(gridMeshes);

  gridMeshes.copy(drawGrid( {lineMaterial, gridMax, gridStep}));

  freeThreeObjects(axesHolder)
  // Axes
  axesHolder.copy(drawAxes( {gridMax, gridStep, axesMaterial}));
  
  // Fonts

  // for (let index = axesText.length - 1; index >= 0 ; index--) {
  //   const textObject = axesText[index];
  //   freeThreeObjects(textObject);
  //   scene.remove(textObject);
  //   axesText.remove(textObject);
  // }
  console.log(axesText.length);
   
  [axesText, font] = labelAxes( { scene , gridMax, gridStep, render: requestFrameIfNotRequested, axesText } );

  camera.position.multiplyScalar(newGridMax / oldGridMax);
}


const material = new THREE.MeshPhongMaterial({color: 0x121212,shininess: 60,side: THREE.FrontSide,vertexColors: false});
const materialColors = new THREE.MeshPhongMaterial({color: 0xffffff,shininess: 70,side: THREE.DoubleSide, vertexColors: true});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});

whiteLineMaterial.polygonOffset = true;
whiteLineMaterial.polygonOffsetFactor = 0.1;

const redLineMaterial = new THREE.LineBasicMaterial({color: 0xbb0000,linewidth: 14});


const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true } );
const minusMaterial = new THREE.MeshPhongMaterial({color: 0xff3232, shininess: 80, side: THREE.BackSide,vertexColors: false, transparent: true, opacity: 0.7});
const plusMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.7});



const curves = {
  twist: {
    x: "t",
    y: "t^2", 
    z: "t^3",
    a: "-1",
    b: "1",
  },
  helix: {
    x: "cos(t)", 
    y: "sin(t)",
    z: "t/(2*pi)",
    a: "-2*pi",
    b: "2*pi",
  },
  wacky: {
    x: "cos(8*pi*t)", 
    y: "sin(3*pi*t)",
    z: "sin(7*pi*t)",
    a: "-1",
    b: "1",
  },
}


const rData = {
  a: math.parse("-1").compile(),
  b: math.parse("1").compile(),
  x: math.parse("t").compile(),
  y: math.parse("t^2").compile(),
  z: math.parse("t^3").compile(),
}

const data = {
  S: 'twist',
  nX: 30,
  rNum: 10,
  cNum: 10,
  shards: 0,
  nVec: 5,
  normalizeTNB: false,
  showPositionVector: false,
  currentUPosition: 0.5
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
        updateCurve();
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
        const val = parseFloat(element.value);
        data[element.name] = val;
        element.nextElementSibling.innerText =  '' ;
        // element.nextElementSibling.innerText =  val.toString() ;
        if (element.name === "currentUPosition") {
          // tangentVectors( {u: val });
          updateCurve()
        }
      }
    }
  });

document.querySelectorAll("#shards").forEach( (element) => {
  element.oninput = () => {
    data[element.name] = parseInt(element.value);
    updateCurve();

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


{
  const element = document.querySelector("input#tanFrameVisible");
  element.oninput = () => {
    tangentFrame.visible = element.checked;
    requestFrameIfNotRequested();
  }
}

// data.currentUPosition = 0.5;
{
  const element = document.querySelector("input#normalizeTNB");
  element.oninput = () => {
    data.normalizeTNB = element.checked;
    
    tangentVectors({u: data.currentUPosition});
    requestFrameIfNotRequested();

  }
}

{
  const element = document.querySelector("input#showPositionVector");
  element.oninput = () => {
    data.showPositionVector = element.checked;
    
    tangentVectors({u: data.currentUPosition});
    requestFrameIfNotRequested();

  }
}

{
  const element = document.querySelector("input#tubeVisible");
  element.oninput = () => {
    tube.visible = element.checked;
    requestFrameIfNotRequested();
  }
}






let tube;
function updateCurve() {
  const {a,b,x,y,z} = rData;
  const A = a.evaluate(), B = b.evaluate();
  const r = ((t) => new THREE.Vector3(x.evaluate({t: t}), y.evaluate({t: t}), z.evaluate({t: t})));
  console.log(a.evaluate(),r(.5));

  let path = new ParametricCurve( 1 , r, A, B);
  let geometry = new THREE.TubeBufferGeometry( path, 500, gridStep/10, 8, false );
  if ( tube ) {
    tube.geometry.dispose();
    tube.geometry = geometry;
  } else {
    tube = new THREE.Mesh( geometry, plusMaterial );
    scene.add( tube );
    // colorBufferVertices( tube, (x,y,z) => blueUpRedDown(1));
  }

  tangentVectors({ u: data.currentUPosition });
  // if (document.querySelector("input[type=checkbox]#curl").checked) {drawCurl();}

  // updateShards(data.shards);
  if (!frameRequested) render();
   
}

// Exercises
// 

function simpleMathString(s) {return math.simplify(math.parse(s)).toTex()}


//
//
// UI for parametric curve
//
//

const curveKeys = Object.keys(curves);
for (let i = 0; i < curveKeys.length; i++) {
  const curve = curveKeys[i];
  const element = document.getElementById(curve);

  element.onclick = () => {
    data.S = curve;
    const sf = curves[curve];
    let el;
    for (let i = 0; i < "xyzab".length; i++) {;
      const c = "xyzab"[i];
      el = document.querySelector(`#custom${c.toUpperCase()}`);
      el.value = sf[c];
      rData[c] = math.parse(sf[c]).compile();
      // el.dispatchEvent(new Event('change'));
    }
    updateCurve();
    for (let j = 0; j < curveKeys.length; j++) {
      const el = document.getElementById(curveKeys[j]);
      const elForm = document.querySelector(`.surface-choices-item#${curveKeys[j]}-formula`)
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
  const XYZ = "XYZAB";
  for (let i = 0; i < XYZ.length; i++) {
    const ch = XYZ[i];
    const id = `custom${ch}`;
    const element = document.querySelector(`#${id}`);

    element.onchange = () => {
      const c = ch.toLowerCase();
      // console.log(element.value, "is the value of" + ch);
      const form = document.querySelector(`#${id} + .form-warning`);
      try {
        const expr = math.parse(element.value).compile();
        rData[c] = expr;
        form.innerText = '';
      } catch (e) {
        console.error( e );
        form.innerText = ' ' + e.name;
        return;
      }
      // console.log(expr.evaluate( {u: 2, v: 1} ));
      updateCurve();
    };
  }
}






// Select a point
const tangentFrame = new THREE.Object3D();
const arrows = {u: new THREE.Mesh(), v: new THREE.Mesh(), n: new THREE.Mesh(), r: new THREE.Mesh()};
const ruColors = {u: 0x992525, v: 0x252599, n: 0xb6b6b6, r: 0x121212};
for (let key of Object.keys(arrows)) {
  arrows[key].material = new THREE.MeshBasicMaterial( {color: ruColors[key] });
  tangentFrame.add(arrows[key])
}

const pointMaterial = new THREE.MeshLambertMaterial( { color: 0xffff33});
const point = new THREE.Mesh( new THREE.SphereGeometry(gridStep/8, 16,16),pointMaterial);

tangentFrame.add(point);
tangentFrame.visible = false;

scene.add(tangentFrame);

function tnbFrame({u = 0.5, dt = .001, du = 1, normalized = false } = {} ) {
  const {a,b,x,y,z} = rData;
  const A = a.evaluate(), B = b.evaluate()
  const U = (1 - u)*A + u*B; 
  // const du = (B - A) / data.rNum, dv = (dMax - cMin) / data.cNum;

  const p = new THREE.Vector3(x.evaluate({t: U}), y.evaluate({t: U}), z.evaluate({t: U})), 
  rForward = new THREE.Vector3(x.evaluate({t: U + dt/2}), y.evaluate({t: U + dt/2}), z.evaluate({t: U + dt/2})), 
  rBackward = new THREE.Vector3(x.evaluate({t: U - dt/2}), y.evaluate({t: U - dt/2}), z.evaluate({t: U - dt/2}));
  const acc = rForward.clone();
  acc.addScaledVector(p,-2);
  acc.add(rBackward);
  acc.multiplyScalar(4*du / dt**2)
  
    
    rForward.sub(rBackward).multiplyScalar(1 / dt);
    // console.log("inside ruF",dMax,cMin,{p: p, u: rForward, v: rvForward, n: rForward.clone().cross(rvForward)}dv);
  // console.log(p,ru,rv);

  if (normalized) {
    rForward.normalize();
    acc.addScaledVector(rForward, rForward.dot(acc)*(-1)).normalize()
  }


  return {p: p, u: rForward, v: acc, n: rForward.clone().cross(acc).normalize()}
}

// Construct tangent vectors at a point u,v (both 0 to 1)
function tangentVectors( {u = 0.5, dt = .001 } = {} ) {

  const dr = tnbFrame( {u, dt, du: 1, normalized: data.normalizeTNB});

  point.position.copy(dr.p);


  const arrowParams = { radiusTop: gridStep / 10,  radiusBottom: gridStep / 20, heightTop: gridStep/7 }

  for (const [key, arrow] of Object.entries(arrows)) {
    const pos = dr.p.clone();
    if ( arrow.geometry ) arrow.geometry.dispose();

    if (key === "r") {
      arrow.position.set(0,0,0);
      arrow.geometry = new ArrowBufferGeometry( { ...arrowParams, height: pos.length() } )
      arrow.lookAt(pos);
      arrow.visible = data.showPositionVector;
    } else{
      arrow.position.copy(pos);
      arrow.geometry = new ArrowBufferGeometry( { ...arrowParams, height: dr[key].length() } )
      arrow.lookAt(pos.add(dr[key]));
    }
    if (key ==="n") {
      arrow.visible = data.normalizeTNB;
    }
  }

}


function freeThreeObjects(objectHolder) {
  for (let i = objectHolder.children.length - 1; i >= 0 ; i--) {
    const element = objectHolder.children[i];
    if (element.geometry.dispose) element.geometry.dispose();
    objectHolder.remove(element);
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

      const intersects = raycaster.intersectObjects( [ tube ], true );

      if ( intersects.length > 0 ) {
        const intersect = intersects[0];
        // console.log(intersect.uv);
        point.position.x = intersect.point.x;
        point.position.y = intersect.point.y;
        point.position.z = intersect.point.z;

        const u = intersect.uv.x, v = intersect.uv.y;
        data.currentUPosition = u;
        document.querySelector("#currentUPosition").value = data.currentUPosition;
        tangentVectors({u: data.currentUPosition});
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
  }
},false);
window.addEventListener('keyup',(e) => {
  if (e.key === "Shift") {
    selectNewPoint = false;
    cancelAnimationFrame(myReq);
    frameRequested = false;
  }
},false);


// Add surface area pieces

const shards = new THREE.Object3D();
const shardMaterial = new THREE.MeshPhongMaterial( {color: 0xb4b4b4, shininess: 80, side: THREE.DoubleSide })
scene.add(shards);

function updateShards(N=0) {
  // for (let index = shards.children.length - 1; index >= 0 ; index--) {
  //   const element = shards.children[index];
  //   element.geometry.dispose()
  //   shards.remove(element);
  // }
  // if (N < 1) return;
  // const dt = 1/N;
  // const vec = new THREE.Vector3();
  // for (let i = 0; i < N; i++) {
  //   for (let j = 0; j < N; j++) {
  //     const {p,u,v} = tnbFrame( {u: i*dt, v: j*dt, du: dt, dv: dt } );
  //     const geometry = new THREE.ParametricBufferGeometry( (x,y,vec) => {
  //       vec.copy(p);
  //       vec.add(u.clone().multiplyScalar(x)).add(v.clone().multiplyScalar(y));
  //       vec.z += 0.001;
  //       // console.log(x, y, vec)
  //     },1,1);
  //     const shard = new THREE.Mesh( geometry, shardMaterial );
  //     shards.add(shard);
  //   }
  // }
}

// updateShards(22);
// console.log(shards.children)


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
processURLSearch()

updateCurve();

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
{
  const uv = {t: 0.5, v: 0.5};
  point.position.set(rData.x.evaluate(uv),rData.y.evaluate(uv),rData.z.evaluate(uv));
  tangentVectors( {u: data.currentUPosition });
}


requestFrameIfNotRequested();