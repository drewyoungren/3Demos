/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import { GUI} from '../base/dat.gui.module.js';
import { colorBufferVertices, blueUpRedDown, addColorBar, ArrowBufferGeometry } from "../base/utils.js";

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

camera.position.x = gridMax*2/2;
camera.position.y = -gridMax*3/2 ;
camera.position.z = gridMax*4.5/2;
camera.up.set(0,0,1);
camera.lookAt( 0,0,0 );

// Lights


// soft white light
scene.add( new THREE.AmbientLight( 0xA0A0A0 ) );
// let directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
// directionalLight.position.set(0,50,0)
// scene.add( directionalLight );
// directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
// directionalLight.position.set(0,-50,0)
// scene.add( directionalLight );
// directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
// directionalLight.position.set(50,0,50)
// scene.add( directionalLight );
// directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
// directionalLight.position.set(-50,0,-50)
// scene.add( directionalLight );
// directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
// directionalLight.position.set(50,0,-50)
// scene.add( directionalLight );
// directionalLight = new THREE.PointLight( 0xffffff, 0.5 );
// directionalLight.position.set(-50,0,50)
// scene.add( directionalLight );

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

controls.target.set( 0,0,0);
controls.addEventListener('change',render);

window.addEventListener('resize', render);

//axes

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
  if (coords === 'rect'){
    for (let j = -(10*gridMax); j <= (10*gridMax); j += gridStep) {
        points.push( new THREE.Vector3( j, -(10*gridMax), 0 ) );
        points.push( new THREE.Vector3( j, (10*gridMax), 0 ) );

        // let geometry = new THREE.BufferGeometry().setFromPoints( points );
        // gridMeshes.add(new THREE.Line(geometry,lineMaterial));
        
        // points = [];

        points.push( new THREE.Vector3( -(10*gridMax), j , 0) );
        points.push( new THREE.Vector3( (10*gridMax), j , 0) );

      }
    } else {
      for (let i = 0; i <= 10*gridMax; i += gridStep) {
        for (let j = 0; j < 100; j++) {
          points.push( new THREE.Vector3( i*Math.cos(2*pi*j/100), i*Math.sin(2*pi*j/100) , 0) );
          points.push( new THREE.Vector3( i*Math.cos(2*pi*(j + 1)/100), i*Math.sin(2*pi*(j + 1)/100) , 0) );
        }
      }
      for (let i = 0; i < 16 ; i++) {
        points.push( new THREE.Vector3( 10*gridMax*Math.cos(pi*i/8), 10*gridMax*Math.sin(pi*i/8) , 0) );
        points.push( new THREE.Vector3( 0, 0, 0 ) );
      }
    }
    geometry = new THREE.BufferGeometry().setFromPoints( points );
    gridMeshes.add(new THREE.LineSegments(geometry,lineMaterial));
}

scene.add(gridMeshes);
drawGrid();
// drawGrid('polar');

// Axes
const axesHolder = new THREE.Object3D();
scene.add(axesHolder);
const axesMaterial = new THREE.MeshLambertMaterial( {color: 0x320032} );
for (let index = 0; index < 3; index++) {
  let geometry = new THREE.CylinderGeometry( gridStep/16, gridStep/16, gridMax*3, 12 );
  let coneGeometry = new THREE.ConeGeometry( gridStep/10, gridStep/3, 12 );
  let cylinder = new THREE.Mesh( geometry, axesMaterial );
  // cylinder.position.y = gridMax*1.1/2;
  let cone = new THREE.Mesh(coneGeometry,axesMaterial);
  if (index === 0) {
    cylinder.rotation.x = Math.PI/2;
  } else { if (index === 2) {
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

      if (i === 0) { textHolder.position.x = tPos; } else {
        if (i === 1) {
          textHolder.position.y = tPos;
        } else { textHolder.position.z = tPos; }
      }
      scene.add(textHolder);
      textHolder.add(text);

      axesText.push(textHolder);
      // console.log("pushed: ",'xyz'[i])
      if (render) {render();}
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



const material = new THREE.MeshPhongMaterial({color: 0xdd22ff,shininess: 60,side: THREE.DoubleSide,vertexColors: false});
const materialRandom = new THREE.MeshPhongMaterial({color: 0x0000b4,shininess: 70,side: THREE.FrontSide,vertexColors: false});
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

const fields = {
  'wave': {
    func: (x,y,z,vec) => {vec.set(1,Math.sin(2*x)/2,-Math.sin(z)); return vec;},
    tex: " \,\vec i + \sin(x) \,\vec j + \sin(z) \,\vec k",
  },
  'constant': {
    func: (x,y,z,vec) => {vec.set(1/2,-1/2,0); return vec;},
    tex: " \,\vec i + 2 \,\vec j - \,\vec k",
  },
  'swirl': {
    func: (x,y,z,vec) => {vec.set(-y - x/10,x - y/10,0); return vec;},
    tex: " - y \,\vec i + x\,\vec j ",
  },
}

const data = {
  r: 'parabola',
  field: 'swirl',
  tMode: 0, // interpolate between dy (-1), ds (0), and dx (1)
  sMode: 0, // fill in wall from 0 to 1
}

// let fieldMesh;
// function updateField(T = 0, dt = 1/60) {
//   console.log(T,dt);
//   const points = [];
//   let start = new THREE.Vector3();
//   let vec = new THREE.Vector3();
//   let r1 = new THREE.Vector3();
//   let r2 = new THREE.Vector3(),u,v;
//   const F = fields[data.field].func;
//   let x,y,z,t;
//   for (let tx = -1; tx <= 1; tx += 1) {
//     for (let ty = -1; ty <= 1; ty += 1) {
//       for (let tz = -1; tz <= 1; tz += 1) {
//         x = tx, y = ty, t = tz;
//         for (let t = 0; t < T; t += dt) {
//           start.set(x,y,z)
//           vec = F(x,y,z,vec).multiplyScalar(dt/2);
//           // x == 1 && y == 1 ? console.log(start,vec) : true;
//           if (x == -1 && y == -1) {
//             console.log(start,vec)
//           }
//           start.set(x + vec.x, y + vec.y, z + vec.z);
//           vec = F(start.x,start.y,start.z,vec).multiplyScalar(dt)
//           if (x == -1 && y == -1) {
//             console.log(start,vec)
//           }
//           x += vec.x;
//           y += vec.y;
//           z += vec.z;
//         }
//         points.push(x,y,z);
//         vec = F(x,y,z,vec).multiplyScalar(0.1);
//         points.push(x + vec.x, y + vec.y, z + vec.z);
//         points.push(x + vec.x, y + vec.y, z + vec.z);
//         r1 = vec.clone();
//         r2.set(Math.random(),Math.random(),Math.random());
//         r2 = r2.cross(r1);
//         r1.normalize()
//         r2.normalize()
//         points.push(x + vec.x - Math.sqrt(3)/80*r1.x + 1/80*r2.x , y + vec.y - Math.sqrt(3)/80*r1.y + 1/80*r2.y , z + vec.z - Math.sqrt(3)/80*r1.z + 1/80*r2.z );
//         points.push(x + vec.x - Math.sqrt(3)/80*r1.x + 1/80*r2.x , y + vec.y - Math.sqrt(3)/80*r1.y + 1/80*r2.y , z + vec.z - Math.sqrt(3)/80*r1.z + 1/80*r2.z );
//         points.push(x + vec.x - Math.sqrt(3)/80*r1.x - 1/80*r2.x , y + vec.y - Math.sqrt(3)/80*r1.y - 1/80*r2.y , z + vec.z - Math.sqrt(3)/80*r1.z - 1/80*r2.z );
//         points.push(x + vec.x - Math.sqrt(3)/80*r1.x - 1/80*r2.x , y + vec.y - Math.sqrt(3)/80*r1.y - 1/80*r2.y , z + vec.z - Math.sqrt(3)/80*r1.z - 1/80*r2.z );
//         points.push(x + vec.x, y + vec.y, z + vec.z);
//       }
//     }
//   }

//   const geometry = new THREE.BufferGeometry()
//   geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ).onUpload( disposeArray ) );
//   if (fieldMesh) {
//     fieldMesh.geometry.dispose();
//     fieldMesh.geometry = geometry;
//   } else {
//     fieldMesh = new THREE.LineSegments( geometry, redLineMaterial );
//     scene.add(fieldMesh)
//   }
// }`

gui.add(data,'field',Object.keys(fields)).onChange(() => {
  // updateField();
  counter = 0;
  animate();
})

// updateField(1,0.5);

const quiver = new THREE.Object3D();
scene.add(quiver);
const arrowGeometries = [];
for (let i = 1; i < 51; i++) {
  arrowGeometries.push(new ArrowBufferGeometry( Math.min(1/30,i/100), Math.min(1/60,i/100), i/100, Math.min(1/10, i/100)));
}
const arrowGeometry = new ArrowBufferGeometry( 1/20, 1/50, 1/2, 1/12 );

for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    for (let k = -1; k <= 2; k += 1/2) {
    let vec = new THREE.Vector3();
    const pos = new THREE.Vector3();
    pos.set(Math.random()-1/2, Math.random()-1/2, Math.random()-1/2).normalize();
    pos.multiplyScalar(4*gridMax);
    fields[data.field].func(pos.x,pos.y,pos.z,vec);

    const arrow = new THREE.Mesh( arrowGeometries[Math.min(49, Math.round( vec.length()*20 )) ], material );
    // const arrowMesh = new THREE.LineSegments( new THREE.EdgesGeometry(arrow.geometry), whiteLineMaterial );
    
    arrow.position.set( pos.x, pos.y, pos.z );
    vec = fields[data.field].func( pos.x, pos.y, pos.z, vec );
    console.log( "setup", i, j, pos, vec)
    arrow.lookAt(pos.x + vec.x, pos.y + vec.y, pos.z + vec.z);
    // arrow.add(arrowMesh);
    quiver.add( arrow );
    }
  }
}

let counter = 0;

function animate() {
  const dt = 1/60;
  const F = fields[data.field].func;
  let vec = new THREE.Vector3();

  for (let index = 0; index < quiver.children.length; index++) {
    const arrow = quiver.children[index];

    const pos = arrow.position.clone();
    pos.add(F(pos.x,pos.y,pos.z,vec).multiplyScalar(dt));

    if (pos.length() > 4*gridMax) {
      pos.set(Math.random()-1/2, Math.random()-1/2, Math.random()-1/2).normalize();
      pos.multiplyScalar(4*gridMax);
    }

    arrow.position.set(pos.x , pos.y , pos.z );
    F(pos.x,pos.y,pos.z,vec);

    arrow.geometry = arrowGeometries[Math.min(49, Math.round( vec.length()*20 )) ];

    arrow.lookAt(pos.x + vec.x, pos.y + vec.y, pos.z + vec.z);

  }
  counter ++;
  render();
  if (true){
    requestAnimationFrame(animate);
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

animate();




// function showIntegral() {
//   const element = document.getElementById("formula-button");
//   const form = document.getElementById("t-formula");
//   if (element.classList.contains("active")) {
//     element.classList.remove("active");
//     form.style.display = 'none';
//   } else {
//     element.classList.add("active");
//     form.style.display = 'block';
//   }
// }

// document.getElementById("formula-button").onclick = showIntegral;


// gui.domElement.style.zIndex = 2000;
