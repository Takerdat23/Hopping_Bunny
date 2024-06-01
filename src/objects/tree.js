import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Materials
var blackMat = new THREE.MeshPhongMaterial({
    color: 0x100707,
    shading: THREE.FlatShading,
  });
  
  var brownMat = new THREE.MeshPhongMaterial({
    color: 0xb44b39,
    shininess: 0,
    shading: THREE.FlatShading,
  });
  
  var greenMat = new THREE.MeshPhongMaterial({
    color: 0x7abf8e,
    shininess: 0,
    shading: THREE.FlatShading,
  });
  
  var pinkMat = new THREE.MeshPhongMaterial({
    color: 0xdc5f45,//0xb43b29,//0xff5b49,
    shininess: 0,
    shading: THREE.FlatShading,
  });
  
  var lightBrownMat = new THREE.MeshPhongMaterial({
    color: 0xe07a57,
    shading: THREE.FlatShading,
  });
  
  var whiteMat = new THREE.MeshPhongMaterial({
    color: 0xa49789,
    shading: THREE.FlatShading,
  });
  var skinMat = new THREE.MeshPhongMaterial({
    color: 0xff9ea5,
    shading: THREE.FlatShading
  });
  

function create_tree() {
    var truncHeight = 50 + Math.random() * 150;
    var topRadius = 1 + Math.random() * 5;
    var bottomRadius = 5 + Math.random() * 5;
    var mats = [blackMat, brownMat, pinkMat, whiteMat, greenMat, lightBrownMat, pinkMat];
    var matTrunc = blackMat; //mats[Math.floor(Math.random()*mats.length)];
    var nhSegments = 3; //Math.ceil(2 + Math.random()*6);
    var nvSegments = 3; //Math.ceil(2 + Math.random()*6);
    var geom = new THREE.CylinderGeometry(topRadius, bottomRadius, truncHeight, nhSegments, nvSegments);
    geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, truncHeight / 2, 0));

    this.mesh = new THREE.Mesh(geom, matTrunc);

    for (var i = 0; i < geom.vertices.length; i++) {
        var noise = Math.random();
        var v = geom.vertices[i];
        v.x += -noise + Math.random() * noise * 2;
        v.y += -noise + Math.random() * noise * 2;
        v.z += -noise + Math.random() * noise * 2;

        geom.computeVertexNormals();

        // FRUITS
        if (Math.random() > .7) {
            var size = Math.random() * 3;
            var fruitGeometry = new THREE.CubeGeometry(size, size, size, 1);
            var matFruit = mats[Math.floor(Math.random() * mats.length)];
            var fruit = new THREE.Mesh(fruitGeometry, matFruit);
            fruit.position.x = v.x;
            fruit.position.y = v.y + 3;
            fruit.position.z = v.z;
            fruit.rotation.x = Math.random() * Math.PI;
            fruit.rotation.y = Math.random() * Math.PI;

            this.mesh.add(fruit);
        }

        // BRANCHES
        if (Math.random() > .5 && v.y > 10 && v.y < truncHeight - 10) {
            var h = 3 + Math.random() * 5;
            var thickness = .2 + Math.random();

            var branchGeometry = new THREE.CylinderGeometry(thickness / 2, thickness, h, 3, 1);
            branchGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, h / 2, 0));
            var branch = new THREE.Mesh(branchGeometry, matTrunc);
            branch.position.x = v.x;
            branch.position.y = v.y;
            branch.position.z = v.z;

            var vec = new THREE.Vector3(v.x, 2, v.z);
            var axis = new THREE.Vector3(0, 1, 0);
            branch.quaternion.setFromUnitVectors(axis, vec.clone().normalize());


            this.mesh.add(branch);
        }

    }

    this.mesh.castShadow = true;
}


export { create_tree}