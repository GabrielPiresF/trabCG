import * as THREE from  'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {createGroundPlane, initCamera} from '../libs/util/util.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import * as T3Areas from './t3areas.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { Box3, OrthographicCamera } from '../build/three.module.js';
import * as T3Assets from './t3assets.js';
import { Buttons } from "../libs/other/buttons.js";
var buttons = new Buttons(onButtonDown);

let scene, renderer, camera;
scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer({alpha: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
renderer.autoClear = false;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("webgl-output").appendChild(renderer.domElement);

camera = initCamera(new THREE.Vector3(0, 15, 30));
window.addEventListener('resize', function(){onWindowResize(camera, renderer)}, false);

let keysScene = new THREE.Scene();
let keysCamera = new THREE.OrthographicCamera(-2.4, 2.4, -0.9, 0.9, 0.1, 2000);
keysCamera.position.copy(new THREE.Vector3(0, 0.6, 3));

let stats = new Stats();
document.body.appendChild(stats.domElement);
let ambientLight = new THREE.AmbientLight('rgb(80, 80, 80)',  1.0);
scene.add(ambientLight);

let dirLightSpecular = new THREE.DirectionalLight('rgb(255, 255, 255)', 0.1);
dirLightSpecular.position.copy(new THREE.Vector3(-5, -7, 5));
dirLightSpecular.target.position.copy(new THREE.Vector3(5, 5, 5));
scene.add(dirLightSpecular);

function onWindowResize(camera, renderer){
    if(camera instanceof THREE.PerspectiveCamera){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    else{
        camera.left = -window.innerWidth/tamanho_estimado;
        camera.right = window.innerWidth/tamanho_estimado;
        camera.top = window.innerHeight/tamanho_estimado;
        camera.bottom = -window.innerHeight/tamanho_estimado;
        camera.near = -tamanho_estimado;
        camera.far = tamanho_estimado;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

let plataformaFinal = new Array();

let dirLight = new THREE.DirectionalLight('rgb(255, 255, 255)', 1.0);
dirLight.position.set(-60, 60, 60);
dirLight.target.position.set(0, 0, 0);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -35;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.bottom = -30;
dirLight.shadow.camera.top = 30;
dirLight.shadow.autoUpdate = true;
scene.add(dirLight);
let isEndGame = false;
const width = 10;
const widthIsEven = (1-width%2);
let isOpenDoors = false;

let asset = {
    object: null,
    loaded: false,
    bb: new THREE.Box3(),
    move: false
}

let initialPosition = new THREE.Vector3(0, 0, 0); //INICIO
//let initialPosition = new THREE.Vector3(0, 0, -1*(10+2*width)); //CINZA sala 1
//let initialPosition = new THREE.Vector3(0,4.5, 10+2*width); //AZUL sala 2
//let initialPosition = new THREE.Vector3(10+2*width, -4.5, 0); //VERMELHO sala 3
//let initialPosition = new THREE.Vector3(-1*(width)-6, 4.5, 0); //AMARELA sala 4



let cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.99, 32));
cylinder.position.copy(initialPosition);
cylinder.translateY(1);
cylinder.visible = false;
asset.object = cylinder;
updateAsset();
updateAsset();
scene.add(cylinder);


let player = new THREE.Object3D();
let mixerPlayer = new THREE.AnimationMixer();
let clock = new THREE.Clock();
let keyboard = new KeyboardState();
let dx = 1, dz = 1;
let xDirection = 0;
let zDirection = 0;
const speed = 0.09;
let orientation = [[90, 135, 180], [45, 0, 225], [360, 315, 270]];
let graus = new Array(361)
for(let g = 0; g < 361; g++)
    graus[g] = THREE.MathUtils.degToRad(g-180);

let lsCubes = new Array();
let lsKeys = new Array();
let lsStairs = new Array();

let doors = new Array();
let doorArea2 = [0, false];
let doorArea3 = [0, false];
let doorsPositionLsCubes = new Array();
let doorsDetection = new Array();
let keys = new Array();
let auxKeys = new Array();

let interruptors = new Array();
let lights = new Array();
let dragCubesArea3 = new Array();

let lerp = new Array();
let slerp = new Array();
let scale = new Array();
let rotateY = new Array();

let elevatedCubes = new Array();

let levitatedCube = null;
let levitatedCubeWorldPosition = new THREE.Vector3();
let cubesPositionLsCubes = new Array();

let cubePositioningIndicator = new THREE.Mesh(new THREE.BoxGeometry(0.99, 0.99, 0.99), new THREE.MeshLambertMaterial({color: 'rgb(0, 255, 0)', opacity: 0.5, transparent: true}));
cubePositioningIndicator.visible = false;
let cubePositioningIndicatorCollisor = new THREE.Box3();
let collisionSubstitute = new THREE.Box3().setFromObject(new THREE.Object3D());
scene.add(cubePositioningIndicator);

let sceneDrag = new THREE.Scene();
scene.add(sceneDrag);

var tamanho_estimado = 115;

const loadingManager = new THREE.LoadingManager(() => {
    let loadingScreen = document.getElementById('loading-screen');
    loadingScreen.transition = 0;

    let loading = document.getElementById('loader');
    loading.transition = 0;
    loading.classList.add('loader-container-hidden');
  
    let button  = document.getElementById('myBtn');
    button.classList.add('start');
    button.style.background = 'none';
    button.innerHTML = 'START';
    button.addEventListener('click', onButtonPressed);
});

const onMouseSelectCube = (event)=>{
    event.preventDefault();
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    pointer.x = (event.clientX/window.innerWidth)*2-1;
    pointer.y = -(event.clientY/window.innerHeight)*2+1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(sceneDrag.children);
    const intersects2 = raycaster.intersectObjects(player.children);
    if(!event.detail || event.detail == 1)
        for(let i = 0; i < intersects.length || intersects2.length> i; i++)
            if(intersects.length > 0 || intersects2.length>0){
                if(levitatedCube == null){
                    if(player.position.distanceTo(intersects[i]?.object.position) < 3){
                        intersects[i].object.material.color.set('DarkGoldenRod');
                        levitateCube(intersects[i].object, true);
                    }
                    break;
                }
                else if(levitatedCube == intersects2[i]?.object){
                    intersects2[i].object.material.color.set('BurlyWood');
                    levitateCube(intersects2[i].object, false);
                    break;
                }
            }
    else
        event.preventDefault();
};
window.addEventListener('click', onMouseSelectCube, false);

let soundPutObject = new Array();

setPlayer();
T3Areas.createScenery(lsCubes, lsKeys, lsStairs, interruptors, width, scene, sceneDrag, cubesPositionLsCubes, keys, doors, doorsDetection, doorsPositionLsCubes, elevatedCubes, lights, dragCubesArea3, plataformaFinal, soundPutObject, loadingManager);

fillKeyScene();

for(let i = 0; i < keys.length; i++)
    rotateY.push([keys[i][0], 0.01]);

for(let i = 0; i < elevatedCubes.length; i++)
    lerp.push([elevatedCubes[i][0], elevatedCubes[i][0].clone().position, 0.05, 3, i]);

let soundMusic = T3Assets.loadSound('soundMusic.mp3', true, camera, 0.1, loadingManager);
let soundWin = T3Assets.loadSound('soundWin.wav', false, plataformaFinal[1], 0.5, loadingManager);
let soundLight = new Array();
for(let i = 0; i < lights.length; i++){
    soundLight.push(null)
    T3Assets.loadSounds(soundLight, i, 'soundLight.wav', false, lights[i][0], 0.1, loadingManager);
}
let soundSlideDoor = new Array();
for(let i = 0; i < doors.length; i++){
    soundSlideDoor.push(null)
    T3Assets.loadSounds(soundSlideDoor, i, 'soundSlideDoor.wav', false, doors[i], 1, loadingManager);
}
let soundActionableCube = new Array();
for(let i = 0; i < elevatedCubes.length; i++){
    soundActionableCube.push(null)
    T3Assets.loadSounds(soundActionableCube, i, 'soundActionableCube.wav', false, elevatedCubes[i][0], 0.5, loadingManager);
}
let soundGetKey = new Array();
for(let i = 0; i < keys.length; i++){
    soundGetKey.push(null)
    T3Assets.loadSounds(soundGetKey, i, 'soundGetKey.wav', false, keys[i][0], 0.1, loadingManager);
}

/*
for(let i = 0; i < doorsDetection.length; i++)
    scene.add(new THREE.Box3Helper(doorsDetection[i], 'Red'));
for(let i = 0; i < lsKeys.length; i++)
    scene.add(new THREE.Box3Helper(lsKeys[i], 'Green'));
for(let i = 0; i < lsCubes.length; i++)
    scene.add(new THREE.Box3Helper(lsCubes[i], 'Blue'));
for(let i = 0; i < lsStairs.length; i++)
    scene.add(new THREE.Box3Helper(lsStairs[i], 'Yellow'));
*/

render();

function onButtonPressed(){
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.transition = 0;
    loadingScreen.classList.add('fade-out');
    loadingScreen.addEventListener('transitionend', (e) => {
      const element = e.target;
      element.remove();
      
    });
    let div = document.getElementById('inGameButtons');
    let buttonC = document.createElement('button');
    buttonC.style = 'bottom:10px; right: 170px; width: 150px; line-height: 1.0em;';
    buttonC.innerHTML = 'CHANGE<br>CAMERA';
    buttonC.id = 'C';
    buttonC.className = 'video-game-button';
    buttonC.onclick = function() {
        changeCamera();
        moveCamera();
    };
    div.appendChild(buttonC);
    let buttonT = document.createElement('button');
    buttonT.style = 'bottom:10px; right: 10px; width: 150px; line-height: 1.0em;';
    buttonT.innerHTML = 'TEST<br>MODE';
    buttonT.id = 'T';
    buttonT.className = 'video-game-button';
    buttonT.onclick = function() {
        isOpenDoors = true;
    };
    div.appendChild(buttonT);
    let joystickDiv = document.createElement('div');
    joystickDiv.style = 'pointer-events: auto; position: absolute; bottom: 0; left: 0; display: block; touch-action: manipulation;'
    joystickDiv.id = 'joystickWrapper'
    div.appendChild(joystickDiv);

    let joystick = nipplejs.create({
        zone: document.getElementById('joystickWrapper'),
        mode: 'static',
        position: {top: '-180px', left: '80px'}
    });

    joystick.on('move', function(evt, data){
        xDirection = data.vector.x;
        zDirection = data.vector.y;
    });

    joystick.on('end', function(evt){
        xDirection = 0;
        zDirection = 0;
    });
    
    soundMusic.play();
}

function fillKeyScene(){
    let auxDirLight = new THREE.DirectionalLight('rgb(255, 255, 255)', 0.8);
    auxDirLight.position.copy(new THREE.Vector3(0, 0.5, -2));
    auxDirLight.target.position.copy(new THREE.Vector3(0, 0.5, -4));
    keysScene.add(auxDirLight);
    for(let i = 0; i < keys.length; i++){
        auxKeys[i] = keys[i][0].clone();
        auxKeys[i].rotation.y = 0;
        auxKeys[i].rotation.z = THREE.MathUtils.degToRad(25);
        auxKeys[i].position.set(i*1.3-0.4, 0.5, -3);
        auxKeys[i].visible = false;
        keysScene.add(auxKeys[i]);
    }
}

function updateLightArea3(){
    if(player.position.z >= width/2 && player.position.z <= (width/2+5)){
        dirLight.intensity = 0.16*(width/2+6.5-player.position.z);
        if(dirLight.intensity > 1.0)
            dirLight.intensity = 1.0
        ambientLight.intensity = 0.2*(width/2+5.5-player.position.z);
        if(ambientLight.intensity > 1.0)
            ambientLight.intensity = 1.0
    }
}

function levitateCube(obj, isLevitar){
    if(isLevitar){
        for(let j = 0; j < elevatedCubes.length; j++){
            if(comparePosition(obj.position, new THREE.Vector3(elevatedCubes[j][0].position.x, elevatedCubes[j][0].position.y+0.6, elevatedCubes[j][0].position.z),0.1)){
                if(elevatedCubes[j][0].material.color.g){
                    lerp[j][1] = new THREE.Vector3(lerp[j][1].x, lerp[j][1].y+0.19, lerp[j][1].z);
                    lerp[j][0].material.color = new THREE.Color(1, 0, 0);
                    if(!soundActionableCube[j].isPlaying)
                        soundActionableCube[j].play();
                    if(elevatedCubes[j][2] == 2)
                        doorArea2[0] = doorArea2[0]-1;
                    else
                        doorArea3[0] = doorArea3[0]-1;
                }
                break;
            }
        }

        levitatedCube = obj;
        player.add(obj);

        let i = lerp.findIndex(x=> x[0] === obj);
        if(i!=-1)
            lerp.splice(i, 1);
        i = slerp.findIndex(x=> x[0] === obj);
        if(i!=-1)
            slerp.splice(i, 1);

        obj.rotation.set(0, 0, 0);
        obj.position.set(0, 1.5, 2);

        lsCubes[cubesPositionLsCubes.find(x=> x[0] === obj)[1]] = collisionSubstitute;
        updateCubePositioningIndicator();
        cubePositioningIndicator.visible = true;
    }
    else{
        levitatedCube = null;
        player.remove(obj);
        sceneDrag.add(obj);

        obj.rotation.copy(player.rotation);
        obj.position.set(player.position.x, player.position.y+1.5, player.position.z);
        obj.translateZ(2);

        lsCubes[cubesPositionLsCubes.find(x=> x[0] === obj)[1]] = new THREE.Box3().setFromObject(cubePositioningIndicator);
        cubePositioningIndicator.visible = false;

        lerp.push([obj, cubePositioningIndicator.clone().position, 0.5, 0]);
        slerp.push([obj, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.round(player.rotation.y/(Math.PI/2))*(Math.PI/2), 0)), 0.5]);
    }
}

function changeCamera(){
  var pos = new THREE.Vector3().copy(camera.position);

    if(camera instanceof THREE.PerspectiveCamera)
        camera = new THREE.OrthographicCamera(-window.innerWidth/tamanho_estimado, window.innerWidth/tamanho_estimado, window.innerHeight/tamanho_estimado, window.innerHeight/-tamanho_estimado, -tamanho_estimado, tamanho_estimado);
    else
        camera = new THREE.PerspectiveCamera(51, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.copy(pos);
    camera.lookAt(player.position);
}

function moveCamera(){  
     
    if (camera instanceof THREE.PerspectiveCamera)
    {
        camera.position.x = player.position.x+6;
        camera.position.y = player.position.y+12;
        camera.position.z = player.position.z+5;
        camera.lookAt(player.position.x, player.position.y+1, player.position.z);
    }
    else
    {    
        camera.position.x = player.position.x+8;
        camera.position.y = player.position.y+16;
        camera.position.z = player.position.z+6
            camera.lookAt(player.position.x, player.position.y+1, player.position.z);
    
    }
}

function setPlayer(){
    let loaderPlayer = new GLTFLoader(loadingManager);
    loaderPlayer.load('../assets/objects/walkingMan.glb',
    function(gltf)
    {
        player = gltf.scene;
        player.position.copy(initialPosition);
        scene.add(player);
        mixerPlayer = new THREE.AnimationMixer(player);
        mixerPlayer.clipAction(gltf.animations[0]).play();
        mixerPlayer.timeScale = 2;
        updateAsset();
        player.traverse(function (child){
            if(child){
                child.castShadow = true;
            }
        });
    },
    function(xhr){
        console.log('player ' + xhr.loaded/xhr.total*100 + '% carregado');
    },
    function(error){
	    console.log('Erro ao carregar o player: ' + error);
    }); 
    camera = new THREE.OrthographicCamera(-window.innerWidth / tamanho_estimado, window.innerWidth / tamanho_estimado,
                                            window.innerHeight / tamanho_estimado, -window.innerHeight / tamanho_estimado, -tamanho_estimado, tamanho_estimado);
    moveCamera();
}

function keyboardUpdate(){
    keyboard.update();
    
    dx = 1, dz = 1;

    if(keyboard.pressed('up') || keyboard.pressed('W'))
        --dz;
    if(keyboard.pressed('left') || keyboard.pressed('A'))
        --dx;
    if(keyboard.pressed('down') || keyboard.pressed('S'))
        ++dz;
    if(keyboard.pressed('right') || keyboard.pressed('D'))
        ++dx;
    if(dx!=1 || dz!=1)
        movePlayer();
    if(keyboard.down('C'))
    {
        changeCamera();
        moveCamera();
    }
    if(keyboard.down('T'))
        isOpenDoors = true;
}

function onButtonDown(event){
    if(event.target.id == 'full')
        buttons.setFullScreen();
    /*
    switch(event.target.id)
    {
        case 'full':
            buttons.setFullScreen();
            break;    
    }
    */
}

function movePlayerJoystick(){
    if(xDirection||zDirection){
        let orientationJoystick = 0;
        let currentDegreePosition = Math.round((player.rotation._y+Math.PI)/Math.PI*180);
        if(xDirection>0)
            orientationJoystick = Math.round((Math.atan(zDirection/xDirection)+Math.PI-THREE.MathUtils.degToRad(45)+Math.PI)/Math.PI*180);
        else
            orientationJoystick = Math.round((Math.atan(zDirection/xDirection)-THREE.MathUtils.degToRad(45)+Math.PI)/Math.PI*180);
        
        if(Math.abs(currentDegreePosition - orientationJoystick) >= 3){
            let left = 0;
            let right = 0;
            if(currentDegreePosition > orientationJoystick){
                left = currentDegreePosition - orientationJoystick;
                right = 360-currentDegreePosition + orientationJoystick;
            }
            else{
                left = 360-orientationJoystick + currentDegreePosition;
                right = orientationJoystick - currentDegreePosition;
            }
            if(left > right)
                player.rotation.set(0, graus[(currentDegreePosition+3)%360], 0);
            else{
                if(currentDegreePosition == 0)
                    player.rotation.set(0, graus[360], 0);
                else
                    player.rotation.set(0, graus[Math.abs(currentDegreePosition-3)%360], 0);
            }
        }

        let co = Math.sin(player.rotation._y)*speed;
        let ca = Math.cos(player.rotation._y)*speed;

        cylinder.translateX(co);
        updateAsset();
        if(checkCollisions())
            cylinder.translateX(-co);
        cylinder.translateZ(ca);
        updateAsset();
        if(checkCollisions())
            cylinder.translateZ(-ca);
        if(checkStairsCollisions()){
            cylinder.translateY(speed);
            player.position.setY(cylinder.position.y-1);
        }
        player.position.setX(cylinder.position.x);
        player.position.setZ(cylinder.position.z);
        mixerPlayer.update(clock.getDelta());

        updateInterruptores();
    }
}

function movePlayer(){
    if(!xDirection && !zDirection){
        if(player.rotation._y != graus[orientation[dx][dz]]){
            let currentDegreePosition = Math.round((player.rotation._y+Math.PI)/Math.PI*180);
            let left = 0;
            let right = 0;
            if(currentDegreePosition > orientation[dx][dz]){
                left = currentDegreePosition - orientation[dx][dz];
                right = 360-currentDegreePosition + orientation[dx][dz];
            }
            else{
                left = 360-orientation[dx][dz] + currentDegreePosition;
                right = orientation[dx][dz] - currentDegreePosition;
            }
            if(left > right)
                player.rotation.set(0, graus[(currentDegreePosition+9)%360], 0);
            else{
                if(currentDegreePosition == 0)
                    player.rotation.set(0, graus[360], 0);
                else
                    player.rotation.set(0, graus[Math.abs(currentDegreePosition-9)%360], 0);
            }
        }

        let co = Math.sin(player.rotation._y)*speed;
        let ca = Math.cos(player.rotation._y)*speed;

        cylinder.translateX(co);
        updateAsset();
        if(checkCollisions())
            cylinder.translateX(-co);
        cylinder.translateZ(ca);
        updateAsset();
        if(checkCollisions())
            cylinder.translateZ(-ca);
        if(checkStairsCollisions()){
            cylinder.translateY(speed);
            player.position.setY(cylinder.position.y-1);
        }
        player.position.setX(cylinder.position.x);
        player.position.setZ(cylinder.position.z);
        mixerPlayer.update(clock.getDelta());

        updateInterruptores();
    }
}

function updateCubePositioningIndicator(){
    cubePositioningIndicator.position.set(Math.round(player.position.x+Math.sin(player.rotation._y)*2.5), player.position.y-0.5, Math.round(player.position.z+Math.cos(player.rotation._y)*2.5));
    if(widthIsEven){
        levitatedCube.getWorldPosition(levitatedCubeWorldPosition);
        if(cubePositioningIndicator.position.x > levitatedCubeWorldPosition.x)
            cubePositioningIndicator.translateX(-0.5);
        else
            cubePositioningIndicator.translateX(0.5);
        if(cubePositioningIndicator.position.z > levitatedCubeWorldPosition.z)
            cubePositioningIndicator.translateZ(-0.5);
        else
            cubePositioningIndicator.translateZ(0.5);
    }
    cubePositioningIndicatorCollisor = cubePositioningIndicatorCollisor.setFromObject(cubePositioningIndicator);
    let invalidPosition = true;
    let i = 0;
    for(; i < lsCubes.length; i++)
        if(cubePositioningIndicatorCollisor.intersectsBox(lsCubes[i]))
            break;
    if(i!=lsCubes.length){
        do{
            cubePositioningIndicator.translateY(0.1);
            cubePositioningIndicatorCollisor = cubePositioningIndicatorCollisor.setFromObject(cubePositioningIndicator);
            i = 0;
            for(; i < lsCubes.length; i++)
                if(cubePositioningIndicatorCollisor.intersectsBox(lsCubes[i]))
                    break;
            if(i==lsCubes.length){
                i = 0;
                for(; i < lsStairs.length; i++)
                    if(cubePositioningIndicatorCollisor.intersectsBox(lsStairs[i]))
                        break;
                if(i==lsStairs.length)
                    invalidPosition = false;
            }
        }while(invalidPosition);
    }
    else{
        do{
            i = 0;
            for(; i < lsStairs.length; i++)
                if(cubePositioningIndicatorCollisor.intersectsBox(lsStairs[i]))
                    break;
            if(i!=lsStairs.length){
                cubePositioningIndicator.translateY(0.1);
                cubePositioningIndicatorCollisor = cubePositioningIndicatorCollisor.setFromObject(cubePositioningIndicator);
                i = 0;
                for(; i < lsCubes.length; i++)
                    if(cubePositioningIndicatorCollisor.intersectsBox(lsCubes[i]))
                        break;
                if(i==lsCubes.length){
                    i = 0;
                    for(; i < lsStairs.length; i++)
                        if(cubePositioningIndicatorCollisor.intersectsBox(lsStairs[i]))
                            break;
                    if(i==lsStairs.length)
                        invalidPosition = false;
                }
            }
            else
                invalidPosition = false;
        }while(invalidPosition);        
    }
}

function updateAsset(){
    asset.bb.setFromObject(asset.object);
}

function checkCollisions(){
    for(let i = 0; i < lsCubes.length; i++)
        if(asset.bb.intersectsBox(lsCubes[i]))
            return true;
    return false;
}

function checkStairsCollisions(){
    for(let i = 0; i < lsStairs.length; i++)
        if(asset.bb.intersectsBox(lsStairs[i]))
            return true;
    return false;
}

function checkEndGameCollisions(){
    if(asset.bb.intersectsBox(plataformaFinal[0]))
            return true;
    return false;
}

function updateKeys(){
    for(let i = 0; i < lsKeys.length; i++){
       if(asset.bb.intersectsBox(lsKeys[i]) || isOpenDoors){
            lsKeys[i] = collisionSubstitute;
            keys[i][1] = true;
            auxKeys[i].visible = true;
            lerp.push([keys[i][0], player.position, 0.1, 1, i]);
            scale.push([keys[i][0], 0.005]);
            if(soundGetKey[i]){
                soundGetKey[i].play();
                soundGetKey[i] = false;
            }
        }
        if(asset.bb.intersectsBox(doorsDetection[i]) && keys[i][1]){
            doorsDetection[i] = collisionSubstitute;
            keys[i][1] = false;
            lerp.push([doors[i], new THREE.Vector3(doors[i].position.x, doors[i].position.y-5.1, doors[i].position.z), 0.045, 2, i, doors[i].position.y-5]);
            soundSlideDoor[i].play();
        }
    }
}

function updateInterruptores(){
    if(!doorArea3[1]){
        let aux = false;
        let worldPosition = new THREE.Vector3()
        let distance = 5
        for(let i = 0; i < interruptors.length; i++){
            if(player.position.distanceTo(interruptors[i].position) < 6){
                aux = true;
                if(!lights[i][0].intensity){
                    lights[i][0].intensity = 1;
                    if(!soundLight[i].isPlaying)
                        soundLight[i].play();
                    lights[i][0].shadow.autoUpdate = true;
                    if(lights[i][1] != null && !lights[i][1].visible && lights[i][1].position.distanceTo(interruptors[i].position) < 6){
                        if(!lights[i][1].visible)
                            lights[i][1].visible = true;
                        lights[i][1].children.forEach(child => {if(!child.visible) child.visible = true;});
                    }
                }
                if(player.children.length > 1 && !player.children[1].visible)
                    player.children[1].visible = true;
            }
            else{
                if(lights[i][0].intensity){
                    lights[i][0].intensity = 0;
                    if(!soundLight[i].isPlaying)
                        soundLight[i].play();
                    lights[i][0].shadow.autoUpdate = false;
                    if(lights[i][1] != null){
                        if(lights[i][1].visible)
                            lights[i][1].visible = false;
                    }
                }
            }
        }
        dragCubesArea3[0].getWorldPosition(worldPosition)
        if((lights[0][0].intensity && lights[0][0].position.distanceTo(worldPosition) < distance) || (lights[1][0].intensity && lights[1][0].position.distanceTo(worldPosition) < distance) || (lights[2][0].intensity && lights[2][0].position.distanceTo(worldPosition) < distance) || (lights[3][0].intensity && lights[3][0].position.distanceTo(worldPosition) < distance) || (lights[4][0].intensity && lights[4][0].position.distanceTo(worldPosition) < distance) || (lights[5][0].intensity && lights[5][0].position.distanceTo(worldPosition) < distance) || (lights[6][0].intensity && lights[6][0].position.distanceTo(worldPosition) < distance) || (lights[7][0].intensity && lights[7][0].position.distanceTo(worldPosition) < distance)){
            if(!dragCubesArea3[0].visible)
                dragCubesArea3[0].visible = true;
        }
        else{
            if(dragCubesArea3[0].visible && !(player.children.length > 1 && player.children[1] === dragCubesArea3[0] && aux))
                dragCubesArea3[0].visible = false;
        }

        dragCubesArea3[1].getWorldPosition(worldPosition)
        if((lights[0][0].intensity && lights[0][0].position.distanceTo(worldPosition) < distance) || (lights[1][0].intensity && lights[1][0].position.distanceTo(worldPosition) < distance) || (lights[2][0].intensity && lights[2][0].position.distanceTo(worldPosition) < distance) || (lights[3][0].intensity && lights[3][0].position.distanceTo(worldPosition) < distance) || (lights[4][0].intensity && lights[4][0].position.distanceTo(worldPosition) < distance) || (lights[5][0].intensity && lights[5][0].position.distanceTo(worldPosition) < distance) || (lights[6][0].intensity && lights[6][0].position.distanceTo(worldPosition) < distance) || (lights[7][0].intensity && lights[7][0].position.distanceTo(worldPosition) < distance)){
            if(!dragCubesArea3[1].visible)
                dragCubesArea3[1].visible = true;
        }
        else{
            if(dragCubesArea3[1].visible && !(player.children.length > 1 && player.children[1] === dragCubesArea3[1] && aux))
                dragCubesArea3[1].visible = false;
        }
    }
    else{
        for(let i = 0; i < interruptors.length; i++){
            if(player.position.distanceTo(interruptors[i].position) < 12.5){
                if(!lights[i][0].shadow.autoUpdate)
                    lights[i][0].shadow.autoUpdate = true;
            }
            else{
                if(lights[i][0].shadow.autoUpdate)
                    lights[i][0].shadow.autoUpdate = false;
            }
        }
    }
}

function updateTransformations(){
    for(let i = 0; i < lerp.length; i++){
        lerp[i][0].position.lerp(lerp[i][1], lerp[i][2]);
        switch(lerp[i][3]){
            case 0:
                if(comparePosition(lerp[i][0].position, lerp[i][1], 0.001)){
                    soundPutObject[sceneDrag.children.findIndex(x=> x === lerp[i][0])].play();
                    for(let j = 0; j < elevatedCubes.length; j++){
                        if(comparePosition(lerp[i][1], new THREE.Vector3(elevatedCubes[j][0].position.x, elevatedCubes[j][0].position.y+0.6, elevatedCubes[j][0].position.z),0.1)){
                            if(elevatedCubes[j][0].material.color.r){
                                lerp[i][0].position.set(0, 0.6, 0);
                                sceneDrag.remove(lerp[i][0]);
                                elevatedCubes[j][0].add(lerp[i][0]);
                                elevatedCubes[j] = [elevatedCubes[j][0], elevatedCubes[j][1], elevatedCubes[j][2], lerp[i][0]]
                                lerp[j][1] = new THREE.Vector3(lerp[j][1].x, lerp[j][1].y-0.19, lerp[j][1].z);
                            }
                            break;
                        }
                    }
                    lerp.splice(i, 1);
                    --i;
                }
                break;
            case 1:
                if(lerp[i][0].scale.x <= 0){
                    lerp[i][0].visible = false;
                    lerp.splice(i, 1);
                    --i;
                }
                break;
            case 2:
                if(lerp[i][0].position.y < lerp[i][5]){
                    lerp[i][0].visible = false;
                    lsCubes[doorsPositionLsCubes[lerp[i][4]]] = collisionSubstitute;
                    lerp.splice(i, 1);
                    --i;
                }
                break;
            case 3:
                lsCubes[elevatedCubes[lerp[i][4]][1]] = new Box3().setFromObject(lerp[i][0]);
                if(comparePosition(lerp[i][0].position, lerp[i][1], 0.001) && elevatedCubes[lerp[i][4]].length > 3){
                    lerp[i][0].remove(elevatedCubes[lerp[i][4]][3]);
                    sceneDrag.add(elevatedCubes[lerp[i][4]][3]);
                    elevatedCubes[lerp[i][4]][3].position.set(lerp[i][0].position.x, lerp[i][0].position.y+elevatedCubes[lerp[i][4]][3].position.y, lerp[i][0].position.z);
                    lsCubes[cubesPositionLsCubes.find(x=> x[0] === elevatedCubes[lerp[i][4]][3])[1]] = new THREE.Box3().setFromObject(elevatedCubes[lerp[i][4]][3]);
                    elevatedCubes[lerp[i][4]] = [elevatedCubes[lerp[i][4]][0], elevatedCubes[lerp[i][4]][1], elevatedCubes[lerp[i][4]][2]];
                    lerp[i][0].material.color = new THREE.Color(0, 1, 0);
                    soundActionableCube[i].play();
                    if(elevatedCubes[lerp[i][4]][2] == 2){
                        doorArea2[0] = doorArea2[0]+1;
                        if(doorArea2[0] == 3 && doorArea2[1] == false){
                            doorArea2[1] = true;
                            lerp.push([doors[3], new THREE.Vector3(doors[3].position.x, doors[3].position.y-5.1, doors[3].position.z), 0.045, 2, 3, doors[3].position.y-5]);
                            soundSlideDoor[3].play();
                        }
                    }
                    else{
                        doorArea3[0] = doorArea3[0]+1;
                        if(doorArea3[0] == 2 && doorArea3[1] == false){
                            doorArea3[1] = true;
                            lerp.push([doors[4], new THREE.Vector3(doors[4].position.x, doors[4].position.y-5.1, doors[4].position.z), 0.045, 2, 4, doors[4].position.y-5]);
                            soundSlideDoor[4].play();
                            for(let i = 0; i < lights.length; i++){
                                if(!lights[i][0].intensity){
                                    lights[i][0].intensity = 1;
                                    if(!soundLight[i].isPlaying)
                                        soundLight[i].play();
                                }
                                lights[i][0].shadow.needsUpdate = true;
                                if(lights[i][1] != null)
                                    lights[i][1].visible = true;
                            }
                        }
                    }
                }
        }
    }

    for(let i = 0; i < slerp.length; i++){
        slerp[i][0].quaternion.slerp(slerp[i][1], slerp[i][2]);
        if(comparePosition(slerp[i][0].rotation, new THREE.Euler().setFromQuaternion(slerp[i][1]), 0.001)){
            slerp.splice(i, 1);
            --i;
        }
    }

    for(let i = 0; i < scale.length; i++){
        scale[i][0].scale.x = scale[i][0].scale.x-scale[i][1];
        scale[i][0].scale.y = scale[i][0].scale.y-scale[i][1];
        scale[i][0].scale.z = scale[i][0].scale.z-scale[i][1];
        if(scale[i][0].scale.x <= 0){
            scale.splice(i, 1);
            --i;
        }
    }
    
    for(let i = 0; i < rotateY.length; i++){
        rotateY[i][0].rotateY(rotateY[i][1]+(Math.abs(rotateY[i][0].rotation.y)/Math.PI)/5);
        if(rotateY[i][0].scale < 0){
            rotateY.splice(i, 1);
            --i;
        }
    }
}

function updateDirLight(){
    dirLight.shadow.camera.updateProjectionMatrix();
    dirLight.position.set(-60+player.position.x, 60+player.position.y, 60+player.position.z);
    dirLight.target.position.set(player.position.x, player.position.y, player.position.z);
    dirLight.target.updateMatrixWorld();
}

function comparePosition(a, b, difference){
    return Math.abs(a.x-b.x) < difference && Math.abs(a.y-b.y) < difference && Math.abs(a.z-b.z) < difference ? true : false;
}

function checkEndGame(){    
    if(checkEndGameCollisions() && !isEndGame)
    {
        soundWin.play();
        alert("Fim de jogo");
        isEndGame = true;
    }
}

function checkFall(){
    if (player.position.y < -9) {
        alert("Tente Novamente");
        cylinder.position.set(10+2*width, 2, 0);
        player.position.copy(cylinder.position);
    }
}

function alternateRender(){
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);  
    renderer.setScissorTest(false);
    renderer.setClearColor(0xffffff, 1);
    renderer.clear();
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);   

    renderer.setViewport(5, 5, 240, 90);
    renderer.setScissor(5, 5, 240, 90);
    renderer.setScissorTest(true);
    renderer.setClearColor(0xffffff, 0);
    keysCamera.updateProjectionMatrix(); 
    renderer.render(keysScene, keysCamera);
}

function render(){
    checkFall();
    checkEndGame();
    updateLightArea3();
    updateKeys();
    keyboardUpdate();
    movePlayerJoystick();
    alternateRender();
    requestAnimationFrame(render);
    cylinder.translateY(-speed);
    updateAsset();
    if(checkCollisions() || checkStairsCollisions())
        cylinder.translateY(speed);
    player.position.setY(cylinder.position.y-1);
    updateTransformations();
    updateDirLight();
    moveCamera();
    stats.update();
    if(levitatedCube != null)
        updateCubePositioningIndicator();
}