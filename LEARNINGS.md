# Orders Widget - Session Learnings

## Date: Session 1

---

## What We Built
A 3D room scene with a visionOS-style glass widget mounted on the wall, with furniture and ambient lighting.

---

## Technical Learnings

### 1. Placing HTML in 3D Space (Three.js)
- **CSS3DRenderer** is required to place HTML elements in true 3D space
- Regular HTML overlays always face the camera (billboard effect)
- Need TWO renderers: WebGLRenderer for 3D objects + CSS3DRenderer for HTML
- Both share the same camera for proper alignment
```javascript
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
const widgetObject = new CSS3DObject(htmlElement);
widgetObject.scale.set(0.002, 0.002, 0.002); // Scale down from pixels to 3D units
```

### 2. External 3D Model Loading - What Works
**Working source:**
- Khronos glTF Sample Models via jsDelivr CDN
- URL pattern: `https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/[ModelName]/glTF-Binary/[ModelName].glb`
- Example: SheenChair loaded successfully

**What DIDN'T work:**
- `market-assets.fra1.cdn.digitaloceanspaces.com` - URLs were guesses, got 404s
- `vazxmixjsiez.cdn.babyloncdn.com` - Same issue
- poly.pizza without specific model IDs

**Lesson:** Don't guess CDN URLs. Use verified sources or ask user for specific URLs.

### 3. Floor/Surface Materials
- High metalness + low roughness = mirror-like reflections = weird light blobs
- For wood floors: `roughness: 0.85, metalness: 0` works well
- Reflective floors need careful light positioning

### 4. Camera Constraints (OrbitControls)
```javascript
controls.minDistance = 1.5;  // How close you can zoom
controls.maxDistance = 6;
controls.minPolarAngle = Math.PI / 3;   // Vertical limit (top)
controls.maxPolarAngle = Math.PI / 2.2; // Vertical limit (bottom)
controls.minAzimuthAngle = -Math.PI / 5; // Horizontal limit (left)
controls.maxAzimuthAngle = Math.PI / 5;  // Horizontal limit (right)
```

### 5. visionOS Glass Widget Styling
Key CSS properties for the glass effect:
- `backdrop-filter: blur(20px) saturate(120%)`
- Asymmetric borders (brighter on light side)
- Inner glow + outer glow shadows
- Specular highlight line at top edge
- Warm amber tones: `rgba(255, 140, 80, 0.25)`

### 6. Scene Lighting for Warm Atmosphere
```javascript
// Warm sunset from left
sunLight = new THREE.DirectionalLight(0xffaa77, 2.0);
sunLight.position.set(-4, 3, 2);

// Cool blue fill from right
fillLight = new THREE.DirectionalLight(0x9090c0, 0.6);

// Purple ambient for dusk
ambient = new THREE.AmbientLight(0x8080a0, 0.4);
```

---

## Design Decisions Made

1. **Widget dimensions:** Started at 550×354pt, scaled up to 700×450pt for visibility
2. **Color theme:** Warm amber/copper glass against purple/blue dusk background
3. **Furniture:** Mix of loaded models (SheenChair) + procedural (credenza, plant, table)
4. **Interaction:** Constrained orbit camera, widget fixed to wall

---

## What Should Be Different Next Time

1. **Don't guess model URLs** - Either use verified sources or ask for URLs upfront
2. **Start with widget design first** - Nail the 2D design before adding 3D
3. **Keep procedural furniture simple** - The basic shapes looked fine
4. **Test external models one at a time** - Not batch loading unknowns
5. **Define the full widget content upfront** - We kept changing requirements

---

## Files Created
- `dist/index.html` - HTML structure
- `dist/styles.css` - Widget + scene styling
- `dist/app.js` - Three.js scene + widget logic

---

## The Refined Prompt (for next attempt)

**Widget spec:**
- 550 × 354pt visionOS-style glass panel
- LEFT COLUMN: Order count (large), 7-day sparkline, % change badge
- RIGHT COLUMN: Live order feed (new orders push to top, old flow down)
- Warm amber glass aesthetic with white edge highlights

**Environment:**
- Simple 3D room (wall + floor)
- Minimal furniture (don't overcomplicate)
- Warm sunset lighting from left
- Widget mounted on wall in 3D space
