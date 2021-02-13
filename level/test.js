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

    console.log(code, code.toString(2), edges);
  
    for (let index = 0; index < edges.length; index++) {
      const i = edges[index];
      const [p1, p2] = msPositions[i];
      const [v1, v2] = msDirections[i];
      const c = cs[i];
      
      endPoints.push([p1 + c*v1, p2 + c*v2]);
    }
    return endPoints;
  }
  
  console.log(marchingSquare(1,2,3,4,2.5, 1.2));
  console.log(marchingSquare(1,3,2,4,2.5, 2.5));

  const points = [];

  points.push(...[1,3]);
  points.push(...[4,8,16]);
  points.push(...[]);

  console.log("points", points);