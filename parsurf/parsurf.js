/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';



// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import { GUI} from '../base/dat.gui.module.js';
import { colorBufferVertices, blueUpRedDown, addColorBar, marchingSegments } from "../base/utils.js";

// Make z the default up
THREE.Object3D.DefaultUp.set(0,0,1);

/* Some constants */
const nX = 30; // resolution for surfaces
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


const material = new THREE.MeshPhongMaterial({color: 0x121212,shininess: 60,side: THREE.FrontSide,vertexColors: false});
const materialRandom = new THREE.MeshPhongMaterial({color: 0x0000ff,shininess: 70,side: THREE.FrontSide,vertexColors: false});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});
const redLineMaterial = new THREE.LineBasicMaterial({color: 0xbb0000,linewidth: 14});


const wireMaterial = new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true } );
const minusMaterial = new THREE.MeshPhongMaterial({color: 0xff3232, shininess: 80, side: THREE.BackSide,vertexColors: false, transparent: true, opacity: 0.7});
const plusMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.7});



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



const surfaces = {
  graphs: {
    x: "u",
    y: "v", 
    z: "sin(3*u - v)*exp(-u^2/2 - v^2/2)/2",
    a: "-1",
    b: "1",
    c: "-1",
    d: "1",
    // tex: {
    //   x: "u",
    //   y: "v",
    //   z: " \\frac12\\sin(3u - v) e^{-\\frac{u^2 + v^2}{2}}",
    //   ru: "\\vec i + f_u\\,\\vec k",
    //   rv: "\\vec j + f_v\\,\\vec k",
    //   n: "-f_u\\,\\vec i -f_v\\,\\vec j + \\vec k",
    // },
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
    x: "u", 
    y: "v",
    z: "1/4 - u/4",
    a: "-1",
    b: "1",
    c: "-1",
    d: "1",
  },
}

const rData = {
  a: math.parse("-1").compile(),
  b: math.parse("1").compile(),
  c: math.parse("-1").compile(),
  d: math.parse("1").compile(),
  x: math.parse("u").compile(),
  y: math.parse("v").compile(),
  z: math.parse("1/4 - u/4").compile(),
}

const data = {
  r: 'customSurf',
  nX: 30,
  rNum: 10,
  cNum: 10,
}

const gui = new GUI();
gui.add(data,'nX',2,60,1).name("Segments").onChange(updateSurface);
gui.add(data,'rNum',2,60,1).name("u-Meshes").onChange(updateSurface);
gui.add(data,'cNum',2,60,1).name("v-Meshes").onChange(updateSurface);

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
  const meshGeometry = meshLines( data.rNum, data.cNum, data.nX);
  if (surfaceMesh) {
    for (let i = 0; i < surfaceMesh.children.length; i++) {
      const mesh = surfaceMesh.children[i];
      mesh.geometry.dispose()
      mesh.geometry = i < 2 ? geometry : meshGeometry;
    }
  } else {
    surfaceMesh = new THREE.Object3D();
    const frontMesh = new THREE.Mesh( geometry, plusMaterial );
    const backMesh = new THREE.Mesh( geometry, minusMaterial );
    // mesh.add(new THREE.Mesh( geometry, wireMaterial ))
    surfaceMesh.add( frontMesh );
    surfaceMesh.add( backMesh );
    surfaceMesh.add( new THREE.LineSegments( meshGeometry, whiteLineMaterial));
  // mesh.visible = false;
    scene.add(surfaceMesh);
  }
  render();
}

updateSurface();

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

function meshLines( rNum=10, cNum=10 , nX=30) {
  const {a,b,c,d,x,y,z} = rData;
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
  let cMin = c.evaluate( params ), dMax = d.evaluate( params );
  for (let u=A+dx; u <= B; u += dx) {
    params.u = u;
    cMin = Math.min(cMin, c.evaluate( params ) );
    dMax = Math.max(dMax, d.evaluate( params ) );
  }
  for (let v = cMin; v <= dMax; v += (dMax - cMin)/cNum ) {
    const zs = marchingSegments( x => (c.evaluate( {u: x} ) - v)*(v - d.evaluate( {u: x} )), A, B, nX);
    // console.log("v and zs ", v, zs);
    params.v = v;
    let nextZero = zs.shift();
    for (let u=A; u < B; u += dx) {
      params.u = u;
      if (c.evaluate( params ) <= v && v <= d.evaluate( params )) {
        points.push(new THREE.Vector3( x.evaluate( params ), y.evaluate( params ), z.evaluate( params )));
        if (nextZero < u + dx) {
          params.u = nextZero;
          points.push(new THREE.Vector3( x.evaluate( params ), y.evaluate( params ), z.evaluate( params )));
          nextZero = zs.shift();
        } else {
          params.u += dx;
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


const surfs = ["graphs","revolutions","spheres","customSurf"];
for (let i = 0; i < surfs.length; i++) {
  const surf = surfs[i];
  const element = document.getElementById(surf);

  element.onclick = () => {
    data.r = surf;
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
        elForm.style.display = 'block';
      } else {
        el.classList.remove("choices-selected");
        elForm.style.display = 'none';
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
      console.log(element.value, "is the value of" + ch);
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






function showIntegral() {
  const element = document.getElementById("formula-button");
  const form = document.getElementById("t-formula");
  if (element.classList.contains("active")) {
    element.classList.remove("active");
    form.style.display = 'none';
  } else {
    element.classList.add("active");
    form.style.display = 'block';
  }
}


console.log(marchingSegments( math.cos, 0, 8));
// document.getElementById("formula-button").onclick = showIntegral;

// gui.domElement.style.zIndex = 2000;
