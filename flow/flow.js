/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import { GUI} from '../base/dat.gui.module.js';
import  { ArrowBufferGeometry, drawAxes, drawGrid, labelAxes }  from "../base/utils.js";

const stats = new Stats();
stats.showPanel( 2 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

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
// controls.addEventListener('change',render);

// window.addEventListener('resize', render);

// Grid

let gridMeshes = drawGrid();
scene.add(gridMeshes);

// Axes
const axesMaterial = new THREE.MeshLambertMaterial( {color: 0x320032} );
const axesHolder = drawAxes( {gridMax, gridStep, axesMaterial});
scene.add(axesHolder)

// Fonts
const [axesText, font] = labelAxes( { scene } );

const disposeArray = () => {
  this.array = null;
}

let gui = new GUI();

const material = new THREE.MeshPhongMaterial({color: 0xdd22ff,shininess: 60,side: THREE.DoubleSide,vertexColors: false});
// const materialRandom = new THREE.MeshPhongMaterial({color: 0x0000b4,shininess: 70,side: THREE.FrontSide,vertexColors: false});
// const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});
// const redLineMaterial = new THREE.LineBasicMaterial({color: 0xbb0000,linewidth: 14});


// const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true } );
// const minusMaterial = new THREE.MeshPhongMaterial({color: 0xff3232, shininess: 80, side: THREE.BackSide, vertexColors: false, transparent: true, opacity: 0.4});
// const plusMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide, vertexColors: false, transparent: true, opacity: 0.4});






const fields = {
  'wave': {
    func: (x,y,z,vec) => {vec.set(1, Math.sin(2 * x) / 2, -Math.sin(4 * z) / 2); return vec;},
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

gui.add(data,'field',Object.keys(fields))

// updateField(1,0.5);

const quiver = new THREE.Object3D();
scene.add(quiver);
const arrowGeometries = [];

for (let i = 1; i < 51; i++) {
  arrowGeometries.push(new ArrowBufferGeometry( {radiusTop: Math.min(1/180,i/100), radiusBottom: Math.min(1/200,i/1000), height: i/100, heightTop: Math.min(1/100, i/100) } ));
}


for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    for (let k = -1; k <= 8; k += 1/2) {
    let vec = new THREE.Vector3();
    const pos = new THREE.Vector3();
    pos.set(Math.random()-1/2, Math.random()-1/2, Math.random()-1/2).normalize();
    pos.multiplyScalar(2*gridMax);
    fields[data.field].func(pos.x,pos.y,pos.z,vec);

    const arrow = new THREE.Mesh( arrowGeometries[Math.min(49, Math.round( vec.length()*20 )) ], material );
    // const arrowMesh = new THREE.LineSegments( new THREE.EdgesGeometry(arrow.geometry), whiteLineMaterial );
    
    arrow.position.set( pos.x, pos.y, pos.z );
    vec = fields[data.field].func( pos.x, pos.y, pos.z, vec );
    // console.log( "setup", i, j, pos, vec)
    arrow.lookAt(pos.x + vec.x, pos.y + vec.y, pos.z + vec.z);
    // arrow.add(arrowMesh);
    quiver.add( arrow );
    }
  }
}

let counter = 0, last;


function animate( time ) {
  let dt;
  if (last === undefined) {
    dt = 0;
  } else {
    dt = (time - last) * 0.001;
  }
  last = time;

  stats.begin()
  const F = fields[data.field].func;
  let vec = new THREE.Vector3();

  for (let index = 0; index < quiver.children.length; index++) {
    const arrow = quiver.children[index];

    const pos = arrow.position.clone();
    pos.add(F(pos.x,pos.y,pos.z,vec).multiplyScalar(dt));

    if (Math.max(Math.abs(pos.x), Math.abs(pos.y), Math.abs(pos.z)) > 2*gridMax) {
      pos.set(Math.random()-1/2, Math.random()-1/2, Math.random()-1/2).normalize();
      pos.multiplyScalar(2*gridMax);
    }

    arrow.position.set(pos.x , pos.y , pos.z );
    F(pos.x,pos.y,pos.z,vec);

    arrow.geometry = arrowGeometries[Math.min(49, Math.round( vec.length()*20 )) ];

    arrow.lookAt(pos.x + vec.x, pos.y + vec.y, pos.z + vec.z);

  }
  counter ++;
  render();

  stats.end()

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
    controls.update();

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
