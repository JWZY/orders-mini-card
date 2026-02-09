import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// Local model files (downloaded from poly.pizza)
const LOCAL_MODELS = [
  { name: 'Fiddle Plant', file: 'Fiddle-leaf Plant.glb', pos: [-0.84, -0.50, -0.66], scale: 0.12, rotY: -1.03 },
  { name: 'Cabinet', file: 'Cabinet Television Doo.glb', pos: [-0.51, -0.50, -0.75], scale: 1.34, rotY: 3.14 },
  { name: 'Couch', file: 'Couch Medium.glb', pos: [1.24, -0.50, -0.54], scale: 0.23, rotY: -0.18 },
  { name: 'Rug', file: 'Modern_Rug_01.obj', mtl: 'Modern_Rug_01.mtl', pos: [0.20, -0.50, -0.28], scale: 0.21, rotY: -1.57 },
];

// Store loaded models for GUI manipulation
const loadedModels = {};
let modelsLoaded = 0;
const totalModels = LOCAL_MODELS.length;

function checkAllLoaded() {
  modelsLoaded++;
  if (modelsLoaded >= totalModels) {
    document.body.classList.add('ready');
  }
}

// ============================================
// MOCK DATA
// ============================================

const orderData = {
  total: 1247,
  previousTotal: 1089,
  barData: [142, 168, 195, 156, 203, 178, 205, 189, 220, 195, 210, 185],
  recentOrders: [
    { name: 'Yuki T.', flag: '🇯🇵', items: 3, amount: '$127.50', time: 'Just now' },
    { name: 'Priya S.', flag: '🇮🇳', items: 1, amount: '$84.00', time: '2m ago' },
    { name: 'Marco R.', flag: '🇮🇹', items: 5, amount: '$215.90', time: '5m ago' },
    { name: 'Sarah M.', flag: '🇺🇸', items: 2, amount: '$52.25', time: '8m ago' },
    { name: 'Ahmed K.', flag: '🇪🇬', items: 4, amount: '$163.00', time: '12m ago' },
  ]
};

const customers = [
  { name: 'Sarah', flag: '🇺🇸' },
  { name: 'James', flag: '🇬🇧' },
  { name: 'Yuki', flag: '🇯🇵' },
  { name: 'Priya', flag: '🇮🇳' },
  { name: 'Mohammed', flag: '🇦🇪' },
  { name: 'Sofia', flag: '🇪🇸' },
  { name: 'Chen', flag: '🇨🇳' },
  { name: 'Anna', flag: '🇩🇪' },
  { name: 'Lucas', flag: '🇧🇷' },
  { name: 'Fatima', flag: '🇲🇦' },
  { name: 'Kim', flag: '🇰🇷' },
  { name: 'Olga', flag: '🇺🇦' },
  { name: 'Marco', flag: '🇮🇹' },
  { name: 'Aisha', flag: '🇳🇬' },
  { name: 'Erik', flag: '🇸🇪' },
  { name: 'Marie', flag: '🇫🇷' },
  { name: 'Raj', flag: '🇮🇳' },
  { name: 'Mei', flag: '🇹🇼' },
  { name: 'Carlos', flag: '🇲🇽' },
  { name: 'Anya', flag: '🇷🇺' },
  { name: 'Tariq', flag: '🇵🇰' },
  { name: 'Ingrid', flag: '🇳🇴' },
  { name: 'Kofi', flag: '🇬🇭' },
  { name: 'Liam', flag: '🇮🇪' },
  { name: 'Sakura', flag: '🇯🇵' },
  { name: 'Ahmed', flag: '🇪🇬' },
  { name: 'Nina', flag: '🇵🇱' },
  { name: 'Thabo', flag: '🇿🇦' },
  { name: 'Emma', flag: '🇦🇺' },
  { name: 'Arjun', flag: '🇮🇳' },
  { name: 'Sven', flag: '🇩🇰' },
  { name: 'Leila', flag: '🇮🇷' },
  { name: 'Mateo', flag: '🇦🇷' },
  { name: 'Hana', flag: '🇨🇿' },
  { name: 'Kwame', flag: '🇬🇭' },
  { name: 'Chloe', flag: '🇨🇦' },
  { name: 'Hiroshi', flag: '🇯🇵' },
  { name: 'Zara', flag: '🇬🇧' },
  { name: 'Dmitri', flag: '🇷🇺' },
  { name: 'Aaliyah', flag: '🇸🇦' },
];
const visibleBars = 10;

// ============================================
// WIDGET RENDERING
// ============================================

function renderWidget() {
  // Order count
  document.getElementById('orderCount').textContent = orderData.total.toLocaleString();

  // Sparkline (bar chart)
  renderSparkline(orderData.barData);

  // Order feed
  renderFeed(orderData.recentOrders);
}

function renderSparkline(data, isNewBar = false) {
  const svg = document.getElementById('sparkline');
  const width = 300;
  const height = 60;
  const barGap = 6;
  const barWidth = (width - barGap * (visibleBars - 1)) / visibleBars;

  // Get the last N bars to display
  const displayData = data.slice(-visibleBars);
  const max = Math.max(...displayData, 150);

  const bars = displayData.map((value, i) => {
    const x = i * (barWidth + barGap);
    const barHeight = (value / max) * (height - 8);
    const y = height - barHeight;
    const isLast = i === displayData.length - 1;
    const enterClass = isNewBar && isLast ? 'entering' : '';
    // Fade opacity based on position (left = faded)
    const opacity = 0.3 + (i / visibleBars) * 0.7;
    return `<rect class="sparkline-bar ${enterClass}" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" style="opacity: ${isLast ? 1 : opacity}"/>`;
  });

  svg.innerHTML = bars.join('');
}

function renderFeed(orders, isNewOrder = false) {
  const feedList = document.getElementById('feedList');

  feedList.innerHTML = orders.map((order, i) => `
    <div class="feed-item ${isNewOrder && i === 0 ? 'entering' : ''} ${isNewOrder && i > 0 ? 'shifting' : ''}">
      <div class="feed-item-left">
        <span class="feed-name">${order.flag} ${order.name}</span>
        <span class="feed-meta">${order.items} item${order.items > 1 ? 's' : ''} · ${order.time}</span>
      </div>
      <span class="feed-amount">${order.amount}</span>
    </div>
  `).join('');
}

// Simulate new orders coming in
let barAccumulator = 0;
let barUpdateCounter = 0;

function simulateNewOrder() {
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const lastName = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const newAmount = (Math.random() * 200 + 30).toFixed(2);
  const newItems = Math.floor(Math.random() * 5) + 1;

  orderData.recentOrders.unshift({
    name: `${customer.name} ${lastName}.`,
    flag: customer.flag,
    items: newItems,
    amount: `$${newAmount}`,
    time: 'Just now'
  });

  // Update times for existing orders
  if (orderData.recentOrders[1]) orderData.recentOrders[1].time = '1m ago';
  if (orderData.recentOrders[2]) orderData.recentOrders[2].time = '3m ago';
  if (orderData.recentOrders[3]) orderData.recentOrders[3].time = '6m ago';
  if (orderData.recentOrders[4]) orderData.recentOrders[4].time = '10m ago';

  if (orderData.recentOrders.length > 6) {
    orderData.recentOrders.pop();
  }

  orderData.total++;
  barAccumulator++;
  barUpdateCounter++;

  // Update count
  document.getElementById('orderCount').textContent = orderData.total.toLocaleString();

  // Render feed with animation flag
  renderFeed(orderData.recentOrders, true);

  // Add new bar every few orders (simulates time buckets)
  if (barUpdateCounter >= 3) {
    const newBarValue = 150 + Math.random() * 80 + barAccumulator * 5;
    orderData.barData.push(Math.floor(newBarValue));
    barAccumulator = 0;
    barUpdateCounter = 0;
    renderSparkline(orderData.barData, true);
  }
}

// Add new order every 1200-2400ms
function scheduleNextOrder() {
  const delay = 1200 + Math.random() * 1200;
  setTimeout(() => {
    simulateNewOrder();
    scheduleNextOrder();
  }, delay);
}
scheduleNextOrder();

// ============================================
// THREE.JS SCENE
// ============================================

let scene, camera, renderer, cssRenderer, controls;
let lights = {}; // Store lights for GUI control
let mouseX = 0, mouseY = 0;
let targetCameraX = 0, targetCameraY = 0;
const cameraBasePos = { x: -0.02, y: 0.39, z: 1.10 };
const cameraMoveStrength = { x: 0.15, y: 0.08 }; // How much camera moves with mouse

// Mobile/gyroscope support
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let gyroEnabled = false;
let gyroX = 0, gyroY = 0;

function initScene() {
  const container = document.getElementById('scene-container');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd8d4cf);

  // Camera - adjust FOV and position for mobile
  const fov = isMobile ? 65 : 50;
  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100);

  if (isMobile) {
    // Pull back and center for mobile
    camera.position.set(0, 0.5, 1.4);
    cameraBasePos.x = 0;
    cameraBasePos.y = 0.5;
    cameraBasePos.z = 1.4;
  } else {
    camera.position.set(-0.02, 0.39, 1.10);
  }

  // WebGL Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // CSS3D Renderer (for widget in 3D space)
  cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(cssRenderer.domElement);

  // Controls (disabled rotation/pan - mouse tracking handles movement)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableRotate = false; // Disable click-drag rotation
  controls.enablePan = false; // Disable panning
  controls.enableZoom = false; // Disable scroll zoom
  controls.target.set(0, isMobile ? 0.45 : 0.30, 0);

  // Lighting
  setupLighting();

  // Room
  createRoom();

  // Place widget in 3D
  createWidget3D();

  // Animation loop
  animate();
}

function setupLighting() {
  // Warm ambient (afternoon glow base)
  lights.ambient = new THREE.AmbientLight(0xffeedd, 0.4);
  scene.add(lights.ambient);

  // Main sun - warm afternoon from upper left (creates diagonal shadows)
  lights.sun = new THREE.DirectionalLight(0xffaa66, 1.8);
  lights.sun.position.set(-4, 4, 2);
  lights.sun.castShadow = true;
  lights.sun.shadow.mapSize.width = 2048;
  lights.sun.shadow.mapSize.height = 2048;
  lights.sun.shadow.camera.near = 0.1;
  lights.sun.shadow.camera.far = 20;
  lights.sun.shadow.camera.left = -5;
  lights.sun.shadow.camera.right = 5;
  lights.sun.shadow.camera.top = 5;
  lights.sun.shadow.camera.bottom = -5;
  lights.sun.shadow.bias = -0.001;
  scene.add(lights.sun);

  // Warm bounce light (simulates light bouncing off warm surfaces)
  lights.bounce = new THREE.DirectionalLight(0xffddaa, 0.5);
  lights.bounce.position.set(2, 0.5, 3);
  scene.add(lights.bounce);

  // Cool fill light from right (sky light through window)
  lights.fill = new THREE.DirectionalLight(0xaaccff, 0.3);
  lights.fill.position.set(3, 2, 1);
  scene.add(lights.fill);

  // Hemisphere light (sky = warm, ground = warm wood reflection)
  lights.hemi = new THREE.HemisphereLight(0xffeebb, 0xaa8866, 0.4);
  scene.add(lights.hemi);

  // Rim light from behind (golden hour backlight) - disabled
  lights.rim = new THREE.DirectionalLight(0xffcc88, 0);
  lights.rim.position.set(0, 2, -3);
  scene.add(lights.rim);
}

function createRoom() {
  // Back wall (light warm gray like reference)
  const wallGeo = new THREE.PlaneGeometry(8, 4);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xd8d4cf,
    roughness: 0.95
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 1, -1);
  wall.receiveShadow = true;
  scene.add(wall);

  // Floor (wood brown)
  const floorGeo = new THREE.PlaneGeometry(8, 6);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.8,
    metalness: 0
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  floor.receiveShadow = true;
  scene.add(floor);

  // Load 3D furniture
  loadFurniture();
}

function loadFurniture() {
  const loader = new GLTFLoader();

  // Load models
  LOCAL_MODELS.forEach((modelConfig) => {
    const addModelToScene = (model) => {
      model.scale.setScalar(modelConfig.scale);
      model.position.set(...modelConfig.pos);
      model.rotation.y = modelConfig.rotY;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(model);
      loadedModels[modelConfig.name] = model;
      console.log(`✓ ${modelConfig.name} loaded`);
      checkAllLoaded();
    };

    if (modelConfig.mtl) {
      const mtlLoader = new MTLLoader();
      mtlLoader.load(modelConfig.mtl, (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(modelConfig.file, (obj) => {
          addModelToScene(obj);
        }, undefined, (error) => {
          console.error(`✗ Error loading ${modelConfig.name}:`, error);
        });
      }, undefined, (error) => {
        console.error(`✗ Error loading MTL for ${modelConfig.name}:`, error);
      });
    } else {
      loader.load(modelConfig.file, (gltf) => {
        addModelToScene(gltf.scene);
      }, undefined, (error) => {
        console.error(`✗ Error loading ${modelConfig.name}:`, error);
      });
    }
  });
}

function createWidget3D() {
  const widget = document.getElementById('widget');
  const widgetObject = new CSS3DObject(widget);

  // Scale: widget is 550x354 pixels, we want it ~1.1 units wide in 3D
  const scale = 0.002;
  widgetObject.scale.set(scale, scale, scale);

  // Position on wall
  widgetObject.position.set(0, 0.5, -0.95);

  scene.add(widgetObject);

  // Store globally for GUI control
  window.widgetObject = widgetObject;
}

function animate() {
  requestAnimationFrame(animate);

  // Smooth camera follow mouse (inverted to follow eye direction)
  targetCameraX = cameraBasePos.x - (mouseX * cameraMoveStrength.x);
  targetCameraY = cameraBasePos.y - (mouseY * cameraMoveStrength.y);

  // Lerp for smooth movement
  camera.position.x += (targetCameraX - camera.position.x) * 0.05;
  camera.position.y += (targetCameraY - camera.position.y) * 0.05;

  controls.update();
  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

// ============================================
// RESIZE
// ============================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse tracking for camera movement (desktop)
window.addEventListener('mousemove', (e) => {
  if (isMobile) return;
  // Convert to -1 to 1 range (center = 0)
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -((e.clientY / window.innerHeight) * 2 - 1); // Invert Y
});

// Gyroscope for camera movement (mobile)
function handleOrientation(e) {
  const beta = e.beta || 0;   // front/back tilt (-180 to 180)
  const gamma = e.gamma || 0; // left/right tilt (-90 to 90)

  // Center around typical holding angle (~40-50 degrees)
  gyroY = Math.max(-1, Math.min(1, (beta - 45) / 30));
  gyroX = Math.max(-1, Math.min(1, gamma / 30));

  mouseX = gyroX;
  mouseY = -gyroY;
}

function enableGyro() {
  if (gyroEnabled) return;
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+ requires permission (must be called from user gesture)
    DeviceOrientationEvent.requestPermission()
      .then(permission => {
        if (permission === 'granted') {
          gyroEnabled = true;
          window.addEventListener('deviceorientation', handleOrientation);
        }
      })
      .catch(console.error);
  } else if ('DeviceOrientationEvent' in window) {
    gyroEnabled = true;
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

// Show gyro hint overlay on mobile, dismiss on tap (doubles as iOS user gesture)
if (isMobile) {
  const hint = document.getElementById('gyro-hint');
  hint.style.display = '';
  hint.addEventListener('click', () => {
    enableGyro();
    hint.classList.add('dismissing');
    setTimeout(() => hint.remove(), 400);
  }, { once: true });
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  renderWidget();
  initScene();
});
