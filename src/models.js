import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

function to_meshphong(model){
    model.traverse((child) => {
        if ( ! child.isMesh ) return;
      
        var prevMaterial = child.material;
      
        child.material = new THREE.MeshPhongMaterial();
      
        THREE.MeshBasicMaterial.prototype.copy.call( child.material, prevMaterial );
      
      });
}

function enable_shadow(scene){
    scene.traverse(function (child) {
        if (child.isMesh) {
            // child.material = material
            
            child.castShadow = true;
            
            child.receiveShadow = true;
            
        }
        
    });
}


let HeroModel = await gltfLoader.loadAsync("models/fox/Fox.gltf")
// to_meshphong(HeroModel.scene.children[1])

enable_shadow(HeroModel.scene)


let CottageModel = await gltfLoader.loadAsync("models/cottage/scene.gltf")

enable_shadow(CottageModel.scene)

function getCottage(){
    let obj = CottageModel.scene.clone()
    obj.scale.set(30,30, 30)

    return obj
}

let TrapModel = await gltfLoader.loadAsync("models/trap/scene.gltf")

function get_trap(){
    let obj = TrapModel.scene.clone()
    obj.scale.set(30,30, 30)

    
    return obj
}
function get_trap_animation(){
    return TrapModel.animations[0]
}
export { HeroModel, getCottage, get_trap,get_trap_animation }