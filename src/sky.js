
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Sky } from 'three/addons/objects/Sky.js';


class daySky {
    constructor() {

        let sun = new THREE.Vector3();

        let sky = new Sky();
        sky.scale.setScalar(10000);

        const skyUniforms = sky.material.uniforms;
        skyUniforms['turbidity'].value = 5;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        this.parameters = {
            elevation: 7,
            azimuth: 123
        };

        this.sky = sky
        this.sun = sun


        this.obj = new THREE.Group()

        this.obj.add(this.sky)

        let lights = this.getLights()

        this.obj.add(lights)
        this.updateSun()
    }

    // visible(visible=false){
    //     this.obj.traverse(function (child) {
    //         child.visible=visible
    //     });
    // }

    updateSun() {
        let phi = THREE.MathUtils.degToRad(90 - this.parameters.elevation);
        let theta = THREE.MathUtils.degToRad(this.parameters.azimuth);

        this.sun.setFromSphericalCoords(1, phi, theta);

        this.sky.material.uniforms['sunPosition'].value.copy(this.sun);

        let { x, y, z } = this.sun

        this.hemiLight.position.set(x, y, z)
        this.hemiLight.position.multiplyScalar(-100)


        this.dirLight.position.set(x, y, z)
        this.dirLight.position.multiplyScalar(200)

        if (this.parameters.elevation < 0 || this.parameters.elevation > 180) {
            this.obj.visible = false
        } else {
            this.obj.visible = true
        }
    }

    getLights() {
        let light = new THREE.Group()


        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        this.hemiLight.color.setHSL(0.6, 1, 0.6);
        this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);

        light.add(this.hemiLight);


        this.globalLight = new THREE.AmbientLight(0xffffff, 1);
        this.globalLight.color.setHSL(0.1, 1, 0.95);
        light.add(this.globalLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 5);
        this.dirLight.color.setHSL(0.1, 1, 0.95);

        this.dirLight.castShadow = true;

        this.dirLight.shadow.mapSize.width = 4096;
        this.dirLight.shadow.mapSize.height = 4096;

        const d = 1000;

        this.dirLight.shadow.camera.left = - d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;

        this.dirLight.shadow.camera.near = 1;
        this.dirLight.shadow.camera.far = 3000;
        // this.dirLight.shadow.radius = 0.01;
        // this.dirLight.shadow.bias = -0.01;

        light.add(this.dirLight);

        return light
    }
}


class nightSky {
    constructor() {

        let sun = new THREE.Vector3();

        let sky = new Sky();
        sky.scale.setScalar(10000);

        const skyUniforms = sky.material.uniforms;
        skyUniforms['turbidity'].value = 0;
        skyUniforms['rayleigh'].value = 0.01;
        skyUniforms['mieCoefficient'].value = 0.001;
        skyUniforms['mieDirectionalG'].value = 0.01;

        this.parameters = {
            elevation: 7,
            azimuth: 123
        };

        this.sky = sky
        this.sun = sun


        this.obj = new THREE.Group()

        this.obj.add(this.sky)

        let lights = this.getLights()

        this.obj.add(lights)
        this.updateSun()
    }

    updateSun() {
        let phi = THREE.MathUtils.degToRad(90 - this.parameters.elevation);
        let theta = THREE.MathUtils.degToRad(this.parameters.azimuth);


        this.sun.setFromSphericalCoords(1, phi, theta);

        this.sky.material.uniforms['sunPosition'].value.copy(this.sun);

        let { x, y, z } = this.sun

        this.hemiLight.position.set(x, y, z)
        this.hemiLight.position.multiplyScalar(-100)


        this.dirLight.position.set(x, y, z)
        this.dirLight.position.multiplyScalar(200)

        if (this.parameters.elevation < 0 || this.parameters.elevation > 180) {
            this.obj.visible = false
        } else {
            this.obj.visible = true
        }
    }

    getLights() {
        let light = new THREE.Group()


        this.hemiLight = new THREE.HemisphereLight(0x404040, 0x404040, 0.5);
        this.hemiLight.color.setHSL(0.5, 0.5, 0.5);
        this.hemiLight.groundColor.setHSL(0.75, 0.75, 0.75);

        light.add(this.hemiLight);


        this.globalLight = new THREE.AmbientLight(0x404040, 1);
        // this.globalLight.color.setHSL(0.75, 0.75, 0.75);
        light.add(this.globalLight);

        this.dirLight = new THREE.DirectionalLight(0x404040, 2);
        // this.dirLight.color.setHSL(0.75, 0.75, 0.75);

        this.dirLight.castShadow = true;

        this.dirLight.shadow.mapSize.width = 4096;
        this.dirLight.shadow.mapSize.height = 4096;

        const d = 200;

        this.dirLight.shadow.camera.left = - d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;

        this.dirLight.shadow.camera.near = 1;
        this.dirLight.shadow.camera.far = 2000;

        // this.dirLight.shadow.radius = 0.1;
        // this.dirLight.shadow.bias = 0.001;

        light.add(this.dirLight);

        return light
    }
}

class SkyBox {
    constructor(fog) {

        this.state = 'day'

        this.daysk = new daySky()
        this.nightsk = new nightSky()

        this.parameters = {
            elevation: 7,
            azimuth: 123
        };

        this.fog = fog


        this.updateSun()

        this.obj = new THREE.Group()
        this.obj.add(this.daysk.obj)
        this.obj.add(this.nightsk.obj)
    }

    updateSun() {
        this.parameters.elevation = (this.parameters.elevation) % 360
        this.parameters.azimuth = (this.parameters.azimuth) % 360

        if (this.parameters.elevation < 0 || this.parameters.elevation > 180) {
            this.state="night"
            this.fog.color.set(0x404040)
        }else{
            this.state="day"
            this.fog.color.set(0xffffff)
        }

        this.nightsk.parameters.elevation = (this.parameters.elevation + 180) % 360
        this.daysk.parameters.elevation = this.parameters.elevation



        this.nightsk.parameters.azimuth = this.parameters.azimuth
        this.daysk.parameters.azimuth = this.parameters.azimuth

        this.daysk.updateSun()
        this.nightsk.updateSun()
    }

}


export { SkyBox }