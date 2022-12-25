import * as THREE from 'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';

export function addNewNaveArea2(x, y, z, lsCubes, sceneDrag, cubesPositionLsCubes, soundPutObject, loadingManager){
    let loaderNave = new GLTFLoader(loadingManager);
    loaderNave.load('./assets/nave.glb',
    function(gltf)
    {
        let object = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshLambertMaterial({opacity: 0, transparent: true}));
        let auxObject = gltf.scene;
        object.add(auxObject);
        auxObject.traverse(function (child){
            if(child){
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        object.position.set(x, y, z);
        let auxScale = new THREE.Box3().setFromObject(auxObject);
        auxObject.scale.set(1/(auxScale.max.x-auxScale.min.x), 1/(auxScale.max.y-auxScale.min.y), 1/(auxScale.max.z-auxScale.min.z));
        auxObject.position.y = -0.5
        lsCubes.push(new THREE.Box3().setFromObject(object));
        cubesPositionLsCubes.push([object, lsCubes.length-1]);
        sceneDrag.add(cubesPositionLsCubes[cubesPositionLsCubes.length-1][0]);
        loadSounds(soundPutObject, sceneDrag.children.length-1, 'soundPutObject.wav', false, object, 0.5, loadingManager);
    },
    function(xhr){
        console.log('nave ' + xhr.loaded/xhr.total*100 + '% carregado');
    },
    function(error){
	    console.log('Erro ao carregar o nave: ' + error);
    });
}

export function addNewDinoArea3(x, y, z, lsCubes, sceneDrag, cubesPositionLsCubes, dragCubes, positionDragCubes, lights, positionLights, soundPutObject, loadingManager){
    let loaderDino = new GLTFLoader(loadingManager);
    loaderDino.load('./assets/dino.glb',
    function(gltf)
    {
        let dragCube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshLambertMaterial({opacity: 0, transparent: true}));
        let auxDragCube = gltf.scene;
        dragCube.add(auxDragCube);
        auxDragCube.traverse(function (child){
            if(child){
                child.castShadow = true;
                //child.receiveShadow = true;
            }
        });
        dragCube.position.set(x, y, z);
        let auxScale = new THREE.Box3().setFromObject(auxDragCube);
        auxDragCube.scale.set(0.4/(auxScale.max.x-auxScale.min.x), 1/(auxScale.max.y-auxScale.min.y), 2/(auxScale.max.z-auxScale.min.z));
        lsCubes.push(new THREE.Box3().setFromObject(dragCube));
        cubesPositionLsCubes.push([dragCube, lsCubes.length-1]);
        sceneDrag.add(cubesPositionLsCubes[cubesPositionLsCubes.length-1][0]);
        dragCubes[positionDragCubes] = dragCube;
        dragCubes[positionDragCubes].visible = false;
        lights[positionLights] = [lights[positionLights][0], dragCube];
        loadSounds(soundPutObject, sceneDrag.children.length-1, 'soundPutObject.wav', false, dragCube, 0.5, loadingManager);
    },
    function(xhr){
        console.log('dino ' + xhr.loaded/xhr.total*100 + '% carregado');
    },
    function(error){
	    console.log('Erro ao carregar o dino: ' + error);
    });
}

export function loadTexture(textureName, loadingManager){
    let textureLoader = new THREE.TextureLoader(loadingManager);
    let texture = textureLoader.load('./assets/'+textureName+'.png');
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

export function lambertMaterialAndTexture(textureName, colorMaterial, xScale, yScale, zScale, loadingManager){
    let textureLoader = new THREE.TextureLoader(loadingManager);
    let material = [
        new THREE.MeshLambertMaterial({ color: colorMaterial, map: textureLoader.load('./assets/'+textureName+'.png')}), //right side
        new THREE.MeshLambertMaterial({ color: colorMaterial, map: textureLoader.load('./assets/'+textureName+'.png')}), //left side
        new THREE.MeshLambertMaterial({ color: colorMaterial, map: textureLoader.load('./assets/'+textureName+'.png')}), //top side
        new THREE.MeshLambertMaterial({ color: colorMaterial, map: textureLoader.load('./assets/'+textureName+'.png')}), //bottom side
        new THREE.MeshLambertMaterial({ color: colorMaterial, map: textureLoader.load('./assets/'+textureName+'.png')}), //front side
        new THREE.MeshLambertMaterial({ color: colorMaterial, map: textureLoader.load('./assets/'+textureName+'.png')}), //back side
    ];
    for(let i = 0; i < 6; i++){
        material[i].map.minFilter = THREE.LinearFilter;
        material[i].map.wrapS = THREE.RepeatWrapping;
        material[i].map.wrapT = THREE.RepeatWrapping;
    }
    material[0].map.repeat.set(zScale, yScale);
    material[1].map.repeat.set(zScale, yScale);
    material[2].map.repeat.set(xScale, zScale);
    material[3].map.repeat.set(xScale, zScale);
    material[4].map.repeat.set(xScale, yScale);
    material[5].map.repeat.set(xScale, yScale);
    return material;
}

export function loadSounds(sound, positionSound, soundName, isLoop, object, volume, loadingManager){
    let audioLoader = new THREE.AudioLoader(loadingManager);
    let listener = new THREE.AudioListener();
    sound[positionSound] = new THREE.Audio(listener);  
    audioLoader.load('./assets/'+soundName, function(buffer){
	    sound[positionSound].setBuffer(buffer);
	    sound[positionSound].setLoop(isLoop);
	    sound[positionSound].setVolume(volume);
    });
    object.add(listener);
}

export function loadSound(soundName, isLoop, object, volume, loadingManager){
    let audioLoader = new THREE.AudioLoader(loadingManager);
    let listener = new THREE.AudioListener();
    let sound = new THREE.Audio(listener);  
    audioLoader.load('./assets/'+soundName, function(buffer){
	    sound.setBuffer(buffer);
	    sound.setLoop(isLoop);
	    sound.setVolume(volume);
    });
    object.add(listener);
    return sound;
}