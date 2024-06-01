import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { grassTexture, bumpTexture } from '../textures.js'
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import { get_polygon_tree_pack } from '../models.js';





class Floor {
    constructor(floorRadius, width_multiplier = 4, height_multiplier = 3) {
        this.floorRadius = floorRadius
        this.width_multiplier = width_multiplier
        this.height_multiplier = height_multiplier


        this.widthSegments = 20
        this.heightSegments = 10

        // let floorGeometry = new THREE.PlaneGeometry(floorRadius * 4, floorRadius * 4);
        let floorGeometry = new THREE.PlaneGeometry(floorRadius * width_multiplier, floorRadius * height_multiplier, this.widthSegments, this.heightSegments);

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

        floor.position.y = 0;
        floor.position.x = 0;
        floor.position.z = - floorRadius / 2;

        this.obj = floor

        this.objs_holder = new THREE.Group()
        
        this.obj.add(this.objs_holder)

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
            vertex.z += Math.random() *20-5;

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

    get_height(x, z, include_children=false) {
        // get height of plane
        // children are ignored
        var ray = new THREE.Raycaster();
        var rayPos = new THREE.Vector3();

        // Use y = 100 to ensure ray starts above terran
        let topy = 50

        rayPos.set(x, topy, z);
        var rayDir = new THREE.Vector3(0, -1, 0); // Ray points down

        // Set ray from pos, pointing down
        ray.set(rayPos, rayDir);

        // Check where it intersects terrain Mesh
        let intersect = ray.intersectObject(this.obj, include_children);

        if (intersect.length == 1) {

            let height = topy - intersect[0].distance

            return height
        }
        return undefined
    }

    populate_objects() {
        let tree = get_polygon_tree_pack()
        this.objs_holder.add(tree)

        let {x, y, z} = tree.getWorldPosition(new THREE.Vector3())

        let h = this.get_height(x, z)
        
        tree.position.y+=h
        

        tree.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;

            }
        });
    }

    clear_scene() {
        for (var i = this.objs_holder.children.length - 1; i >= 0; i--) {
            let obj = this.objs_holder.children[i];
            this.objs_holder.remove(obj);
        }
    }

}

class SlidingFloor {
    constructor(floorRadius, width_multiplier = 5, height_multiplier = 3) {
        this.floorRadius = floorRadius
        this.width_multiplier = width_multiplier
        this.height_multiplier = height_multiplier

        this.floor1 = new Floor(floorRadius, width_multiplier, height_multiplier)

        this.floor2 = new Floor(floorRadius, width_multiplier, height_multiplier)

        this.floor2.obj.position.x = this.floorRadius * width_multiplier

        this.obj = new THREE.Group();
        this.obj.add(this.floor1.obj)
        this.obj.add(this.floor2.obj)


        this.floor2.fuse(this.floor1)
    }
    update(delta, speed) {
        let new_x_pos1 = this.floor1.obj.position.x - speed * delta * 10
        let new_x_pos2 = this.floor2.obj.position.x - speed * delta * 10


        // reset position if floor is out of view
        if (new_x_pos1 <= -this.floorRadius * this.width_multiplier) {
            new_x_pos1 = new_x_pos2 + this.floorRadius * this.width_multiplier;
            this.floor1.regenerateFloor()


            this.floor1.fuse(this.floor2)

        }
        if (new_x_pos2 <= -this.floorRadius * this.width_multiplier) {
            new_x_pos2 = new_x_pos1 + this.floorRadius * this.width_multiplier;
            this.floor2.regenerateFloor()

            this.floor2.fuse(this.floor1)

        }

        this.floor1.obj.position.x = new_x_pos1
        this.floor2.obj.position.x = new_x_pos2
    }

    get_height(x, z) {

        let height = this.floor1.get_height(x, z)
        if (height == undefined) height = this.floor2.get_height(x, z)

        return height
    }
}

export { Floor, SlidingFloor }