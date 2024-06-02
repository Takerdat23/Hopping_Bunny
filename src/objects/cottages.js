import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getCottage } from '../models.js';


function create_corttage(floorWidth, floorHeight, offset) {
    let limit = 0.08 * floorHeight
    let w = floorWidth * 0.9

    let cot = getCottage()

    cot.position.x = Math.random() * w - w / 2;

    let z
    do {
        z = Math.random() * floorHeight - floorHeight / 2;
    } while (-(z - offset) < limit)

    cot.position.z = z

    cot.rotation.y = Math.random() * Math.PI / 2

    return cot
}

export {
    create_corttage
}