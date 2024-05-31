import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {grassTexture, bumpTexture} from './textures.js'


class Floor{
    constructor(floorRadius, moving_speed){
        let floorMaterial = new THREE.MeshPhongMaterial({
            map: grassTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.5, // Adjust the bump scale as needed
        });

        let floorShadow = new THREE.Mesh(new THREE.PlaneGeometry(floorRadius * 4, floorRadius * 2), new THREE.MeshPhongMaterial({
            color: 0x7abf8e,
            specular: 0x000000,
            shininess: 1,
            transparent: true,
            opacity: .5
        }));
        floorShadow.rotation.x = -Math.PI / 2;
        floorShadow.receiveShadow = true;

        let floorGrass = new THREE.Mesh(new THREE.PlaneGeometry(floorRadius * 4, floorRadius * 2), floorMaterial);
        floorGrass.rotation.x = -Math.PI / 2;
        floorGrass.receiveShadow = false;

        let floor = new THREE.Group();
        floor.position.y = 0;
        floor.position.x = 0;

        floor.add(floorShadow);
        floor.add(floorGrass);

        this.obj=floor

        this.moving_speed = moving_speed
        this.floorRadius=floorRadius
    }

    update(delta){
        let new_x_pos = this.obj.position.x - Math.floor(this.moving_speed * delta * 20)/2

        // reset position if floor is out of view
        if (new_x_pos < -this.floorRadius * 4){
            new_x_pos = this.floorRadius*4 - 1
        }
        this.obj.position.x = new_x_pos
    }
}

export {Floor}