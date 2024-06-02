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

function shape_leaves(leavesGeometry) {
  let position = leavesGeometry.attributes.position


  // vertex displacement

  let vertex = new THREE.Vector3();

  let middle = new THREE.Vector3();

  leavesGeometry.computeBoundingBox();

  middle.x = (leavesGeometry.boundingBox.max.x + leavesGeometry.boundingBox.min.x) / 2;
  middle.y = (leavesGeometry.boundingBox.max.y + leavesGeometry.boundingBox.min.y) / 2;
  middle.z = (leavesGeometry.boundingBox.max.z + leavesGeometry.boundingBox.min.z) / 2;


  for (let i = 0, l = position.count; i < l; i++) {

    vertex.fromBufferAttribute(position, i);
    let s = 30
    let ratio = noise.simplex3(vertex.x / s, vertex.y / s, vertex.z / s) / 8 + 0.8


    vertex.x = middle.x + (vertex.x - middle.x) * ratio
    vertex.y = middle.y + (vertex.y - middle.y) * ratio
    vertex.z = middle.z + (vertex.z - middle.z) * ratio
    // let z = noise.simplex2(vertex.x / 200, vertex.y / 200)

    // vertex.z += z * 10

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);

  }

}

function create_tree() {
  var truncHeight = 50 + Math.random() * 150;
  let leaves_radius = truncHeight / 4 + Math.random() * 10

  var topRadius = 1 + Math.random() * 5;
  var bottomRadius = 5 + Math.random() * 5;
  var mats = [brownMat, pinkMat, whiteMat, greenMat, lightBrownMat, pinkMat, blackMat];
  var matTrunc = blackMat;
  // var matTrunc = mats[Math.floor(Math.random() * mats.length)]; //mats[Math.floor(Math.random()*mats.length)];

  var nhSegments = 3; //Math.ceil(2 + Math.random()*6);
  var nvSegments = 3; //Math.ceil(2 + Math.random()*6);

  var geom = new THREE.CylinderGeometry(topRadius, bottomRadius, truncHeight, nhSegments, nvSegments);
  geom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, truncHeight / 2, 0));

  let mesh = new THREE.Mesh(geom, matTrunc);

  let vertices = geom.attributes.position
  let vertex = new THREE.Vector3();

  let fruits = new THREE.Group()

  for (var i = 0; i < vertices.count; i++) {

    vertex.fromBufferAttribute(vertices, i);

    var noise = Math.random();

    vertex.x += -noise + Math.random() * noise * 2;
    vertex.y += -noise + Math.random() * noise * 2;
    vertex.z += -noise + Math.random() * noise * 2;

    vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);

    geom.computeVertexNormals();


    // FRUITS
    if (Math.random() > .8) {
      var size = Math.random() * 10;
      var fruitGeometry = new THREE.BoxGeometry(size, size, size, 1);
      var matFruit = mats[Math.floor(Math.random() * mats.length)];
      var fruit = new THREE.Mesh(fruitGeometry, matFruit);
      fruit.position.x = vertex.x;
      fruit.position.y = vertex.y + size;
      fruit.position.z = vertex.z;
      fruit.rotation.x = Math.random() * Math.PI;
      fruit.rotation.y = Math.random() * Math.PI;

      fruits.add(fruit);
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

  if (Math.random() < 0.5) {

    let seg = Math.floor(leaves_radius/2)
    let leavesGeometry = new THREE.SphereGeometry(leaves_radius, seg, seg)
    var matleaves = mats[Math.floor(Math.random() * (mats.length - 1))];

    let leaves = new THREE.Mesh(leavesGeometry, matleaves);
    leaves.scale.set(
      Math.random()*0.8 + 0.8,
      Math.random()*0.8 + 0.8,
      Math.random()*0.8 + 0.8,
    )
    shape_leaves(leavesGeometry)

    leaves.applyMatrix4(new THREE.Matrix4().makeTranslation(0, truncHeight - leaves_radius * 0.2, 0));

    leaves.name = "leaves"

    mesh.add(leaves)
  }

  fruits.name = "fruits"

  mesh.add(fruits)

  mesh.castShadow = true;

  // mesh.position.y += truncHeight / 2
  mesh.position.y = 0

  return mesh
}

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}


function create_forest(nTrees, floorWidth, floorHeight, offset) {
  let limit = 0.019 * floorHeight

  let forest = new THREE.Group()

  for (var i = 0; i < nTrees; i++) {
    var tree = create_tree()

    // tree.position.x = -floorWidth + i * treeSpacing; // Distribute trees along the x-axis

    tree.position.y = 0; // Trees on the floor 

    let z
    do {
      z = Math.random() * floorHeight - floorHeight / 2;
    } while (Math.abs(z - offset) < limit)

    tree.position.z = z

    // let w = floorWidth * 0.9

    tree.position.x = Math.random() * floorWidth - floorWidth / 2;

    tree.rotation.x = gaussianRandom() * Math.PI / 28
    // tree.rotation.x = 0
    // tree.rotation.z = Math.random()
    tree.rotation.y = Math.random() * Math.PI / 2

    forest.add(tree)
  }

  return forest
}

function update_tree(tree, delta) {
  let fruits = tree.getObjectByName("fruits")


  for (let i = 0; i < fruits.children.length; i++) {
    let f = fruits.children[i]
    f.rotation.y += noise.simplex2(delta, delta) * 0.1
    f.rotation.x += noise.simplex2(delta, delta) * 0.1
    f.rotation.z += noise.simplex2(delta, delta) * 0.1

    // f.rotation.z = noise.simplex2(f.position.z, delta) * 50
    // f.rotation.x += delta
    f.position.y += Math.sin(delta) * noise.simplex2(delta, delta)

  }

  // let leaves = tree.getObjectByName("leaves")
  // if (leaves != undefined){
  //   // leaves.rotation.y += noise.simplex2(delta, delta)*0.8
  //   leaves.position.y += noise.simplex2(delta, delta)*0.8
  //   // * noise.simplex2(delta, delta)
  // }
}

function update_forest(forest, delta) {
  for (let i = 0; i < forest.children.length; i++) {
    let tree = forest.children[i]
    update_tree(tree, delta)
  }
}


export { create_forest, create_tree, update_forest, update_tree }