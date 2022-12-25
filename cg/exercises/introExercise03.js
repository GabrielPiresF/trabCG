import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
//let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
/*
let cube1 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
let cube2 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
let cube3 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);

let cube4 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
let cube5 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
let cube6 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);

let cube7 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
let cube8 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
let cube9 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);

cube1.position.set(-5, 1, 0);
cube2.position.set(0, 1, 0);
cube3.position.set(5, 1, 0);

cube4.position.set(-5, 1, -5);
cube5.position.set(0, 1, -5);
cube6.position.set(5, 1, -5);

cube7.position.set(-5, 1, 5);
cube8.position.set(0, 1, 5);
cube9.position.set(5, 1, 5);

scene.add(cube1);
scene.add(cube2);
scene.add(cube3);
scene.add(cube4);
scene.add(cube5);
scene.add(cube6);
scene.add(cube7);
scene.add(cube8);
scene.add(cube9);

*/
let i = -5;

while(i<=5){
  let j=-5;
  while(j<=5){
    let cube = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
    cube.position.set(i, 1, j);
    scene.add(cube);
    j=j+5;
  }
  i=i+5;
}





// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

render();
function render()
{



  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}