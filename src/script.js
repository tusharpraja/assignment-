import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFACD);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 30),
  new THREE.MeshStandardMaterial({
    color: "#88AFA5",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

// Left wall
const leftWallGeometry = new THREE.BoxGeometry(0.1, 5, 30);
const leftWallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
leftWall.position.set(-10, 2.5, 0);
scene.add(leftWall);

// Front wall
const frontWallGeometry = new THREE.BoxGeometry(20, 5, 0.1); // Width, Height, Thickness
const frontWallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const frontWall = new THREE.Mesh(frontWallGeometry, frontWallMaterial);
frontWall.position.set(0, 2.5, -15); // Adjust position to the front
scene.add(frontWall);

// Back wall
const backWallGeometry = new THREE.BoxGeometry(20, 5, 0.1);
const backWallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
backWall.position.set(0, 2.5, 15);
scene.add(backWall);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Model
 */
const gltfloader = new GLTFLoader();
gltfloader.load("/models/scene.gltf", (gltf) => {
  const model = gltf.scene;

  // Calculate the model's bounding box
  const boundingBox = new THREE.Box3().setFromObject(model);
  
  // Get the center and size of the bounding box
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());

  // Reposition the model to be centered on the floor
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= boundingBox.min.y; // This will place the model's bottom on the floor

  // Add the model to the scene
  scene.add(model);
});

//  Tree Model at each corner
const positions = [
  new THREE.Vector3(-9, 0, -14), // Bottom-left corner
  new THREE.Vector3(9, 0, -14),  // Bottom-right corner
  new THREE.Vector3(9, 0, 12),   // Top-right corner
  new THREE.Vector3(-9, 0, 14)   // Top-left corner
];

const loadTreeModel = (position) => {
  gltfloader.load("/Tree/scene.gltf", (gltf) => {
    const m1 = gltf.scene;

    // Center the model
    const boundingBox = new THREE.Box3().setFromObject(m1);
    const center = boundingBox.getCenter(new THREE.Vector3());

    m1.position.x -= center.x;
    m1.position.y -= boundingBox.min.y; // Position on the floor
    m1.position.z -= center.z;

    // Optionally scale the model
    m1.scale.set(5, 5, 5); // Scale down if necessary

    // Set position of the model
    m1.position.add(position);

    // Add 
    scene.add(m1);
  }, undefined, (error) => {
    console.error('An error occurred while loading the model:', error);
  });
};

// Load tree at each corner
positions.forEach(position => {
  loadTreeModel(position);
});





/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  50, // Field of view (FOV)
  sizes.width / sizes.height, // Aspect ratio
  0.1, // Near clipping plane
  100  // Far clipping plane
);

// Set camera position
camera.position.set(5, 2, 8); // X: 5, Y: 2, Z: 8
scene.add(camera);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * Add a simple door
 */
const doorGeometry = new THREE.BoxGeometry(1.9, 3.3, 0.1); // Width: 1, Height: 2, Depth: 0.1
const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); 
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.castShadow = true;

// Position the door in front of the camera
door.position.set(5, 1.1, 6.8); // Adjust based on your scene setup
// door.rotateX(3)
door.rotateY(0.1)
// Add the door to the scene
scene.add(door);



