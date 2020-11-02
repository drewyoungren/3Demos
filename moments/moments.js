/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import {color, GUI} from '../base/dat.gui.module.js';

/* Some constants */
let nX = 30; // resolution for surfaces
let xmin = 10; // domain of function
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

camera.position.z = 20;
camera.position.y = 15 ;
camera.position.x = 10;
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
controls.target.set( ymin/2 + ymax/2,0,xmin/2 + xmax/2 );



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
        gridMeshes.add(new THREE.Line(geometry,lineMaterial));
        
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
    gridMeshes.add(new THREE.Line(geometry,lineMaterial));
}

scene.add(gridMeshes);
drawGrid('polar');

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
        if (i ==1) {
          textHolder.position.x = tPos;
        } else { textHolder.position.y = tPos; }
      }
      scene.add(textHolder);
      textHolder.add(text);

      axesText.push(textHolder);
      // console.log("pushed: ",'xyz'[i])
      controls.addEventListener('change',() => {
        for (let index = 0; index < axesText.length; index++) {
          const element = axesText[index];
          element.lookAt(camera.position);
        }
      });
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


let functionData = {
  wave: {
    func: (x,y) =>  {return 1 - Math.sin(x*Math.PI/6) + Math.cos(y*y/33);},
    latex: "1-\\sin (\\pi x) + \\frac{\\cos(y^2)}{33}",
    vmax: 3,
    vmin: -3,
  },
  poly: {
    func: (x,y) =>  {return 13 - x*x/13 - y*y/13;},
    latex: "13 - \\frac{x^2 + y^2}{13}",
    vmax: 13,
    vmin: 0,
  },
  plane: {
    func: (x,y) =>  {return x/3-y/5 + 3;},
    latex: "\\fracx3 - \\fracy5 + 3",
    vmax: 10,
    vmin: -4
  },
  gaussian: {
    func: (x,y) =>  {return Math.exp(-x*x - y*y);},
    latex: "e^{-x^2 - y^2}",
    vmax: 1,
    vmin: 0,
  },
};


let regionData = {
  disk: {r: (u,v) => {
    return [13*u*Math.cos(2*Math.PI*v),13*u*Math.sin(2*Math.PI*v)];
  }},
  wedge: {r: (u,v) => {
    return [13*u*Math.cos(2*Math.PI/3*v),13*u*Math.sin(2*Math.PI/3*v)];
  }},
  cardioid: {r: (u,v) => {
    return [3*u*(3 - 2*Math.cos(2*Math.PI*v))*Math.cos(2*Math.PI*v),3*u*(3 - 2*Math.cos(2*Math.PI*v))*Math.sin(2*Math.PI*v)];
  }}
};

let data = {
  f: 'wave',
  N: 10,
  seg: 12,
  region: 'disk',
  nX:60
};

// let skel = new THREE.LineSegments(new THREE.EdgesGeometry( graphGeometry ),whiteLineMaterial);
// graphMesh.add(skel);

let gui = new GUI();

let graphWorld = new THREE.Object3D();
graphWorld.rotation.x += Math.PI/2;
graphWorld.rotation.y += Math.PI;
graphWorld.rotation.z += Math.PI/2;
scene.add(graphWorld);

let material = new THREE.MeshPhongMaterial({color: 0xb45555,shininess: 80,side: THREE.FrontSide,vertexColors: false});
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
}

const boxHolder = new THREE.Object3D();
graphWorld.add(boxHolder);
spinnerHolders.push(boxHolder);
let momentaArray = [];
let spinnerIndex = {};

const box = new THREE.Object3D();
boxHolder.add(box);
const boxBox = new THREE.Mesh( new THREE.BoxBufferGeometry(boxData.a,boxData.b,boxData.c),material);
box.add(boxBox);

function boxMoment(theta) {
  let {a,b,c} = boxData;
  return Math.pow(a,3)*b*c/12*Math.pow(Math.cos(theta),2) + Math.pow(b,3)*a*c + Math.pow(c,3)*b*a/3*Math.pow(Math.sin(theta),2);
}

spinnerIndex.box = momentaArray.length;
momentaArray.push(boxMoment(0));
boxBox.position.z += boxData.c/2;
gui.add(box.rotation,'y',0,Math.PI).name('extend').onChange((val) => {
  momentaArray[spinnerIndex.box] = boxMoment(val);
  console.log(boxMoment(val));
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

let last = 0; // last time updated

function render(time=0) {
    time *= 0.001;
    controls.update();
    let dt = time - last;
    last = time;




    for (let i = 0; i < spinnerHolders.length; i++) {
      const element = spinnerHolders[i];
      element.rotation.z += 32*Math.PI*dt/momentaArray[i]
    }

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
    
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

requestAnimationFrame(render);

