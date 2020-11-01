/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
import {GUI} from '../base/dat.gui.module.js';

/* Some constants */
let nX = 30; // resolution for surfaces
let xmin = -2; // domain of function
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

camera.position.z = 1.2*(xmax - xmin) + xmax;
camera.position.y = 1 ;
camera.position.x = ymin - 0.2*(ymax - ymin);
camera.lookAt( 0,0,0 );

// Lights


// soft white light
scene.add( new THREE.AmbientLight( 0x404040 ) );
scene.add( new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 ) );

//something to make shiny things shine
let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
light.position.set(60,50,40);
scene.add(light);

// controls 

const controls = new OrbitControls (camera, renderer.domElement);
controls.autoRotate = false;
controls.target.set( ymin/2 + ymax/2,0,xmin/2 + xmax/2 );
controls.addEventListener('change',render);


window.addEventListener('resize', render);

//axes

const ii = new THREE.Vector3( 0, 0, 1 );
const jj = new THREE.Vector3( 1, 0, 0 );
const kk = new THREE.Vector3( 0, 1, 0 );
const axesArray = [ii,jj,kk];

const lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.8 } );

let gridMeshes = new THREE.Object3D();
function drawGrid() {
    for (let j = -(10*gridMax); j <= (10*gridMax); j += gridStep) {
        let points = [];
        points.push( new THREE.Vector3( j, 0, -(10*gridMax) ) );
        points.push( new THREE.Vector3( j, 0, (10*gridMax) ) );

        let geometry = new THREE.BufferGeometry().setFromPoints( points );
        gridMeshes.add(new THREE.Line(geometry,lineMaterial));
        
        points = [];
        points.push( new THREE.Vector3( -(10*gridMax), 0, j ) );
        points.push( new THREE.Vector3( (10*gridMax), 0, j ) );

        geometry = new THREE.BufferGeometry().setFromPoints( points );
        gridMeshes.add(new THREE.Line(geometry,lineMaterial));
    }
}

scene.add(gridMeshes);
drawGrid();

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
	'fonts/P052_Italic.json',
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
      }
    
    renderer.render(scene, camera);
    // requestAnimationFrame(render);
  }

render();


// requestAnimationFrame(render);