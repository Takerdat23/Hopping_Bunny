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

        h_scene.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;

            }
            // if (object.isMesh) { object.castShadow = true; }
        });


        this.velocity = {
            x: 0, 
            y: 0 
        }

        this.target_velocity = {
            x: 1, // run forward
            y: -20, // stay on the ground
        }
    }

    update_velocity(delta){

        let t = 0.7 * delta
        
        this.velocity.x = this.velocity.x * (1 - t) + this.target_velocity.x * t
        this.velocity.y = this.velocity.y * (1 - t) + this.target_velocity.y * t
    }

    update_target_velocity(terrain_height){
        if (terrain_height == undefined)return
        // y target_velocity should be 0 when character is on the ground
        if (this.obj.position.y - terrain_height < 0.01){
            this.target_velocity.y=0
        }else{
            this.target_velocity.y=-150
        }
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

    jump() {
        if (this.state == "jumping") {
            return
        }
        this.stop_animation()


    }

    update(delta, speed, terrain_height) {
        // console.log(perlin.noise)

        let m_delta = speed * delta / 8 * (Math.random()*0.6+0.7)

        if (speed < 8) {
            if (speed == 0) {
                this.standing()
                m_delta = delta
            } else {
                this.walking()
            }
        } else {
            this.running()
        }

        if (this.mixer) { this.mixer.update(m_delta); }


        this.update_target_velocity(terrain_height)
        this.update_velocity(delta)

        let vel_y = this.velocity.y

        this.obj.position.y += vel_y*delta

        if (this.obj.position.y < terrain_height) {
            this.obj.position.y = terrain_height
        }

        // if (terrain_height == undefined || this.state == "jumping") return

        // let vel = 0.5

        // this.obj.position.y -= vel


        // if (this.obj.position.y < terrain_height){
        //     this.obj.position.y = this.obj.position.y * 0.1 + terrain_height * 0.9
        // }else{
        //     this.obj.position.y = this.obj.position.y * 0.6 + terrain_height * 0.4
        // }
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