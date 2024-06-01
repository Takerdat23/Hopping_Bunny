import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { grassTexture, bumpTexture } from '../textures.js'
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import { get_polygon_tree_pack, getCottage } from '../models.js';

import { create_tree, create_forest } from './tree.js'

class Floor {
    constructor(floorRadius, width_multiplier = 4, height_multiplier = 3) {
        this.floorRadius = floorRadius
        this.width_multiplier = width_multiplier
        this.height_multiplier = height_multiplier


        this.widthSegments = 20
        this.heightSegments = 20

        this.floorWidth = floorRadius * width_multiplier
        this.floorHeight = floorRadius * height_multiplier

        // let floorGeometry = new THREE.PlaneGeometry(floorRadius * 4, floorRadius * 4);
        let floorGeometry = new THREE.PlaneGeometry(this.floorWidth, this.floorHeight, this.widthSegments, this.heightSegments);

        this.original_pos = floorGeometry.attributes.position.clone()

        this.floorGeometry = floorGeometry


        let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({
            color: 0x7abf8e,
            // specular: 0x000000,
            // shininess: 1,
            // transparent: true,
            // opacity: .5
            flatShading: true
        }));

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


        this.regenerateFloor()
    }

    regenerateFloor() {
        this.clear_scene()
        let position = this.original_pos.clone()


        // vertex displacement

        let vertex = new THREE.Vector3();

        for (let i = 0, l = position.count; i < l; i++) {

            vertex.fromBufferAttribute(position, i);

            vertex.x += Math.random() * 20 - 10;
            vertex.y += Math.random() * 20 - 10;
            vertex.z += Math.random() * 16 - 8;

            position.setXYZ(i, vertex.x, vertex.y, vertex.z);

        }

        this.floorGeometry.attributes.position = position

        this.populate_objects()
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

            vertex.z = other_vertex.z;
            vertex.y = other_vertex.y;
            vertex.x = other_vertex.x - this.width_multiplier * this.floorRadius;
            position.setXYZ(pos_id, vertex.x, vertex.y, vertex.z);

        }
    }

    get_height(x, z, include_children = false) {
        // get height of plane
        // children are ignored
        var ray = new THREE.Raycaster();
        var rayPos = new THREE.Vector3();

        // Use y = 100 to ensure ray starts above terran
        let topy = 150

        rayPos.set(x, topy, z);
        var rayDir = new THREE.Vector3(0, -1, 0); // Ray points down

        // Set ray from pos, pointing down
        ray.set(rayPos, rayDir);

        // Check where it intersects terrain Mesh
        let intersect = ray.intersectObject(this.floor, include_children);


        if (intersect.length == 1) {
            // console.log(intersect)

            let height = topy - intersect[0].distance

            return height
        }
        return undefined
    }

    populate_objects() {
        // let cot = getCottage()
        // this.objs_holder.add(cot)

        // cot.rotation.x=Math.PI/2
        // cot.position.x=0
        // cot.position.z=0
        // cot.position.y=100

        // let tree = create_tree()
        // this.objs_holder.add(tree)

        // console.log(tree.position)

        create_forest(
            50, this.floorWidth, this.floorHeight,this.offset, this.objs_holder
        )


        // // TODO: fix this function
        this.elevate_objects()

        // this.objs_holder.traverse(function (object) {
        //     if (object instanceof THREE.Mesh) {
        //         object.castShadow = true;
        //         object.receiveShadow = true;

        //     }
        // });
    }

    elevate_objects() {
        for (var i = this.objs_holder.children.length - 1; i >= 0; i--) {
            let obj = this.objs_holder.children[i];

            let { x, y, z } = obj.getWorldPosition(new THREE.Vector3())

            let h = this.get_height(x, z)

            if (h != undefined) {
                obj.position.y += h - 1
            }

        }
    }

    clear_scene() {
        for (var i = this.objs_holder.children.length - 1; i >= 0; i--) {
            let obj = this.objs_holder.children[i];
            this.objs_holder.remove(obj);
        }
    }

}

const rotate = (arr, count = 1) => {
    return [...arr.slice(count, arr.length), ...arr.slice(0, count)];
};

class SlidingFloor {
    constructor(floorRadius, width_multiplier = 4, height_multiplier = 4) {
        this.floorRadius = floorRadius
        this.width_multiplier = width_multiplier
        this.height_multiplier = height_multiplier

        this.obj = new THREE.Group();

        this.floors = []

        this.N = 5

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
            this.floors[i].obj.position.x = this.floors[i].obj.position.x - speed * delta * 10
        }

        // reset position if the first floor is out of view
        if (this.floors[0].obj.position.x < -this.floorRadius * this.width_multiplier) {
            this.floors[0].obj.position.x = this.floors[this.N - 1].obj.position.x + this.floorRadius * this.width_multiplier
            
            this.floors[0].fuse(this.floors[this.N - 1])

            // roll the array
            this.floors = rotate(this.floors, 1)

        }
    }

    get_height(x, z) {
        let height
        for (let i = 0; i < this.N; i++){
            height = this.floors[i].get_height(x, z)
            if (height != undefined)break
        }

        return height
    }
}

export { Floor, SlidingFloor }