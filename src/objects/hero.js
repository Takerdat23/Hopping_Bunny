import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import * as TWEEN from 'tween'

import { HeroModel } from '../models.js';
const perlin = new ImprovedNoise();

class Hero {
    constructor() {
        this.state = ""
        this.obj = new THREE.Group();

        let h_scene = HeroModel.scene
        let animations = HeroModel.animations


        this.obj.add(h_scene)


        h_scene.scale.set(0.3, 0.3, 0.3)


        h_scene.rotation.y = Math.PI / 2


        this.mixer = new THREE.AnimationMixer(h_scene);


        this.standing_animation = this.mixer.clipAction(
            animations[0]
        )
        this.walking_animation = this.mixer.clipAction(
            animations[1]
        )
        this.running_animation = this.mixer.clipAction(
            animations[2]
        )



        this.running()

        this.obj.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;

            }
            // if (object.isMesh) { object.castShadow = true; }
        });
    }

    stop_animation() {
        switch (this.state) {
            case 'running':
                this.running_animation.stop()
                break;
            case 'walking':
                this.walking_animation.stop()
                break;
            case 'standing':
                this.standing_animation.stop()
                break;
        }
    }

    standing() {
        if (this.state == "standing") {
            return
        }
        this.stop_animation()
        this.standing_animation.play()
        this.state = "standing"
    }

    running() {
        if (this.state == "running") {
            return
        }
        this.stop_animation()
        this.running_animation.play()
        this.state = "running"
    }

    walking() {
        if (this.state == "walking") {
            return
        }
        this.stop_animation()
        this.walking_animation.play()
        this.state = "walking"
    }

    update(delta, speed, terrain_height) {
        // console.log(perlin.noise)
        let m_delta = speed * delta / 7

        let t = perlin.noise(m_delta, 1,Math.random()/1000)
        if (this.mixer) { this.mixer.update(t); }

        this.obj.position.y = terrain_height

        // this.obj.position.y += 0.1

    }

    get_loc() {
        let handVec = new THREE.Vector3()

        this.obj.getWorldPosition(handVec)
        return handVec
    }
}

export {
    Hero
}