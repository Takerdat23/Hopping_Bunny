
import * as THREE from 'three'
import * as dat from 'dat'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { Constraint } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from 'tween'
import Stats from 'three/addons/libs/stats.module.js';
import { Sky } from 'three/addons/objects/Sky.js';

import { SlidingFloor } from './objects/floor.js';
import { Hero } from './objects/hero.js'

import { get_polygon_tree_pack } from './models.js';

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
        this.gui = new dat.GUI()

        this.delta = 0;
        this.floorRadius = 200;
        this.speed = 0;
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
        this.farPlane = 2000;

        this.mousePos = {
            x: 0,
            y: 0
        };

        this.gui.add(this, 'speed', 0, 100)

        this.autoDayNight = false



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
        this.camera.lookAt(new THREE.Vector3(0, 100, 0));

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
        if (this.autoDayNight) {

            this.skyb.parameters["elevation"] = (this.skyb.parameters["elevation"] + 0.1) % 360
            this.skyb.updateSun()

        }

        // this.test()
        this.renderer.renderLists.dispose()

        this.stats.update()
        requestAnimationFrame(this.update.bind(this))
    }


    test(){
        let objs_holder = this.floor.floors[0].objs_holder
        let floor = this.floor.floors[0]
        console.log(objs_holder.children.length)


        for (var i = objs_holder.children.length - 1; i >= 0; i--) {
            let obj = objs_holder.children[i];

            obj.visible=false

            let { x, y, z } = obj.getWorldPosition(new THREE.Vector3())
            
            let dir = new THREE.Vector3( 0, -1, 0 );
            dir.normalize();

            let h = floor.get_height(x, z)
            
            let origin = new THREE.Vector3( x, y, z );

            let arrowHelper = new THREE.ArrowHelper( dir, origin, -h, 0xffff00 );

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