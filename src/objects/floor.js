import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { grassTexture, bumpTexture } from '../textures.js'

import { get_polygon_tree_pack, getCottage } from '../models.js';

import { create_forest, update_forest } from './tree.js'
import { create_corttage } from './cottages.js';

import { create_traps } from './obstacles.js';

function disposeNode(node) {
    if (node instanceof THREE.Mesh) {
        if (node.geometry) {
            node.geometry.dispose();
        }

        if (node.material) {

            // if (node.material.map) node.material.map.dispose();
            // if (node.material.lightMap) node.material.lightMap.dispose();
            // if (node.material.bumpMap) node.material.bumpMap.dispose();
            // if (node.material.normalMap) node.material.normalMap.dispose();
            // if (node.material.specularMap) node.material.specularMap.dispose();
            // if (node.material.envMap) node.material.envMap.dispose();
            // if (node.material.alphaMap) node.material.alphaMap.dispose();
            // if (node.material.aoMap) node.material.aoMap.dispose();
            // if (node.material.displacementMap) node.material.displacementMap.dispose();
            // if (node.material.emissiveMap) node.material.emissiveMap.dispose();
            // if (node.material.gradientMap) node.material.gradientMap.dispose();
            // if (node.material.metalnessMap) node.material.metalnessMap.dispose();
            // if (node.material.roughnessMap) node.material.roughnessMap.dispose();

            node.material.dispose();   // disposes any programs associated with the material

        }
    }
}   // disposeNode

function disposeHierarchy(node, callback) {
    for (var i = node.children.length - 1; i >= 0; i--) {
        var child = node.children[i];
        disposeHierarchy(child, callback);
        callback(child);
    }
}


let fcolors = [
    0x100707,
    0xb44b39,
    0x7abf8e,
    0xdc5f45,
    0xe07a57,
    0xa49789,
]


class Floor {
    constructor(floorRadius, width_multiplier = 4, height_multiplier = 3) {
        this.floorRadius = floorRadius
        this.width_multiplier = width_multiplier
        this.height_multiplier = height_multiplier


        this.widthSegments = 40
        this.heightSegments = this.widthSegments

        this.floorWidth = floorRadius * width_multiplier
        this.floorHeight = floorRadius * height_multiplier

        // let floorGeometry = new THREE.PlaneGeometry(floorRadius * 4, floorRadius * 4);
        let floorGeometry = new THREE.PlaneGeometry(this.floorWidth, this.floorHeight, this.widthSegments, this.heightSegments);

        this.original_pos = floorGeometry.attributes.position.clone()

        this.floorGeometry = floorGeometry

        this.floorMat = new THREE.MeshPhongMaterial({
            color: 0x7abf8e,
            // specular: 0x000000,
            // shininess: 1,
            flatShading: true
        })

        let floor = new THREE.Mesh(floorGeometry, this.floorMat);

        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.castShadow = true;


        this.floor = floor

        this.obj = new THREE.Group()

        this.obj.add(floor)

        this.objs_holder = new THREE.Group()

        this.obj.add(this.objs_holder)

        this.offset = floorRadius
        this.obj.position.z -= this.offset

        this.elevate_objects_flag = false

        this.regenerateFloor()
    }

    regenerateFloor(delta = 0) {
        this.clear_scene()
        let ori_position = this.original_pos
        let position = this.floorGeometry.attributes.position

        if (delta == 0) {
            delta = Math.random() * 10
        }

        // vertex displacement

        let vertex = new THREE.Vector3();

        for (let i = 0, l = position.count; i < l; i++) {

            vertex.fromBufferAttribute(ori_position, i);

            let x = vertex.x + Math.random() * 20 - 10;
            let y = vertex.y + Math.random() * 20 - 10;

            let r = 200
            let z = noise.simplex3(vertex.x / r, vertex.y / r, delta)

            z = z * 20

            position.setXYZ(i, x, y, z);

        }

        position.needsUpdate = true


        this.populate_objects()
        this.elevate_objects_flag = false
    }

    fuse(other_floor) {
        // assume the current plane is always to the right of the other plane
        let position = this.floorGeometry.attributes.position

        let other_position = other_floor.floorGeometry.attributes.position


        let vertex = new THREE.Vector3();
        let other_vertex = new THREE.Vector3();


        for (let i = 0; i <= this.heightSegments; i++) {
            // pos_id = i * (this.widthSegments + 1) + this.widthSegments

            let pos_id = i * (this.widthSegments + 1)
            let other_pos_id = i * (this.widthSegments + 1) + this.widthSegments

            vertex.fromBufferAttribute(position, pos_id);
            other_vertex.fromBufferAttribute(other_position, other_pos_id);

            let new_x = other_vertex.x - this.width_multiplier * this.floorRadius

            let new_y = (vertex.y + other_vertex.y) / 2
            let new_z = (vertex.z + other_vertex.z) / 2

            position.setXYZ(pos_id, new_x, new_y, new_z);
            other_position.setXYZ(other_pos_id, other_vertex.x, new_y, new_z);
        }

        position.needsUpdate = true
        other_position.needsUpdate = true
    }

    get_height(x, z, include_children = false) {
        // get height of plane
        // children are ignored
        var ray = new THREE.Raycaster();
        var rayPos = new THREE.Vector3();

        // Use y = 100 to ensure ray starts above terran
        let topy = 200

        rayPos.set(x, topy, z);
        var rayDir = new THREE.Vector3(0, -1, 0); // Ray points down
        rayDir.normalize()

        // Set ray from pos, pointing down
        ray.set(rayPos, rayDir);

        // Check where it intersects terrain Mesh
        let intersect = ray.intersectObject(this.floor);


        // if (intersect.length == 1) {
        //     // console.log(intersect)

        //     let height = topy - intersect[0].distance

        //     return height
        // }


        // console.log(intersect.length)
        // d
        let distance = topy * 2

        for (let i = 0; i < intersect.length; i++) {
            if (intersect[i].distance < distance) distance = intersect[i].distance
        }
        // console.log(distance)

        if (distance == topy * 2) return undefined


        return topy - distance
    }

    populate_objects() {

        let forest = create_forest(20, this.floorWidth, this.floorHeight, this.offset)
        forest.name = "forest"
        this.objs_holder.add(forest)

        if (Math.random() < 0.5) {

            let cot = create_corttage(
                this.floorWidth, this.floorHeight, this.offset
            )
            this.objs_holder.add(cot)
        }

        let traps = create_traps(
            this.floorWidth, this.floorHeight, this.offset
        )
        this.objs_holder.add(traps)

        // // TODO: fix this function
        // this.elevate_objects()

        this.objs_holder.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                // object.receiveShadow = true;

            }
        });
    }

    elevate_object(obj) {
        let { x, y, z } = obj.getWorldPosition(new THREE.Vector3())

        let h = this.get_height(x, z)
        // console.log(x, y, z, h)

        if (h != undefined) {
            obj.position.y += h
        }
    }

    elevate_objects() {
        if (this.elevate_objects_flag) return
        for (var i = this.objs_holder.children.length - 1; i >= 0; i--) {
            let obj = this.objs_holder.children[i];
            if (obj.name == "forest") continue
            this.elevate_object(obj)

        }
        // elevate the trees
        let forest = this.objs_holder.getObjectByName("forest")

        if (forest) forest.children.forEach((obj)=>{
            this.elevate_object(obj)
        })
        this.elevate_objects_flag = true
    }

    clear_scene() {
        for (var i = this.objs_holder.children.length - 1; i >= 0; i--) {
            let obj = this.objs_holder.children[i];

            this.objs_holder.remove(obj);

            // disposeHierarchy(obj, disposeNode);
            // new Promise((resolve, reject)=>{
            // })

        }
    }

    update(delta) {
        let forest = this.objs_holder.getObjectByName("forest")

        if (forest) update_forest(forest, delta)
    }

}

const rotate = (arr, count = 1) => {
    return [...arr.slice(count, arr.length), ...arr.slice(0, count)];
};

class SlidingFloor {
    constructor(floorRadius, width_multiplier = 3, height_multiplier = 4) {
        this.floorRadius = floorRadius
        this.width_multiplier = width_multiplier
        this.height_multiplier = height_multiplier

        this.obj = new THREE.Group();

        this.floors = []

        this.N = 4

        for (let i = 0; i < this.N; i++) {
            this.floors.push(new Floor(floorRadius, width_multiplier, height_multiplier))
            this.floors[i].obj.position.x = this.floorRadius * width_multiplier * i

            if (i != 0) {
                this.floors[i].fuse(this.floors[i - 1])
            }

            this.obj.add(this.floors[i].obj)
        }

        this.floors[0].fuse(this.floors[this.N - 1])

    }
    update(delta, speed) {

        for (let i = 0; i < this.N; i++) {
            this.floors[i].obj.position.x = this.floors[i].obj.position.x - speed * delta
            this.floors[i].elevate_objects()
        }

        // reset position if the first floor is out of view
        if (this.floors[0].obj.position.x < -this.floorRadius * this.width_multiplier) {

            this.floors[0].obj.position.x = this.floors[this.N - 1].obj.position.x + this.floorRadius * this.width_multiplier

            this.floors[0].regenerateFloor(delta)

            this.floors[0].fuse(this.floors[this.N - 1])

            // roll the array
            this.floors = rotate(this.floors, 1)
        }

        // only update animation on the first 3 floor
        for (let i = 0; i < 3; i++) {
            this.floors[i].update(delta)
        }
    }

    get_height(x, z) {
        let height
        for (let i = 0; i < this.N; i++) {
            height = this.floors[i].get_height(x, z)
            if (height != undefined) break
        }

        return height
    }
}

export { Floor, SlidingFloor }