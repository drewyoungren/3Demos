/* jshint esversion: 6 */

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
}

// return line segments ([pairs of triples])
export function marchingSquares(f, level, xmin, xmax, ymin, ymax, zlevel = null, nX = 30, nY = 30) {
    const dx = (xmax - xmin) / nX, dy = (ymax - ymin) / nY;
    const z = zlevel == null ? level : zlevel;
    let points = new Float32Array();
    for (let x=xmin; x < xmax; x += dx) {
        for (let y = ymin; y < ymax; y += dy) {
            let cornerValues = [f(x,y),f(x+dx,y),f(x + dx,y + dy),f(x,y + dy)];
            let cornerComps = cornerValues.reduce((result,val) => {
                return result + ((val >= z) ? "1" : "0")
            },"");
            // for (let xy of [[x,y],[x+dx,y],[x + dx,y + dy],[x,y + dy]]) {
            //     corners.push((f(...xy) > level) ? 1 : 0);
            // }
        console.log(cornerValues,cornerComps);
        }
    }
}