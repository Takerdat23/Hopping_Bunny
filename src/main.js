
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { Constraint } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from 'tween'

import { Sky } from 'three/addons/objects/Sky.js';

import { SlidingFloor } from './objects/floor.js';
import { Hero } from './objects/hero.js'

import { get_tree } from './models.js';


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
        this.renderer.toneMappingExposure = 1;



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

    createSky(elevation = 2, azimuth = 180) {

        let sun = new THREE.Vector3();

        const sky = new Sky();
        sky.scale.setScalar(10000);

        // scene.add( sky );

        const skyUniforms = sky.material.uniforms;

        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        const phi = THREE.MathUtils.degToRad(90 - elevation);
        const theta = THREE.MathUtils.degToRad(azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);

        this.scene.add(sky)
    }

    createObjects() {
        this.createLights()

        this.createSky()

        // create floor
        this.floor = new SlidingFloor(this.floorRadius)

        this.scene.add(this.floor.obj)

        this.hero = new Hero()
        this.floor.obj.add(this.hero.obj)

        let tree = get_tree()

        this.floor.floor1.obj.add(tree)

    }

    createLights() {


        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 50, 0);
        this.scene.add(hemiLight);


        this.globalLight = new THREE.AmbientLight(0xffffff, 2);
        // this.scene.add(this.globalLight);

        const dirLight = new THREE.DirectionalLight( 0xffffff, 2 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( - 1, 1.75, 1 );
        dirLight.position.multiplyScalar( 30 );
        // this.scene.add( dirLight );

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        const d = 50;

        dirLight.shadow.camera.left = - d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = - d;

        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = - 0.0001;
        
        this.scene.add(dirLight);

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
        
        let terrain_height = this.floor.get_height(0,0)
        // console.log(height);
        // this.hero.obj.position.y=terrain_height + 1
        
        this.hero.update(delta, this.speed, terrain_height)

        requestAnimationFrame(this.update.bind(this))
    }

}

let g = new Game()