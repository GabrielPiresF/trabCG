import * as THREE from  'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import {TeapotGeometry} from '../build/jsm/geometries/TeapotGeometry.js';
import {initRenderer, 
        initDefaultSpotlight,
        createGroundPlaneXZ,
        SecondaryBox, 
        onWindowResize} from "../libs/util/util.js";

let scene, renderer, light, camera, keyboard;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(5.0, 5.0, 5.0)); // Use default light    
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
keyboard = new KeyboardState();

var groundPlane = createGroundPlaneXZ(10, 10, 40, 40); // width, height, resolutionW, resolutionH
scene.add(groundPlane);

// Create objects
createTeapot( 2.0,  0.4,  0.0, Math.random() * 0xffffff);
createTeapot(0.0,  0.4,  2.0, Math.random() * 0xffffff);  
createTeapot(0.0,  0.4, -2.0, Math.random() * 0xffffff);    

let camPos  = new THREE.Vector3(0, 0, 1);
let camUp   = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.0, 0.0);
var message = new SecondaryBox("");





// Main camera
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.position.copy(camPos);
   camera.up.copy( camUp );
   camera.lookAt(camLook);


let cameraHolder = new THREE.Object3D();

cameraHolder.add(camera);

render();

function updateCamera()
{
   // DICA: Atualize a câmera aqui!
   camera.position.copy(camPos);
   camera.up.copy( camUp );
   camera.lookAt(camLook);


   message.changeMessage("Pos: {" + camPos.x + ", " + camPos.y + ", " + camPos.z + "} " + 
                         "/ LookAt: {" + camLook.x + ", " + camLook.y + ", " + camLook.z + "}");
}

function keyboardUpdate() {

   keyboard.update();
   
   // DICA: Insira aqui seu código para mover a câmera

   let transMove = 0.1;
   let degree = 1.0;

   if (keyboard.pressed("B")) cameraHolder.translateZ(transMove);
   if (keyboard.pressed("space")) cameraHolder.translateZ(-transMove);
   if (keyboard.pressed("W")) cameraHolder.translateY(transMove);
   if (keyboard.pressed("S")) cameraHolder.translateY(-transMove);
   if (keyboard.pressed("A")) cameraHolder.translateX(transMove);
   if (keyboard.pressed("D")) cameraHolder.translateX(-transMove);

   if (keyboard.pressed("left")) cameraHolder.rotateY(THREE.MathUtils.degToRad(degree));
   if (keyboard.pressed("right")) cameraHolder.rotateY(THREE.MathUtils.degToRad(-degree));
   if (keyboard.pressed("up")) cameraHolder.rotateX(THREE.MathUtils.degToRad(degree));
   if (keyboard.pressed("down")) cameraHolder.rotateX(THREE.MathUtils.degToRad(-degree));
   if (keyboard.pressed("Q")) cameraHolder.rotateZ(THREE.MathUtils.degToRad(degree));
   if (keyboard.pressed("E")) cameraHolder.rotateZ(THREE.MathUtils.degToRad(-degree));



  /* if (keyboard.down("up")) cameraHolder.z +=1;
   if (keyboard.down("down")) cameraHolder.z-=1;

   if (keyboard.down("pageup")) camPos.y +=1;
   if (keyboard.down("pagedown")) camPos.y-=1;



   if (keyboard.down("A")) camLook.x +=1;
   if (keyboard.down("D")) camLook.x -=1;
   if (keyboard.down("W")) camLook.z +=1;
   if (keyboard.down("S")) camLook.z -=1;
   if (keyboard.down("Q")) camLook.y +=1;
   if (keyboard.down("E")) camLook.y -=1;

*/

   /*
   var speed = 30;
   var moveDistance = speed * clock.getDelta();

   if (keyboard.down("left")) cube.translateX(-1);
   if (keyboard.down("right")) cube.translateX(1);
   if (keyboard.down("up")) cube.translateY(1);
   if (keyboard.down("down")) cube.translateY(-1);

   if (keyboard.pressed("A")) cube.translateX(-moveDistance);
   if (keyboard.pressed("D")) cube.translateX(moveDistance);
   if (keyboard.pressed("W")) cube.translateY(moveDistance);
   if (keyboard.pressed("S")) cube.translateY(-moveDistance);

   if (keyboard.pressed("space")) cube.position.set(0.0, 0.0, 2.0);
*/
   
   updateCamera();
}

function createTeapot(x, y, z, color )
{
   var geometry = new TeapotGeometry(0.5);
   var material = new THREE.MeshPhongMaterial({color, shininess:"200"});
      material.side = THREE.DoubleSide;
   var obj = new THREE.Mesh(geometry, material);
      obj.castShadow = true;
      obj.position.set(x, y, z);
   scene.add(obj);
}

function render()
{
   requestAnimationFrame(render);
   keyboardUpdate();
   renderer.render(scene, camera) // Render scene
}