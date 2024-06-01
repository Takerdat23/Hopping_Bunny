import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

let polygon_tree_pack = await gltfLoader.loadAsync("models/polygon_tree_pack/scene.gltf")

let polygon_tree_pack_models = polygon_tree_pack.scene.getObjectByName("GLTF_SceneRootNode");

console.log(polygon_tree_pack_models.children.length)

function get_polygon_tree_pack(id=-1){
    // return random model if id = -1
    if (id == -1){
        id = Math.floor(Math.random() * polygon_tree_pack_models.children.length); 
    }

    let obj = polygon_tree_pack_models.children[id].clone()
    obj.scale.set(10, 10, 10);
    obj.rotation.x=Math.PI/2


    let box = new THREE.Box3().setFromObject(obj)
    
    let z = box.getSize(new THREE.Vector3()).z
    
    obj.position.z=z/2

    let re = new THREE.Group()
    re.add(obj)
    return re
}



let HeroModel = await gltfLoader.loadAsync("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF/Fox.gltf")


export { get_polygon_tree_pack, HeroModel }