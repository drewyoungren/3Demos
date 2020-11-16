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