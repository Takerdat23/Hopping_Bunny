
import * as THREE from 'three'
import * as dat from 'dat'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// import { Constraint } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { SlidingFloor } from './objects/floor.js';
import { MainCharacter } from './objects/main_character.js'

import { get_trap_animation } from './models.js';

import { SkyBox } from './sky.js';

THREE.ColorManagement.enabled = false; // TODO: Confirm correct color management.

noise.seed(Math.random());


class Game {
    constructor() {
        this.initParams()
        this.initScreenAnd3D()
        this.createObjects()

        // the game loop
        this.update()
    }
    initParams() {
        this.gui = new GUI()

        this.gui.close()

        this.state = "waiting"

        this.delta = 0;
        this.floorRadius = 200;

        this.cameraPosGame = 100;
        this.cameraPosGameOver = 260;
        this.monsterAcceleration = 0.004;
        this.malusClearColor = 0xb44b39;
        this.malusClearAlpha = 0;

        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;

        this.windowHalfX = this.WIDTH / 2;
        this.windowHalfY = this.HEIGHT / 2;


        this.aspectRatio = this.WIDTH / this.HEIGHT;
        this.fieldOfView = 50;
        this.nearPlane = 1;
        this.farPlane = 2500;

        this.mousePos = {
            x: 0,
            y: 0
        };


        this.autoDayNight = false

        this.whitespace_pressed = false

        document.addEventListener("keyup", this.onKeyUp.bind(this));
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        // document.addEventListener("mouseup", this.onWhitespaceDown.bind(this));
        // document.addEventListener("mousedown", this.onWhitespaceDown.bind(this));

        this.max_whitespace_pressed_time = 50 // 50ms
        this.min_whitespace_pressed_time = 10 // 10ms
        this.last_whitespace_pressed = 10
        // time since last onWhitespaceDown
        this.whitespace_pressed_time = 0

        this.trap_animation_mixer = undefined


        this.fieldDistance = document.getElementById("distValue");
        this.distance = 0

        this.max_speed = 500

    }

    update_distance_counter(delta) {
        this.distance += this.main_char.velocity.x * delta
        this.fieldDistance.innerText = Math.floor(this.distance / 4);
    }
    onKeyUp(e) {

        if (e.key == " " && this.state == "running") {
            this.whitespace_pressed = false
        }

        if (e.key == "r") {
            this.reset_game()
        }


    }
    onKeyDown(e) {
        if (this.state == "waiting") {
            this.start()
            return
        }

        if (e.key == " " && this.state == "running") {
            this.whitespace_pressed = true
        }
    }

    start() {
        if (this.state != "waiting") return

        this.state = "running"

        this.main_char.speed = 150
    }




    get_white_space_status(delta) {
        this.last_whitespace_pressed += delta
        this.whitespace_pressed_time += delta

        if (this.whitespace_pressed_time < this.min_whitespace_pressed_time) {
            return true
        }
        if (this.whitespace_pressed_time > this.max_whitespace_pressed_time) {
            return false
        }



    }
    initScreenAnd3D() {


        this.scene = new THREE.Scene();

        // Add exponential fog to the scene with a lower density for a more gradual effect
        this.scene.fog = new THREE.FogExp2(0xffffff, 0.0005); // Adjust the density value to make the fog more appropriate

        this.camera = new THREE.PerspectiveCamera(
            this.fieldOfView,
            this.aspectRatio,
            this.nearPlane,
            this.farPlane
        );

        this.camera.position.x = -110;
        this.camera.position.z = 95;
        this.camera.position.y = 25;
        this.camera.lookAt(new THREE.Vector3(0, 200, 0));

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // this.renderer.setClearColor(this.malusClearColor, this.malusClearAlpha);
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;



        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container = document.getElementById('world');
        this.container.appendChild(this.renderer.domElement);

        // remove later
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);


        this.gui.add(this.controls, 'enabled').name("OrbitControl")

        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);


        // // window.addEventListener('resize', handleWindowResize, false);
        // document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        // document.addEventListener("touchend", this.onMouseDown.bind(this), false);

        this.clock = new THREE.Clock();
    }

    onMouseDown(e) {
        // when the cursor is pressed on the canvas
        console.log(e)
    }

    createSky() {

        this.skyb = new SkyBox(this.scene.fog)

        this.scene.add(this.skyb.obj)

        var folder1 = this.gui.addFolder("sun");

        folder1.add(this.skyb.parameters, 'elevation', 0, 360, 0.1).onChange(
            this.skyb.updateSun.bind(this.skyb)
        )
        folder1.add(this.skyb.parameters, 'azimuth', - 180, 180, 0.1).onChange(
            this.skyb.updateSun.bind(this.skyb)
        )

        folder1.add(this, 'autoDayNight')

        // folder1.add(this.skyb.dirLight, 'visible').name("directional light")
        // folder1.add(this.skyb.globalLight, 'visible').name("ambient light")

        // folder1.add(this.skyb.hemiLight, 'visible').name("ambient light")

        folder1.open()

    }

    createObjects() {
        this.createSky()

        // create floor
        this.floor = new SlidingFloor(this.floorRadius)

        this.scene.add(this.floor.obj)



        this.main_char = new MainCharacter()
        
        this.floor.obj.add(this.main_char.obj)
        this.gui.add(this.main_char, 'speed', 0, 400)
    }

    check_main_character_collision() {
        let obstacles = this.floor.obj.getObjectsByProperty("is_obs", true)

        // console.log(obstacles)
        let mindistance = 9000

        for (let i = 0; i < obstacles.length; i++) {

            let ov = new THREE.Vector3()
            let cv = new THREE.Vector3()

            obstacles[i].getWorldPosition(ov)
            this.main_char.obj.getWorldPosition(cv)


            // console.log(cv)

            let distance = cv.distanceTo(ov)

            obstacles[i].rotation.y += 0.01


            if (distance < 4) {
                // console.log(distance)
                this.main_char.die()

                obstacles[i].is_obs = false
                obstacles[i].position.set(0, 5, 0)
                obstacles[i].rotation.set(0, 5, 0)

                this.trap_animation_mixer = new THREE.AnimationMixer(obstacles[i]);
                let animation = this.trap_animation_mixer.clipAction(get_trap_animation())
                animation.setLoop(THREE.LoopOnce);
                animation.clampWhenFinished = true;
                animation.enabled = true;
                animation.play();

                // console.log(obstacles[i])
                // obstacles[i].rotation.y+=Math.PI/2

                obstacles[i].parent.remove(obstacles[i])

                this.main_char.obj.add(obstacles[i])

            }

            if (distance < mindistance) {
                mindistance = distance
            }



        }
        // console.log(mindistance)
    }

    reset_game() {
        this.state = "waiting"
        this.floor.reset()
        this.main_char.reset()
        this.distance = 0
    }

    update() {
        let delta = this.clock.getDelta();
        if (this.state == "running") {
            this.main_char.speed += delta * 4

            if (this.main_char.speed > this.max_speed) this.main_char.speed = this.max_speed
        }
        // the game loop

        this.controls.update();

        let speed = this.main_char.velocity.x

        this.floor.update(delta, speed)

        let terrain_height = this.floor.get_height(0, 0)

        // console.log(terrain_height)

        this.main_char.update(delta, terrain_height, this.whitespace_pressed)

        if (this.autoDayNight) {

            this.skyb.parameters["elevation"] = (this.skyb.parameters["elevation"] + 0.1) % 360
            this.skyb.updateSun()

        }

        this.check_main_character_collision()
        if (this.trap_animation_mixer) { this.trap_animation_mixer.update(delta); }
        // console.log(this.whitespace_pressed)
        // this.floor.floors[0].elevate_objects()
        // this.test()

        this.update_distance_counter(delta)
        this.renderer.renderLists.dispose()
        this.stats.update()
        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.update.bind(this))
    }


    test() {
        let objs_holder = this.floor.floors[0].objs_holder
        let floor = this.floor.floors[0]
        console.log(objs_holder.children.length)


        for (var i = objs_holder.children.length - 1; i >= 0; i--) {
            let obj = objs_holder.children[i];

            obj.visible = false

            let { x, y, z } = obj.getWorldPosition(new THREE.Vector3())

            let dir = new THREE.Vector3(0, -1, 0);
            dir.normalize();

            let h = floor.get_height(x, z)

            let origin = new THREE.Vector3(x, y, z);

            let arrowHelper = new THREE.ArrowHelper(dir, origin, -h, 0xffff00);

            this.scene.add(arrowHelper)

            // console.log(x, y, z, h)

            // if (h != undefined) {
            //     console.log(h)
            //     obj.position.y += h
            // }

        }
    }

}

let g = new Game()