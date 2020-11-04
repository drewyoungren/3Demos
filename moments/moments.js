/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import {color, GUI} from '../base/dat.gui.module.js';
import { colorBufferVertices, blueUpRedDown } from "../base/utils.js";

/* Some constants */
let nX = 30; // resolution for surfaces
let xmin = -5; // domain of function
let xmax = 4;
let ymin = -1;
let ymax = 3;
let gridMax = Math.max(...[xmin,xmax,ymin,ymax].map(Math.abs));
let gridStep = 1;



const scene = new THREE.Scene();
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({antialias: true, alpha : true,canvas: canvas});

scene.background = new THREE.Color( 0xddddef );

const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);

camera.position.z = gridMax*1.5;
camera.position.y = gridMax/2 ;
camera.position.x = gridMax/5;
camera.lookAt( 0,0,0 );

// Lights


// soft white light
scene.add( new THREE.AmbientLight( 0x404040 ) );
scene.add( new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 ) );

//something to make shiny things shine
let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
light.position.set(0,50,0);
scene.add(light);
light = new THREE.PointLight(0xFFFFFF, 1, 1000);
light.position.set(50,-10,50);
scene.add(light);

// controls 

const controls = new OrbitControls (camera, renderer.domElement);
controls.autoRotate = false;
controls.target.set( 0,0,0 );
controls.addEventListener('change',() => {renderer.render(scene, camera);});


// window.addEventListener('resize', render);

//axes

const ii = new THREE.Vector3( 0, 0, 1 );
const jj = new THREE.Vector3( 1, 0, 0 );
const kk = new THREE.Vector3( 0, 1, 0 );
const axesArray = [ii,jj,kk];

const lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.8 } );

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

        let geometry = new THREE.BufferGeometry().setFromPoints( points );
        gridMeshes.add(new THREE.LineSegments(geometry,lineMaterial));
        
        points = [];
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
      size: 0.5,
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
        if (i == 1) {
          textHolder.position.x = tPos;
        } else { textHolder.position.y = tPos; }
      }
      scene.add(textHolder);
      textHolder.add(text);

      axesText.push(textHolder);
      // console.log("pushed: ",'xyz'[i])
    }
    controls.addEventListener('change',() => {
      for (let index = 0; index < axesText.length; index++) {
        const element = axesText[index];
        element.lookAt(camera.position);
      }
    });
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

// let skel = new THREE.LineSegments(new THREE.EdgesGeometry( graphGeometry ),whiteLineMaterial);
// graphMesh.add(skel);

let gui = new GUI();

let graphWorld = new THREE.Object3D();
graphWorld.rotation.x += Math.PI/2;
graphWorld.rotation.y += Math.PI;
graphWorld.rotation.z += Math.PI/2;
scene.add(graphWorld);

let material = new THREE.MeshPhongMaterial({color: 0xffffff,shininess: 80,side: THREE.FrontSide,vertexColors: true});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});


// graph of function over region.

// For color gradient


let lut = new Lut();
lut.setColorMap("cooltowarm");

let spinnerHolders = [];

// A box, sides a,b,c, with bottom face centered at origin.

let boxData = {
  a: 1.5,
  b: 1.5,
  c: 4
};

const boxHolder = new THREE.Object3D();
graphWorld.add(boxHolder);
spinnerHolders.push(boxHolder);
let momentaArray = [];
let spinnerIndex = {};

// tilting box

const box = new THREE.Object3D();
boxHolder.add(box);
const boxBox = new THREE.Mesh( new THREE.BoxBufferGeometry(boxData.a,boxData.b,boxData.c),material);
const zDistColor = (u,v,w) => blueUpRedDown(Math.sqrt( Math.pow(u,2) + Math.pow(v,2) ) / 5);
// box.rotation.y = 0;
box.add(boxBox);

function boxMoment(theta) {
  let {a,b,c} = boxData;
  return Math.pow(a,3)*b*c/12*Math.pow(Math.cos(theta),2) + Math.pow(b,3)*a*c + Math.pow(c,3)*b*a/3*Math.pow(Math.sin(theta),2);
}

spinnerIndex.box = momentaArray.length;
momentaArray.push(boxMoment(0));
boxBox.position.z += boxData.c/2; 

// sphere
const earthFrame = new THREE.Object3D();
graphWorld.add(earthFrame);
spinnerHolders.push(earthFrame);
spinnerIndex.earth = spinnerHolders.length - 1;
momentaArray.push(3/10*4/3*Math.PI*Math.pow(2,4));

// instantiate a loader
const textureLoader = new THREE.TextureLoader();

let earthMaterial = new THREE.MeshPhongMaterial( { color: 0x1212ff, side: THREE.FrontSide , shininess: 80});
const earth = new THREE.Mesh( new THREE.SphereGeometry(2, 15, 15), earthMaterial);
earthFrame.add(earth);
earth.position.z += 6;
earth.rotation.x += Math.PI/2;


// load a resource
textureLoader.load(
	// resource URL
	'../textures/land_ocean_ice_2048.jpg',

	// onLoad callback
	function ( texture ) {
		// texture courtesy https://visibleearth.nasa.gov/images/57730/the-blue-marble-land-surface-ocean-color-and-sea-ice
		earthMaterial = new THREE.MeshBasicMaterial( {
			map: texture
     } );
    earth.material = earthMaterial;
    renderer.render( scene, camera);
	},

	// onProgress callback currently not supported
	undefined,

	// onError callback
	function ( err ) {
		console.error( 'An error happened.' );
	}
);
// earthMaterial.map = THREE.ImageUtils.loadTexture('../textures/earth_8k.jpg');


let last = 0; // last time updated
let spinAway = false;
let alpha = 0; // angular acceleration
let omega = 0; // angular velocity




gui.add(box.rotation,'y',0,Math.PI).name('tilt').onChange((val) => {
  momentaArray[spinnerIndex.box] = boxMoment(val);
  colorBufferVertices(boxBox , zDistColor);
  if (! spinAway) {
    requestAnimationFrame(render);
  }
});
gui.add(earth.position,'x',0,4).name('orbit').onChange((val) => {
  momentaArray[spinnerIndex.earth] = 4*Math.PI*Math.pow(2,3)*(2*Math.pow(2,2) + 5*Math.pow(val,2))/15;
  // colorBufferVertices(earth , zDistColor);
  if (! spinAway) {
    requestAnimationFrame(render);
  }
});



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

// window.addEventListener('resize',() => resizeRendererToDisplaySize(renderer));

window.addEventListener('keydown', ( e ) => {
  if (e.key === 'Shift') {
    last = e.timeStamp*0.001;
    console.log("Keydown timestamp: ",last,omega);
    spinAway = true;
    requestAnimationFrame((time) => {
      last = time*0.001;
      requestAnimationFrame(render);
    });
  }
});

window.addEventListener('keyup', ( e ) => {
  if (e.key === 'Shift') {
    spinAway = false;
  }
});

window.addEventListener('mouseleave', () => {spinAway = false;});

function render(timestamp) {
    const time = timestamp * 0.001;
    // controls.update();
    let dt = time - last;
    let omegaNew;
    console.log("Render omega", omega);
    if (spinAway) {
      omegaNew = Math.min(1,omega + dt/2);
      console.log("Spinup",last,time,dt,omega,omegaNew);
    } else {
      omegaNew = Math.max(0,omega - dt/2);
      console.log("Spindown",last,time,dt,omega,omegaNew);
    }
    
    for (let i = 0; i < spinnerHolders.length; i++) {
      const element = spinnerHolders[i];
      element.rotation.z += 50*Math.PI*dt*((omegaNew + omega)/2)/momentaArray[i];
    }
    last = time;
    omega = omegaNew;

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
    
    renderer.render(scene, camera);
    if (omega > 0) {
      requestAnimationFrame(render);
    }
  }

requestAnimationFrame(render);
colorBufferVertices(boxBox , zDistColor);
