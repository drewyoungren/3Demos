/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.0/examples/jsm/controls/OrbitControls.js';
// import {Lut} from 'https://unpkg.com/three@0.121.0/examples/jsm/math/Lut.js';
import { GUI} from '../base/dat.gui.module.js';
import { colorBufferVertices, blueUpRedDown } from "../base/utils.js";

/* Some constants */
const nX = 30; // resolution for surfaces
const xmin = 10; // domain of function
const xmax = 4;
const ymin = -1;
const ymax = 3;
const gridMax = Math.max(...[xmin,xmax,ymin,ymax].map(Math.abs));
const gridStep = 1;



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
light.position.set(0,30,0);
scene.add(light);
light = new THREE.PointLight(0xFFFFFF, 1, 1000);
light.position.set(0,0,-10);
scene.add(light);
light = new THREE.PointLight(0xFFFFFF, 1, 1000);
light.position.set(30,30,5);
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


let gui = new GUI();

let graphWorld = new THREE.Object3D();
graphWorld.rotation.x += Math.PI/2;
graphWorld.rotation.y += Math.PI;
graphWorld.rotation.z += Math.PI/2;
scene.add(graphWorld);

let material = new THREE.MeshPhongMaterial({color: 0xffffff,shininess: 60,side: THREE.FrontSide,vertexColors: true});
let materialRandom = new THREE.MeshPhongMaterial({color: 0x0000ff,shininess: 70,side: THREE.FrontSide,vertexColors: false});
const whiteLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff,linewidth: 2});





function piePiece({innerRadius,thickness,thetaStart=0,angle=Math.PI/3,height=1,segments=12,startHeight=0}) {
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

let pieGeometry = piePiece( pieData );
const pieMaterial = new THREE.MeshPhongMaterial({color: 0x3232ff, shininess: 80, side: THREE.FrontSide,vertexColors: false});
const materialColor = new THREE.Color();
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
  pieMesh.geometry = piePiece( pieData );
  render();
}

// pieMaterial.setValues( {color: pieData.color });

//turn off by default
pieMesh.visible = false;
let pieFolder = gui.addFolder('Pie');
pieFolder.add(pieMesh,'visible').onChange(render).listen();
// pieFolder.add(pieData,"innerRadius",0,20.0).onChange(() => {setTimeout(updatePie,100);});
pieFolder.add(pieData,"innerRadius",0,20.0).onChange(updatePie);
pieFolder.add(pieData,"thickness",0,20.0).onChange(updatePie);
pieFolder.add(pieData,"thetaStart",0,2*Math.PI).onChange(updatePie);
pieFolder.add(pieData,"angle",0,2*Math.PI).onChange(updatePie);
pieFolder.add(pieData,"height",0,10).onChange(updatePie);
pieFolder.add(pieData,"segments",1,25,1).onChange(updatePie);
pieFolder.add(pieData,"texture",['flat','wire','glossy']).onChange((val) => {pieMesh.material = (val == 'flat') ? flatMaterial : pieMaterial; render();});
// pieFolder.addColor(pieData,"other").onChange((val) => {console.log(val); pieData.color.setRGB(val.r/256,val.g/256,val.b/256); pieMaterial.setValues( {color: pieData.color }); setTimeout(updatePie,100);});


// Sphere piece

function spherePiece({ rho = 1, 
  drho = 0.5, 
  theta = 0, 
  dtheta = Math.PI/4, 
  phi = Math.PI/6,
  dphi = Math.PI/6,
  segments = 4
}) {
    dphi = Math.min(dphi,Math.PI - phi);
    let t = theta;
    let dt = dtheta/segments;
    let p = phi, dp = dphi/segments, dr = drho/segments;

  
    let points = [];
    let normals = []; 
    let color = new THREE.Color();
    let colorLeft = new THREE.Color();
    let colors = [];
    color.setHSL(2/10, 0.9, 0.66);
    colorLeft.setHSL(0, 0.9, 0.66);
  
  
    
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        for ( let h = 0; h < segments; h++) {
          let corners = [];
      
          for (let k = 0; k < 2; k++) {
            for (let l = 0; l < 2; l++) {
              for (let m = 0; m < 2; m++) {
                corners.push([(rho + (h + k)*dr)*Math.sin(p + dphi - (j + m)*dp)*Math.cos(t + (l + i)*dt),
                  (rho + (h + k)*dr)*Math.sin(p + dphi - (j + m)*dp)*Math.sin(t + (l + i)*dt),
                  (rho + (h + k)*dr)*Math.cos(p + dphi - (j + m)*dp)]);
              }
            }
          }
          let inVec = [];
          for (let k = 4; k < 8; k++) {
            const vec = new THREE.Vector3(...corners[k]);
            vec.set(...corners[k]);
            vec.normalize();
            
            vec.multiplyScalar(-1);
            inVec.push([vec.x, vec.y, vec.z]);
          }

          const rightVec = new THREE.Vector3(-(inVec[0][1]),inVec[0][0],0);
          rightVec.normalize();

          const leftVec = new THREE.Vector3(inVec[2][1],-(inVec[2][0]),0);
          leftVec.normalize();

          const upVec = [];
          for (let k = 0; k <= 1; k++) {
            let [x,y,z] = inVec[1+2*k];
            [x,y,z] = [-x,-y,-z];
            let vec = new THREE.Vector3(0,0,1);
            if (z > 1e-10) {
              vec.set( -x, -y, (x*x + y*y) / z);
            } else { if (z < -1e-10) {
                vec.set( x, y, -(x*x + y*y) / z);
              }
            }
            vec.normalize();
            upVec.push([vec.x, vec.y, vec.z]);
          }

          const downVec = [];
          for (let k = 0; k <= 1; k++) {
            let [x,y,z] = inVec[2*k];
            [x,y,z] = [-x,-y,-z];
            let vec = new THREE.Vector3(0,0,-1);
            if (z > 1e-10) {
              vec.set( x, y, -(x*x + y*y) / z);
            } else { if (z < -1e-10) {
                vec.set( -x, -y, (x*x + y*y) / z);
              }
            }
            vec.normalize();
            downVec.push([vec.x, vec.y, vec.z]);
          }
          
          if ( h == 0 && rho > 0) {
          // inner
          points.push(...corners[0]);
          points.push(...corners[1]);
          points.push(...corners[2]);
          points.push(...corners[2]);
          points.push(...corners[1]);
          points.push(...corners[3]);
      
          normals.push(inVec[0][0],inVec[0][1],inVec[0][2]);
          normals.push(inVec[1][0],inVec[1][1],inVec[1][2]);
          normals.push(inVec[2][0],inVec[2][1],inVec[2][2]);
          normals.push(inVec[2][0],inVec[2][1],inVec[2][2]);
          normals.push(inVec[1][0],inVec[1][1],inVec[1][2]);
          normals.push(inVec[3][0],inVec[3][1],inVec[3][2]);
      
          colors.push(color.r,color.g,color.b);
          colors.push(color.r,color.g,color.b);
          colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
          colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
          colors.push(color.r,color.g,color.b);
          colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
          }
          // outer
          if (h == segments - 1 && (dp > 0) && (dt > 0)) {
          points.push(...corners[4]);
          points.push(...corners[6]);
          points.push(...corners[5]);
          points.push(...corners[6]);
          points.push(...corners[7]);
          points.push(...corners[5]);
      
          normals.push(-inVec[0][0],-inVec[0][1],-inVec[0][2]);
          normals.push(-inVec[2][0],-inVec[2][1],-inVec[2][2]);
          normals.push(-inVec[1][0],-inVec[1][1],-inVec[1][2]);
          normals.push(-inVec[2][0],-inVec[2][1],-inVec[2][2]);
          normals.push(-inVec[3][0],-inVec[3][1],-inVec[3][2]);
          normals.push(-inVec[1][0],-inVec[1][1],-inVec[1][2]);
      
          colors.push(color.r,color.g,color.b);
          colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
          colors.push(color.r,color.g,color.b);
          colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
          colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
          colors.push(color.r,color.g,color.b);}
      
          // right
          if ((i == 0) && (dphi > 0) && (drho > 0)) {
            points.push(...corners[0]);
            points.push(...corners[4]);
            points.push(...corners[5]);
            points.push(...corners[0]);
            points.push(...corners[5]);
            points.push(...corners[1]);
            
            for (let k = 0; k < 6; k++) {
              normals.push(rightVec.x,rightVec.y,rightVec.z);
              colors.push(color.r,color.g,color.b);
            }
          }
      
          // left
          if ((i == segments - 1) && (dphi > 0) && (drho > 0)){
            points.push(...corners[2]);
            points.push(...corners[3]);
            points.push(...corners[7]);
            points.push(...corners[2]);
            points.push(...corners[7]);
            points.push(...corners[6]);
            
            for (let k = 0; k < 6; k++) {
              normals.push(leftVec.x,leftVec.y,leftVec.z);
              colors.push(colorLeft.r,colorLeft.g,colorLeft.b);
            }
          }
      
      
          // top
          if ((j == segments - 1) && (dtheta > 0) && (drho > 0)) {
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
            
            normals.push(upVec[0][0],upVec[0][1],upVec[0][2]);
            normals.push(upVec[0][0],upVec[0][1],upVec[0][2]);
            normals.push(upVec[1][0],upVec[1][1],upVec[1][2]);
            normals.push(upVec[1][0],upVec[1][1],upVec[1][2]);
            normals.push(upVec[0][0],upVec[0][1],upVec[0][2]);
            normals.push(upVec[1][0],upVec[1][1],upVec[1][2]);
          }
          // bottom
          if ((j == 0) && (dtheta > 0) && (drho > 0)){
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
          
              normals.push(downVec[0][0],downVec[0][2],downVec[0][2]);
              normals.push(downVec[1][0],downVec[1][2],downVec[1][2]);
              normals.push(downVec[0][0],downVec[0][2],downVec[0][2]);
              normals.push(downVec[0][0],downVec[0][2],downVec[0][2]);
              normals.push(downVec[1][0],downVec[1][2],downVec[1][2]);
              normals.push(downVec[1][0],downVec[1][2],downVec[1][2]);
          }
        }
      }    
    }
  
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ).onUpload( disposeArray ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
    // geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).onUpload( disposeArray ) );
  
    return geometry;
  
  }

let sphereData = {
  rho: 9,
  drho: 5,
  theta: 0,
  dtheta: Math.PI/2,
  phi: Math.PI/4,
  dphi: Math.PI/2,
  segments: 2,
  f: "none"
};

const testSP = new THREE.Mesh( spherePiece( sphereData ), materialRandom);
const skeletonSP = new THREE.LineSegments( new THREE.EdgesGeometry( testSP.geometry), whiteLineMaterial );
testSP.add(skeletonSP);

const frameBall = new THREE.Mesh( new THREE.SphereBufferGeometry( sphereData.rho, 15, 15), wireMaterial);
testSP.add(frameBall);

function updateSpherical() {
  if (testSP.geometry) {
  testSP.geometry.dispose();
  }
  testSP.geometry = spherePiece( sphereData );
  if (skeletonSP.geometry) {
  skeletonSP.geometry.dispose();
  }
  skeletonSP.geometry = new THREE.EdgesGeometry( testSP.geometry, 30);

  switch(sphereData.f){
    case 'none':
      testSP.material = materialRandom;
      break;
    case 'x':
      colorBufferVertices( testSP, (x,y,z) => blueUpRedDown(x/10));
      testSP.material = material;
      break;
    case 'y':
      colorBufferVertices( testSP, (x,y,z) => blueUpRedDown(y/10));
      testSP.material = material;
      break;
    case 'z':
      colorBufferVertices( testSP, (x,y,z) => blueUpRedDown(z/10));
      testSP.material = material;
      break;
    case 'rho':
      colorBufferVertices( testSP, (x,y,z) => blueUpRedDown(Math.sqrt(x*x + y*y + z*z)/20));
      testSP.material = material;
      break;
    case 'theta':
      colorBufferVertices( testSP, (x,y,z) => blueUpRedDown((thetaCoordinate(x,y) )/Math.PI));
      testSP.material = material;
      break;

  }

  render();
}
graphWorld.add(testSP);

const sphereFolder = gui.addFolder("Spherical");
sphereFolder.add(sphereData,'rho',0,20).onChange(updateSpherical);
sphereFolder.add(sphereData,'drho',0,10).onChange(updateSpherical);
sphereFolder.add(sphereData,'theta',0,2*Math.PI).onChange(updateSpherical);
sphereFolder.add(sphereData,'dtheta',0,2*Math.PI).onChange(updateSpherical);
sphereFolder.add(sphereData,'phi',0,Math.PI).onChange(updateSpherical);
sphereFolder.add(sphereData,'dphi',0,Math.PI).onChange(updateSpherical);
sphereFolder.add(sphereData,'segments',1,20,1).onChange(updateSpherical);
sphereFolder.add(sphereData,'f',['none','x','y','z','rho','theta']).onChange(updateSpherical);



function thetaCoordinate(x,y,z,positive=true) {
  let t;
  if (x > 0) {
    t = Math.atan(y/x);
  } else {
    if (x < 0) {
      if (y >= 0) {
        t = Math.PI + Math.atan(y/x);
      } else {
        t = -Math.PI + Math.atan(y/x);
      }
    } else {
      if (y >= 0) {
        t = Math.PI/2;
      } else {
        t = -Math.PI/2;
      }
    }
  }
  return t;
  // if (t < 0 && positive) {
  //   return 2*Math.PI + t;
  // } else {
  //   return t ;
  // }
}

// Select a point. 

const pointMaterial = new THREE.MeshLambertMaterial( { color: 0xffff33});
const point = new THREE.Mesh( new THREE.SphereGeometry(gridStep/4, 10,10),pointMaterial);

frameBall.add(point);

point.position.set(5,5,-5);

const raycaster = new THREE.Raycaster();

let mouseVector = new THREE.Vector2();



function onMouseMove( e ) {
    // normalized mouse coordinates
    if (selectNewPoint) {
      mouseVector.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouseVector.y = 1 - 2 * ( e.clientY / window.innerHeight );
    
      raycaster.setFromCamera( mouseVector, camera );

      const intersects = raycaster.intersectObjects( [frameBall ], true );

      if ( intersects.length > 0 ) {
        let intersect = intersects[0];
        // console.log(intersect.point);
        point.position.x = intersect.point.z;
        point.position.y = intersect.point.x;
        point.position.z = intersect.point.y;
      }

      requestAnimationFrame(render);
    
    }
	}


let selectNewPoint = false;


window.addEventListener('mousemove',onMouseMove,false);
window.addEventListener('keydown',(e) => {
  if (e.key === "Shift") {
    selectNewPoint = true;
    frameBall.visible = true;
  }
},false);
window.addEventListener('keyup',(e) => {
  if (e.key === "Shift") {
    selectNewPoint = false;
    frameBall.visible = false;
  }
},false);



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


const rectElement = document.querySelector("#sphereRectangle");
rectElement.onclick = clearAllButPie;

// clearAllButPie();
// requestAnimationFrame(render);