
import * as THREE from 'three'
import * as dat from 'dat'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { Constraint } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from 'tween'

import { Sky } from 'three/addons/objects/Sky.js';

import { SlidingFloor } from './objects/floor.js';
import { Hero } from './objects/hero.js'

import { get_polygon_tree_pack } from './models.js';

import { SkyBox } from './sky.js';

THREE.ColorManagement.enabled = false; // TODO: Confirm correct color management.

class Game {
    constructor() {
        this.initParams()
        this.initScreenAnd3D()
        this.createObjects()

        // the game loop
        this.update()
    }
    initParams() {
        this.gui = new dat.GUI()

        this.delta = 0;
        this.floorRadius = 200;
        this.speed = 10;
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
        this.cameraPosGame = 200;
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
        this.farPlane = 10000;

        this.mousePos = {
            x: 0,
            y: 0
        };

        this.gui.add(this, 'speed', 0, 100)

    }
    initScreenAnd3D() {


        this.scene = new THREE.Scene();

        // Add exponential fog to the scene with a lower density for a more gradual effect
        this.scene.fog = new THREE.FogExp2(0xffffff, 0.001); // Adjust the density value to make the fog more appropriate

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

        // this.renderer.setClearColor(this.malusClearColor, this.malusClearAlpha);
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;



        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.shadowMap.enabled = true;

        this.container = document.getElementById('world');
        this.container.appendChild(this.renderer.domElement);

        // remove later
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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

    createSky() {

        this.skyb = new SkyBox()

        this.scene.add(this.skyb.obj)

        var folder1 = this.gui.addFolder("sun");

        folder1.add(this.skyb.parameters, 'elevation', 0, 90, 0.1).onChange(
            this.skyb.updateSun.bind(this.skyb)
        )
        folder1.add(this.skyb.parameters, 'azimuth', - 180, 180, 0.1).onChange(
            this.skyb.updateSun.bind(this.skyb)
        )

        folder1.open()

    }

    createObjects() {
        this.createSky()

        // create floor
        this.floor = new SlidingFloor(this.floorRadius)

        this.scene.add(this.floor.obj)

        this.hero = new Hero()
        this.floor.obj.add(this.hero.obj)


    }

    update() {
        let delta = this.clock.getDelta();
        // the game loop
        this.renderer.render(this.scene, this.camera)

        this.controls.update();


        this.floor.update(delta, this.speed)

        // update hero position on the floor
        // hero has a fix position of x=0 and z=0
        // y is the height
        // this.hero.obj.position.y=100

        let terrain_height = this.floor.get_height(0, 0)
        // console.log(height);
        // this.hero.obj.position.y=terrain_height + 1

        this.hero.update(delta, this.speed, terrain_height)

        requestAnimationFrame(this.update.bind(this))
    }

}

let g = new Game()