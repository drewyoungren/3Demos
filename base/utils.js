/* jshint esversion: 6 */

import * as THREE from 'https://unpkg.com/three@0.121.0/build/three.module.js';


export function marchingSquares( {f, level, xmin, xmax, ymin, ymax, zLevel = null, nX = 30, nY = 30}) {
  
  const dx = (xmax - xmin) / nX, dy = (ymax - ymin) / nY;
  const z = zLevel === null ? level : zLevel;
  let points = [];
  // for (let i=0; i < nX; i++) {
  //   for (let j=0; j < nY; j++) {
  //       const x = xmin + i*dx, y = ymin + j*dy;
  for (let x = xmin; x < xmax - dx/3; x += dx) {
    for (let y = ymin; y < ymax - dy/3; y += dy) {
        const [a,b,c,d,e] = [f(x,y),f(x+dx,y),f(x + dx,y + dy),f(x,y + dy),f(x + dx/2, y + dy/2)];
        marchingSquare(a,b,c,d,e,level).forEach(element => {
          const [s,t] = element;
          points.push(new THREE.Vector3(x + s*dx, y + t*dy, z));
        });
        // for (let xy of [[x,y],[x+dx,y],[x + dx,y + dy],[x,y + dy]]) {
        //     corners.push((f(...xy) > level) ? 1 : 0);
        // }
    }
  }
  return points;
}


// binary value for val >= lev for a,b,c,d, starting from most significant bit (perhaps stupidly)
const squaresTable = {
  0b0000: [],
  0b1111: [],
  0b0111: [0,3],
  0b1011: [0,1],
  0b1101: [1,2],
  0b1110: [2,3],
  0b1000: [0,3],
  0b0100: [0,1],
  0b0010: [1,2],
  0b0001: [2,3],
  0b1100: [1,3],
  0b0110: [0,2],
  0b0011: [1,3],
  0b1001: [0,2],
  // "0101": [], // saddle point
  // "1010": []
};

const msPositions = [[0,0],[1,0],[1,1],[0,1]], msDirections = [[1,0],[0,1],[-1,0],[0,-1]];

// return line segments ([pairs of triples])
function marchingSquare(a,b,c,d,e,lev) {
  
  /*
    a,b,c,d values on corner of unit square {0,1}x{0,1} counter-clockwise from origin
    e is center value for resolving saddle points
    return line segment endpoints pairwise in normalized coordinates
  */


  const values = [a,b,c,d];

  let code = 0;

  const cs = [null, null, null, null];

  for (let index = 0; index < values.length; index++) {
    const m = values[index], M = values[(index + 1) % 4];
    
    if (m >= lev) { code += Math.pow(2,3 - index); }

    if (((m < lev) && (M >= lev)) || ((m >= lev) && (M < lev))) {
      cs[index] = (lev - m) / (M - m);
    }

  }

  const endPoints = [];
  let edges = [];

  if (squaresTable.hasOwnProperty(code)) {
    edges = squaresTable[code];
  } else {
    if (((a < lev) && (e < lev)) || (!(a < lev) && !(e < lev))) {
      edges = [0,1,2,3];
    } else {
      edges = [3,0,1,2];
    }
  }


  for (let index = 0; index < edges.length; index++) {
    const i = edges[index];
    const [p1, p2] = msPositions[i];
    const [v1, v2] = msDirections[i];
    const c = cs[i];
    
    endPoints.push([p1 + c*v1, p2 + c*v2]);
  }
  return endPoints;
}

const edgeTable = new Uint16Array([
  0x0,
  0x109,
  0x203,
  0x30a,
  0x406,
  0x50f,
  0x605,
  0x70c,
  0x80c,
  0x905,
  0xa0f,
  0xb06,
  0xc0a,
  0xd03,
  0xe09,
  0xf00,
  0x190,
  0x99,
  0x393,
  0x29a,
  0x596,
  0x49f,
  0x795,
  0x69c,
  0x99c,
  0x895,
  0xb9f,
  0xa96,
  0xd9a,
  0xc93,
  0xf99,
  0xe90,
  0x230,
  0x339,
  0x33,
  0x13a,
  0x636,
  0x73f,
  0x435,
  0x53c,
  0xa3c,
  0xb35,
  0x83f,
  0x936,
  0xe3a,
  0xf33,
  0xc39,
  0xd30,
  0x3a0,
  0x2a9,
  0x1a3,
  0xaa,
  0x7a6,
  0x6af,
  0x5a5,
  0x4ac,
  0xbac,
  0xaa5,
  0x9af,
  0x8a6,
  0xfaa,
  0xea3,
  0xda9,
  0xca0,
  0x460,
  0x569,
  0x663,
  0x76a,
  0x66,
  0x16f,
  0x265,
  0x36c,
  0xc6c,
  0xd65,
  0xe6f,
  0xf66,
  0x86a,
  0x963,
  0xa69,
  0xb60,
  0x5f0,
  0x4f9,
  0x7f3,
  0x6fa,
  0x1f6,
  0xff,
  0x3f5,
  0x2fc,
  0xdfc,
  0xcf5,
  0xfff,
  0xef6,
  0x9fa,
  0x8f3,
  0xbf9,
  0xaf0,
  0x650,
  0x759,
  0x453,
  0x55a,
  0x256,
  0x35f,
  0x55,
  0x15c,
  0xe5c,
  0xf55,
  0xc5f,
  0xd56,
  0xa5a,
  0xb53,
  0x859,
  0x950,
  0x7c0,
  0x6c9,
  0x5c3,
  0x4ca,
  0x3c6,
  0x2cf,
  0x1c5,
  0xcc,
  0xfcc,
  0xec5,
  0xdcf,
  0xcc6,
  0xbca,
  0xac3,
  0x9c9,
  0x8c0,
  0x8c0,
  0x9c9,
  0xac3,
  0xbca,
  0xcc6,
  0xdcf,
  0xec5,
  0xfcc,
  0xcc,
  0x1c5,
  0x2cf,
  0x3c6,
  0x4ca,
  0x5c3,
  0x6c9,
  0x7c0,
  0x950,
  0x859,
  0xb53,
  0xa5a,
  0xd56,
  0xc5f,
  0xf55,
  0xe5c,
  0x15c,
  0x55,
  0x35f,
  0x256,
  0x55a,
  0x453,
  0x759,
  0x650,
  0xaf0,
  0xbf9,
  0x8f3,
  0x9fa,
  0xef6,
  0xfff,
  0xcf5,
  0xdfc,
  0x2fc,
  0x3f5,
  0xff,
  0x1f6,
  0x6fa,
  0x7f3,
  0x4f9,
  0x5f0,
  0xb60,
  0xa69,
  0x963,
  0x86a,
  0xf66,
  0xe6f,
  0xd65,
  0xc6c,
  0x36c,
  0x265,
  0x16f,
  0x66,
  0x76a,
  0x663,
  0x569,
  0x460,
  0xca0,
  0xda9,
  0xea3,
  0xfaa,
  0x8a6,
  0x9af,
  0xaa5,
  0xbac,
  0x4ac,
  0x5a5,
  0x6af,
  0x7a6,
  0xaa,
  0x1a3,
  0x2a9,
  0x3a0,
  0xd30,
  0xc39,
  0xf33,
  0xe3a,
  0x936,
  0x83f,
  0xb35,
  0xa3c,
  0x53c,
  0x435,
  0x73f,
  0x636,
  0x13a,
  0x33,
  0x339,
  0x230,
  0xe90,
  0xf99,
  0xc93,
  0xd9a,
  0xa96,
  0xb9f,
  0x895,
  0x99c,
  0x69c,
  0x795,
  0x49f,
  0x596,
  0x29a,
  0x393,
  0x99,
  0x190,
  0xf00,
  0xe09,
  0xd03,
  0xc0a,
  0xb06,
  0xa0f,
  0x905,
  0x80c,
  0x70c,
  0x605,
  0x50f,
  0x406,
  0x30a,
  0x203,
  0x109,
  0x0,
]);


const triTable = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1],
  [3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1],
  [3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1],
  [3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1],
  [9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1],
  [9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
  [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1],
  [8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1],
  [9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
  [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1],
  [3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1],
  [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1],
  [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1],
  [4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1],
  [9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
  [5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1],
  [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1],
  [9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
  [0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
  [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1],
  [10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1],
  [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1],
  [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1],
  [5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1],
  [9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1],
  [0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1],
  [1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1],
  [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1],
  [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1],
  [2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1],
  [7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1],
  [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1],
  [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1],
  [11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1],
  [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1],
  [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1],
  [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1],
  [11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
  [1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1],
  [9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1],
  [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1],
  [2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
  [0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
  [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1],
  [6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1],
  [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1],
  [6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1],
  [5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1],
  [1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
  [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1],
  [6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1],
  [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1],
  [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1],
  [3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
  [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1],
  [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1],
  [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1],
  [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1],
  [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1],
  [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1],
  [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1],
  [10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1],
  [10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1],
  [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1],
  [1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1],
  [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1],
  [0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1],
  [10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1],
  [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1],
  [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1],
  [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1],
  [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1],
  [3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1],
  [6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1],
  [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1],
  [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1],
  [10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1],
  [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1],
  [7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1],
  [7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1],
  [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1],
  [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1],
  [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1],
  [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1],
  [0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1],
  [7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
  [10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
  [2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
  [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1],
  [7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1],
  [2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1],
  [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1],
  [10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1],
  [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1],
  [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1],
  [7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1],
  [6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1],
  [8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1],
  [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1],
  [6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1],
  [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1],
  [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1],
  [8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1],
  [0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1],
  [1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1],
  [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1],
  [10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1],
  [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1],
  [10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
  [5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
  [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1],
  [9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
  [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1],
  [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1],
  [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1],
  [7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1],
  [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1],
  [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1],
  [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1],
  [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1],
  [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1],
  [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1],
  [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1],
  [6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1],
  [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1],
  [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1],
  [6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1],
  [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1],
  [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1],
  [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1],
  [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1],
  [9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1],
  [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1],
  [1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1],
  [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1],
  [0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1],
  [5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1],
  [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1],
  [11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1],
  [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1],
  [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1],
  [2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1],
  [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1],
  [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1],
  [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1],
  [1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1],
  [9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1],
  [9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1],
  [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1],
  [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1],
  [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1],
  [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1],
  [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1],
  [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1],
  [9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1],
  [5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1],
  [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1],
  [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1],
  [8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1],
  [0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1],
  [9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1],
  [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1],
  [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1],
  [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1],
  [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1],
  [11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1],
  [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1],
  [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1],
  [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1],
  [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1],
  [1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1],
  [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1],
  [4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1],
  [0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1],
  [3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1],
  [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1],
  [0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1],
  [9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1],
  [1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
];

const corners = [[0,0,0],[0,1,0],[1,1,0],[1,0,0],[0,0,1],[0,1,1],[1,1,1],[1,0,1]];

function vertexInterp(
    level,
    c0,
    c1,
    v0,
    v1
  ) {
    const out = [];
    const mu = (level - v0) / (v1 - v0);
    for (let i = 0; i < 3; i++) {
        out.push((1 - mu)*c0[i] + mu*c1[i])
    }
    return out;
  }

function marchingCube(vals, level) {
  /*
    return triangles for Marching Cubes algorithm given vals on 8 corners
    and level
*/

  let cubeindex = 0;
  for (let i = 0; i < vals.length; i++) {
    const element = vals[i];
    if (element < level) {
      cubeindex |= Math.pow(2, i);
    }
  }

  /* Cube is entirely in/out of the surface */
  if (edgeTable[cubeindex] == 0) return [];

  const vertList = {};

  /* Find the vertices where the surface intersects the cube */
  if (edgeTable[cubeindex] & 1)
    vertList[0] = vertexInterp(
      level,
      corners[0],
      corners[1],
      vals[0],
      vals[1]
    );
  if (edgeTable[cubeindex] & 2)
    vertList[1] = vertexInterp(
      level,
      corners[1],
      corners[2],
      vals[1],
      vals[2]
    );
  if (edgeTable[cubeindex] & 4)
    vertList[2] = vertexInterp(
      level,
      corners[2],
      corners[3],
      vals[2],
      vals[3]
    );
  if (edgeTable[cubeindex] & 8)
    vertList[3] = vertexInterp(
      level,
      corners[3],
      corners[0],
      vals[3],
      vals[0]
    );
  if (edgeTable[cubeindex] & 16)
    vertList[4] = vertexInterp(
      level,
      corners[4],
      corners[5],
      vals[4],
      vals[5]
    );
  if (edgeTable[cubeindex] & 32)
    vertList[5] = vertexInterp(
      level,
      corners[5],
      corners[6],
      vals[5],
      vals[6]
    );
  if (edgeTable[cubeindex] & 64)
    vertList[6] = vertexInterp(
      level,
      corners[6],
      corners[7],
      vals[6],
      vals[7]
    );
  if (edgeTable[cubeindex] & 128)
    vertList[7] = vertexInterp(
      level,
      corners[7],
      corners[4],
      vals[7],
      vals[4]
    );
  if (edgeTable[cubeindex] & 256)
    vertList[8] = vertexInterp(
      level,
      corners[0],
      corners[4],
      vals[0],
      vals[4]
    );
  if (edgeTable[cubeindex] & 512)
    vertList[9] = vertexInterp(
      level,
      corners[1],
      corners[5],
      vals[1],
      vals[5]
    );
  if (edgeTable[cubeindex] & 1024)
    vertList[10] = vertexInterp(
      level,
      corners[2],
      corners[6],
      vals[2],
      vals[6]
    );
  if (edgeTable[cubeindex] & 2048)
    vertList[11] = vertexInterp(
      level,
      corners[3],
      corners[7],
      vals[3],
      vals[7]
    );

  /* Create the triangle */
  // let ntriang = 0;
  const triangles = []
  for (let i = 0; triTable[cubeindex][i] != -1; i += 3) {
    triangles.push(vertList[triTable[cubeindex][i]]);
    triangles.push(vertList[triTable[cubeindex][i + 1]]);
    triangles.push(vertList[triTable[cubeindex][i + 2]]);
    // ntriang++;
  }

  return triangles;
}

export function marchingCubes({ f, level=0, xMin=-1, xMax=1, yMin=-1, yMax=1, zMin=-1, zMax=1 } = {}) {
  const geometry = new THREE.BufferGeometry();


  const N = 30 , h = 0.001;
  const vertices = [], normals = [];

  for(let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      for (let k = 0; k < N; k++) {
        const [x,y,z] = [2*i/N - 1, 2*j/N - 1,2*k/N - 1];
        const dx = 2/N, dy = 2/N, dz = 2/N;
        
        const grid = [[x,y,z],[x,y + dy,z],[x + dx,y + dy,z],[x + dx,y,z],
                      [x,y,z + dz],[x,y + dy,z + dz],[x + dx,y + dy,z + dz],[x + dx,y,z + dz]]

        const vals = [];
        grid.forEach(corner => {
          vals.push(f(...corner))
        });

        const pts = marchingCube( vals, level);
      
        for (let index = 0; index < pts.length; index++) {
          const pt = pts[index];

          const u = x + pt[0]*dx, v = y + pt[1]*dy, w = z + pt[2]*dz;

          const fx = (f(u + h/2, v, w) - f(u - h/2, v, w)) / h;
          const fy = (f(u, v + h/2, w) - f(u, v - h/2, w)) / h;
          const fz = (f(u, v, w + h/2) - f(u, v, w - h/2)) / h;

          const norm = new THREE.Vector3(fx, fy, fz);
          norm.normalize();

          // console.log([u,v,w], norm);

          vertices.push(u,v,w);
          normals.push(norm.x, norm.y, norm.z);
        }
      }
    }
  }

  // console.log(vertices.length)
  
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

  return geometry;
}

// Find extremes of scalar function on vertices

export function vMaxMin(mesh, f) {
  let vMax, vMin;
  const points = mesh.geometry.attributes.position.array;
  vMax = f(points[0],points[1],points[2]);
  vMin = vMax;
  for (let i = 3; i < points.length; i += 3) {
    const w = f(points[i],points[i+1],points[i+2]);
    vMax = Math.max(vMax, w);
    vMin = Math.min(vMin, w);
  }
  return [vMax, vMin];
}

/* color the vertices of a geometry via f(x,y,z) -> {r,g,b} */
export function colorBufferVertices( mesh , f ) {
    let colors = [];
    let vec = new THREE.Vector3();
    const points = mesh.geometry.attributes.position.array;
    // console.log("=======");
    for (let i = 0; i < points.length; i += 3) {
        vec.set(points[i],points[i+1],points[i+2]);
        let {x,y,z} = mesh.localToWorld(vec);
        let {r,g,b} = f(x,y,z);
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
        textLabel.innerHTML = '<span class="colorBarText" style="vertical-align:text-top">' + (Math.round((vMin + x*vRange)*100)/100).toString() + '</span>';
        textLabel.style.bottom = (100 * x).toString() + "%";
        textLabel.style.left = "0px";
    }
    context.fillStyle = grd;
    context.fillRect(0,0,canvas.width,canvas.height);
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

	constructor( {radiusTop = 1/16, radiusBottom = 1/20, height = 1, heightTop = 1/6, radialSegments = 8, heightSegments = 1, openEnded = false, heightIncludesHead = true} = {} ) {

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
    generateCap( false, true );

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

		function generateCap( top, headBase = false ) {

			// save the index of the first center vertex
			const centerIndexStart = index;

			const uv = new THREE.Vector2();
			const vertex = new THREE.Vector3();

			let groupCount = 0;

			const radius = ( top || headBase ) ? radiusTop : radiusBottom;
			const sign = ( top ) ? 1 : -1;

			// first we generate the center vertex data of the cap.
			// because the geometry needs one set of uvs per face,
			// we must generate a center vertex per face/segment

			for ( let x = 1; x <= radialSegments; x ++ ) {

				// vertex

				vertices.push( 0, 0, top ? tubeHeight + heightTop : (headBase ? tubeHeight : 0) );

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
				vertex.z = top || headBase ? tubeHeight : 0;
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
  const axisGeometry = new ArrowBufferGeometry( {radiusTop: gridStep/9, radiusBottom: gridStep/16, height: gridMax*3, heightTop: gridStep/3 * 2 , heightIncludesHead: false} );
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
  axesText = [],
  render = undefined
} = {}) {
  const loader = new THREE.FontLoader();
  const font = loader.load(
    // resource URL
    fontFile,
    function (font) {
      // clear out the old
      for (let index = 0; index < axesText.length; index++) {
        const element = axesText[index];
        if (element.children) {
          element.children[0].geometry.dispose();
        }
        scene.remove(element);
      }
      axesText.length = 0;
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
          const textGeo = new THREE.TextGeometry(( Math.round(100*((-3/2 + i/2)*gridMax)) / 100 ).toString(), textGeometryArguments);
          tickGeos.push(textGeo);
          textGeo.computeBoundingBox();
        }
      }
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 6; j++) {
          const text = new THREE.Mesh( new THREE.BufferGeometry().fromGeometry( tickGeos[j] ), textMaterial );
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
        if (render) render();
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


// Gauss-Legendre quadrature via https://rosettacode.org/wiki/Numerical_integration/Gauss-Legendre_Quadrature#JavaScript

const factorial = n => n  <= 1 ? 1 : n * factorial(n - 1);
const M = n => (n - (n % 2 !== 0)) / 2;
const gaussLegendre = (fn, a, b, n) => {
	// coefficients of the Legendre polynomial
	const coef = [...Array(M(n) + 1)].map((v, m) => v = (-1) ** m * factorial(2 * n - 2 * m) / (2 ** n * factorial(m) * factorial(n - m) * factorial(n - 2 * m)));
	// the polynomial function 
	const f = x => coef.map((v, i) => v * x ** (n - 2 * i)).reduce((sum, item) => sum + item, 0);
	const terms = coef.length - (n % 2 === 0);
	// coefficients of the derivative polybomial
	const dcoef = [...Array(terms)].map((v, i) => v = n - 2 * i).map((val, i) => val * coef[i]);
	// the derivative polynomial function
	const df = x => dcoef.map((v, i) => v * x ** (n - 1 - 2 * i)).reduce((sum, item) => sum + item, 0);
	const guess = [...Array(n)].map((v, i) => Math.cos(Math.PI * (i + 1 - 1 / 4) / (n + 1 / 2)));
	// Newton Raphson 
	const roots = guess.map(xo => [...Array(100)].reduce(x => x - f(x) / df(x), xo));
	const weights = roots.map(v => 2 / ((1 - v ** 2) * df(v) ** 2));
	return (b - a) / 2 * weights.map((v, i) => v * fn((b - a) * roots[i] / 2 + (a + b) / 2)).reduce((sum, item) => sum + item, 0);
}
// console.log(gaussLegendre(x => Math.exp(x), -3, 3, 5));

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

export { ArrowBufferGeometry, ParametricCurve, drawGrid, drawAxes, labelAxes, gaussLegendre, rk4, norm1 };