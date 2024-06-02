import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let colors = [
    0x100707,
    0xb44b39,
    0x7abf8e,
    0xdc5f45,
    0xe07a57,
    0xa49789,
]

// Materials
var blackMat = new THREE.MeshPhongMaterial({
  color: 0x100707,
  flatShading: true,
});

var brownMat = new THREE.MeshPhongMaterial({
  color: 0xb44b39,
  shininess: 0,
  flatShading: true,
});

var greenMat = new THREE.MeshPhongMaterial({
  color: 0x7abf8e,
  shininess: 0,
  flatShading: true,
});

var pinkMat = new THREE.MeshPhongMaterial({
  color: 0xdc5f45,//0xb43b29,//0xff5b49,
  shininess: 0,
  flatShading: true,
});

var lightBrownMat = new THREE.MeshPhongMaterial({
  color: 0xe07a57,
  flatShading: true,
});

var whiteMat = new THREE.MeshPhongMaterial({
  color: 0xa49789,
  flatShading: true,
});
var skinMat = new THREE.MeshPhongMaterial({
  color: 0xff9ea5,
  flatShading: true
});