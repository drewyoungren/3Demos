/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
// import {Stats} from 'https://unpkg.com/stats.js@0.17.0/build/stats.min.js';



// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import { GUI} from '../base/dat.gui.module.js';
import { colorBufferVertices, blueUpRedDown, addColorBar, marchingSegments, drawAxes, drawGrid, labelAxes, ArrowBufferGeometry, vMaxMin } from "../base/utils.js";

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
// controls.addEventListener('change',render);

// window.addEventListener('resize', render);

//axes

const lineMaterial = new THREE.LineBasicMaterial( { color: 0x551122, transparent: true, opacity: 0.8 } );

// Grid

let gridMeshes = drawGrid( {lineMaterial});
gridMeshes.renderDepth = -1;
scene.add(gridMeshes);

// Axes
const axesMaterial = new THREE.MeshLambertMaterial( {color: 0x320032} );
const axesHolder = drawAxes( {gridMax, gridStep, axesMaterial});
scene.add(axesHolder)

// Fonts
const [axesText, font] = labelAxes( { scene } );


const material = new THREE.MeshPhongMaterial({color: 0x121212,shininess: 60,side: THREE.FrontSide,vertexColors: false});
const materialColors = new THREE.MeshPhongMaterial({color: 0xffffff,shininess: 70,side: THREE.DoubleSide, vertexColors: true});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});

whiteLineMaterial.polygonOffset = true;
whiteLineMaterial.polygonOffsetFactor = 0.1;

const redLineMaterial = new THREE.LineBasicMaterial({color: 0xbb0000,linewidth: 14});


const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true } );
const minusMaterial = new THREE.MeshPhongMaterial({color: 0xff3232, shininess: 80, side: THREE.BackSide,vertexColors: false, transparent: true, opacity: 0.7});
const plusMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.7});



const surfaces = {
  graphs: {
    x: "u",
    y: "v", 
    z: "sin(3*u - v)*exp(-u^2/2 - v^2/2)/2",
    a: "-1",
    b: "1",
    c: "-1",
    d: "1",
  },
  revolutions: {
    x: "u", 
    y: "4/5 cos(u) sin(v)",
    z: "4/5 cos(u) cos(v)",
    a: "-pi/2",
    b: "pi/2",
    c: "0",
    d: "2*pi",
  },
  spheres: {
    x: "sin(u) cos(v)", 
    y: "sin(u) sin(v)",
    z: "cos(u)",
    a: "0.0001",
    b: "pi/2",
    c: "0",
    d: "2 pi",
  },
  customSurf: {
    x: "(1 + cos(u/2)*v/3)*cos(u)", 
    y: "(1 + cos(u/2)*v/3)*sin(u)",
    z: "(sin(u/2)*v/3)",
    a: "0",
    b: "2 pi",
    c: "-1",
    d: "1",
  },
  kiss: {
    x: "(cos(u) + 1.001)sin(v) / 2", 
    y: "(cos(u) + 1.001)cos(v) / 2",
    z: "u/2",
    a: "-pi/6",
    b: "pi",
    c: "0",
    d: "2 pi",
    material: new THREE.MeshStandardMaterial( {color: 0xffffff, roughness: 0.5, metalness: 0.7 } )
  },
  bugle: {
    x: "u < 0 ? (1 + cos(v)*2^(-9*pi/20)/8) : (u < 9*pi/2 ? (1 + cos(v)*2^((-9*pi/2 + u)/10)/8)*cos(u) : -1.4*(u - 9*pi/2))", 
    y: "u < 0 ? (u + cos(v)*2^(-9*pi/20)/8) : (u < 9*pi/2 ? (1 + cos(v)*2^((-9*pi/2 + u)/10)/8)*sin(u) : 1 + (2^((u - 9*pi/2)/10)/8 + (u - 9*pi/2)^2/2)*cos(v))", 
    z: "u < 0 ? (sin(v)*2^(-9*pi/20)/8) : (u < 9*pi/2 ? (sin(v)*2^((-9*pi/2 + u)/10)/8) + ( (u*4/(9*pi) - 1)*((u*4/(9*pi) - 1)^2-1)^2/3 ) : (2^((u - 9*pi/2)/10)/8 + (u - 9*pi/2)^2/2)*sin(v))", 
    a: "-1.3",
    b: "9*pi/2 + 1",
    c: "0",
    d: "2 pi",
    material: new THREE.MeshStandardMaterial( {color: 0xffffbb, roughness: 0.5, metalness: 0.7 } )
  },
}

const fields = {
  'source': {
    P: "x",
    Q: "y",
    R: "z"
  },
  'sink': {
    P: "0",
    Q: "0",
    R: "-z"
  },
  'swirl': {
    P: "-y",
    Q: "x",
    R: "x^2 - y^2"
  },
  'wacky': {
    P: "sin(x*y)",
    Q: "-atan(sin(3*z))",
    R: "x^2 - y^2 - z^3/2"
  },
  'rain': {
    P: "x/4",
    Q: "y/4",
    R: "-z/4"
  },
  'gravity': {
    P: "(x^2 + y^2 + z^2) > 0.2  ? -x/(x^2 + y^2 + z^2)^(3/2)  : 0",
    Q: "(x^2 + y^2 + z^2) > 0.2  ? -y/(x^2 + y^2 + z^2)^(3/2) : 0",
    R: "(x^2 + y^2 + z^2) > 0.2  ? -z/(x^2 + y^2 + z^2)^(3/2) : 0"
  },
  '2body': {
    P: "((x+1)^2 + (y+1)^2 + (z+1)^2) > 0.2 & ((x-1)^2 + (y-1)^2 + (z-1)^2) > 0.025 ? -1.15*(x+1)/((x+1)^2 + (y+1)^2 + (z+1)^2)^(3/2) - (x-1)/((x-1)^2 + (y-1)^2 + (z-1)^2)^(1.5) : 0",
    Q: "((x+1)^2 + (y+1)^2 + (z+1)^2) > 0.2 & ((x-1)^2 + (y-1)^2 + (z-1)^2) > 0.025 ? -1.15*(y+1)/((x+1)^2 + (y+1)^2 + (z+1)^2)^(3/2) - (y-1)/((x-1)^2 + (y-1)^2 + (z-1)^2)^(1.5): 0",
    R: "((x+1)^2 + (y+1)^2 + (z+1)^2) > 0.2 & ((x-1)^2 + (y-1)^2 + (z-1)^2) > 0.025 ? -1.15*(z+1)/((x+1)^2 + (y+1)^2 + (z+1)^2)^(3/2) - (z-1)/((x-1)^2 + (y-1)^2 + (z-1)^2)^(1.5): 0",
  },
  'magnet': {
    P: "(((x-1/2)^2 + y^2 + z^2) > 0.01) & (((x+1/2)^2 + y^2 + z^2) > 0.025) ? (x-1/2) / ((x-1/2)^2 + y^2 + z^2)^(0.6) - (x + 1/2) / ((x + 1/2)^2 + y^2 + z^2)^(0.6): 0",
    Q: "(((x-1/2)^2 + y^2 + z^2) > 0.01) & (((x+1/2)^2 + y^2 + z^2) > 0.025) ? (y) / ((x-1/2)^2 + y^2 + z^2)^(0.6) - (y) / ((x + 1/2)^2 + y^2 + z^2)^(0.6) : 0",
    R: "(((x-1/2)^2 + y^2 + z^2) > 0.01) & (((x+1/2)^2 + y^2 + z^2) > 0.025) ? (z) / ((x-1/2)^2 + y^2 + z^2)^(0.6) - (z) / ((x + 1/2)^2 + y^2 + z^2)^(0.6) : 0",
  },
  // 'magnet2': {
  //   P: "(((x-1/2)^2 + y^2 + z^2) > 0.025) & (((x+1/2)^2 + y^2 + z^2) > 0.025) ? ((x - 0.5)*(y^2 + z^2 + (x + 0.5)^2)^1.5 - (x + 0.5)*(y^2 + z^2 + (x - 0.5)^2)^1.5)*(y^2 + z^2 + (x - 0.5)^2)^(-0.5)*(y^2 + z^2 + (x + 0.5)^2)^(-0.5): 0",
  //   Q: "(((x-1/2)^2 + y^2 + z^2) > 0.025) & (((x+1/2)^2 + y^2 + z^2) > 0.025) ? y*(-(y^2 + z^2 + (x - 0.5)^2)^1.5 + (y^2 + z^2 + (x + 0.5)^2)^1.5)*(y^2 + z^2 + (x - 0.5)^2)^(-0.5)*(y^2 + z^2 + (x + 0.5)^2)^(-0.5) : 0",
  //   R: "(((x-1/2)^2 + y^2 + z^2) > 0.025) & (((x+1/2)^2 + y^2 + z^2) > 0.025) ? z*(-(y^2 + z^2 + (x - 0.5)^2)^1.5 + (y^2 + z^2 + (x + 0.5)^2)^1.5)*(y^2 + z^2 + (x - 0.5)^2)^(-0.5)*(y^2 + z^2 + (x + 0.5)^2)^(-0.5) : 0",
  // },
  // 'test': {
  //   P: "x^2",
  //   Q: "1/2",
  //   R: "0",
  // },
}

// Add bodies to the "physical" fields.

{
  const gravityMesh = new THREE.Object3D();
  const sph = new THREE.SphereBufferGeometry(.22, 16, 16 );
  let mesh = new THREE.Mesh(sph, new THREE.MeshLambertMaterial({color: 0xdddd33}));
  mesh.position.set(1,1,1);
  gravityMesh.add(mesh);
  mesh = new THREE.Mesh(sph, new THREE.MeshLambertMaterial({color: 0xddaa33}));
  mesh.position.set(-1,-1,-1);
  gravityMesh.add(mesh);
  mesh = new THREE.Mesh(sph, new THREE.MeshLambertMaterial({color: 0xddddbc}));
  mesh.visible = false;
  scene.add(mesh)
  fields['gravity'].body = mesh;
  gravityMesh.visible = false;
  fields["2body"].body = gravityMesh;
  scene.add(gravityMesh);

  mesh = new THREE.Mesh(new THREE.CylinderGeometry( .1, .1, 1.4), new THREE.MeshLambertMaterial({color: 0xff8888}));
  mesh.rotation.z = Math.PI/2;
  fields.magnet.body = mesh;
  mesh.visible = false;
  scene.add(mesh);

  // scene.add(mesh);
}


let fieldChoice = 'rain';

for (let c of "PQR") {
  const form = document.querySelector(`input#custom${c}`);
  form.value = fields[fieldChoice][c];
}

const rData = {
  a: math.parse("-1").compile(),
  b: math.parse("1").compile(),
  c: math.parse("-1").compile(),
  d: math.parse("1").compile(),
  x: math.parse("u").compile(),
  y: math.parse("v").compile(),
  z: math.parse("u^3 - u").compile(),
  P: math.parse(fields[fieldChoice].P).compile(),
  Q: math.parse(fields[fieldChoice].Q).compile(),
  R: math.parse(fields[fieldChoice].R).compile(),
  E: math.parse("x^2 + y^2").compile(),
}

const data = {
  S: 'graphs',
  nX: 30,
  rNum: 10,
  cNum: 10,
  shards: 0,
  nVec: 5,
}

const urlParams = new URLSearchParams(location.search)
// console.log(urlParams.keys() ? true : false);
let debug = false;
if (urlParams.keys()) {
  urlParams.forEach((val, key) => {
    const element = document.querySelector(`input#custom${key.toUpperCase()}`);
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
    }
    // const [s,c] = key.split("camera");
    // if (!s) {
    //   camera.position[c.toLowerCase()] = parseFloat(val);
    // }
    
  });
}

function makeQueryStringObject() {
  let query = {};
  Object.keys(rData).forEach( (key) => {
    const element = document.querySelector(`#custom${key.toUpperCase()}`);
    if (element) {
      query[key] = element.value;
    }
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

document.querySelectorAll(".setting-thing>input").forEach( (element) => {
  element.oninput = () => {
    data[element.name] = parseInt(element.value);
    updateSurface();
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


{
  const element = document.querySelector("input#frameBallVisible");
  element.oninput = () => {
    frameBall.visible = element.checked;
  }
}

let acidTrails = false;
{
  const element = document.querySelector("input#trailsVisible");
  element.oninput = () => {
    trails.visible = element.checked;
    acidTrails = element.checked;
    freeBalls(trails);
  }
}

{
  const element = document.querySelector("input#surfaceVisible");
  element.oninput = () => {
    surfaceMesh.visible = element.checked;
  }
}


let surfaceMesh;
function updateSurface() {
  const {a,b,c,d,x,y,z} = rData;
  const A = a.evaluate(), B = b.evaluate();
  const geometry = new THREE.ParametricBufferGeometry( (u,v,vec) => {
    const U = A + (B - A)*u;
    const params = {
      u: U,
      v: (1 - v)*c.evaluate( {u: U} ) + v*d.evaluate({u: U}),
    };
    vec.set(x.evaluate( params ), y.evaluate( params ), z.evaluate( params ) );
  }, data.nX, data.nX);
  const meshGeometry = meshLines(rData, data.rNum, data.cNum, data.nX);
  let material = plusMaterial;
  if (surfaces[data.S].material) {
    material = surfaces[data.S].material;
  }
  if (surfaceMesh) {
    for (let i = 0; i < surfaceMesh.children.length; i++) {
      const mesh = surfaceMesh.children[i];
      mesh.geometry.dispose()
      mesh.geometry = i < 2 ? geometry : meshGeometry;
      if (i < 1) {
        mesh.material = material;
      }

      if (i === 0) {
        if (colorFunc) {
          mesh.material = materialColors;
          let [vMax, vMin] = vMaxMin(mesh, (x,y,z) => rData.E.evaluate({x,y,z}));
          colorBufferVertices( mesh, (x,y,z) => {
            const value = rData.E.evaluate({x,y,z});
            return blueUpRedDown( 2 * (value - vMin) / (vMax - vMin) - 1 );
          });
          const colorBar = document.querySelector(".colorBar");
          if (colorBar) document.body.removeChild(colorBar);
          addColorBar(vMin, vMax);
        }
      }
      if (i === 1) {
        mesh.visible = ! colorFunc;
      }
    }
  } else {
    surfaceMesh = new THREE.Object3D();
    const backMesh = new THREE.Mesh( geometry, minusMaterial );
    const frontMesh = new THREE.Mesh( geometry, material );
    if (colorFunc) {
      frontMesh.material = materialColors;
      backMesh.visible = false;
      let [vMax, vMin] = vMaxMin(frontMesh, (x,y,z) => rData.E.evaluate({x,y,z}));
      colorBufferVertices( frontMesh, (x,y,z) => {
        const value = rData.E.evaluate({x,y,z});
        return blueUpRedDown( 2 * (value - vMin) / (vMax - vMin) - 1 );
      });
      addColorBar(vMin, vMax);
    }
    // mesh.add(new THREE.Mesh( geometry, wireMaterial ))
    surfaceMesh.add( frontMesh );
    surfaceMesh.add( backMesh );
    surfaceMesh.add( new THREE.LineSegments( meshGeometry, whiteLineMaterial));
  // mesh.visible = false;
    scene.add(surfaceMesh);
  }
  tangentVectors();
  updateShards(data.shards);
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

let cMin, dMax; // make these globals as useful for tangents.

function meshLines( rData, rNum=10, cNum=10 , nX=30) {
  const {a,b,c,d,x,y,z} = rData;
  const N = lcm(lcm(rNum,cNum),nX);
  const A = a.evaluate(), B = b.evaluate();
  const du = (B - A)/rNum;
  const dx = (B - A)/lcm(nX,cNum);
  const points = [];
  for (let u=A; u <= B; u += du ) {
    const C = c.evaluate( {u: u} ), D = d.evaluate( {u: u} );
    const dy = (D - C)/lcm(nX,rNum);
    const params = {u: u, v: C};
    points.push(new THREE.Vector3(x.evaluate( params ), y.evaluate( params ), z.evaluate( params )))
    for (let v=C + dy; v < D; v += dy) {
      params.v = v;
      points.push(new THREE.Vector3(x.evaluate( params ), y.evaluate( params ), z.evaluate( params )))
      points.push(new THREE.Vector3(x.evaluate( params ), y.evaluate( params ), z.evaluate( params )))
    }
    params.v = D;
    points.push(new THREE.Vector3(x.evaluate( params ), y.evaluate( params ), z.evaluate( params )))
  }
  
  // v-Meshes
  const params = {u: A};
  cMin = c.evaluate( params ), dMax = d.evaluate( params );
  for (let u=A+dx; u <= B; u += dx) {
    params.u = u;
    cMin = Math.min(cMin, c.evaluate( params ) );
    dMax = Math.max(dMax, d.evaluate( params ) );
  }

  for (let v = cMin; v <= dMax; v += (dMax - cMin)/cNum ) {
    const zs = marchingSegments( x => (c.evaluate( {u: x} ) - v)*(v - d.evaluate( {u: x} )), A, B, nX);
    params.v = v;
    let nextZero = zs.shift();
    for (let u=A; u <= B - dx + tol; u += dx) {
      params.u = u;
      if (c.evaluate( params ) <= v && v <= d.evaluate( params )) {
        points.push(new THREE.Vector3( x.evaluate( params ), y.evaluate( params ), z.evaluate( params )));
        if (nextZero < u + dx) {
          params.u = nextZero;
          points.push(new THREE.Vector3( x.evaluate( params ), y.evaluate( params ), z.evaluate( params )));
          nextZero = zs.shift();
        } else {
          params.u = u + dx;
          points.push(new THREE.Vector3( x.evaluate( params ), y.evaluate( params ), z.evaluate( params )));
        }
      } else {
          if (nextZero < u + dx) {
            params.u = nextZero;
            points.push(new THREE.Vector3( x.evaluate( params ), y.evaluate( params ), z.evaluate( params )));
            nextZero = zs.shift();
            params.u = u + dx;
            points.push(new THREE.Vector3( x.evaluate( params ), y.evaluate( params ), z.evaluate( params )));
          }
      }
    }
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  return geometry;
}

//
//
// UI for parametric surface
//
//

const surfs = ["graphs","revolutions","spheres","customSurf"];
for (let i = 0; i < surfs.length; i++) {
  const surf = surfs[i];
  const element = document.getElementById(surf);

  element.onclick = () => {
    data.S = surf;
    const sf = surfaces[surf];
    let el;
    for (let i = 0; i < "xyzabcd".length; i++) {;
      const c = "xyzabcd"[i];
      el = document.querySelector(`#custom${c.toUpperCase()}`);
      el.value = sf[c];
      rData[c] = math.parse(sf[c]).compile();
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
  const XYZ = "XYZABCD";
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
      updateSurface();
    };
  }
}

// Color based on scalar field

// Runge-Kutta method
function rk4(x, y, z, F, dt) {
  // Returns final (x1,y1,z1) array after time dt has passed.
  //        x,y,z: initial position
  //        F: r' function a(x,v,dt) (must be callable)
  //        dt: timestep
  const vec = new THREE.Vector3(),
        f1 = new THREE.Vector3(),
        f2 = new THREE.Vector3(),
        f3 = new THREE.Vector3(),
        f4 = new THREE.Vector3();
  
  f1.copy(F(x,y,z,vec).multiplyScalar(dt));
  f2.copy(F(x + f1.x/2, y + f1.y/2, z + f1.z/2,vec).multiplyScalar(dt));
  f3.copy(F(x + f2.x/2, y + f2.y/2, z + f2.z/2,vec).multiplyScalar(dt));
  f4.copy(F(x + f3.x, y + f3.y, z + f3.z,vec).multiplyScalar(dt));

  const x1 = x + (f1.x + 2*f2.x + 2*f3.x + f4.x)/6;
  const y1 = y + (f1.y + 2*f2.y + 2*f3.y + f4.y)/6;
  const z1 = z + (f1.z + 2*f2.z + 2*f3.z + f4.z)/6;

  return [x1, y1, z1];
}

// 1-norm
function norm1(v) {
  return Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
}

class BallMesh extends THREE.Mesh {
  constructor(geometry, material, lim=1) {
    super( geometry, material );

    this.start = new THREE.Vector3();
    this.lim = lim;
    this.trail = [];
    this.trailColors = [];
  }

  initiate(F, dt=0.01, maxSteps=500, tol = 1e-3 ) {
    // Flow this.position backward on F until 1) it moves less than tol*lim, 2) has 1-norm  > lim, or 3) maxSteps reached
    const counter = 0, vec = new THREE.Vector3(), vec1 = new THREE.Vector3();
    vec.copy(this.position);
    for (let i = 0; i< maxSteps; i++ ) {
      vec1.set(...rk4(vec.x,vec.y,vec.z,F,-dt));
      if (vec.clone().sub(vec1).length() < tol*this.lim) {
        return this.start.copy(vec1);
      } else {
        if (norm1(vec1) > this.lim) {
          return this.start.copy(vec);
        }
      }
      vec.copy(vec1);
    }
    return this.start.copy(vec1);
  }

}

const balls = new THREE.Object3D();
const trails = new THREE.Object3D();
const fieldMaterial = new THREE.MeshLambertMaterial( {color: 0x373765 } )
const trailMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, vertexColors: true } );
const arrowGeometries = [], heightResolution = 150, vfScale = gridStep*5;
const arrowArgs = {radiusTop: vfScale/30, radiusBottom: vfScale/100, heightTop: vfScale/8};
const trailColors = [0,0,1];

for( let j= 1; j <= 250; j++) {
  trailColors.push((j/250), (j/250), 1-j/250 );
  trailColors.push((j/250), (j/250), 1-j/250 );
}

for (let i = 1; i <= heightResolution; i++) {
  const geometry = new ArrowBufferGeometry( {
    radiusBottom: vfScale/100, 
    height: i/heightResolution*vfScale, 
    heightTop: Math.min(i/heightResolution*vfScale/3,vfScale/8) ,
    radiusTop: Math.min(vfScale/30, i/heightResolution*vfScale/6)
  });
  arrowGeometries.push(geometry)
}


function initBalls( balls, lim=1, N=data.nVec ) {
  const vec = new THREE.Vector3();
  let maxLength = 0;
  const arrowDefaultGeometry = new ArrowBufferGeometry( {...arrowArgs, height: gridStep/gridMax } );

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      for (let k = 0; k < N; k++) {
        const ball = new BallMesh( arrowDefaultGeometry , fieldMaterial , 1.2);
        const trail = new THREE.LineSegments( new THREE.BufferGeometry(), trailMaterial);
        ball.trailObject = trail;
        trails.add(trail);

        ball.position.set(((i + 1 / 2) * 2 / (N) - 1) * lim + .01 * Math.random(),
          ((j + 1 / 2) * 2 / (N) - 1) * lim + .01 * Math.random(),
          ((k + 1 / 2) * 2 / (N) - 1) * lim + .01 * Math.random());
        ball.initiate(fieldF);
        const posr = new THREE.Vector3();
        // posr.copy(ball.position);
        ball.trail.push(ball.position.clone());

        fieldF(ball.position.x,ball.position.y,ball.position.z, vec);
        const len = vec.length();
        maxLength = Math.max(maxLength, len);
        // ball.position.copy(ball.start)
        // fieldF(ball.position.x,ball.position.y,ball.position.z, vec);
        vec.add(ball.position);
        ball.lookAt(vec);
        // console.log(ball.start);
        balls.add(ball);
      }
    }
  }
  return maxLength; // 
}

function updateBalls(balls, F, dt, lim=1) {
  const vec = new THREE.Vector3();
  balls.children.forEach( (ball) => {
    const {x,y,z} = ball.position;
    const pos1 = new THREE.Vector3(); 
    pos1.set(...rk4(x,y,z,F,dt));

    if (acidTrails) {
      ball.trail.unshift(ball.trail.pop()) // move the last position, stored at the back, to the front. 
      ball.trail.unshift(pos1);            // move the current position in to complete the line segment
      
      if (ball.trail.length > 501) {       // truncate trail
        ball.trail.pop();
        ball.trail.pop();
      }

      const trail = ball.trailObject;
      if (trail && ball.trail.length > 1) {
        trail.geometry.setFromPoints(ball.trail);
        trail.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( trailColors.slice(0,ball.trail.length*3), 3 ) );
      }
    }
    if (norm1(pos1) > ball.lim || pos1.clone().sub(ball.position).length() < 1e-6 ) {
      ball.position.copy(ball.start);
      // ball.trail = [];
    } else {
      ball.position.copy(pos1);
    }

    if (acidTrails) {
      ball.trail.push(ball.position.clone());               // store the current position at the back
    }

    let height = F(ball.position.x,ball.position.y,ball.position.z,vec).length();
    height = Math.round(height / maxLength * heightResolution) - 1;
    
    ball.geometry = arrowGeometries[Math.max(0,Math.min(arrowGeometries.length -1, height))];
    
    ball.lookAt(vec.add(ball.position));
    // if Math.ball.position.x
  })
}

function freeBalls(balls) {
  for (let i = balls.children.length - 1; i >= 0 ; i--) {
    const element = balls.children[i];
    if (element.geometry.dispose) element.geometry.dispose();
    balls.remove(element);
  }
}

 
let fieldF = (x,y,z,vec) => {
  vec.set(rData.P.evaluate( {x,y,z} ), rData.Q.evaluate( {x,y,z} ), rData.R.evaluate( {x,y,z} ));
  return vec;
}

let maxLength = 2;
// let maxLength = initBalls(balls);
// updateBalls(balls, fieldF, 1);
scene.add(balls);
scene.add(trails);



//
//   UI for field
//


for (let [field,pqr] of Object.entries(fields)) {
  let element = document.querySelector(`#field-${field}`);
  if (! element) {
    element = document.createElement('span');
    const pipe = document.createElement('span');
    pipe.innerHTML = " | ";
    element.id = `field-${field}`;
    element.innerText = field;
    const row = document.querySelector("#field-row");
    row.appendChild(pipe);
    row.appendChild(element);
  }

  element.onclick = () => {
    fieldChoice = field;
    // const sf = fields[field];
    let el;
    for (let i = 0; i < "PQR".length; i++) {;
      const c = "PQR"[i];
      el = document.querySelector(`#custom${c.toUpperCase()}`);
      el.value = pqr[c];
      rData[c] = math.parse(pqr[c]).compile();
      // el.dispatchEvent(new Event('change'));
    }
    for (let [key, obj] of Object.entries(fields)) {
      if (obj.body) {
        obj.body.visible = key === field;
      }
    }
  }
}

const rhos = {
  'moment': "x^2 + y^2",
  'north' : "x^2 + y^2 + (z - 2)^2",
  'plane wave': "sin(x - 3y)"
}

for (let [rho,func] of Object.entries(rhos)) {
  let element = document.querySelector(`#density-${rho}`);
  if (! element) {
    element = document.createElement('span');
    const pipe = document.createElement('span');
    pipe.innerHTML = " | ";
    element.id = `density-${rho}`;
    element.innerText = rho;
    const row = document.querySelector("#density-row");
    row.appendChild(pipe);
    row.appendChild(element);
  }

  element.onclick = () => {
    // const sf = fields[field];
    let el;
    const c = "E";
    el = document.querySelector(`#custom${c.toUpperCase()}`);
    el.value = func;
    rData[c] = math.parse(func).compile();
    updateSurface();
    // el.dispatchEvent(new Event('change'));
  }
}


{
  const XYZ = "PQRE";
  for (let i = 0; i < XYZ.length; i++) {
    const ch = XYZ[i];
    const id = `custom${ch}`;
    const element = document.querySelector(`#${id}`);
    const form = document.querySelector(`#${id} + .form-warning`);

    element.onchange = () => {
      // const c = ch.toLowerCase();
      // console.log(element.value, "is the value of" + ch);
      try {
        // console.log("got here");
        const expr = math.parse(element.value).compile();
        rData[ch] = expr;
        form.innerText = '';
        if (ch === 'D') updateSurface();

      } catch (e) {
        console.error( e );
        form.innerText = ' ' + e.name;
        return;
      }
    };
  }
}

{  // play controls
  const play = document.querySelector("#field-play");
  play.onclick = () => {
    if (balls.children.length < 1) {
      console.log("play from the top");
      maxLength = initBalls(balls, 1.2*gridMax, data.nVec);
    }
    faucet = true;
  }

  const pause = document.querySelector("#field-pause");
  pause.onclick = () => {
    faucet = false;
    console.log("pause");
  }

  const stop = document.querySelector("#field-stop");
  stop.onclick = () => {
    faucet = false;
    freeBalls(balls);
    freeBalls(trails);
    console.log("stop");
  }

  const rew = document.querySelector("#field-rewind");
  rew.onclick = () => {
    // faucet = false;
    freeBalls(balls);
    freeBalls(trails);
    maxLength = initBalls(balls, 1.2*gridMax, data.nVec);
    // faucet = true;
    console.log("rewind");
  }
}


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
frameBall.visible = false;

scene.add(frameBall);

function ruFrame({u = 0.5, v = 0.5, dt = .001, du = 1, dv = 1 } = {} ) {
  const {a,b,c,d,x,y,z} = rData;
  const A = a.evaluate(), B = b.evaluate()
  const U = (1 - u)*A + u*B; 
  const C = c.evaluate( {u: U} ), D = d.evaluate( {u: U} );
  const V = (1 - v)*C + v*D; 
  // const du = (B - A) / data.rNum, dv = (dMax - cMin) / data.cNum;

  const p = new THREE.Vector3(x.evaluate({u: U, v: V}), y.evaluate({u: U, v: V}), z.evaluate({u: U, v: V})), 
    ruForward = new THREE.Vector3(x.evaluate({u: U + dt/2, v: V}), y.evaluate({u: U + dt/2, v: V}), z.evaluate({u: U + dt/2, v: V})), 
    ruBackward = new THREE.Vector3(x.evaluate({u: U - dt/2, v: V}), y.evaluate({u: U - dt/2, v: V}), z.evaluate({u: U - dt/2, v: V})), 
    rvForward = new THREE.Vector3(x.evaluate({u: U, v: V + dt/2}), y.evaluate({u: U, v: V + dt/2}), z.evaluate({u: U, v: V + dt/2})),
    rvBackward = new THREE.Vector3(x.evaluate({u: U, v: V - dt/2}), y.evaluate({u: U, v: V - dt/2}), z.evaluate({u: U, v: V - dt/2}));
  
    
    ruForward.sub(ruBackward).multiplyScalar((B - A) * du / dt);
    rvForward.sub(rvBackward).multiplyScalar((D - C) * dv / dt);
    // console.log("inside ruF",dMax,cMin,{p: p, u: ruForward, v: rvForward, n: ruForward.clone().cross(rvForward)}dv);
  // console.log(p,ru,rv);


  return {p: p, u: ruForward, v: rvForward, n: ruForward.clone().cross(rvForward)}
}

// Construct tangent vectors at a point u,v (both 0 to 1)
function tangentVectors( {u = 0.5, v = 0.5, dt = .001 } = {} ) {

  const dr = ruFrame( {u,v,dt,du: 1/data.rNum, dv: 1/data.cNum});

  point.position.copy(dr.p);


  const arrowParams = { radiusTop: gridStep / 10,  radiusBottom: gridStep / 20, heightTop: gridStep/7 }

  for (const [key, arrow] of Object.entries(arrows)) {
    const pos = dr.p.clone();
    arrow.position.copy(pos);
    if ( arrow.geometry ) arrow.geometry.dispose();
    arrow.geometry = new ArrowBufferGeometry( { ...arrowParams, height: dr[key].length() } )
    arrow.lookAt(pos.add(dr[key]));
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
    // frameBall.visible = true;
  }
},false);
window.addEventListener('keyup',(e) => {
  if (e.key === "Shift") {
    selectNewPoint = false;
    // frameBall.visible = false;
  }
},false);


// Add surface area pieces

const shards = new THREE.Object3D();
const shardMaterial = new THREE.MeshPhongMaterial( {color: 0xb4b4b4, shininess: 80, side: THREE.DoubleSide })
scene.add(shards);

function updateShards(N=0) {
  for (let index = shards.children.length - 1; index >= 0 ; index--) {
    const element = shards.children[index];
    element.geometry.dispose()
    shards.remove(element);
  }
  if (N < 1) return;
  const dt = 1/N;
  const vec = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const {p,u,v} = ruFrame( {u: i*dt, v: j*dt, du: dt, dv: dt } );
      const geometry = new THREE.ParametricBufferGeometry( (x,y,vec) => {
        vec.copy(p);
        vec.add(u.clone().multiplyScalar(x)).add(v.clone().multiplyScalar(y));
        vec.z += 0.001;
        // console.log(x, y, vec)
      },1,1);
      const shard = new THREE.Mesh( geometry, shardMaterial );
      shards.add(shard);
    }
  }
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

let myReq,last;

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

let debugLog;
if (debug) {
  debugLog = document.createElement('div');
  const timeLog = document.createElement('div');
  debugLog.classList.add('debugger');
  document.body.appendChild(debugLog);
  debugLog.appendChild(timeLog);
  timeLog.id = "timeLog";
  }

// start the flow
let faucet = !debug;

let colorFunc = false; // do density
const colorFuncCheckbox = document.querySelector("input#colorFunc");

colorFuncCheckbox.oninput = () => {
  colorFunc = colorFuncCheckbox.checked;
  if (!colorFunc) {
    const cBar = document.querySelector(".colorBar");
    if (cBar) {
      cBar.parentElement.removeChild(cBar);
    }
  }
  updateSurface();
}


document.getElementById("encodeURL").onclick = () => {
    // console.log();
    const qString = new URLSearchParams( makeQueryStringObject() );
    console.log(qString.toString());
    window.location.search = qString.toString();
};

document.querySelector("#cameraReset").onclick = () => {
  // console.log();
  controls.target.set(0,0,0);
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
updateSurface();

//initialize frame
{
  const uv = {u: 0.5, v: 0.5};
  point.position.set(rData.x.evaluate(uv));
  tangentVectors();
}

// go
requestAnimationFrame(animate);