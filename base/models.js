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


export function addDemoObject({ demoType, params = null, id = null, renderFunction = () => {} }) {
  console.log("addDemoObject", demoType);
  switch (demoType) {
    case "parsurf":
      console.log("Got to parsurf ");
      return addParameterizedSurface({ params, renderFunction });
      break;

    default:
      break;
  }
}

function addParameterizedSurface({ params, nX = 30, renderFunction = () => {} }) {
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
  domElement.style.border = "1px solid black";
  domElement.style.borderRadius = "1rem";

  const div = document.createElement("div")
  div.classList.add("w3-container","custom-uvs");

  const divXYZ = document.createElement("div")
  divXYZ.classList.add("menu-choice-pipe-separator");
  divXYZ.style.paddingTop = '20px';
  for (const c of "xyz") {
      const el = document.createElement("div");
      const label = document.createElement("span");
      label.innerText = `\$ ${c}(u,v) = \$`
      const inputArea = document.createElement("span")
      const input = document.createElement("input")
      input.type = "text";
      input.classList.add("custom-input",`custom${c.toUpperCase()}`);
      input.value = params[c];
      const warn = document.createElement("span");
      warn.style.color = 'red';
      warn.classList.add("form-warning")
      inputArea.appendChild(input);
      inputArea.appendChild(warn)
      el.appendChild(label);
      el.appendChild(inputArea);
      divXYZ.appendChild(el)
  }
  div.appendChild(divXYZ);

  const divUV = document.createElement("div")
  divUV.classList.add("menu-choice-pipe-separator");
  divUV.style.paddingTop = '20px';
  for (const c of ["abu", "cdv"]) {
      const el = document.createElement("div");
      const span = document.createElement("span")
      el.appendChild(span)


      const inputAreaA = document.createElement("span")
      const inputA = document.createElement("input")
      inputA.type = "text";
      inputA.classList.add("custom-input",`custom${c[0].toUpperCase()}`);
      inputA.value = params[c[0]];
      const warnA = document.createElement("span");
      warnA.style.color = 'red';
      warnA.classList.add("form-warning")
      inputAreaA.appendChild(inputA);
      inputAreaA.appendChild(warnA)
      
      const label = document.createElement("span");
      label.innerText = `\$ \\leq ${c[2]} \\leq \$`;

      const inputAreaB = document.createElement("span")
      const inputB = document.createElement("input")
      inputB.type = "text";
      inputB.classList.add("custom-input",`custom${c[1].toUpperCase()}`);
      inputB.value = params[c[1]];
      const warnB = document.createElement("span");
      warnB.style.color = 'red';
      warnB.classList.add("form-warning")
      inputAreaB.appendChild(inputB);
      inputAreaB.appendChild(warnB)

      span.appendChild(inputAreaA);
      span.appendChild(label);
      span.appendChild(inputAreaB);
      divUV.appendChild(el)
  }

  div.appendChild(divUV);

  domElement.append(div);
  setTimeout(() => {
    MathJax.typeset();
  }, 1000);   
//   domElement.innerHTML = `<div class="w3-container" id="custom-uvs">
//   <div class="menu-choice-pipe-separator" style="padding-top: 20px;">
//     <div>
//       <span>$x(u,v) = $ </span>
//       <span><input class="custom-input" type="text" name="customX" id="customX" value="u"><span
//           style="color: red;" class="form-warning"></span></span>
//     </div>
//     <div>
//       <span>$y(u,v) = $ </span>
//       <span><input class="custom-input" type="text" name="customY" id="customY" value="v"><span
//           style="color: red;" class="form-warning"></span></span>
//     </div>
//     <div>
//       <span>$z(u,v) = $ </span>
//       <span><input class="custom-input" type="text" name="customZ" id="customZ" value="u^3 - u"><span
//           style="color: red;" class="form-warning"></span></span>
//     </div>
//   </div>

//   <div class="menu-choice-pipe-separator" style="padding-top: 20px;">
//     <div>
//       <span><input class="custom-input" type="text" name="customA" style="width: 4em; text-align: right;"
//           id="customA" value="-1"><span style="color: red;" class="form-warning"></span>
//       </span>
//       $ \leq u \leq $
//       <span><input class="custom-input" type="text" name="customB" style="width: 4em;" id="customB"
//           value="1"><span style="color: red;" class="form-warning"></span>
//       </span>
//     </div>
//     <div>
//       <span>
//         <input class="custom-input" type="text" name="customC" style="width: 4em; text-align: right;"
//           id="customC" value="-1"><span style="color: red;" class="form-warning"></span>
//       </span>
//       $ \leq v \leq $
//       <span>
//         <input class="custom-input" type="text" name="customD" style="width: 4em;" id="customD" value="1"><span
//           style="color: red;" class="form-warning"></span>
//       </span>
//     </div>
//   </div>
// </div>`;
  const colorButton = document.createElement("button")
  colorButton.classList.add("btn", "w3-btn", "sans","button-border");
  colorButton.innerText = "Color";
  colorButton.onclick = () => {
      console.log("Button pushed");
      surfaceMesh.children[0].material = plusMaterial3;
      renderFunction();
  }
  domElement.appendChild(colorButton)

  const trashButton = document.createElement("button")
  trashButton.classList.add("btn", "w3-btn", "sans","button-border");
  trashButton.innerHTML = '<i class="fa fa-trash"></i>';
  trashButton.onclick = () => {
      console.log("Trash button pushed");
      for (let i = surfaceMesh.children.length - 1; i >= 0; i--) {
          const obj = surfaceMesh.children[i]
          if (obj.geometry) {
              obj.geometry.dispose();
          }
          surfaceMesh.remove(obj);
      }
      surfaceMesh.parent.remove(surfaceMesh);
      domElement.remove();
      renderFunction();
  }
  domElement.appendChild(trashButton)


  return {
    demoType: "parsurf",
    params,
    threeObject: surfaceMesh,
    domElement,
  };
}

