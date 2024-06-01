import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Materials
var blackMat = new THREE.MeshPhongMaterial({
  color: 0x100707,
  flatShading: true,
});

var brownMat = new THREE.MeshPhongMaterial({
  color: 0xb44b39,
  shininess: 0,
  flatShading: true,
});

var greenMat = new THREE.MeshPhongMaterial({
  color: 0x7abf8e,
  shininess: 0,
  flatShading: true,
});

var pinkMat = new THREE.MeshPhongMaterial({
  color: 0xdc5f45,//0xb43b29,//0xff5b49,
  shininess: 0,
  flatShading: true,
});

var lightBrownMat = new THREE.MeshPhongMaterial({
  color: 0xe07a57,
  flatShading: true,
});

var whiteMat = new THREE.MeshPhongMaterial({
  color: 0xa49789,
  flatShading: true,
});
var skinMat = new THREE.MeshPhongMaterial({
  color: 0xff9ea5,
  flatShading: true
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
  geom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, truncHeight / 2, 0));

  let mesh = new THREE.Mesh(geom, matTrunc);

  let vertices = geom.attributes.position
  let vertex = new THREE.Vector3();

  for (var i = 0; i < vertices.count; i++) {

    vertex.fromBufferAttribute(vertices, i);

    var noise = Math.random();

    vertex.x += -noise + Math.random() * noise * 2;
    vertex.y += -noise + Math.random() * noise * 2;
    vertex.z += -noise + Math.random() * noise * 2;

    vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);

    geom.computeVertexNormals();

    // FRUITS
    if (Math.random() > .7) {
      var size = Math.random() * 3;
      var fruitGeometry = new THREE.BoxGeometry(size, size, size, 1);
      var matFruit = mats[Math.floor(Math.random() * mats.length)];
      var fruit = new THREE.Mesh(fruitGeometry, matFruit);
      fruit.position.x = vertex.x;
      fruit.position.y = vertex.y + 3;
      fruit.position.z = vertex.z;
      fruit.rotation.x = Math.random() * Math.PI;
      fruit.rotation.y = Math.random() * Math.PI;

      mesh.add(fruit);
    }

    // BRANCHES
    if (Math.random() > .5 && vertex.y > 10 && vertex.y < truncHeight - 10) {
      var h = 3 + Math.random() * 5;
      var thickness = .2 + Math.random();

      var branchGeometry = new THREE.CylinderGeometry(thickness / 2, thickness, h, 3, 1);
      branchGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, h / 2, 0));
      var branch = new THREE.Mesh(branchGeometry, matTrunc);
      branch.position.x = vertex.x;
      branch.position.y = vertex.y;
      branch.position.z = vertex.z;

      var vec = new THREE.Vector3(vertex.x, 2, vertex.z);
      var axis = new THREE.Vector3(0, 1, 0);
      branch.quaternion.setFromUnitVectors(axis, vec.clone().normalize());


      mesh.add(branch);
    }

  }

  mesh.castShadow = true;

  // mesh.position.y += truncHeight / 2
  mesh.position.y = 0

  return mesh
}

function create_forest(nTrees, floorWidth, floorHeight,offset, scene=0) {
  // let treeSpacing = floorWidth / nTrees

  let limit=0.019 * floorHeight

  for (var i = 0; i < nTrees; i++) {
    var tree = create_tree()

    // tree.position.x = -floorWidth + i * treeSpacing; // Distribute trees along the x-axis

    tree.position.y = 0; // Trees on the floor 


    let z
    do {
      z = Math.random() * floorHeight - floorHeight / 2;
    }while(Math.abs(z-offset) < limit)

    tree.position.z = z


    tree.position.x = Math.random() * floorWidth - floorWidth / 2;

    tree.rotation.x = Math.random()/10
    tree.rotation.z = Math.random()/10
    tree.rotation.y = Math.random()


    scene.add(tree)
  }
}

export { create_tree, create_forest }