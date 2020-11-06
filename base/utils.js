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