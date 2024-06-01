import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

let gltf = await gltfLoader.loadAsync("models/polygon_tree_pack/scene.gltf")

let models = gltf.scene.getObjectByName("GLTF_SceneRootNode");

function get_tree() {
    let obj = models.children[232].clone()
    // obj.position.x = 0
    // obj.position.y = 60
    // obj.position.z = -50

    obj.scale.set(10, 10, 10);

    return obj
}


let HeroModel = await gltfLoader.loadAsync("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF/Fox.gltf")

export { get_tree, HeroModel }