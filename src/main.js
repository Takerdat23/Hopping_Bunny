
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { Constraint } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Floor } from './floor.js';
import {Hero} from './characters/hero.js'

function Cone(r, h, rs, color) {
    let geometry = new THREE.ConeGeometry(r, h, rs);
    let material = new THREE.MeshPhongMaterial({ color: color });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true
    return mesh
}

class Game {
    constructor() {
        this.initParams()
        this.initScreenAnd3D()
        this.createObjects()

        // the game loop
        this.update()
    }
    initParams() {
        this.delta = 0;
        this.floorRadius = 200;
        this.moving_speed = 10;
        this.distance = 0;
        this.level = 1;
        this.levelInterval;
        this.levelUpdateFreq = 3000;
        this.initSpeed = 6;
        this.maxSpeed = 30;
        this.monsterPos = .65;
        this.monsterPosTarget = .65;
        this.floorRotation = 0;
        this.collisionObstacle = 10;
        this.collisionBonus = 20;
        this.gameStatus = "play";
        this.cameraPosGame = 160;
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
        this.farPlane = 2000;

        this.mousePos = {
            x: 0,
            y: 0
        };

    }
    initScreenAnd3D() {
        this.scene = new THREE.Scene();

        // Add exponential fog to the scene with a lower density for a more gradual effect
        this.scene.fog = new THREE.FogExp2(0xffffff, 0.0025); // Adjust the density value to make the fog more appropriate

        this.camera = new THREE.PerspectiveCamera(
            this.fieldOfView,
            this.aspectRatio,
            this.nearPlane,
            this.farPlane
        );

        this.camera.position.x = 0;
        this.camera.position.z = this.cameraPosGame;
        this.camera.position.y = 30;
        this.camera.lookAt(new THREE.Vector3(0, 30, 0));

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(this.malusClearColor, this.malusClearAlpha);

        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.shadowMap.enabled = true;

        this.container = document.getElementById('world');
        this.container.appendChild(this.renderer.domElement);

        // remove later
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.update();


        // // window.addEventListener('resize', handleWindowResize, false);
        // document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        // document.addEventListener("touchend", this.onMouseDown.bind(this), false);

        this.clock = new THREE.Clock();
    }

    onMouseDown(e) {
        // when the cursor is pressed on the canvas
        console.log(e)
    }

    createObjects(){
        this.createLights()

        // create floor
        this.floor1 = new Floor(this.floorRadius, this.moving_speed)
        this.floor1.obj.name="floor2"
        this.scene.add(this.floor1.obj)

        this.floor2 = new Floor(this.floorRadius, this.moving_speed)
        this.floor2.obj.position.x = this.floorRadius * 4
        this.floor2.obj.name="floor2"
        this.scene.add(this.floor2.obj)

        this.hero = new Hero()
        this.scene.add(this.hero.obj)
    }

    createLights() {
        this.globalLight = new THREE.AmbientLight(0xffffff, .9);

        let shadowLight = new THREE.DirectionalLight(0xffffff, 1);
        shadowLight.position.set(-30, 40, 20);
        shadowLight.castShadow = true;
        shadowLight.shadow.camera.left = -400;
        shadowLight.shadow.camera.right = 400;
        shadowLight.shadow.camera.top = 400;
        shadowLight.shadow.camera.bottom = -400;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 2000;
        shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;

        this.shadowLight = shadowLight
        this.scene.add(this.globalLight);
        this.scene.add(shadowLight);

    }

    update(){
        let delta = this.clock.getDelta();
        // the game loop
        this.renderer.render(this.scene, this.camera)

        this.controls.update();

        this.hero.update(delta)

        this.floor1.update(delta)
        this.floor2.update(delta)

        requestAnimationFrame(this.update.bind(this))
    }



}

let g = new Game()