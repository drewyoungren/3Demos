import {
    // colorBufferVertices,
    // blueUpRedDown,
    // addColorBar,
    // marchingSegments,
    // drawAxes,
    // drawGrid,
    // labelAxes,
    // ArrowBufferGeometry,
    // vMaxMin,
    // gaussLegendre,
    // marchingSquares,
    marchingCubes,
  } from "../base/utils.js";

onmessage = (e) => {
    const {k,z,a,b,c,d,e,f} = e.data;
    const geometry = marchingCubes({
      f: (u, v, w) => {
        return z.evaluate({ x: u, y: v, z: w });
      },
      level: k.evaluate(),
      xMin: a.evaluate(),
      xMax: b.evaluate(),
      yMin: c.evaluate(),
      yMax: d.evaluate(),
      zMin: e.evaluate(),
      zMax: f.evaluate(),
      N: data.nX,
    });

    postMessage(geometry);
}