
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Sky } from 'three/addons/objects/Sky.js';


class SkyBox {
    constructor() {

        let sun = new THREE.Vector3();

        let sky = new Sky();
        sky.scale.setScalar(10000);

        const skyUniforms = sky.material.uniforms;
        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        this.parameters = {
            elevation: 10,
            azimuth: 180
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
    }

    getLights() {
        let light = new THREE.Group()


        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
        this.hemiLight.color.setHSL(0.6, 1, 0.6);
        this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);

        light.add(this.hemiLight);


        this.globalLight = new THREE.AmbientLight(0xffffff, 1.5);
        light.add(this.globalLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 2);
        this.dirLight.color.setHSL(0.1, 1, 0.95);

        this.dirLight.castShadow = true;

        this.dirLight.shadow.mapSize.width = 4096;
        this.dirLight.shadow.mapSize.height = 4096;

        const d = 600;

        this.dirLight.shadow.camera.left = - d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = 200;
        this.dirLight.shadow.camera.bottom = -100;

        this.dirLight.shadow.camera.far = 3500;
        this.dirLight.shadow.radius = 0.1;

        light.add(this.dirLight);

        return light
    }


}
export { SkyBox }