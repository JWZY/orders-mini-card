import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

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

  // Change badge
  const change = orderData.total - orderData.previousTotal;
  const changePercent = ((change / orderData.previousTotal) * 100).toFixed(1);
  const badge = document.getElementById('changeBadge');

  if (change >= 0) {
    badge.className = 'change-badge positive';
    badge.textContent = `↑ ${changePercent}%`;
  } else {
    badge.className = 'change-badge negative';
    badge.textContent = `↓ ${Math.abs(changePercent)}%`;
  }

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

// Add new order every 300-1000ms
function scheduleNextOrder() {
  const delay = 300 + Math.random() * 700;
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

function initScene() {
  const container = document.getElementById('scene-container');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1520);

  // Camera
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.4, 1.6);

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

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.2;
  controls.maxDistance = 3;
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 1.8;
  controls.minAzimuthAngle = -Math.PI / 6;
  controls.maxAzimuthAngle = Math.PI / 6;
  controls.target.set(0, 0.3, 0);

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
  // Warm ambient (afternoon glow)
  const ambient = new THREE.AmbientLight(0x806050, 0.5);
  scene.add(ambient);

  // Warm afternoon sun from left
  const sunLight = new THREE.DirectionalLight(0xffaa77, 1.8);
  sunLight.position.set(-3, 2.5, 1);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  scene.add(sunLight);

  // Soft fill light from right (cooler)
  const fillLight = new THREE.DirectionalLight(0x8090a0, 0.3);
  fillLight.position.set(2, 1, 1);
  scene.add(fillLight);

  // Subtle rim light from behind
  const rimLight = new THREE.DirectionalLight(0xffd0a0, 0.4);
  rimLight.position.set(0, 2, -2);
  scene.add(rimLight);
}

function createRoom() {
  // Back wall (warm dark purple)
  const wallGeo = new THREE.PlaneGeometry(8, 4);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x2a2535,
    roughness: 0.9
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 1, -1);
  wall.receiveShadow = true;
  scene.add(wall);

  // Floor (warm dark)
  const floorGeo = new THREE.PlaneGeometry(8, 6);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a1518,
    roughness: 0.85,
    metalness: 0
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  floor.receiveShadow = true;
  scene.add(floor);
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
}

function animate() {
  requestAnimationFrame(animate);
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

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  renderWidget();
  initScene();
});
