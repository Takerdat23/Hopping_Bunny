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
    obj.position.set(0, 0, 0);

    // obj.rotation.x=Math.PI/2


    let box = new THREE.Box3().setFromObject(obj)
    
    let y = box.getSize(new THREE.Vector3()).y
    
    obj.position.y= y/2

    // let re = new THREE.Group()
    // re.add(obj)
    return obj
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
export { get_polygon_tree_pack, HeroModel, getCottage }