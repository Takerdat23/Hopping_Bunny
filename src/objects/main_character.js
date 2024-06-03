import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import * as TWEEN from 'tween'

import { HeroModel } from '../models.js';
const perlin = new ImprovedNoise();

class MainCharacter {
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
            x: 150, // run forward
            y: -20, // stay on the ground
        }
        
        this.speed = 0
        this.running()

        // 300 ms
        this.max_jump_time = 100
        this.jump_time = this.max_jump_time
    }

    update_velocity(delta){

        let t = 7 * delta
        
        this.velocity.x = this.velocity.x * (1 - t) + this.target_velocity.x * t
        this.velocity.y = this.velocity.y * (1 - t) + this.target_velocity.y * t
    }

    update_target_velocity(terrain_height){
        // y target_velocity should be 0 when character is on the ground
        if (this.obj.position.y - terrain_height < 0.01 || terrain_height == undefined){
            this.target_velocity.y=0
            
            this.jump_time = this.max_jump_time
        }else{
            this.target_velocity.y=-300
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
        this.target_velocity.x = this.speed
        if (this.state == "standing") {
            return
        }
        this.stop_animation()
        this.standing_animation.play()
        this.state = "standing"
    }

    running() {
        this.target_velocity.x = this.speed
        if (this.state == "running") {
            return
        }
        this.stop_animation()
        this.running_animation.play()
        this.state = "running"
    }

    walking() {
        this.target_velocity.x = this.speed
        if (this.state == "walking") {
            return
        }
        this.stop_animation()
        this.walking_animation.play()
        this.state = "walking"
    }

    jump() {
        // if (this.state == "jumping") {
        //     return
        // }
        this.target_velocity.x = this.speed*4
        this.target_velocity.y = 1000
        // this.stop_animation()
        this.state = "jumping"
    }

    die(){
        this.state = "dead"
        this.stop_animation()
        this.obj.rotation.x=Math.PI/2

        this.obj.position.z=-10
        this.obj.position.y+=10
        this.velocity.x=0
        this.velocity.y=0
        this.target_velocity.x=0
        this.target_velocity.y=0
    }
    play_animation(){}
    update(delta, terrain_height, whitespace_pressed) {
        // console.log(whitespace_pressed)

        if (this.state == "dead"){
            return
        }

        let speed = this.velocity.x

        if (whitespace_pressed && this.jump_time>=0){
            // console.log(whitespace_pressed)
            this.jump()
            this.jump_time -= delta * 1000

            // console.log(this.jump_time)
        }else{

            if (speed < 180) {
                if (speed < 8) {
                    this.standing()
                } else {
                    this.walking()
                }
            } else {
                this.running()
            }
            this.update_target_velocity(terrain_height)
        }

        // console.log(this.speed)
        
        let animation_delta
        if (this.state != "standing"){

            // animation_delta = speed/80 * delta * (Math.random()*0.6+0.7)
            animation_delta = speed/80 * delta 
        }
        else{
            // animation_delta = delta * (Math.random()*0.6+0.7)
            animation_delta = delta
        }

        if (this.state == "jumping"){
            animation_delta = delta/80
        }

        
        
        if (this.mixer) { this.mixer.update(animation_delta); }
        
        
        this.update_velocity(delta)

        let vel_y = this.velocity.y

        this.obj.position.y += vel_y*delta

        if (this.obj.position.y < terrain_height) {
            this.obj.position.y = terrain_height
        }
        // console.log(this.obj.position.y, terrain_height)

    }

    get_loc() {
        let handVec = new THREE.Vector3()

        this.obj.getWorldPosition(handVec)
        return handVec
    }
}

export {
    MainCharacter
}