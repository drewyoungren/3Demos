import * as THREE from "https://unpkg.com/three@0.121.0/build/three.module.js";
// import { color } from "./dat.gui.module";

const wireMaterial = new THREE.MeshBasicMaterial({
  color: 0x333333,
  wireframe: true,
});
const minusMaterial = new THREE.MeshPhongMaterial({
  color: 0xff3232,
  shininess: 80,
  side: THREE.BackSide,
  vertexColors: false,
  transparent: true,
  opacity: 0.7,
});
const plusMaterial = new THREE.MeshPhongMaterial({
  color: 0x3232ff,
  shininess: 80,
  side: THREE.FrontSide,
  vertexColors: false,
  transparent: true,
  opacity: 0.7,
});
const plusMaterial2 = new THREE.MeshPhongMaterial({color: 0xffaaaa, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.7});
const plusMaterial3 = new THREE.MeshPhongMaterial({color: 0xaaffaa, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.7});
const plusMaterial4 = new THREE.MeshPhongMaterial({color: 0xffaaff, shininess: 80, side: THREE.FrontSide,vertexColors: false, transparent: true, opacity: 0.7});


export function addDemoObject({ demoType, params = null, id = null }) {
  console.log("addDemoObject", demoType);
  switch (demoType) {
    case "parsurf":
      console.log("Got to parsurf ");
      return addParameterizedSurface({ params });
      break;

    default:
      break;
  }
}

function addParameterizedSurface({ params, nX = 30 }) {
  if (!params) {
    params = {
      a: "-1",
      b: "1",
      c: "0",
      d: "2*pi",
      x: `u + ${Math.random()}`,
      y: `cos(u*pi/2)^2*sin(v) + ${Math.random()}`,
      z: `cos(u*pi/2)^2*cos(v) + ${Math.random()}`,
    };
  }

  const { a, b, c, d, x, y, z } = params;

  const A = math.parse(a).evaluate(),
    B = math.parse(b).evaluate();
  const C = math.parse(c).compile(),
    D = math.parse(d).compile();
  const X = math.parse(x).compile(),
    Y = math.parse(y).compile(),
    Z = math.parse(z).compile();
  const geometry = new THREE.ParametricBufferGeometry(
    (u, v, vec) => {
      const U = A + (B - A) * u;
      const params = {
        u: U,
        v: (1 - v) * C.evaluate({ u: U }) + v * D.evaluate({ u: U }),
      };
      vec.set(X.evaluate(params), Y.evaluate(params), Z.evaluate(params));
    },
    nX,
    nX
  );
  //   const [rNum, cNum] = [6, 6];
  //   const meshGeometry = meshLines(params, rNum, cNum, nX);
  let material = plusMaterial;

  const surfaceMesh = new THREE.Object3D();
  const backMesh = new THREE.Mesh(geometry, minusMaterial);
  const frontMesh = new THREE.Mesh(geometry, material);
  //   if (colorFunc) {
  //     frontMesh.material = materialColors;
  //     backMesh.visible = false;
  //     let [vMax, vMin] = vMaxMin(frontMesh, (x, y, z) =>
  //       rData.E.evaluate({ x, y, z })
  //     );
  //     colorBufferVertices(frontMesh, (x, y, z) => {
  //       const value = rData.E.evaluate({ x, y, z });
  //       return blueUpRedDown((2 * (value - vMin)) / (vMax - vMin) - 1);
  //     });
  //     addColorBar(vMin, vMax);
  //   }
  //   // mesh.add(new THREE.Mesh( geometry, wireMaterial ))
  surfaceMesh.add(frontMesh);
  surfaceMesh.add(backMesh);
  //   surfaceMesh.add(new THREE.LineSegments(meshGeometry, whiteLineMaterial));
  // mesh.visible = false;

  const domElement = document.createElement("div");
  domElement.classList.add("surfaceInput")
  domElement.innerText = `Testing...Hello...`;
  const colorButton = document.createElement("button")
  colorButton.classList.add("btn", "w3-btn", "sans");
  colorButton.innerText = "Color";
  colorButton.style.border = "1px";
  colorButton.onclick = () => {
      console.log("Button pushed");
      surfaceMesh.children[0].material = plusMaterial3;
  }
  domElement.appendChild(colorButton)
  //   domElement.classList.add("threeDomElement surfDomElement")

  return {
    demoType: "parsurf",
    params,
    threeObject: surfaceMesh,
    domElement,
  };
}

