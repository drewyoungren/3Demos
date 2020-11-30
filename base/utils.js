/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';

const squaresTable = {
    "0000": [],
    "1111": [],
    "0111": [0,1,0,3],
    "1011": [1,0,1,2],
    "1101": [2,1,2,3],
    "1110": [3,0,3,2],
    "1000": [3,0,3,2],
    "0100": [],
    "0010": [],
    "0001": [],
    "1100": [3,0,2,1],
    "0110": [0,1,3,2],
    "0011": [0,3,1,2],
    "1001": [1,0,2,3],
    // "0101": [], // saddle point
    // "1010": []
};

// return line segments ([pairs of triples])
export function marchingSquares(f, level, xmin, xmax, ymin, ymax, zLevel = null, nX = 30, nY = 30) {
    const dx = (xmax - xmin) / nX, dy = (ymax - ymin) / nY;
    const z = zLevel == null ? level : zLevel;
    let points = new Float32Array();
    for (let x=xmin; x < xmax; x += dx) {
        for (let y = ymin; y < ymax; y += dy) {
            let cornerValues = [f(x,y),f(x+dx,y),f(x + dx,y + dy),f(x,y + dy)];
            let cornerComps = cornerValues.reduce((result,val) => {
                return result + ((val >= z) ? "1" : "0");
            },"");
            // for (let xy of [[x,y],[x+dx,y],[x + dx,y + dy],[x,y + dy]]) {
            //     corners.push((f(...xy) > level) ? 1 : 0);
            // }
        console.log(cornerValues,cornerComps);
        }
    }
}

// const getMethods = (obj) => {
//     let properties = new Set();
//     let currentObj = obj;
//     do {
//       Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
//     } while ((currentObj = Object.getPrototypeOf(currentObj)));
//     return [...properties.keys()].filter(item => typeof obj[item] === 'function');
//   };

/* color the vertices of a geometry via f(x,y,z) -> {r,g,b} */
export function colorBufferVertices( mesh , f ) {
    let colors = [];
    let vec = new THREE.Vector3();
    const points = mesh.geometry.attributes.position.array;
    console.log("=======");
    for (let i = 0; i < points.length; i += 3) {
        vec.set(points[i],points[i+1],points[i+2]);
        // vec.add(mesh.position);
        // console.log(vec);
        let {x,y,z} = mesh.localToWorld(vec);
        let {r,g,b} = f(z,x,y);
        // console.log([x,y,z]);
        colors.push(r,g,b);
    }
    mesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ));
    // const points = geometry.attributes.position.array;
}

export const blueUpRedDown = function(x,grayness=0.8) {
    // blue-red too traumatic
    let color = new THREE.Color();
    x = Math.max(-1,Math.min(1,x));
    if (x >= 0) {
        color.setRGB((1 - 0.3*x)*grayness, (1-0.9*x)*grayness, (1-x)*grayness);
    } else {
        color.setRGB((1+0.7*x)*grayness, (1 + x)*grayness , (1 + 0.7*x)*grayness);
    }
    return color;
};

export function addColorBar(vMin=-1, vMax=1) {
    const container = document.createElement("div");
    container.classList.add("colorBar");
    document.body.append(container);
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    canvas.width = container.clientWidth/2;
    canvas.height = container.clientHeight;
    canvas.style.height = "100%";
    console.log(container.clientHeight,canvas.height,canvas.width,canvas.style.height);

    const labels = document.createElement("div");
    labels.classList.add("colorBarTextContainer");
    container.appendChild(labels);

    const context = canvas.getContext('2d');
    // context.rect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // canvas.style.width = "1100px";

    // add linear gradient
    const grd = context.createLinearGradient( 0, canvas.height,0,0);

    const vRange = vMax - vMin;
    for (let x = 0; x <= 1; x += 0.125) {
        const hexString = blueUpRedDown(x*2 - 1).getHexString();
        grd.addColorStop(x, "#" + hexString);  
        const textLabel = document.createElement("div");
        labels.appendChild(textLabel);
        textLabel.classList.add("colorBarText");
        textLabel.innerHTML = '<span class="colorBarText" style="vertical-align:text-top">' + (vMin + x*vRange).toString() + '</span>';
        textLabel.style.bottom = (100 * x).toString() + "%";
        textLabel.style.left = "0px";
        // textLabel.style.textAlign = "right";
        // console.log(textLabel.style,canvas.height,textLabel.style.bottom);
    }
    // grd.addColorStop(0,"#3D003D");
    // grd.addColorStop(0.5,"#FFFFFF")
    // grd.addColorStop(1,"#8E1400");
    console.log(grd,canvas.width,canvas.height,canvas.clientHeight);
    // light blue
    // dark blue
    // grd.addColorStop(1, '#004CB3');
    context.fillStyle = grd;
    context.fillRect(0,0,canvas.width,canvas.height);
    // context.font = "20pt Monaco, monospace";
    // context.fillStyle = "black";
    // context.textAlign = "center";
    // context.fillText("Hello Lorem Ipsum How are you?", canvas.width/2, canvas.height/2);
    container.style.display = 'block';
}

export function thetaCoordinate(x,y,z,positive=true) {
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

export function marchingSegments(f, a=0, b=1, nX=100) {
  const dx= (b - a)/nX;
  const zeros = [];
  for (let i=0; i < nX; i++) {
    const x0 = a + i*dx, x1 = a + (i + 1)*dx;
    const y0 = f(x0), y1 = f(x1);
    if (y0*y1 < 0) {
      zeros.push(x0 - y0*(x1 - x0)/(y1 - y0));
    }
  }
  return zeros;
}

// Modified from https://github.com/mrdoob/three.js/blob/master/src/geometries/CylinderBufferGeometry.js
class ArrowBufferGeometry extends THREE.BufferGeometry {

	constructor( radiusTop = 1/16, radiusBottom = 1/20, height = 1, heightTop = 1/6, radialSegments = 8, heightSegments = 1, openEnded = false, heightIncludesHead = true ) {

		super();
		this.type = 'ArrowBufferGeometry';

		this.parameters = {
			radiusTop: radiusTop,
			radiusBottom: radiusBottom,
      height: height,
      heightTop: heightTop,
			radialSegments: radialSegments,
			heightSegments: heightSegments,
			openEnded: openEnded,
			heightIncludesHead: heightIncludesHead,
		};

    const scope = this;
    const thetaStart = 0, thetaLength = 2 * Math.PI;

		radialSegments = Math.floor( radialSegments );
		heightSegments = Math.floor( heightSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		let index = 0;
		const indexArray = [];
		const halfHeight = height / 2;
		const tubeHeight = heightIncludesHead ? height - heightTop : height;
		let groupStart = 0;

		// generate geometry

    generateTorso();
    generateCap( true );

		if ( openEnded === false ) {

			if ( radiusBottom > 0 ) generateCap( false );

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

		function generateTorso() {

			const normal = new THREE.Vector3();
			const vertex = new THREE.Vector3();

			let groupCount = 0;

			// this will be used to calculate the normal
			const slope = 0;

			// generate vertices, normals and uvs

			for ( let y = 0; y <= heightSegments; y ++ ) {

				const indexRow = [];

				const v = y / heightSegments;

				// calculate the radius of the current row

				const radius = radiusBottom;

				for ( let x = 0; x <= radialSegments; x ++ ) {

					const u = x / radialSegments;

					const theta = u * Math.PI * 2;

					const sinTheta = Math.sin( theta );
					const cosTheta = Math.cos( theta );

					// vertex

					vertex.x = radius * cosTheta;
					vertex.y = radius * sinTheta;
					vertex.z = v * tubeHeight;
					vertices.push( vertex.x, vertex.y, vertex.z );

					// normal

					normal.set( cosTheta, sinTheta, 0 ).normalize();
					normals.push( normal.x, normal.y, normal.z );

					// uv

					uvs.push( u, 1 - v );

					// save index of vertex in respective row

					indexRow.push( index ++ );

				}

				// now save vertices of the row in our index array

				indexArray.push( indexRow );

			}

			// generate indices

			for ( let x = 0; x < radialSegments; x ++ ) {

				for ( let y = 0; y < heightSegments; y ++ ) {

					// we use the index array to access the correct indices

					const a = indexArray[ y ][ x ];
					const b = indexArray[ y + 1 ][ x ];
					const c = indexArray[ y + 1 ][ x + 1 ];
					const d = indexArray[ y ][ x + 1 ];

					// faces

					indices.push( b, a, d );
					indices.push( c, b, d );

					// update group counter

					groupCount += 6;

				}

			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup( groupStart, groupCount, 0 );

			// calculate new start value for groups

			groupStart += groupCount;

		}

		function generateCap( top ) {

			// save the index of the first center vertex
			const centerIndexStart = index;

			const uv = new THREE.Vector2();
			const vertex = new THREE.Vector3();

			let groupCount = 0;

			const radius = ( top === true ) ? radiusTop : radiusBottom;
			const sign = ( top === true ) ? 1 : - 1;

			// first we generate the center vertex data of the cap.
			// because the geometry needs one set of uvs per face,
			// we must generate a center vertex per face/segment

			for ( let x = 1; x <= radialSegments; x ++ ) {

				// vertex

				vertices.push( 0, 0, top ? tubeHeight + heightTop : 0 );

				// normal

        if (top) {
          const theta = (x - 1/2) / radialSegments * Math.PI * 2;
          const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);
          const normal = new THREE.Vector3( cosTheta, sinTheta, radiusTop / heightTop );
          normal.normalize();
          normals.push( normal.x, normal.y, normal.z);
        } else {
          normals.push( 0, 0, sign );
        }
				// uv

				uvs.push( 0.5, 0.5 );

				// increase index

				index ++;

			}

			// save the index of the last center vertex
			const centerIndexEnd = index;

			// now we generate the surrounding vertices, normals and uvs

			for ( let x = 0; x <= radialSegments; x ++ ) {

				const u = x / radialSegments;
				const theta = u * thetaLength + thetaStart;

				const cosTheta = Math.cos( theta );
				const sinTheta = Math.sin( theta );

				// vertex

				vertex.x = radius * cosTheta;
				vertex.y = radius * sinTheta;
				vertex.z = top ? tubeHeight : 0;
				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal

        if (top) {
          const normal = new THREE.Vector3(cosTheta, sinTheta, radiusTop / heightTop );
          normal.normalize();
          normals.push( normal.x, normal.y, normal.z);
        } else {
          normals.push( 0, 0, sign );
        }
				// uv

				uv.x = ( cosTheta * 0.5 ) + 0.5;
				uv.y = ( sinTheta * 0.5 * sign ) + 0.5;
				uvs.push( uv.x, uv.y );

				// increase index

				index ++;

			}

			// generate indices

			for ( let x = 0; x < radialSegments; x ++ ) {

				const c = centerIndexStart + x;
				const i = centerIndexEnd + x;

				if ( top === true ) {

					// face top

					indices.push( i, i + 1, c );

				} else {

					// face bottom

					indices.push( i + 1, i, c );

				}

				groupCount += 3;

			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup( groupStart, groupCount, top === true ? 1 : 2 );

			// calculate new start value for groups

			groupStart += groupCount;

		}

	}

}

function drawGrid( { gridMeshes = new THREE.Object3D(), coords = 'rect', gridMax=1, gridStep=0.1, lineMaterial=new THREE.LineBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.8 } ) } = {} ) {
  let points = [];
  for (let index = gridMeshes.children.length - 1; index >= 0; index++) {
    const element = gridMeshes.children[index];
    element.geometry.dispose();
    gridMeshes.remove(element);
  }
  let geometry;
  if (coords === 'rect') {
    for (let j = -(10 * gridMax); j <= (10 * gridMax); j += gridStep) {
      points.push(new THREE.Vector3(j, -(10 * gridMax), 0));
      points.push(new THREE.Vector3(j, (10 * gridMax), 0));

      points.push(new THREE.Vector3(-(10 * gridMax), j, 0));
      points.push(new THREE.Vector3((10 * gridMax), j, 0));

    }
  } else { // polar grid
    for (let i = 0; i <= 10 * gridMax; i += gridStep) {
      for (let j = 0; j < 100; j++) {
        points.push(new THREE.Vector3(i * Math.cos(2 * pi * j / 100), i * Math.sin(2 * pi * j / 100), 0));
        points.push(new THREE.Vector3(i * Math.cos(2 * pi * (j + 1) / 100), i * Math.sin(2 * pi * (j + 1) / 100), 0));
      }
    }
    for (let i = 0; i < 16; i++) {
      points.push(new THREE.Vector3(10 * gridMax * Math.cos(pi * i / 8), 10 * gridMax * Math.sin(pi * i / 8), 0));
      points.push(new THREE.Vector3(0, 0, 0));
    }
  }
  geometry = new THREE.BufferGeometry().setFromPoints(points);
  gridMeshes.add(new THREE.LineSegments(geometry, lineMaterial));
  return gridMeshes;
}

function drawAxes( {  
    gridMax = 1,
    gridStep = 0.1,
    axesMaterial = new THREE.MeshLambertMaterial( { color: 0x000000  } )
  } = {}
) {
  console.log(" invoke stuff ", gridMax, gridStep);
  const axesHolder = new THREE.Object3D();
  const axisGeometry = new ArrowBufferGeometry( gridStep/9, gridStep/16, gridMax*3, gridStep/3 * 2 , 8, 8, false, false );
  for (let index = 0; index < 3; index++) {
    let arrow = new THREE.Mesh( axisGeometry, axesMaterial );
    if (index === 0) {
      arrow.lookAt(1,0,0);
      arrow.position.x = -gridMax*3/2;
    } else { if (index === 2) {
      arrow.lookAt(0,1,0);
      arrow.position.y = -gridMax*3/2;
    } else {
      arrow.position.z = -gridMax*3/2;
    }}
    axesHolder.add( arrow );
  }
  return axesHolder;
}

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

function labelAxes({
  scene,
  gridMax = 1,
  gridStep = 0.1,
  fontFile = '../fonts/P052_Italic.json',
  textMaterial = new THREE.MeshBasicMaterial( {color: 0x000000 } ),
  axesText = []
} = {}) {
  const loader = new THREE.FontLoader();
  const font = loader.load(
    // resource URL
    fontFile,
    function (font) {
      const xyz = ['x', 'y', 'z'];
      const tPos = 1.7 * gridMax;
      const textGeometryArguments = {
        font: font,
        size: gridStep * 2 / 3,
        height: 0,
        curveSegments: 12,
        bevelEnabled: false
      };
      const tickGeos = [];
      for (let i = 0; i <= 6; i++) {
        if (i !== 3) {
          const textGeo = new THREE.TextGeometry(((-3/2 + i/2)*gridMax).toString(), textGeometryArguments);
          tickGeos.push(textGeo);
          textGeo.computeBoundingBox();
        }
      }
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 6; j++) {
          const text = new THREE.Mesh( tickGeos[j], textMaterial );
          const textHolder = new THREE.Object3D();
          tickGeos[j].boundingBox.getCenter(text.position).multiplyScalar(-1);
          textHolder.position[xyz[i]] = (-3/2 + j/2 + (j > 2 ? 1/2 : 0))*gridMax ;
          textHolder.position[xyz[(i + 1) % 3 + (i === 0 ? 1 : 0)]] = - gridStep ;
          textHolder.add(text);
          axesText.push(textHolder);
          scene.add( textHolder );
        }
        const textGeo = new THREE.TextGeometry(xyz[i], textGeometryArguments);
        // const textMaterial = new THREE.MeshBasicMaterial({color: axesMaterial})
        const textHolder = new THREE.Object3D();
        const text = new THREE.Mesh( textGeo, textMaterial );
        // text.computeBoundingBox();

        textGeo.computeBoundingBox();
        textGeo.boundingBox.getCenter(text.position).multiplyScalar(-1);

        textHolder.position[xyz[i]] = tPos;

        textHolder.add(text);
        scene.add(textHolder);
        axesText.push(textHolder);
        // console.log("pushed: ",'xyz'[i])

      }
    },
    // onProgress callback
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function (err) {
      console.log('An error happened');
    }
  );
  return [axesText, font];
}

export { ArrowBufferGeometry, ParametricCurve, drawGrid, drawAxes, labelAxes };