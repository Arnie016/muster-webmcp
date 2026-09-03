import * as THREE from './vendor/three.module.min.js';

const FLOOR_COUNT = 18;
const FLOOR_HEIGHT = 0.5;
const FLOOR_BASE_Y = 1.3;

const palette = {
  ink: 0x07100d,
  site: 0x10221d,
  glass: 0x3f8f84,
  frame: 0x9bc9c1,
  cyan: 0x70cbbb,
  orange: 0xff6b35,
  amber: 0xf4c95d,
  road: 0x181c19,
};

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.48,
    metalness: options.metalness ?? 0.18,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    side: options.side ?? THREE.FrontSide,
  });
}

function box(width, height, depth, meshMaterial, position, name) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), meshMaterial);
  mesh.position.set(...position);
  mesh.name = name;
  return mesh;
}

function addEdges(parent, mesh, color = palette.frame, opacity = 0.24) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.scale.copy(mesh.scale);
  parent.add(edges);
  return edges;
}

function makeSiteLabel(text, color = '#9bc9c1') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  context.font = '700 29px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.72, depthWrite: false }));
  sprite.scale.set(4.5, 0.84, 1);
  return sprite;
}

export function initBuildingScene(canvas, callbacks = {}) {
  if (!canvas || !window.WebGLRenderingContext) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.warn('Muster WebGL training twin unavailable; using the CSS building fallback.', error);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setClearColor(palette.ink, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(palette.ink, 0.035);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const target = new THREE.Vector3(0, 4.4, 0);
  const root = new THREE.Group();
  root.rotation.y = -0.08;
  scene.add(root);

  scene.add(new THREE.HemisphereLight(0xbdeee5, 0x07100d, 1.7));
  const key = new THREE.DirectionalLight(0xe5fff9, 2.6);
  key.position.set(-9, 16, 8);
  scene.add(key);
  const rim = new THREE.PointLight(palette.cyan, 35, 28, 2);
  rim.position.set(8, 8, -8);
  scene.add(rim);

  const site = box(24, 0.12, 17, material(palette.site, { roughness: 0.94 }), [0, -0.1, 0], 'site-plane');
  root.add(site);
  addEdges(root, site, palette.cyan, 0.2);

  const grid = new THREE.GridHelper(24, 24, palette.cyan, 0x23483f);
  grid.position.y = 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  root.add(grid);

  const roadMaterial = material(palette.road, { roughness: 0.96 });
  const southRoad = box(20.5, 0.07, 2.5, roadMaterial, [0, 0.02, 6.4], 'south-service-road');
  const eastRoad = box(2.7, 0.07, 10.8, roadMaterial, [9.7, 0.02, 0.6], 'east-appliance-approach');
  root.add(southRoad, eastRoad);
  addEdges(root, southRoad, 0xb4a874, 0.26);
  addEdges(root, eastRoad, 0xb4a874, 0.26);

  const podium = box(10.2, 1.15, 7.2, material(0x20483f, { roughness: 0.38, metalness: 0.26 }), [0, 0.55, 0], 'public-podium');
  root.add(podium);
  addEdges(root, podium, palette.cyan, 0.38);

  const floorMeshes = [];
  const floorMaterial = material(palette.glass, { roughness: 0.24, metalness: 0.34, transparent: true, opacity: 0.72 });
  for (let floor = 1; floor <= FLOOR_COUNT; floor += 1) {
    const y = FLOOR_BASE_Y + (floor - 1) * FLOOR_HEIGHT;
    const floorMesh = box(7.35, 0.42, 4.85, floorMaterial.clone(), [0, y, 0], `floor-${floor}`);
    floorMesh.userData = { floor };
    root.add(floorMesh);
    addEdges(root, floorMesh, floor === 7 ? palette.orange : palette.frame, floor === 7 ? 0.75 : 0.2);
    floorMeshes.push(floorMesh);
  }

  const frameMaterial = material(0x162b27, { roughness: 0.42, metalness: 0.58 });
  for (let x = -3.5; x <= 3.5; x += 0.7) {
    root.add(box(0.045, 9.2, 0.055, frameMaterial, [x, 5.55, 2.46], 'facade-mullion-front'));
    root.add(box(0.045, 9.2, 0.055, frameMaterial, [x, 5.55, -2.46], 'facade-mullion-back'));
  }
  for (let z = -2.1; z <= 2.1; z += 0.7) {
    root.add(box(0.055, 9.2, 0.045, frameMaterial, [3.71, 5.55, z], 'facade-mullion-east'));
    root.add(box(0.055, 9.2, 0.045, frameMaterial, [-3.71, 5.55, z], 'facade-mullion-west'));
  }

  const roof = box(7.7, 0.18, 5.2, material(0x1a302a, { roughness: 0.78 }), [0, 10.03, 0], 'roof-deck');
  root.add(roof);
  addEdges(root, roof, palette.frame, 0.34);
  [-1.6, 0, 1.6].forEach((x, index) => {
    const plant = box(1.05, 0.65, 1.55, material(0x263c36, { roughness: 0.66, metalness: 0.4 }), [x, 10.45, index % 2 ? 0.55 : -0.35], `roof-plant-${index + 1}`);
    root.add(plant);
    addEdges(root, plant, palette.frame, 0.32);
  });

  const siteTargets = [];
  const zoneMaterials = new Map();
  const addSiteTarget = (id, label, size, position, color) => {
    const zoneMaterial = material(color, { roughness: 0.68, emissive: color, emissiveIntensity: 0.12, transparent: true, opacity: 0.72 });
    const zone = box(size[0], 0.09, size[1], zoneMaterial, [position[0], 0.08, position[1]], id);
    zone.userData = { sitePoint: id };
    root.add(zone);
    addEdges(root, zone, color, 0.72);
    const labelSprite = makeSiteLabel(label, color === palette.orange ? '#ff9b74' : '#9bc9c1');
    labelSprite.position.set(position[0], 0.27, position[1]);
    labelSprite.scale.multiplyScalar(0.58);
    root.add(labelSprite);
    siteTargets.push(zone);
    zoneMaterials.set(id, zoneMaterial);
  };
  addSiteTarget('assembly-a', 'Assembly A', [3.5, 2.1], [-7.1, 1.8], palette.cyan);
  addSiteTarget('assembly-b', 'Assembly B', [3.5, 2.1], [6.9, -3.5], palette.cyan);
  addSiteTarget('appliance-bay', 'Appliance bay', [4.2, 1.4], [5.5, 6.35], palette.orange);
  addSiteTarget('service-road', 'Service road', [5.5, 1.35], [-3.6, 6.35], 0xb4a874);

  const routeMaterial = new THREE.LineDashedMaterial({ color: palette.cyan, transparent: true, opacity: 0.58, dashSize: 0.32, gapSize: 0.19 });
  const route = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.2, 0.2, 2.9),
      new THREE.Vector3(-4.6, 0.2, 3.8),
      new THREE.Vector3(-7.1, 0.2, 2.2),
    ]),
    routeMaterial,
  );
  route.computeLineDistances();
  root.add(route);

  const signalMaterial = new THREE.MeshStandardMaterial({ color: palette.orange, emissive: palette.orange, emissiveIntensity: 2.4 });
  const signal = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 12), signalMaterial);
  signal.position.set(1.7, FLOOR_BASE_Y + 6 * FLOOR_HEIGHT, 2.62);
  signal.visible = false;
  root.add(signal);
  const signalRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.035, 10, 42),
    new THREE.MeshBasicMaterial({ color: palette.orange, transparent: true, opacity: 0.9 }),
  );
  signalRing.position.copy(signal.position);
  signalRing.position.z += 0.04;
  signalRing.visible = false;
  root.add(signalRing);
  const signalLabel = makeSiteLabel('7-E signal', '#ff9b74');
  signalLabel.position.set(1.7, signal.position.y + 0.7, 2.72);
  signalLabel.scale.set(2.65, 0.5, 1);
  signalLabel.visible = false;
  root.add(signalLabel);
  const signalLight = new THREE.PointLight(palette.orange, 0, 6, 2);
  signalLight.position.copy(signal.position);
  root.add(signalLight);

  let currentView = { x: 62, z: -38, scale: 1 };
  let selectedFloor = 7;
  let selectedSitePoint = null;
  let signalActive = false;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const updateCamera = () => {
    const elevation = THREE.MathUtils.degToRad(Math.max(16, Math.min(48, 90 - currentView.x)));
    const azimuth = THREE.MathUtils.degToRad(currentView.z + 58);
    const radius = 24 / currentView.scale;
    camera.position.set(
      target.x + Math.cos(elevation) * Math.sin(azimuth) * radius,
      target.y + Math.sin(elevation) * radius,
      target.z + Math.cos(elevation) * Math.cos(azimuth) * radius,
    );
    camera.lookAt(target);
  };

  const applyFloorState = () => {
    floorMeshes.forEach((mesh) => {
      const active = mesh.userData.floor === selectedFloor;
      mesh.material.color.setHex(active ? palette.orange : palette.glass);
      mesh.material.emissive.setHex(active ? palette.orange : 0x000000);
      mesh.material.emissiveIntensity = active ? 0.34 : 0;
      mesh.material.opacity = active ? 0.92 : 0.7;
    });
  };

  const applySiteState = () => {
    zoneMaterials.forEach((zoneMaterial, id) => {
      const active = id === selectedSitePoint;
      zoneMaterial.emissiveIntensity = active ? 0.72 : 0.12;
      zoneMaterial.opacity = active ? 0.94 : 0.72;
    });
  };

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const hitTest = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects([...siteTargets, ...floorMeshes], false)[0];
    canvas.dataset.lastHit = hit?.object?.name || 'none';
    if (!hit) return;
    if (hit.object.userData.sitePoint) callbacks.onSiteSelect?.(hit.object.userData.sitePoint);
    else if (hit.object.userData.floor) callbacks.onFloorSelect?.(hit.object.userData.floor);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement);
  resize();
  updateCamera();
  applyFloorState();
  applySiteState();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setAnimationLoop((time) => {
    if (signalActive && !reduceMotion) {
      const pulse = 1 + Math.sin(time * 0.006) * 0.24;
      signal.scale.setScalar(pulse);
      signalRing.scale.setScalar(1 + Math.sin(time * 0.006) * 0.12);
      signalRing.material.opacity = 0.66 + Math.sin(time * 0.006) * 0.22;
      signalLight.intensity = 28 + Math.sin(time * 0.006) * 8;
    }
    renderer.render(scene, camera);
  });

  return {
    setView(view) {
      currentView = { ...currentView, ...view };
      canvas.dataset.orbitZ = String(currentView.z);
      canvas.dataset.orbitScale = String(currentView.scale);
      updateCamera();
    },
    selectFloor(floor) {
      selectedFloor = Number(floor);
      selectedSitePoint = null;
      canvas.dataset.selectedFloor = String(selectedFloor);
      canvas.dataset.sitePoint = '';
      applyFloorState();
      applySiteState();
    },
    selectSitePoint(pointId) {
      selectedSitePoint = pointId;
      canvas.dataset.sitePoint = pointId;
      applySiteState();
    },
    setSignal(active) {
      signalActive = Boolean(active);
      canvas.dataset.signal = signalActive ? 'active' : 'idle';
      signal.visible = signalActive;
      signalRing.visible = signalActive;
      signalLabel.visible = signalActive;
      signalLight.intensity = signalActive ? 28 : 0;
    },
    pick(clientX, clientY) {
      hitTest(clientX, clientY);
    },
    dispose() {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      renderer.dispose();
    },
  };
}
