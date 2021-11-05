/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import {color, GUI} from '../base/dat.gui.module.js';
import {ParametricGeometry} from '../base/utils.js';

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

let material = new THREE.MeshPhongMaterial({color: 0xffffff,shininess: 80,side: THREE.FrontSide,vertexColors: true});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});


// graph of function over region.

// For color gradient


let lut = new Lut();
lut.setColorMap("cooltowarm");

let graphHolder = new THREE.Object3D();
graphWorld.add(graphHolder);
let graphMaterial = new THREE.MeshPhongMaterial({ color: 0xaea3af, side: THREE.DoubleSide, shininess: 85,vertexColors: true });
let graphMesh,graphSkin;

function updateGraph() {
  let color;
  lut.setMin(functionData[data.f].vmin);
  lut.setMax(functionData[data.f].vmax);
  for (let i = graphHolder.children.length - 1; i >= 0; i--) {
    const element = graphHolder.children[i];
    element.geometry.dispose();
  }
  let graphGeometry = new ParametricGeometry((u,v,vec) => {
    let xy = regionData[data.region].r(u,v);
    let x = xy[0];
    let y = xy[1];
    vec.set(x,y,functionData[data.f].func(x,y));
  },data.nX,data.nX);

  let positions = graphGeometry.getAttribute('position');
  // console.log(positions.count, "positions", positions.getZ(234));
  let colors = [];
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i);
    color = lut.getColor(z);
    if ( color === undefined ) {

      console.log( 'Unable to determine color for value:', z );

    } else {
      colors.push(color.r,color.g,color.b);
    }
  }
  
  if (graphMesh == undefined) {
    graphMesh = new THREE.Mesh( graphGeometry, graphMaterial);
    graphSkin = new THREE.LineSegments(new THREE.WireframeGeometry( graphMesh.geometry ), lineMaterial );
    graphHolder.add(graphSkin);
    graphHolder.add(graphMesh);
  } else {
    graphMesh.geometry = graphGeometry;
    graphSkin.geometry = new THREE.WireframeGeometry( graphMesh.geometry );
  }
  graphGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ));

  render();
}

updateGraph();

let graphFolder = gui.addFolder("Graph");
graphFolder.add(graphMesh,'visible').name("Show graph").onChange(render).listen();
graphFolder.add(graphSkin,'visible').name("Show mesh").onChange(render).listen();
graphFolder.add(data,'f',Object.keys(functionData)).name("function").onChange(updatePieMan);
graphFolder.add(data,'region',Object.keys(regionData)).name("region").onChange(updatePieMan);





function piePiece(innerRadius,thickness,thetaStart=0,angle=Math.PI/3,height=1,segments=12) {
  let t = thetaStart;
  let dt = angle/segments;

  let points = [];
  let normals = []; 
  let color = new THREE.Color();
  let colorLeft = new THREE.Color();
  let colors = [];
  color.setHSL(height/10, 0.9, 0.66);
  colorLeft.setHSL(0, 0.9, 0.66);


  
  for (let i = 0; i < segments; i++) {
    let corners = [];


    for (let j = 0; j < 2; j++) {
      for (let k = 0; k < 2; k++) {
        for (let l = 0; l < 2; l++) {
          corners.push([(innerRadius + j*thickness)*Math.cos(thetaStart + i*dt + k*dt),
            (innerRadius + j*thickness)*Math.sin(thetaStart + i*dt + k*dt),
            l*height]);
        }
      }
    }
    let inVec0 = new THREE.Vector3(...corners[4]);
    inVec0.multiplyScalar(-1);
    inVec0.normalize();
    let inVec1 = new THREE.Vector3(...corners[6]);
    inVec1.multiplyScalar(-1);
    inVec1.normalize();
    
    if ( innerRadius > 0) {
    // inner
    points.push(...corners[0]);
    points.push(...corners[1]);
    points.push(...corners[2]);
    points.push(...corners[2]);
    points.push(...corners[1]);
    points.push(...corners[3]);

    normals.push(inVec0.x,inVec0.y,inVec0.z);
    normals.push(inVec0.x,inVec0.y,inVec0.z);
    normals.push(inVec1.x,inVec1.y,inVec1.z);
    normals.push(inVec1.x,inVec1.y,inVec1.z);
    normals.push(inVec0.x,inVec0.y,inVec0.z);
    normals.push(inVec1.x,inVec1.y,inVec1.z);

    colors.push(color.r,color.g,color.b);
    colors.push(color.r,color.g,color.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(color.r,color.g,color.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    }
    // outer
    points.push(...corners[4]);
    points.push(...corners[6]);
    points.push(...corners[5]);
    points.push(...corners[6]);
    points.push(...corners[7]);
    points.push(...corners[5]);

    normals.push(-inVec0.x,-inVec0.y,-inVec0.z);
    normals.push(-inVec1.x,-inVec1.y,-inVec1.z);
    normals.push(-inVec0.x,-inVec0.y,-inVec0.z);
    normals.push(-inVec1.x,-inVec1.y,-inVec1.z);
    normals.push(-inVec1.x,-inVec1.y,-inVec1.z);
    normals.push(-inVec0.x,-inVec0.y,-inVec0.z);
 
    colors.push(color.r,color.g,color.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(color.r,color.g,color.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(color.r,color.g,color.b);

    // right
    points.push(...corners[0]);
    points.push(...corners[5]);
    points.push(...corners[1]);
    points.push(...corners[0]);
    points.push(...corners[4]);
    points.push(...corners[5]);
    
    for (let j = 0; j < 6; j++) {
      normals.push(inVec0.y,-inVec0.x,inVec0.z);
      colors.push(color.r,color.g,color.b);
    }

    // left
    points.push(...corners[2]);
    points.push(...corners[3]);
    points.push(...corners[7]);
    points.push(...corners[2]);
    points.push(...corners[7]);
    points.push(...corners[6]);
    
    for (let j = 0; j < 6; j++) {
      normals.push(-inVec1.y,inVec1.x,inVec1.z);
      colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    }


    // top
    points.push(...(corners[1]));
    points.push(...corners[5]);
    points.push(...corners[3]);
    points.push(...corners[3]);
    points.push(...corners[5]);
    points.push(...corners[7]);

    colors.push(color.r,color.g,color.b);
    colors.push(color.r,color.g,color.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(color.r,color.g,color.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    
    for (let j = 0; j < 6; j++){
      normals.push(0,0,1);
    }
    
    // bottom
    points.push(...corners[0]);
    points.push(...corners[2]);
    points.push(...corners[4]);
    points.push(...corners[4]);
    points.push(...corners[2]);
    points.push(...corners[6]);
    
    colors.push(color.r,color.g,color.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(color.r,color.g,color.b);
    colors.push(color.r,color.g,color.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
    colors.push(colorLeft.r,colorLeft.g,colorLeft.b);


    for (let j = 0; j < 6; j++){
      normals.push(0,0,-1);
    }


  }    



  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ).onUpload( disposeArray ) );
  geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
  geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).onUpload( disposeArray ) );

  return geometry;

}

let pieData = {
  innerRadius: 7,
  thickness: 7,
  thetaStart: 0, 
  angle: Math.PI*2/3, 
  height: 1,
  segments: 12,
  color: new THREE.Color( 0x0030D7 ),
  other: null,
  texture: 'glossy'
};

let pieGeometry = piePiece(
  pieData.innerRadius,
  pieData.thickness,
  pieData.thetaStart,
  pieData.angle,
  pieData.height,
  pieData.segments
);
let pieMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide,vertexColors: false});
let materialColor = new THREE.Color();
materialColor.setRGB(0.8, 0.2, 0.5 );

let wireMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, wireframe: true } );
let flatMaterial = new THREE.MeshPhongMaterial( { color: materialColor, specular: 0x000000, flatShading: true, side: THREE.DoubleSide } );
let pieMaterialMinus = new THREE.MeshPhongMaterial({color: 0xff3232, shininess: 80, side: THREE.FrontSide,vertexColors: false});
let pieMaterialTheta = new THREE.MeshPhongMaterial({color: 0xffffff, shininess: 80, side: THREE.FrontSide,vertexColors: true});
let pieMesh = new THREE.Mesh(pieGeometry,pieMaterialMinus);
let pieSkel = new THREE.LineSegments( new THREE.EdgesGeometry( pieGeometry ), whiteLineMaterial);
// pieMesh.add(pieSkel);
graphWorld.add(pieMesh);

function updatePie() {
  pieMesh.geometry.dispose();
  pieMesh.geometry = piePiece(   
    pieData.innerRadius,
    pieData.thickness,
    pieData.thetaStart,
    pieData.angle,
    pieData.height,
    pieData.segments,
    pieData.material
  );
  render();
}

// pieMaterial.setValues( {color: pieData.color });

//turn off by default
pieMesh.visible = false;
let pieFolder = gui.addFolder('Pie');
pieFolder.add(pieMesh,'visible').onChange(render).listen();
pieFolder.add(pieData,"innerRadius",0,20.0).onChange(() => {setTimeout(updatePie,100);});
pieFolder.add(pieData,"thickness",0,20.0).onChange(() => {setTimeout(updatePie,100);});
pieFolder.add(pieData,"thetaStart",0,2*Math.PI).onChange(() => {setTimeout(updatePie,100);});
pieFolder.add(pieData,"angle",0,2*Math.PI).onChange(() => {setTimeout(updatePie,100);});
pieFolder.add(pieData,"height",0,10).onChange(() => {setTimeout(updatePie,100);});
pieFolder.add(pieData,"segments",1,25,1).onChange(() => {setTimeout(updatePie,100);});
pieFolder.add(pieData,"texture",['flat','wire','glossy']).onChange((val) => {pieMesh.material = (val == 'flat') ? flatMaterial : pieMaterial; render();});
// pieFolder.addColor(pieData,"other").onChange((val) => {console.log(val); pieData.color.setRGB(val.r/256,val.g/256,val.b/256); pieMaterial.setValues( {color: pieData.color }); setTimeout(updatePie,100);});


// piemann sums

let pieManData = {
  rSegments: 5,
  thetaSegments: 5,
  color: 'z'
};

function arg(x,y) {
  let t;
  if (x > 0) {
    t = Math.atan(y/x);
  } else {
    if (x < 0) {
      t = Math.PI + Math.atan(y/x);
    } else {
      if (y >= 0) {
        t = Math.PI/2;
      } else {
        t = 3*Math.PI/2;
      }
    }
  }
  if (t < 0) {
    return 2*Math.PI + t;
  } else {
    return t ;
  }
}

for (let i=0; i < 12; i++) {
  let r = Math.random() + 1;
  console.log(-1 % (2*Math.PI),arg(r*Math.cos(i/12*Math.PI*2),r*Math.sin(i/12*Math.PI*2)));
}

let pieManHolder = new THREE.Object3D();
pieManHolder.visible = false;
graphWorld.add(pieManHolder);

function updatePieMan() {
  updateGraph();
  for (let i = pieManHolder.children.length - 1; i >= 0; i--) {
    const element = pieManHolder.children[i];
    element.geometry.dispose();
    pieManHolder.remove(element);
  }

  for (let i = 0; i < pieManData.rSegments; i++) {
    for (let j = 0; j < pieManData.thetaSegments; j++) {
      const u = i/pieManData.rSegments;
      const du = 1/pieManData.rSegments;
      const v = j/pieManData.thetaSegments;
      const dv = 1/pieManData.thetaSegments;

      const xy = regionData[data.region].r(u,v);
      const x = xy[0];
      const y = xy[1];
      const xy1 = regionData[data.region].r(u+du,v);
      const x1 = xy1[0];
      const y1 = xy1[1];
      const xy2 = regionData[data.region].r(u,v + dv);
      const x2 = xy2[0];
      const y2 = xy2[1];
      const xy3 = regionData[data.region].r(u+du,v + dv);
      const x3 = xy3[0];
      const y3 = xy3[1];
      const z = functionData[data.f].func(...regionData[data.region].r(u + du/2,v + dv/2));

      const r = Math.sqrt(x*x + y*y);
      const dr = Math.sqrt((x1-x)*(x1-x) + (y1-y)*(y1-y));

      let t = arg(x1,y1);
      let dt = (arg(x3,y3) - t) % (2*Math.PI/2);

      let geometry = piePiece(r, dr, t, dt,Math.abs(z),data.seg);
      let mesh = new THREE.Mesh( geometry , pieMaterial);
        if (mesh == undefined){
          console.log("Empty!",r,dr,t,dt,z);
        }
      if (z < 0) { 
        mesh.position.z += z;
        mesh.material = pieMaterialMinus;
      }
      pieManHolder.add( mesh );
    }

  }
  render();
}

updatePieMan();
// updatePieMan();

const pieManFolder = gui.addFolder("Polar Riemann");
pieManFolder.add(pieManHolder,'visible').name("Show Reimann").onChange(render).listen();
pieManFolder.add(pieManData,'rSegments',1,30,1).onChange(updatePieMan);
pieManFolder.add(pieManData,'thetaSegments',1,30,1).onChange(updatePieMan);





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

function clearAllButPie() {
  graphMesh.visible = false;
  graphSkin.visible = false;
  pieManHolder.visible = false;
  pieMesh.visible = true;
  render();
}


const polarRectElement = document.querySelector("#polarRectangle");
polarRectElement.onclick = clearAllButPie;

// clearAllButPie();
// requestAnimationFrame(render);