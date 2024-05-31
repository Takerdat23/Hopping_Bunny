import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



class Hero {
    constructor() {
        this.state = ""
        this.obj = new THREE.Group();

        let gltfLoader = new GLTFLoader();

        this.mixer = 0

        this.animations = []

        this.standing_animation_id = 0
        this.walking_animation_id = 1
        this.running_animation_id = 2


        gltfLoader.load("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF/Fox.gltf", (gltf) => {
            var ob = gltf.scene;
            ob.scale.y = 0.3;
            ob.scale.x = 0.3;
            ob.scale.z = 0.3;
            ob.rotation.y = Math.PI / 2

            this.mixer = new THREE.AnimationMixer(gltf.scene);

            this.standing_animation = this.mixer.clipAction(
                gltf.animations[0]
            )
            this.walking_animation = this.mixer.clipAction(
                gltf.animations[1]
            )
            this.running_animation = this.mixer.clipAction(
                gltf.animations[2]
            )

            this.obj.add(ob);

            gltf.scene.traverse(function (node) {

                if (node.isMesh) { node.castShadow = true; }

            });

            this.walking()


        });


        this.obj.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
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

    update(delta) {
        if (this.mixer) { this.mixer.update(delta); }
    }
}

export {
    Hero
}