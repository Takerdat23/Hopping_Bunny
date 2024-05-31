import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let TextureLoader = new THREE.TextureLoader();

let grassTexture = TextureLoader.load('./public/middle_grass.jpg');

let bumpTexture = TextureLoader.load('./public/middle_grass.jpg');


grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10); // Adjust the repeat values as needed

// Ensure the bump texture is repeatable
bumpTexture.wrapS = THREE.RepeatWrapping;
bumpTexture.wrapT = THREE.RepeatWrapping;
bumpTexture.repeat.set(10, 10);

export {
    grassTexture,
    bumpTexture
}