import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera,  light, orbit;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
let materialEsphere = setDefaultMaterial('lightblue'); // create a basic material
let materialCylinder = setDefaultMaterial(); // create a basic material
let materialCube = setDefaultMaterial('green'); // create a basic material
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

let esphere = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 16), materialEsphere);
let cylinder = new THREE.Mesh(new THREE.CylinderGeometry(2, 2,10,32), materialCylinder);
let cube2 = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), materialCube);
// position the cube

esphere.position.set(5.0, 2, 0.0);
cylinder.position.set(-5.0, 1, 0.0);
cube2.position.set(0.0, 2.0, 0.0);
// add the cube to the scene
scene.add(esphere);
scene.add(cylinder);
scene.add(cube2);

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