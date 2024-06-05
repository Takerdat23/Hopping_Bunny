import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { get_trap } from '../models.js';




function create_traps(floorWidth, floorHeight, offset) {
    let limit = 0.08 * floorHeight
    let w = floorWidth * 0.9

    let trap = get_trap()

    trap.position.x = Math.random() * w - w / 2;

    let z = offset 

    trap.position.z = z

    trap.rotation.y = Math.random() * Math.PI / 2
    trap.position.y = 4

    // let ah2 = new THREE.AxesHelper( 1 );
    // trap.add(ah2)
    // trap.name = "trap"

    trap.is_obs = true


    return trap
}

export {
    create_traps
}