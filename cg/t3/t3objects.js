import * as THREE from 'three';
import {CSG} from '../libs/other/CSGMesh.js';
import {createGroundPlane} from "../libs/util/util.js";
import * as T3Assets from './t3assets.js';

export function createDoorAndPortal(loadingManager){
    let portal = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 1));
    portal.translateY(3);
    portal.updateMatrix();

    let portalSubtraction = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 1));
    portalSubtraction.translateY(2);
    portalSubtraction.updateMatrix();
    let portalCSG = CSG.fromMesh(portal);
    let portalSubtractionCSG = CSG.fromMesh(portalSubtraction);
    portalCSG = portalCSG.subtract(portalSubtractionCSG);

    portalSubtraction = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32));
    portalSubtraction.translateY(4);
    portalSubtraction.rotateX(THREE.MathUtils.degToRad(90));
    portalSubtraction.updateMatrix();
    portalSubtractionCSG = CSG.fromMesh(portalSubtraction);
    portalCSG = portalCSG.subtract(portalSubtractionCSG);

    portal = CSG.toMesh(portalCSG, new THREE.Matrix4());
    portal.material = new THREE.MeshLambertMaterial({color: 'rgb(105, 105, 105)', map: T3Assets.loadTexture('bricksGrey', loadingManager)});
    portal.material.map.wrapS = THREE.RepeatWrapping;
    portal.material.map.wrapT = THREE.RepeatWrapping;
    portal.material.map.repeat.set(4, 6);
    portal.castShadow = true;
    portal.receiveShadow = true;
  
    let door = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 0.3));
    door.translateY(2);
    door.updateMatrix();
  
    let doorAddition = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.3, 32));
    doorAddition.translateY(4);
    doorAddition.rotateX(THREE.MathUtils.degToRad(90));
    doorAddition.updateMatrix();
  
    let doorSubtraction = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 32));
    doorSubtraction.position.set(-0.8, 2.1, 0.2);
    doorSubtraction.updateMatrix();
  
    let doorCSG = CSG.fromMesh(door);
    let doorAdditionCSG = CSG.fromMesh(doorAddition);
    let doorSubtractionCSG = CSG.fromMesh(doorSubtraction);
  
    doorCSG = doorCSG.union(doorAdditionCSG);
  
    doorCSG = doorCSG.subtract(doorSubtractionCSG);
    for(let i = 0; i < 4; i++){
        doorSubtraction.translateX(0.4);
        doorSubtraction.updateMatrix();
        doorSubtractionCSG = CSG.fromMesh(doorSubtraction);
        doorCSG = doorCSG.subtract(doorSubtractionCSG);
    }
    doorSubtraction.translateZ(-0.4);
    doorSubtraction.updateMatrix();
    doorSubtractionCSG = CSG.fromMesh(doorSubtraction);
    doorCSG = doorCSG.subtract(doorSubtractionCSG);
    for(let i = 0; i < 4; i++){
        doorSubtraction.translateX(-0.4);
        doorSubtraction.updateMatrix();
        doorSubtractionCSG = CSG.fromMesh(doorSubtraction);
        doorCSG = doorCSG.subtract(doorSubtractionCSG);
    }
    
    doorAddition = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 0.1));
    doorAddition.position.set(0, 4, 0.15);
    doorAddition.updateMatrix();

    doorAdditionCSG = CSG.fromMesh(doorAddition);
    
    doorCSG = doorCSG.union(doorAdditionCSG);
    for(let i = 0; i < 3; i++){
        doorAddition.translateY(-1);
        doorAddition.updateMatrix();
        doorAdditionCSG = CSG.fromMesh(doorAddition);
        doorCSG = doorCSG.union(doorAdditionCSG);
    }
    doorAddition.translateZ(-0.3);
    doorAddition.updateMatrix();
    doorAdditionCSG = CSG.fromMesh(doorAddition);
    doorCSG = doorCSG.union(doorAdditionCSG);
    for(let i = 0; i < 3; i++){
        doorAddition.translateY(1);
        doorAddition.updateMatrix();
        doorAdditionCSG = CSG.fromMesh(doorAddition);
        doorCSG = doorCSG.union(doorAdditionCSG);
    }
  
    doorCSG = doorCSG.subtract(portalCSG);
  
    door = CSG.toMesh(doorCSG, new THREE.Matrix4());
    door.material = new THREE.MeshPhongMaterial({color: 'rgb(139, 69, 19)', shininess: '200', specular: 'rgb(255, 255, 255)'});
    door.castShadow = true;
    door.receiveShadow = true;

    let doorAndPortal = [door, portal];
    return doorAndPortal;
}

export function createKey(){
    let points = [];
  
    for(let i = 0; i < 23; i++)
        points.push( new THREE.Vector2(Math.sin(i*6)*0.1+0.3,Math.cos(i*6)*0.1));
    points.push(points[0]);
  
    let key = new THREE.Mesh(new THREE.LatheGeometry(points, 30, 0, 2*Math.PI), new THREE.MeshPhongMaterial({color: 'rgb(255, 215, 0)', shininess: '50', specular: 'rgb(255,255,255)'}));
    key.rotateX(THREE.MathUtils.degToRad(90));
    key.position.set(0, 0.5, 0);
    key.updateMatrix();
  
    let keyAddition = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 32));
    keyAddition.rotateZ(THREE.MathUtils.degToRad(90));
    keyAddition.position.set(-1.05, 0.5, 0);
    keyAddition.updateMatrix();
  
    let keySubtraction = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08));
    keySubtraction.position.set(-1.47, 0.13, 0);
    keySubtraction.updateMatrix();
  
    let keyCSG = CSG.fromMesh(key);
    let keyAdditionCSG = CSG.fromMesh(keyAddition);
    let keySubtractionCSG = CSG.fromMesh(keySubtraction);
    keyCSG = keyCSG.union(keyAdditionCSG);
  
    keyAddition = new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 32));
    keyAddition.rotateZ(THREE.MathUtils.degToRad(90));
    keyAddition.position.set(-1.8, 0.5, 0);
    keyAddition.updateMatrix();
    keyAdditionCSG = CSG.fromMesh(keyAddition);
    keyCSG = keyCSG.union(keyAdditionCSG);
  
    keyAddition = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.08));
    keyAddition.position.set(-1.55, 0.25, 0);
    keyAddition.updateMatrix();
    keyAdditionCSG = CSG.fromMesh(keyAddition);
    keyCSG = keyCSG.union(keyAdditionCSG);
  
    points = [];
    for(let i = 0; i < 12; i++)
        points.push( new THREE.Vector2(Math.sin(i*12)*0.02+0.08,Math.cos(i*12)*0.02));
    points.push(points[0]);
  
    keyAddition = new THREE.Mesh(new THREE.LatheGeometry(points, 30, 0, 2*Math.PI), new THREE.MeshPhongMaterial({color: 'rgb(255, 215, 0)', shininess: '50', specular: 'rgb(255,255,255)'}));
    keyAddition.rotateZ(THREE.MathUtils.degToRad(90));
    keyAddition.position.set(-0.65, 0.5, 0);
    keyAddition.updateMatrix();
    keyAdditionCSG = CSG.fromMesh(keyAddition);
    keyCSG = keyCSG.union(keyAdditionCSG);
  
    keyAddition.position.set(-1.3, 0.5, 0);
    keyAddition.updateMatrix();
    keyAdditionCSG = CSG.fromMesh(keyAddition);
    keyCSG = keyCSG.union(keyAdditionCSG);
  
    keyCSG = keyCSG.subtract(keySubtractionCSG);
  
    keySubtraction.position.set(-1.63, 0.13, 0);
    keySubtraction.updateMatrix();
    keySubtractionCSG = CSG.fromMesh(keySubtraction);
    keyCSG = keyCSG.subtract(keySubtractionCSG);
  
    keySubtraction = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.08));
    keySubtraction.position.set(-1.76, 0.17, 0);
    keySubtraction.updateMatrix();
    keySubtractionCSG = CSG.fromMesh(keySubtraction);
    keyCSG = keyCSG.subtract(keySubtractionCSG);
  
    keySubtraction.position.set(-1.34, 0.17, 0);
    keySubtraction.updateMatrix();
    keySubtractionCSG = CSG.fromMesh(keySubtraction);
    keyCSG = keyCSG.subtract(keySubtractionCSG);
  
    keySubtraction = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08));
    keySubtraction.position.set(-1.71, 0.31, 0);
    keySubtraction.updateMatrix();
    keySubtractionCSG = CSG.fromMesh(keySubtraction);
    keyCSG = keyCSG.subtract(keySubtractionCSG);
  
    keySubtraction.position.set(-1.39, 0.31, 0);
    keySubtraction.updateMatrix();
    keySubtractionCSG = CSG.fromMesh(keySubtraction);
    keyCSG = keyCSG.subtract(keySubtractionCSG);
  
    key = CSG.toMesh(keyCSG, new THREE.Matrix4());
    key.castShadow = true;
    key.receiveShadow = true;
    return key;
}

export function createPortalCollider(){
    let portalCollider = [new THREE.Object3D()];
    portalCollider[0].visible = false;
    for(let i = 1; i < 4; i++){
        portalCollider.push(new THREE.Mesh(new THREE.BoxGeometry()));
        portalCollider[0].add(portalCollider[i]);
    }
    portalCollider[1].translateY(2.5);
    portalCollider[1].scale.y = 6;
    portalCollider[2].position.set(1.5, 5, 0);
    portalCollider[2].scale.x = 2;
    portalCollider[3].position.set(3, 2.5, 0);
    portalCollider[3].scale.y = 6;

    return portalCollider;
}

export function createStairs(loadingManager){
    let stairs = [new THREE.Object3D()];
    let stair = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 1), T3Assets.lambertMaterialAndTexture('floorBrown', 'rgb(140,117,86)', 4, 0.5, 1, loadingManager));
    stair.receiveShadow = true;
    stair.position.set(0, -0.25*0.5, -1);
    for(let i = 0; i < 10; i++){
        stair.position.set(0, -0.25+i*0.5, -1-i);
        stairs.push(stair.clone());
        stairs[0].add(stairs[i+1]);
    }
    return stairs;
}