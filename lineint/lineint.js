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

camera.position.z = gridMax*3;
camera.position.y = gridMax/2 ;
camera.position.x = gridMax*2;
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


const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );
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
    b: 2
  },
  swirl: {
    func: (t) => new THREE.Vector3((1+t/4)*Math.cos(4*pi*t),2*t - Math.sin(8*t)/2,0),
    a: 0,
    b: 1
  }
}

const zFunctions = {
  'wave': (x,y) => 1 + Math.sin((x + y)*2)/3,
  'paraboloid': (x,y) => x*x/2 + y * y/2
}

const data = {
  r: 'parabola',
  f: 'wave',
  tMode: 0 // interpolate between dy (-1), ds (0), and dx (1)
}

let tube;
function updateCurve() {
  const {a,b,func} = curves[data.r];
  const path = new ParametricCurve( 1 , func, a, b);
  const geometry = new THREE.TubeBufferGeometry( path, 500, gridStep/10, 8, false );
  if ( tube ) {
    tube.geometry.dispose();
    tube.geometry = geometry;
  } else {
    tube = new THREE.Mesh( geometry, material );
    graphWorld.add( tube );
    colorBufferVertices( tube, (x,y,z) => blueUpRedDown(1));
  }
}

let walls = [new THREE.Mesh( new THREE.BufferGeometry(), plusMaterial),new THREE.Mesh( new THREE.BufferGeometry(), minusMaterial)];

graphWorld.add(walls[0]);
graphWorld.add(walls[1]);


function updateWall() {
  updateCurve();
  const geometry = new THREE.ParametricBufferGeometry( 
    function(u,v,vec) {
      const {a,b,func} = curves[data.r];
      const t = a + u*(b - a);
      const {x,y} = func(t);
      const z = v*zFunctions[data.f](x,y);
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

  render();
}

updateWall();

// const wallGeometry = new THREE.ParametricBufferGeometry(  );

/*
{
  const points = []

  const a = -2, b = 2;
  const dx = (b - a) / 100;


  for (let i = 0; i < 100; i ++) {
    points.push(r1(a + i*dx));
    points.push(r1(a + i*dx + dx));
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
  graphWorld.add( new THREE.LineSegments( lineGeometry, redLineMaterial));
}
*/

gui.add(data,'tMode',-1.0,1.0).listen().onChange(updateWall);
gui.add(data,'r',Object.keys(curves)).listen().onChange(updateWall);
gui.add(data,'f',Object.keys(zFunctions)).listen().onChange(updateWall);

let last = 0;
function animateToDx() {
  if (last == 0) {
    requestAnimationFrame((time) => {last = time});
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

addColorBar(-1,1);

gui.domElement.style.zIndex = 2000;
// clearAllButPie();
// requestAnimationFrame(render);