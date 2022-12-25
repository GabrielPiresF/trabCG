import * as THREE from  'three';
import {createGroundPlane,radiansToDegrees} from "../libs/util/util.js";
import * as T3Objects from './T3Objects.js';
import * as T3Assets from './T3Assets.js';

let width = 0;
let widthIsOdd = 0;

let actionableCube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshLambertMaterial({color: 'rgb(255, 0, 0)'}));
actionableCube.castShadow = true;
actionableCube.receiveShadow = true;

let auxCollider = new THREE.Mesh(new THREE.BoxGeometry());
auxCollider.castShadow = true;
auxCollider.receiveShadow = true;

let cubeInitialArea = createCube('bricksBrown', 'rgb(89,76,60)');
let doorAndPortal = null

let interruptor = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1, 1), new THREE.MeshPhongMaterial({color: 'Yellow', shininess: '20', specular: 'rgb(255, 255, 255)', emissive: 'Yellow', emissiveIntensity: 0.3}));
interruptor.castShadow = true;
interruptor.receiveShadow = true;

let portalCollider = T3Objects.createPortalCollider();
let key = T3Objects.createKey();
let sphere = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshPhongMaterial({color: 'Navy', shininess: '20', specular: 'rgb(255, 255, 255)', emissive: 'Navy', emissiveIntensity: 0.3}));
sphere.castShadow = true;
sphere.receiveShadow = true;

function createCollider(xPosition, yPosition, zPosition, xScale, yScale, zScale, lsCubes){
    auxCollider.scale.set(xScale, yScale, zScale);
    auxCollider.position.set(xPosition, yPosition, zPosition);
    lsCubes.push(new THREE.Box3().setFromObject(auxCollider));
}

function createSolid(xPosition, yPosition, zPosition, xScale, yScale, zScale, lsCubes, scene, textureName, colorMaterial, loadingManager){
    auxCollider.scale.set(xScale, yScale, zScale);
    auxCollider.position.set(xPosition, yPosition, zPosition);
    lsCubes.push(new THREE.Box3().setFromObject(auxCollider));

    auxCollider.material = T3Assets.lambertMaterialAndTexture(textureName, colorMaterial, xScale, yScale, zScale, loadingManager);
    scene.add(auxCollider.clone());
}

function createCube(textureName, colorMaterial, loadingManager){
    let cube = new THREE.Mesh(new THREE.BoxGeometry(), T3Assets.lambertMaterialAndTexture(textureName, colorMaterial, 1, 1, 1, loadingManager));
    cube.castShadow = true;
    cube.receiveShadow = true;
    return cube;
}

function addNewCube(x, y, z, lsCubes, sceneDrag, cubesPositionLsCubes, soundPutObject, loadingManager){
    let cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshLambertMaterial({color: 'BurlyWood'}));
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(x,y,z);
    lsCubes.push(new THREE.Box3().setFromObject(cube));
    cubesPositionLsCubes.push([cube, lsCubes.length-1]);
    sceneDrag.add(cubesPositionLsCubes[cubesPositionLsCubes.length-1][0]);
    soundPutObject.push(T3Assets.loadSound('soundPutObject.wav', false, cube, 0.5, loadingManager));
}

function insertObjectsArea1(lsCubes, sceneDrag, cubesPositionLsCubes, position, max, soundPutObject, loadingManager)
{
    let x = 0, z = 0;
    
    let matrix = new Array(3*width);
    for(let i = 0; i < 3*width; i++)
        matrix[i] = new Array(width);
    for(let i = 0; i < 3*width; i++)
        for(let j = 0; j < width; j++)
            matrix[i][j] = false;
    if(position[0]!=0)
        for(let i = 0; i < max; i++){
            do{
                x = parseInt(Math.random()*(3*width));
                z = parseInt(Math.random()*(width));
            }while(matrix[x][z]);
            matrix[x][z] = true;
            addNewCube(position[0]+x+0.5-1.5*width, position[1]+0.75, position[2]+z+0.5-width/2, lsCubes, sceneDrag, cubesPositionLsCubes, soundPutObject, loadingManager);
        }
    else
        for(let i = 0; i < max; i++){
            do{
                x = parseInt(Math.random()*(width));
                z = parseInt(Math.random()*(3*width));
            }while(matrix[z][x]);
            matrix[z][x] = true;
            addNewCube(position[0]+x+0.5-width/2, position[1]+0.75, position[2]+z+0.5-1.5*width, lsCubes, sceneDrag, cubesPositionLsCubes, soundPutObject, loadingManager);
        }
}

function insertObjectsArea2(lsCubes, sceneDrag, cubesPositionLsCubes, position, max, occupiedPositions, soundPutObject, loadingManager)
{
    let x = 0, z = 0;
    
    let matrix = new Array(3*width);
    for(let i = 0; i < 3*width; i++)
        matrix[i] = new Array(width);
    for(let i = 0; i < 3*width; i++)
        for(let j = 0; j < width; j++)
            matrix[i][j] = false;
    for(let i = 0; i < occupiedPositions.length; i++){
        x = Math.round(occupiedPositions[i][0]-position[0]-0.5+1.5*width);
        z = Math.round(occupiedPositions[i][1]-position[2]-0.5+width/2);
        matrix[x][z] = true;
    }
    for(let i = 0; i < max; i++){
        do{
            x = parseInt(Math.random()*(3*width));
            z = parseInt(Math.random()*(width));
        }while(matrix[x][z]);
        matrix[x][z] = true;
        soundPutObject.push(null);
        T3Assets.addNewNaveArea2(position[0]+x+0.5-1.5*width, position[1]+0.75, position[2]+z+0.5-width/2, lsCubes, sceneDrag, cubesPositionLsCubes, soundPutObject, loadingManager);
    }
}

function auxInsertObjectsArea3(x, y, z, actionableCubes, dragCubes, i, lights, scene, sceneDrag, lsCubes, cubesPositionLsCubes, elevatedCubes, soundPutObject, loadingManager){
    let type;
    if(8-i <= 4-actionableCubes.length-dragCubes.length)
        do
            type = Math.round(2*Math.random());
        while(type == 0 || (type == 2 && dragCubes.length == 2) || (type == 1 && actionableCubes.length == 2));
    else
        do
            type = Math.round(2*Math.random());
        while((type == 2 && dragCubes.length == 2) || (type == 1 && actionableCubes.length == 2));
    if(type == 1){
        actionableCube.position.set(x, y+0.95, z);
        elevatedCubes.push([actionableCube.clone(), , 3]);
        elevatedCubes[elevatedCubes.length-1][0].material = new THREE.MeshLambertMaterial({color: 'rgb(255, 0, 0)'});
        lsCubes.push(new THREE.Box3().setFromObject(elevatedCubes[elevatedCubes.length-1][0]));
        elevatedCubes[elevatedCubes.length-1][1] = lsCubes.length-1;
        scene.add(elevatedCubes[elevatedCubes.length-1][0]);
        actionableCubes.push(elevatedCubes[elevatedCubes.length-1][0]);
        actionableCubes[actionableCubes.length-1].visible = false;
        lights[lights.length-1] = [lights[lights.length-1][0], elevatedCubes[elevatedCubes.length-1][0]];
    }
    else if(type == 2){
        dragCubes.push(new THREE.Object3D());
        soundPutObject.push(null);
        T3Assets.addNewDinoArea3(x, y, z, lsCubes, sceneDrag, cubesPositionLsCubes, dragCubes, dragCubes.length-1, lights, lights.length-1, soundPutObject, loadingManager);
    }
}

function insertObjectsArea3(lsCubes, interruptors, elevatedCubes, lights, scene, sceneDrag, cubesPositionLsCubes, position, dragCubesArea3, soundPutObject, loadingManager)
{
    let spotLight = new THREE.SpotLight('rgb(255,255,255)');
    spotLight.distance = 4.6;
    spotLight.castShadow = true;
    spotLight.decay = 0;
    spotLight.penumbra = 0.5;
    spotLight.angle = THREE.MathUtils.degToRad(30);
    spotLight.shadow.mapSize.width = 128;
    spotLight.shadow.mapSize.height = 128;
    spotLight.shadow.camera.fov = radiansToDegrees(spotLight.angle);
    spotLight.shadow.camera.near = 0.2;
    spotLight.shadow.camera.far = 4.6;
    spotLight.shadow.camera.left = -1.5;
    spotLight.shadow.camera.right = 1.5;
    spotLight.intensity = 0;

    let actionableCubes = [];

    for(let i = 1; i <= 4; i ++){
        interruptor.position.set(position[0]+width/2-0.125, position[1]+0.75, position[2]+(0.6*i-1.5)*width+0.5);
        interruptors.push(interruptor.clone());
        lsCubes.push(new THREE.Box3().setFromObject(interruptors[interruptors.length-1]));
        scene.add(interruptors[interruptors.length-1]);

        spotLight.position.copy(new THREE.Vector3(interruptors[interruptors.length-1].position.x-2.375, interruptors[interruptors.length-1].position.y+4, interruptors[interruptors.length-1].position.z));
        spotLight.target.position.set(interruptors[interruptors.length-1].position.x-2.375, interruptors[interruptors.length-1].position.y, interruptors[interruptors.length-1].position.z);
        spotLight.target.updateMatrixWorld();
        lights.push([spotLight.clone(), null]);
        lights[lights.length-1][0].shadow.autoUpdate = false;
        scene.add(lights[lights.length-1][0]);
        //scene.add(new THREE.SpotLightHelper(lights[lights.length-1][0]));

        if(actionableCubes.length < 2 || dragCubesArea3.length < 2)
            auxInsertObjectsArea3(spotLight.target.position.x, -4, spotLight.target.position.z, actionableCubes, dragCubesArea3, 2*(i-1)+1, lights, scene, sceneDrag, lsCubes, cubesPositionLsCubes, elevatedCubes, soundPutObject, loadingManager);

        interruptor.position.set(position[0]-width/2+0.125, position[1]+0.75, position[2]+(0.6*i-1.5)*width+0.5);
        interruptors.push(interruptor.clone());
        lsCubes.push(new THREE.Box3().setFromObject(interruptors[interruptors.length-1]));
        scene.add(interruptors[interruptors.length-1]);

        spotLight.position.copy(new THREE.Vector3(interruptors[interruptors.length-1].position.x+2.375, interruptors[interruptors.length-1].position.y+4, interruptors[interruptors.length-1].position.z));
        spotLight.target.position.set(interruptors[interruptors.length-1].position.x+2.375, interruptors[interruptors.length-1].position.y, interruptors[interruptors.length-1].position.z);
        spotLight.target.updateMatrixWorld();
        lights.push([spotLight.clone(), null]);
        lights[lights.length-1][0].shadow.autoUpdate = false;
        scene.add(lights[lights.length-1][0]);
        //scene.add(new THREE.SpotLightHelper(lights[lights.length-1][0]));

        if(actionableCubes.length < 2 || dragCubesArea3.length < 2)
            auxInsertObjectsArea3(spotLight.target.position.x, -4, spotLight.target.position.z, actionableCubes, dragCubesArea3, 2*i, lights, scene, sceneDrag, lsCubes, cubesPositionLsCubes, elevatedCubes, soundPutObject, loadingManager);
    }
}

function createInitialArea(lsCubes, lsStairs, scene, doors, doorsDetection, doorsPositionLsCubes, loadingManager){
    let floorTexture = 'floorBrown';
    let floorColor = 'rgb(140,117,86)';
    let wallTexture = 'bricksBrown';
    let wallColor = 'rgb(89,76,60)';

    createSolid(0, -0.25, 0, width+2, 0.5, width+2, lsCubes, scene, floorTexture, floorColor, loadingManager);
    createSolid(-1.5-width/4+widthIsOdd/4, 0.5, 0.5+width/2, -1+width/2+widthIsOdd/2, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-1.5-width/4+widthIsOdd/4, 0.5, -0.5-width/2, -1+width/2+widthIsOdd/2, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(0.5+width/2, 0.5, 1.5+width/4-widthIsOdd/4, 1, 1, -1+width/2+widthIsOdd/2, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-0.5-width/2, 0.5, 1+width/4-widthIsOdd/4, 1, 1, -2+width/2+widthIsOdd/2, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(1+width/4+widthIsOdd/4, 0.5, 0.5+width/2, -2+width/2-widthIsOdd/2, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(1+width/4+widthIsOdd/4, 0.5, -0.5-width/2, -2+width/2-widthIsOdd/2, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(0.5+width/2, 0.5, -1.5-width/4-widthIsOdd/4, 1, 1, -1+width/2-widthIsOdd/2, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-0.5-width/2, 0.5, -1-width/4-widthIsOdd/4, 1, 1, -2+width/2-widthIsOdd/2, lsCubes, scene, wallTexture, wallColor, loadingManager);

    cubeInitialArea.position.set(-0.5-width/2, 0.5, -0.5-width/2);
    scene.add(cubeInitialArea.clone());

    cubeInitialArea.position.set(-0.5-width/2, 0.5, 0.5+width/2);
    scene.add(cubeInitialArea.clone());

    cubeInitialArea.position.set(0.5+width/2, 0.5, -0.5-width/2);
    scene.add(cubeInitialArea.clone());

    cubeInitialArea.position.set(0.5+width/2, 0.5, 0.5+width/2);
    scene.add(cubeInitialArea.clone());


    doorAndPortal[0].rotateY(THREE.MathUtils.degToRad(90));
    doorAndPortal[1].rotateY(THREE.MathUtils.degToRad(90));
    portalCollider[0].rotateY(THREE.MathUtils.degToRad(90));


    doorAndPortal[1].position.set(11.5+width/2, -4.5, -widthIsOdd/2);
    portalCollider[0].position.set(doorAndPortal[1].position.x, 0.5+doorAndPortal[1].position.y, 1.5+doorAndPortal[1].position.z);
    for(let i = 0; i < 4; i++)
        lsCubes.push(new THREE.Box3().setFromObject(portalCollider[i]));
    lsCubes.splice(-4+lsCubes.length, 1);
    scene.add(doorAndPortal[1].clone());

    doorAndPortal[0].position.set(-11.5-width/2, 4.5, -widthIsOdd/2);
    doorAndPortal[1].position.set(doorAndPortal[0].position.x, doorAndPortal[0].position.y, doorAndPortal[0].position.z);
    createCollider(1+doorAndPortal[0].position.x, 3+doorAndPortal[0].position.y, doorAndPortal[0].position.z, 1, 6, 4, doorsDetection);
    portalCollider[0].position.set(doorAndPortal[1].position.x, 0.5+doorAndPortal[1].position.y, 1.5+doorAndPortal[1].position.z);
    for(let i = 0; i < 4; i++)
        lsCubes.push(new THREE.Box3().setFromObject(portalCollider[i]));
    lsCubes.splice(-4+lsCubes.length, 1);
    doors.push(doorAndPortal[0].clone())
    scene.add(doors[doors.length-1]);
    scene.add(doorAndPortal[1].clone());
    lsCubes.push(new THREE.Box3().setFromObject(doorAndPortal[0]));
    doorsPositionLsCubes.push(lsCubes.length-1);
    sphere.position.set(doorAndPortal[0].position.x, doorAndPortal[0].position.y+7.5, doorAndPortal[0].position.z);
    scene.add(sphere.clone());


    doorAndPortal[0].rotation.y = 0;
    doorAndPortal[1].rotation.y = 0;
    portalCollider[0].rotation.y = 0;


    doorAndPortal[0].position.set(widthIsOdd/2, -4.5, 11.5+width/2);
    doorAndPortal[1].position.set(doorAndPortal[0].position.x, doorAndPortal[0].position.y, doorAndPortal[0].position.z);
    createCollider(doorAndPortal[0].position.x, 3+doorAndPortal[0].position.y, -1+doorAndPortal[0].position.z, 4, 6, 1, doorsDetection);
    portalCollider[0].position.set(-1.5+doorAndPortal[1].position.x, 0.5+doorAndPortal[1].position.y, doorAndPortal[1].position.z);
    for(let i = 0; i < 4; i++)
        lsCubes.push(new THREE.Box3().setFromObject(portalCollider[i]));
    lsCubes.splice(-4+lsCubes.length, 1);
    doors.push(doorAndPortal[0].clone())
    scene.add(doors[doors.length-1]);
    scene.add(doorAndPortal[1].clone());
    lsCubes.push(new THREE.Box3().setFromObject(doorAndPortal[0]));
    doorsPositionLsCubes.push(lsCubes.length-1);
    sphere.material = new THREE.MeshPhongMaterial({color: 'Brown', shininess: '20', specular: 'rgb(255, 255, 255)', emissive: 'Brown', emissiveIntensity: 0.3});
    sphere.position.set(doorAndPortal[0].position.x, doorAndPortal[0].position.y+7.5, doorAndPortal[0].position.z);
    scene.add(sphere.clone());

    doorAndPortal[0].position.set(widthIsOdd/2, 4.5, -11.5-width/2);
    doorAndPortal[1].position.set(doorAndPortal[0].position.x, doorAndPortal[0].position.y, doorAndPortal[0].position.z);
    createCollider(doorAndPortal[0].position.x, 3+doorAndPortal[0].position.y, 1+doorAndPortal[0].position.z, 4, 6, 1, doorsDetection);
    portalCollider[0].position.set(-1.5+doorAndPortal[1].position.x, 0.5+doorAndPortal[1].position.y, doorAndPortal[1].position.z);
    for(let i = 0; i < 4; i++)
        lsCubes.push(new THREE.Box3().setFromObject(portalCollider[i]));
    lsCubes.splice(-4+lsCubes.length, 1);
    doors.push(doorAndPortal[0].clone())
    scene.add(doors[doors.length-1]);
    scene.add(doorAndPortal[1].clone());
    lsCubes.push(new THREE.Box3().setFromObject(doorAndPortal[0]));
    doorsPositionLsCubes.push(lsCubes.length-1);
    sphere.material = new THREE.MeshPhongMaterial({color: 'Gold', shininess: '20', specular: 'rgb(255, 255, 255)', emissive: 'Gold', emissiveIntensity: 0.3});
    sphere.position.set(doorAndPortal[0].position.x, doorAndPortal[0].position.y+7.5, doorAndPortal[0].position.z);
    scene.add(sphere.clone());


    let stairs = T3Objects.createStairs(loadingManager);
    let handrail = [];
    for(let i = 1; i < 11; i++){
        cubeInitialArea.scale.y = 0.5;
        cubeInitialArea.material[0].map.repeat.set(1, 0.5);
        cubeInitialArea.material[1].map.repeat.set(1, 0.5);
        cubeInitialArea.material[4].map.repeat.set(1, 0.5);
        cubeInitialArea.material[5].map.repeat.set(1, 0.5);

        cubeInitialArea.position.set(-2.5, -0.75+0.5*i, -i);
        stairs[0].add(cubeInitialArea.clone());

        cubeInitialArea.scale.y = 1;
        cubeInitialArea.material[0].map.repeat.set(1, 1);
        cubeInitialArea.material[1].map.repeat.set(1, 1);
        cubeInitialArea.material[4].map.repeat.set(1, 1);
        cubeInitialArea.material[5].map.repeat.set(1, 1);

        cubeInitialArea.translateY(0.75);
        handrail.push(cubeInitialArea.clone());
        stairs[0].add(handrail[-1+handrail.length]);

        cubeInitialArea.scale.y = 0.5;
        cubeInitialArea.material[0].map.repeat.set(1, 0.5);
        cubeInitialArea.material[1].map.repeat.set(1, 0.5);
        cubeInitialArea.material[4].map.repeat.set(1, 0.5);
        cubeInitialArea.material[5].map.repeat.set(1, 0.5);

        cubeInitialArea.position.set(2.5, -0.75+0.5*i, -i);
        stairs[0].add(cubeInitialArea.clone());

        cubeInitialArea.scale.y = 1;
        cubeInitialArea.material[0].map.repeat.set(1, 1);
        cubeInitialArea.material[1].map.repeat.set(1, 1);
        cubeInitialArea.material[4].map.repeat.set(1, 1);
        cubeInitialArea.material[5].map.repeat.set(1, 1);

        cubeInitialArea.translateY(0.75);
        handrail.push(cubeInitialArea.clone());
        stairs[0].add(handrail[handrail.length-1]);
    }

    stairs[0].rotateY(THREE.MathUtils.degToRad(90));
    stairs[0].position.set(11.5+width/2, -4.5, -0.5*widthIsOdd);
    for(let i = 0; i < 11; i++){
        lsStairs.push(new THREE.Box3().setFromObject(stairs[i]));
    }
    lsStairs.splice(-11+lsStairs.length, 1);
    scene.add(stairs[0].clone());
    for(let i = 0; i < handrail.length; i++){
        lsCubes.push(new THREE.Box3().setFromObject(handrail[i]));
    }

    stairs[0].position.set(-0.5-width/2, 0, -0.5*widthIsOdd);
    for(let i = 0; i < 11; i++){
        lsStairs.push(new THREE.Box3().setFromObject(stairs[i]));
    }
    lsStairs.splice(-11+lsStairs.length, 1);
    scene.add(stairs[0].clone());
    for(let i = 0; i < handrail.length; i++){
        lsCubes.push(new THREE.Box3().setFromObject(handrail[i]));
    }

    stairs[0].rotateY(THREE.MathUtils.degToRad(270));
    stairs[0].position.set(0.5*widthIsOdd, -4.5, 11.5+width/2);
    for(let i = 0; i < 11; i++){
        lsStairs.push(new THREE.Box3().setFromObject(stairs[i]));
    }
    lsStairs.splice(-11+lsStairs.length, 1);
    scene.add(stairs[0].clone());
    for(let i = 0; i < handrail.length; i++){
        lsCubes.push(new THREE.Box3().setFromObject(handrail[i]));
    }

    stairs[0].position.set(0.5*widthIsOdd, 0, -0.5-width/2);
    for(let i = 0; i < 11; i++){
        lsStairs.push(new THREE.Box3().setFromObject(stairs[i]));
    }
    lsStairs.splice(-11+lsStairs.length, 1);
    scene.add(stairs[0].clone());
    for(let i = 0; i < handrail.length; i++){
        lsCubes.push(new THREE.Box3().setFromObject(handrail[i]));
    }
}

function createArea1(lsCubes, lsKeys, scene, sceneDrag, cubesPositionLsCubes, keys, soundPutObject, loadingManager){
    let floorTexture = 'floorGrey';
    let floorColor = 'White';
    let wallTexture = 'bricksGrey';
    let wallColor = 'DarkGray';

    createSolid(12+2*width, -4.75, 0, 2+3*width, 0.5, 2+width, lsCubes, scene, floorTexture, floorColor, loadingManager);
    createSolid(12+2*width, -4, -0.5-width/2, 3*width, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(12+2*width, -4, 0.5+width/2, 3*width, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(12.5+3.5*width, -4, -1.5-width/4-widthIsOdd/4, 1, 1, width/2-widthIsOdd/2-1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(11.5+width/2, -4, -1.5-width/4-widthIsOdd/4, 1, 1, width/2-widthIsOdd/2-1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(12.5+3.5*width, -4, 1.5+width/4-widthIsOdd/4, 1, 1, width/2+widthIsOdd/2-1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(11.5+width/2, -4, 1.5+width/4-widthIsOdd/4, 1, 1, width/2+widthIsOdd/2-1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(14+3.5*width, -4, 1.5-widthIsOdd/2, 4, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(14+3.5*width, -4, -1.5-widthIsOdd/2, 4, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);

    insertObjectsArea1(lsCubes, sceneDrag, cubesPositionLsCubes, [12+2*width, -4.75, 0], 6, soundPutObject, loadingManager);

    createSolid(21+3.5*width+widthIsOdd/2, -4.75, 0, 10+widthIsOdd, 0.5, 10+widthIsOdd, lsCubes, scene, floorTexture, floorColor, loadingManager);
    createSolid(20.5+3.5*width+widthIsOdd/2, -4, -4.5-widthIsOdd/2, 9+widthIsOdd, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(21.5+3.5*width+widthIsOdd/2, -4, 4.5+widthIsOdd/2, 9+widthIsOdd, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(25.5+3.5*width+widthIsOdd, -4, -0.5, 1, 1, 9+widthIsOdd, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(16.5+3.5*width, -4, -2.5-widthIsOdd/2, 1, 1, 3, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(16.5+3.5*width, -4, 3, 1, 1, 4+widthIsOdd, lsCubes, scene, wallTexture, wallColor, loadingManager);

    key.material = new THREE.MeshPhongMaterial({color: 'MediumBlue', shininess: '10', specular: 'rgb(255, 255, 255)'});
    key.position.set(21+3.5*width+widthIsOdd/2, -4, 0);
    keys.push([key.clone(), false]);
    scene.add(keys[keys.length-1][0]);
    createCollider(21+3.5*width+widthIsOdd/2, -4, 0, 3, 1, 3, lsKeys);
}

function createArea2(lsCubes, lsKeys, scene, sceneDrag, cubesPositionLsCubes, keys, doors, doorsPositionLsCubes, elevatedCubes, soundPutObject, loadingManager){
    let floorTexture = 'floorBlue';
    let floorColor = 'DodgerBlue';
    let wallTexture = 'bricksBlue';
    let wallColor = 'Navy';

    createSolid(-12-2*width, 4.25, 0, 2+3*width, 0.5, 2+width, lsCubes, scene, floorTexture, floorColor, loadingManager);
    createSolid(-12-2*width, 5, -0.5-width/2, 3*width, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-12-2*width, 5, 0.5+width/2, 3*width, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-11.5-width/2, 5, -1.5-width/4-0.25*widthIsOdd, 1, 1, width/2-widthIsOdd/2-1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-12.5-3.5*width, 5, -1.5-width/4-0.25*widthIsOdd, 1, 1, width/2-widthIsOdd/2-1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-11.5-width/2, 5, 1.5+width/4-widthIsOdd/4, 1, 1, width/2+widthIsOdd/2-1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-12.5-3.5*width, 5, 1.5+width/4-widthIsOdd/4, 1, 1, width/2+widthIsOdd/2-1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    

    doorAndPortal[0].rotateY(THREE.MathUtils.degToRad(90));
    doorAndPortal[1].rotateY(THREE.MathUtils.degToRad(90));
    portalCollider[0].rotateY(THREE.MathUtils.degToRad(90));


    doorAndPortal[0].position.set(-12.5-3.5*width, 4.5, -widthIsOdd/2);
    doorAndPortal[1].position.set(-12.5-3.5*width, 4.5, -widthIsOdd/2);
    portalCollider[0].position.set(doorAndPortal[1].position.x, 0.5+doorAndPortal[1].position.y, 1.5+doorAndPortal[1].position.z);
    for(let i = 0; i < 4; i++)
        lsCubes.push(new THREE.Box3().setFromObject(portalCollider[i]));
    lsCubes.splice(-4+lsCubes.length, 1);
    doors.push(doorAndPortal[0].clone())
    scene.add(doors[doors.length-1]);
    scene.add(doorAndPortal[1].clone());
    lsCubes.push(new THREE.Box3().setFromObject(doorAndPortal[0]));
    doorsPositionLsCubes.push(lsCubes.length-1);
    
    actionableCube.position.set(doorAndPortal[0].position.x+6, doorAndPortal[0].position.y+1.45, doorAndPortal[0].position.z+widthIsOdd-2.5);

    for(let i = 0; i < 3; i++){
        elevatedCubes.push([actionableCube.clone(), , 2]);
        elevatedCubes[i][0].translateZ(2*i);
        elevatedCubes[i][0].material = new THREE.MeshLambertMaterial({color: 'rgb(255, 0, 0)'});
        lsCubes.push(new THREE.Box3().setFromObject(elevatedCubes[i][0]));
        elevatedCubes[i][1] = lsCubes.length-1;
        scene.add(elevatedCubes[i][0]);
    }

    insertObjectsArea2(lsCubes, sceneDrag, cubesPositionLsCubes, [-12-2*width, 4.25, 0, 2+3*width], 3, [[elevatedCubes[0][0].position.x, elevatedCubes[0][0].position.z], [elevatedCubes[1][0].position.x, elevatedCubes[1][0].position.z], [elevatedCubes[2][0].position.x, elevatedCubes[2][0].position.z]], soundPutObject, loadingManager);
    
    createSolid(-18-3.5*width+widthIsOdd/2, 4.25, 0, 10+widthIsOdd, 0.5, 10+widthIsOdd, lsCubes, scene, floorTexture, floorColor, loadingManager);
    createSolid(-18-3.5*width+widthIsOdd/2, 5, -4.5-widthIsOdd/2, 10+widthIsOdd, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-18-3.5*width+widthIsOdd/2, 5, 4.5+widthIsOdd/2, 10+widthIsOdd, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-22.5-3.5*width, 5, 0, 1, 1, 8+widthIsOdd, lsCubes, scene, wallTexture, wallColor, loadingManager);
    
    key.material = new THREE.MeshPhongMaterial({color: 'Firebrick', shininess: '10', specular: 'rgb(255, 255, 255)'});
    key.position.set(-17.5-3.5*width-widthIsOdd/2, 5, 0);
    keys.push([key.clone(), false]);
    scene.add(keys[keys.length-1][0]);
    createCollider(-17.5-3.5*width-widthIsOdd/2, 5, 0, 3, 1, 3, lsKeys);

    doorAndPortal[0].rotation.y = 0;
    doorAndPortal[1].rotation.y = 0;
    portalCollider[0].rotation.y = 0
}

function createArea3(lsCubes, lsKeys, interruptors, scene, sceneDrag, cubesPositionLsCubes, keys, doors, doorsPositionLsCubes, elevatedCubes, lights, dragCubesArea3, soundPutObject, loadingManager){    
    let floorTexture = 'floorRed';
    let floorColor = 'Firebrick';
    let wallTexture = 'bricksRed';
    let wallColor = 'Brown';
    
    createSolid(0, -4.75, 12+2*width, 2+width, 0.5, 2+3*width, lsCubes, scene, floorTexture, floorColor, loadingManager);
    createSolid(0.5+width/2, -4, 12+2*width, 1, 1, 3*width, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-0.5-width/2, -4, 12+2*width, 1, 1, 3*width, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-1.5-width/4+widthIsOdd/4, -4, 11.5+width/2, -1+width/2+widthIsOdd/2, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-1.5-width/4+widthIsOdd/4, -4, 12.5+3.5*width, -1+width/2+widthIsOdd/2, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(1.5+width/4+widthIsOdd/4, -4, 11.5+width/2, width/2-widthIsOdd/2-1, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(1.5+width/4+widthIsOdd/4, -4, 12.5+3.5*width, width/2-widthIsOdd/2-1, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);

    insertObjectsArea3(lsCubes, interruptors, elevatedCubes, lights, scene, sceneDrag, cubesPositionLsCubes, [0, -4.75, 12+2*width], dragCubesArea3, soundPutObject, loadingManager);

    doorAndPortal[0].position.set(widthIsOdd/2, -4.5, 12.5+3.5*width);
    doorAndPortal[1].position.set(widthIsOdd/2, -4.5, 12.5+3.5*width);
    portalCollider[0].position.set(-1.5+doorAndPortal[1].position.x, 0.5+doorAndPortal[1].position.y, doorAndPortal[1].position.z);
    for(let i = 0; i < 4; i++)
        lsCubes.push(new THREE.Box3().setFromObject(portalCollider[i]));
    lsCubes.splice(-4+lsCubes.length, 1);
    doors.push(doorAndPortal[0].clone())
    scene.add(doors[doors.length-1]);
    scene.add(doorAndPortal[1].clone());
    lsCubes.push(new THREE.Box3().setFromObject(doorAndPortal[0]));
    doorsPositionLsCubes.push(lsCubes.length-1);

    createSolid(0, -4.75, 18+3.5*width+widthIsOdd/2, 10+widthIsOdd, 0.5, 10+widthIsOdd, lsCubes, scene, floorTexture, floorColor, loadingManager);
    createSolid(4.5+widthIsOdd/2, -4, 18+3.5*width+widthIsOdd/2, 1, 1, 10+widthIsOdd, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-4.5-widthIsOdd/2, -4, 18+3.5*width+widthIsOdd/2, 1, 1, 10+widthIsOdd, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(0, -4, 22.5+3.5*width+widthIsOdd, 8+widthIsOdd, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    
    key.material = new THREE.MeshPhongMaterial({color: 'Gold', shininess: '10', specular: 'rgb(255, 255, 255)'});
    key.rotateY(THREE.MathUtils.degToRad(90));
    key.position.set(0, -4, 17.5+3.5*width+widthIsOdd/2);
    keys.push([key.clone(), false]);
    scene.add(keys[keys.length-1][0]);
    createCollider(0, -4, 17.5+3.5*width+widthIsOdd/2, 3, 1, 3, lsKeys);
    key.rotation.y = 0;
}

function createFinalArea(lsCubes, scene, plataformaFinal, loadingManager){
    let floorTexture = 'floorYellow';
    let floorColor = 'rgb(204, 173, 0)';
    let wallTexture = 'bricksYellow';
    let wallColor = 'Gold';

    let plataformaFinal_ = new THREE.Mesh(new THREE.BoxGeometry(3,0.25,3), new THREE.MeshPhongMaterial({color: 'Gold', shininess: '20', specular: 'rgb(255, 255, 255)', emissive: 'Yellow', emissiveIntensity: 0.3}));
    plataformaFinal_.position.set(0, 4.4, -width/2-11.5-4.5);
    plataformaFinal.push(new THREE.Box3().setFromObject(plataformaFinal_));
    plataformaFinal.push(plataformaFinal_);
    plataformaFinal_.receiveShadow = true;
    scene.add(plataformaFinal_);

    createSolid(0, 4.25, -16-width/2-widthIsOdd/2, 10+widthIsOdd, 0.5, 10+widthIsOdd, lsCubes, scene, floorTexture, floorColor, loadingManager);
    createSolid(4.5+widthIsOdd/2, 5, -15.5-width/2-widthIsOdd/2, 1, 1, 9+widthIsOdd, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-4.5-widthIsOdd/2, 5, -16.5-width/2-widthIsOdd/2, 1, 1, 9+widthIsOdd, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(0.5, 5, -20.5-width/2-widthIsOdd, 9+widthIsOdd, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(-3.5, 5, -11.5-width/2, 3+widthIsOdd, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
    createSolid(3+widthIsOdd/2, 5, -11.5-width/2, 2, 1, 1, lsCubes, scene, wallTexture, wallColor, loadingManager);
}

export function createScenery(lsCubes, lsKeys, lsStairs, interruptors, _width, scene, sceneDrag, cubesPositionLsCubes, keys, doors, doorsDetection, doorsPositionLsCubes, elevatedCubes, lights, dragCubesArea3, plataformaFinal, soundPutObject, loadingManager){
    width = _width;
    widthIsOdd = _width%2;
    doorAndPortal = T3Objects.createDoorAndPortal(loadingManager);
    createInitialArea(lsCubes, lsStairs, scene, doors, doorsDetection, doorsPositionLsCubes, loadingManager);
    createArea1(lsCubes, lsKeys, scene, sceneDrag, cubesPositionLsCubes, keys, soundPutObject, loadingManager);
    createArea2(lsCubes, lsKeys, scene, sceneDrag, cubesPositionLsCubes, keys, doors, doorsPositionLsCubes, elevatedCubes, soundPutObject, loadingManager);
    createArea3(lsCubes, lsKeys, interruptors, scene, sceneDrag, cubesPositionLsCubes, keys, doors, doorsPositionLsCubes, elevatedCubes, lights, dragCubesArea3, soundPutObject, loadingManager);
    createFinalArea(lsCubes, scene, plataformaFinal, loadingManager);

    let plane =  createGroundPlane(width*7 + 200,width*7 + 200, 1, 1, 'PapayaWhip');
    plane.receiveShadow = false;
    plane.rotateX(THREE.MathUtils.degToRad(90));
    plane.position.set(0,-6,0);
    scene.add(plane);
}