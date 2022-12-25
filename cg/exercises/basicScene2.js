import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
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
let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
let cube = new THREE.Mesh(cubeGeometry, material);
cube.scale.set(11, 0.3, 6);
// position the cube
cube.position.set(0.0, 3.0, 0.0);
// add the cube to the scene
// scene.add(cube);




let i,j;
let x = 0;
let rotate = 0.001;
for(i=0;i<36;i++){
  
    let sphere  = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), material);
    sphere.add(new THREE.AxesHelper( 5 ));
    sphere.position.set(0, 1,0);
    sphere.rotateY(x);
    sphere.translateX(rotate);
    sphere.translateZ(10);
    scene.add(sphere);

    
   x++;;
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