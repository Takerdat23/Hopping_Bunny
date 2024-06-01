import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {grassTexture, bumpTexture} from '../textures.js'


class Floor{
    constructor(floorRadius){
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
    }

}

class SlidingFloor{
    constructor(floorRadius){
        this.floorRadius = floorRadius

        this.floor1 = new Floor(floorRadius)

        this.floor2 = new Floor(floorRadius)
        this.floor2.obj.position.x = this.floorRadius * 4

        this.obj = new THREE.Group();
        this.obj.add(this.floor1.obj)
        this.obj.add(this.floor2.obj)
    }
    update(delta, speed){
        let new_x_pos1 = this.floor1.obj.position.x - speed * delta * 10
        let new_x_pos2 = this.floor2.obj.position.x - speed * delta * 10
        

        // reset position if floor is out of view
        if (new_x_pos1 <= -this.floorRadius * 4) {
            new_x_pos1 = new_x_pos2 + this.floorRadius * 4;
          }
          if (new_x_pos2 <= -this.floorRadius * 4) {
            new_x_pos2 = new_x_pos1 + this.floorRadius * 4;
          }

          this.floor1.obj.position.x= new_x_pos1
          this.floor2.obj.position.x= new_x_pos2
    }
}

export {Floor, SlidingFloor}