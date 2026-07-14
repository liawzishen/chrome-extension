import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createParticleTree, getParticleBudget } from './particle-system.js';

const TARGET_FRAME_INTERVAL = 1000 / 30;
const OVERVIEW_TREE_BUDGET_CAP = 240_000;
const POINTER_REPEL_STRENGTH = 1.45;
const POINTER_REPEL_RESPONSE = 16;
const LABEL_TREE_GAP_RATIO = 0.25;
const LABEL_EDGE_PADDING = 18;
const MAX_CONCEPT_CONNECTOR_LENGTH = 112;
const MAX_TREE_CONNECTOR_LENGTH = 96;
const CONNECTOR_TREE_INSET = 4;
const CONCEPT_CAMERA_DISTANCE = 2.75;
const CONCEPT_CAMERA_TARGET_DROP = 0.16;

function formatTreeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'UNDATED'
    : date.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase();
}

function createLabelButton(record, kind, onActivate, onPress) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `forest-label forest-label--${kind}`;
  button.dataset.recordId = record.id;
  const eyebrow = document.createElement('span');
  eyebrow.className = 'forest-label__eyebrow';
  eyebrow.textContent = kind === 'concept'
    ? (record.role || formatTreeDate(record.createdAt))
    : formatTreeDate(record.createdAt);
  const title = document.createElement('span');
  title.className = 'forest-label__title';
  title.textContent = kind === 'concept' ? record.label : record.name;
  button.append(eyebrow, title);
  button.setAttribute('aria-label', kind === 'concept'
    ? `${record.label}${record.role ? `, ${record.role}` : ''}`
    : `${record.name}, created ${formatTreeDate(record.createdAt)}`);
  let pressedPointerId = null;
  let pressOrigin = { x: 0, y: 0 };
  button.addEventListener('pointerdown', (event) => {
    if (event.isPrimary === false || event.button !== 0) return;
    pressedPointerId = event.pointerId;
    pressOrigin = { x: event.clientX, y: event.clientY };
    onPress?.();
    button.setPointerCapture?.(event.pointerId);
  });
  button.addEventListener('pointerup', (event) => {
    if (event.pointerId !== pressedPointerId) return;
    const moved = Math.hypot(
      event.clientX - pressOrigin.x,
      event.clientY - pressOrigin.y,
    );
    pressedPointerId = null;
    if (button.hasPointerCapture?.(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
    if (moved <= 12) onActivate();
  });
  button.addEventListener('pointercancel', () => {
    pressedPointerId = null;
  });
  // Keyboard and assistive-technology activation creates a click with detail 0.
  // Pointer clicks are handled above so a single press cannot select twice.
  button.addEventListener('click', (event) => {
    if (event.detail === 0) onActivate();
  });
  return button;
}

function createConnector(layer) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.classList.add('forest-connector');
  path.setAttribute('marker-end', 'url(#forest-arrowhead)');
  layer.append(path);
  return path;
}

function disposeSystem(scene, system) {
  if (!system) return;
  scene.remove(system.points);
  system.points.geometry.dispose();
  system.points.material.dispose();
}

function disposeHitTarget(scene, target) {
  scene.remove(target);
  target.geometry.dispose();
  target.material.dispose();
}

function damp(current, target, smoothing, deltaTime) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-smoothing * deltaTime));
}

function buildLayout(count, aspect) {
  if (count <= 1) return [{ x: 0, y: 0, z: 0 }];
  const columns = Math.max(2, Math.ceil(Math.sqrt(count * Math.max(0.75, aspect))));
  const rows = Math.ceil(count / columns);
  const spacingX = 4.9;
  const spacingZ = 4.6;
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const itemsInRow = Math.min(columns, count - row * columns);
    const column = index - row * columns;
    return {
      x: (column - (itemsInRow - 1) / 2) * spacingX,
      y: 0,
      z: (row - (rows - 1) / 2) * spacingZ
    };
  });
}

function transformedBounds(system) {
  system.points.updateMatrixWorld(true);
  return system.bounds.clone().applyMatrix4(system.points.matrixWorld);
}

function projectSystemHorizontalBounds(system, camera, viewportWidth) {
  system.points.updateMatrixWorld(true);
  const bounds = system.bounds;
  const center = bounds.getCenter(new THREE.Vector3());
  const projected = new THREE.Vector3();
  let left = Infinity;
  let right = -Infinity;
  const silhouetteSamples = [
    [bounds.min.x, center.y, center.z],
    [bounds.max.x, center.y, center.z],
    [center.x, center.y, bounds.min.z],
    [center.x, center.y, bounds.max.z]
  ];
  for (const [x, y, z] of silhouetteSamples) {
    projected
      .set(x, y, z)
      .applyMatrix4(system.points.matrixWorld)
      .project(camera);
    const screenX = (projected.x * 0.5 + 0.5) * viewportWidth;
    left = Math.min(left, screenX);
    right = Math.max(right, screenX);
  }
  return {
    left: THREE.MathUtils.clamp(left, 0, viewportWidth),
    right: THREE.MathUtils.clamp(right, 0, viewportWidth)
  };
}

export function mountLearningForest(root, options = {}) {
  if (!root) throw new Error('Learning Forest requires a root element.');
  const sceneHost = root.querySelector('#forestScene');
  const labelsLayer = root.querySelector('#forestLabels');
  const connectorsLayer = root.querySelector('#forestConnectors');
  const loadingElement = root.querySelector('#forestLoading');
  const errorElement = root.querySelector('#forestWebglError');
  const particleCountElement = root.querySelector('#forestParticleCount');
  const treeCountElement = root.querySelector('#forestTreeCount');
  if (!sceneHost || !labelsLayer || !connectorsLayer) {
    throw new Error('Learning Forest markup is incomplete.');
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (error) {
    root.dataset.renderer = 'fallback';
    loadingElement.hidden = true;
    errorElement.hidden = false;
    options.onWebglError?.(error);
    return {
      isWebGLAvailable: false,
      setTrees() {},
      focusTree() {},
      focusConcept() {},
      clearConceptFocus() {},
      showOverview() {},
      setMotionPaused() {},
      destroy() {}
    };
  }

  root.dataset.renderer = 'ready';
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const constrained = (navigator.deviceMemory ?? 4) <= 4
    || (navigator.hardwareConcurrency ?? 4) <= 4;
  renderer.setPixelRatio(constrained ? 1 : Math.min(window.devicePixelRatio, 1.25));
  sceneHost.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 160);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 1.6;
  controls.maxDistance = 90;
  controls.rotateSpeed = 0.48;
  controls.zoomSpeed = 0.65;
  controls.autoRotate = false;

  const initialTarget = new THREE.Vector3(0, 0.12, 0);
  const focusCameraPosition = new THREE.Vector3(0.15, 0.22, 14.1);
  const targetCameraPosition = focusCameraPosition.clone();
  const targetControlPoint = initialTarget.clone();
  camera.position.copy(focusCameraPosition);
  controls.target.copy(initialTarget);

  const pointer = new THREE.Vector2(2, 2);
  const raycaster = new THREE.Raycaster();
  const clock = new THREE.Clock();
  const totalParticleBudget = getParticleBudget();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let trees = [];
  let overviewSystems = [];
  let focusSystem = null;
  let hitTargets = [];
  let labelEntries = [];
  let selectedTreeId = '';
  let selectedConceptId = '';
  let mode = 'empty';
  let cameraIsFlying = false;
  let isOrbitDragging = false;
  let motionPaused = reducedMotion;
  let motionHasStarted = !reducedMotion;
  let motionElapsed = 0;
  let pointerInside = false;
  let repelTarget = 0;
  let pressedAt = { x: 0, y: 0, time: 0 };
  let animationFrameId = 0;
  let lastRenderedAt = -Infinity;
  let destroyed = false;

  function clearLabels() {
    labelEntries.forEach((entry) => {
      entry.button.remove();
      entry.connector.remove();
    });
    labelEntries = [];
  }

  function clearHitTargets() {
    hitTargets.forEach((target) => disposeHitTarget(scene, target));
    hitTargets = [];
  }

  function clearOverview() {
    overviewSystems.forEach((entry) => disposeSystem(scene, entry.system));
    overviewSystems = [];
  }

  function clearFocus() {
    disposeSystem(scene, focusSystem?.system);
    focusSystem = null;
  }

  function clearSceneContent() {
    selectedConceptId = '';
    delete root.dataset.focusedConcept;
    clearLabels();
    clearHitTargets();
    clearOverview();
    clearFocus();
  }

  function setMode(nextMode, treeId = '') {
    mode = nextMode;
    root.dataset.mode = nextMode;
    selectedTreeId = treeId;
    options.onModeChange?.({ mode, treeId });
  }

  function setMotionPaused(nextPaused) {
    motionPaused = Boolean(nextPaused);
    root.dataset.motion = motionPaused ? 'paused' : 'playing';
    if (!motionPaused) {
      motionHasStarted = true;
      getActiveSystems().forEach((entry) => {
        entry.system.uniforms.uEdgeDissolveStrength.value = 1;
      });
    }
    return motionPaused;
  }

  function setCameraTarget(position, target) {
    targetCameraPosition.copy(position);
    targetControlPoint.copy(target);
    if (reducedMotion) {
      camera.position.copy(position);
      controls.target.copy(target);
      cameraIsFlying = false;
      return;
    }
    cameraIsFlying = true;
  }

  function fitCameraToOverview() {
    if (!overviewSystems.length) return;
    const bounds = new THREE.Box3();
    overviewSystems.forEach((entry) => bounds.union(transformedBounds(entry.system)));
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const fitHeightDistance = size.y / (2 * Math.tan(verticalFov / 2));
    const fitWidthDistance = size.x / (2 * Math.tan(verticalFov / 2) * Math.max(camera.aspect, 0.1));
    const distance = Math.max(fitHeightDistance, fitWidthDistance, size.z * 1.15, 8) * 1.34;
    const position = new THREE.Vector3(
      center.x,
      center.y + Math.max(1.2, size.z * 0.24),
      center.z + distance
    );
    setCameraTarget(position, center);
  }

  function addOverviewLabel(entry) {
    const connector = createConnector(connectorsLayer);
    const button = createLabelButton(
      entry.record,
      'tree',
      () => focusTree(entry.record.id),
      () => { cameraIsFlying = false; },
    );
    labelsLayer.append(button);
    labelEntries.push({
      type: 'tree',
      id: entry.record.id,
      record: entry.record,
      button,
      connector,
      system: entry.system,
      anchor: new THREE.Vector3(
        entry.system.bounds.getCenter(new THREE.Vector3()).x,
        entry.system.bounds.max.y + 0.34,
        entry.system.bounds.getCenter(new THREE.Vector3()).z
      ),
      points: entry.system.points,
      projected: new THREE.Vector3()
    });
  }

  function buildOverview() {
    clearSceneContent();
    if (!trees.length) {
      setMode('empty');
      loadingElement.hidden = true;
      if (particleCountElement) particleCountElement.textContent = 'No grains';
      return;
    }
    setMode('overview');
    loadingElement.hidden = false;
    loadingElement.querySelector('span:last-child').textContent = 'Growing learning forest';
    const layout = buildLayout(trees.length, camera.aspect || 1);
    const perTreeBudget = Math.min(
      OVERVIEW_TREE_BUDGET_CAP,
      Math.max(12_000, Math.floor(totalParticleBudget / Math.max(1, trees.length)))
    );
    trees.forEach((record, index) => {
      const system = createParticleTree([], renderer, {
        seed: record.seed,
        particleBudget: perTreeBudget,
        opacity: 0,
        edgeDissolveStrength: motionHasStarted ? 1 : 0
      });
      const position = layout[index];
      const scale = trees.length <= 4 ? 0.62 : trees.length <= 10 ? 0.52 : 0.44;
      const visualScale = scale * system.spatialScale;
      system.points.scale.setScalar(visualScale);
      system.points.position.set(position.x, position.y, position.z);
      system.uniforms.uOpacity.value = 0;
      scene.add(system.points);
      const entry = { record, system, targetOpacity: 1 };
      overviewSystems.push(entry);
      addOverviewLabel(entry);

      const hitTarget = new THREE.Mesh(
        new THREE.BoxGeometry(3.9 * visualScale, 7.3 * visualScale, 3.9 * visualScale),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
      );
      hitTarget.position.set(position.x, position.y + 0.55 * visualScale, position.z);
      hitTarget.userData = { kind: 'tree', treeId: record.id };
      scene.add(hitTarget);
      hitTargets.push(hitTarget);
    });
    if (particleCountElement) {
      const total = perTreeBudget * trees.length;
      particleCountElement.textContent = total >= 1_000_000
        ? `${(total / 1_000_000).toFixed(2)}M grains`
        : `${Math.round(total / 1000)}K grains`;
    }
    labelsLayer.classList.toggle('is-directory', trees.length > 8 || sceneHost.clientWidth < 700);
    fitCameraToOverview();
    loadingElement.hidden = true;
  }

  function addConceptLabels(record, system) {
    system.chapterLeaves.forEach((leaf) => {
      const concept = record.concepts.find((item) => item.id === leaf.chapter.id);
      if (!concept) return;
      const connector = createConnector(connectorsLayer);
      const button = createLabelButton(
        { ...concept, createdAt: record.createdAt },
        'concept',
        () => focusConcept(record.id, concept.id),
        () => { cameraIsFlying = false; },
      );
      labelsLayer.append(button);
      labelEntries.push({
        type: 'concept',
        id: concept.id,
        record: concept,
        treeRecord: record,
        leaf,
        system,
        points: system.points,
        button,
        connector,
        projected: new THREE.Vector3()
      });

      const hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(
          Math.max(0.24, leaf.length * 0.65) * system.spatialScale,
          12,
          8,
        ),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
      );
      hitTarget.position.copy(leaf.center).multiplyScalar(system.spatialScale);
      hitTarget.userData = { kind: 'concept', treeId: record.id, conceptId: concept.id };
      scene.add(hitTarget);
      hitTargets.push(hitTarget);
    });
  }

  function focusConcept(treeId, conceptId) {
    const record = trees.find((tree) => tree.id === treeId);
    const concept = record?.concepts.find((item) => item.id === conceptId);
    if (!record || !concept) return false;
    if (!focusSystem || selectedTreeId !== record.id) focusTree(record.id);
    const entry = labelEntries.find((item) => (
      item.type === 'concept'
      && item.treeRecord.id === record.id
      && item.id === concept.id
    ));
    if (!entry) return false;

    entry.points.updateMatrixWorld(true);
    const worldTarget = entry.leaf.center.clone().applyMatrix4(entry.points.matrixWorld);
    const approach = camera.position.clone().sub(worldTarget);
    if (approach.lengthSq() < 0.0001) approach.set(0.12, 0.06, 1);
    approach.normalize();
    const cameraDestination = worldTarget.clone()
      .addScaledVector(approach, CONCEPT_CAMERA_DISTANCE)
      .add(new THREE.Vector3(0, 0.08, 0));
    const framingTarget = worldTarget.clone().add(new THREE.Vector3(0, -CONCEPT_CAMERA_TARGET_DROP, 0));

    selectedConceptId = concept.id;
    root.dataset.focusedConcept = concept.id;
    labelEntries.forEach((item) => item.button.classList.toggle('is-selected', item.id === concept.id));
    setCameraTarget(cameraDestination, framingTarget);
    options.onSelectConcept?.({ treeId: record.id, conceptId: concept.id });
    return true;
  }

  function clearConceptFocus() {
    if (!selectedConceptId) return false;
    selectedConceptId = '';
    delete root.dataset.focusedConcept;
    labelEntries.forEach((entry) => entry.button.classList.remove('is-selected'));
    setCameraTarget(focusCameraPosition, initialTarget);
    return true;
  }

  function focusTree(treeId) {
    const record = trees.find((tree) => tree.id === treeId);
    if (!record) return false;
    clearSceneContent();
    setMode('focus', record.id);
    loadingElement.hidden = false;
    loadingElement.querySelector('span:last-child').textContent = record.isSeedling
      ? 'Growing note seedling'
      : `Growing ${record.name}`;
    const conceptChapters = record.concepts.map((concept) => ({
      id: concept.id,
      date: formatTreeDate(record.createdAt),
      subheader: concept.label
    }));
    const system = createParticleTree(conceptChapters, renderer, {
      seed: record.seed,
      particleBudget: totalParticleBudget,
      opacity: 0,
      edgeDissolveStrength: motionHasStarted ? 1 : 0
    });
    scene.add(system.points);
    focusSystem = { record, system, targetOpacity: 1 };
    addConceptLabels(record, system);
    labelsLayer.classList.remove('is-directory');
    setCameraTarget(focusCameraPosition, initialTarget);
    if (particleCountElement) {
      particleCountElement.textContent = totalParticleBudget >= 1_000_000
        ? `${(totalParticleBudget / 1_000_000).toFixed(2)}M grains`
        : `${Math.round(totalParticleBudget / 1000)}K grains`;
    }
    loadingElement.hidden = true;
    options.onSelectTree?.({ treeId: record.id });
    return true;
  }

  function showOverview() {
    if (trees.length <= 1) {
      if (trees[0]) focusTree(trees[0].id);
      return;
    }
    buildOverview();
  }

  function setTrees(nextTrees) {
    const previousTreeId = selectedTreeId;
    const wasFocused = mode === 'focus';
    trees = Array.isArray(nextTrees)
      ? nextTrees.filter((tree) => tree?.id && tree?.name).map((tree) => ({ ...tree, concepts: (tree.concepts || []).slice(0, 7) }))
      : [];
    if (treeCountElement) {
      treeCountElement.textContent = `${String(trees.length).padStart(2, '0')} ${trees.length === 1 ? 'note tree' : 'note trees'}`;
    }
    if (!trees.length) {
      clearSceneContent();
      setMode('empty');
      loadingElement.hidden = true;
      return;
    }
    if (trees.length === 1) {
      focusTree(trees[0].id);
      return;
    }
    if (wasFocused && trees.some((tree) => tree.id === previousTreeId)) {
      focusTree(previousTreeId);
      return;
    }
    buildOverview();
  }

  function getActiveSystems() {
    return focusSystem ? [focusSystem] : overviewSystems;
  }

  function updatePointerRay() {
    raycaster.setFromCamera(pointer, camera);
    const rayOrigin = raycaster.ray.origin;
    const rayDirection = raycaster.ray.direction;
    const mouseWorld = rayOrigin.clone().addScaledVector(rayDirection, Math.max(1.5, camera.position.distanceTo(controls.target)));
    getActiveSystems().forEach((entry) => {
      entry.system.uniforms.uMouseRayOrigin.value.copy(rayOrigin);
      entry.system.uniforms.uMouseRayDirection.value.copy(rayDirection);
      entry.system.uniforms.uMouseWorld.value.copy(mouseWorld);
    });
  }

  function updatePointer(event) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 + 1;
    updatePointerRay();
  }

  function onPointerEnter(event) {
    pointerInside = true;
    repelTarget = isOrbitDragging || event.buttons !== 0
      ? 0
      : POINTER_REPEL_STRENGTH;
    updatePointer(event);
  }

  function onPointerMove(event) {
    if (!pointerInside) return;
    repelTarget = isOrbitDragging || event.buttons !== 0
      ? 0
      : POINTER_REPEL_STRENGTH;
    updatePointer(event);
  }

  function onPointerLeave() {
    pointerInside = false;
    repelTarget = 0;
    pointer.set(2, 2);
  }

  function onPointerDown(event) {
    repelTarget = 0;
    pressedAt = { x: event.clientX, y: event.clientY, time: performance.now() };
  }

  function onPointerUp(event) {
    const moved = Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y);
    if (moved > 7 || performance.now() - pressedAt.time > 650) return;
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const intersection = raycaster.intersectObjects(hitTargets, false)[0];
    if (!intersection) return;
    const data = intersection.object.userData;
    if (data.kind === 'tree') focusTree(data.treeId);
    if (data.kind === 'concept') focusConcept(data.treeId, data.conceptId);
  }

  function onControlsStart() {
    // A drag must have one visual owner. Stop camera flights and particle
    // repulsion while OrbitControls is rotating so the tree remains rigid in
    // its own coordinate space instead of appearing to shake under the cursor.
    cameraIsFlying = false;
    isOrbitDragging = true;
    repelTarget = 0;
  }

  function onControlsEnd() {
    isOrbitDragging = false;
    repelTarget = pointerInside ? POINTER_REPEL_STRENGTH : 0;
  }

  function onKeyDown(event) {
    if (event.key === 'Escape' && selectedConceptId) {
      clearConceptFocus();
      return;
    }
    if (event.key === 'Escape' && mode === 'focus' && trees.length > 1) showOverview();
  }

  function resize() {
    const { width, height } = sceneHost.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    connectorsLayer.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const pointScale = Math.min(19, Math.max(13, height * 0.018)) * renderer.getPixelRatio();
    getActiveSystems().forEach((entry) => {
      entry.system.uniforms.uPointScale.value = pointScale;
    });
    labelsLayer.classList.toggle('is-directory', mode === 'overview' && (trees.length > 8 || width < 700));
  }

  function updateDirectoryLabels() {
    labelEntries.forEach((entry) => {
      entry.button.style.transform = '';
      entry.button.style.opacity = '1';
      entry.button.style.visibility = 'visible';
      entry.connector.style.opacity = '0';
    });
  }

  function updateProjectedLabels() {
    const width = sceneHost.clientWidth;
    const height = sceneHost.clientHeight;
    if (!width || !height) return;
    if (labelsLayer.classList.contains('is-directory')) {
      updateDirectoryLabels();
      return;
    }
    const visible = [];
    const projectedTreeBounds = new Map();
    getActiveSystems().forEach((entry) => {
      projectedTreeBounds.set(
        entry.system,
        projectSystemHorizontalBounds(entry.system, camera, width),
      );
    });
    labelEntries.forEach((entry) => {
      const localAnchor = entry.type === 'concept' ? entry.leaf.labelAnchor : entry.anchor;
      entry.projected.copy(localAnchor).applyMatrix4(entry.points.matrixWorld).project(camera);
      const inFrustum = Math.abs(entry.projected.x) < 1.26
        && Math.abs(entry.projected.y) < 1.26
        && entry.projected.z > -1
        && entry.projected.z < 1;
      entry.leafScreenX = (entry.projected.x * 0.5 + 0.5) * width;
      entry.leafScreenY = (-entry.projected.y * 0.5 + 0.5) * height;
      const treeBounds = projectedTreeBounds.get(entry.system);
      const treeCenterX = treeBounds ? (treeBounds.left + treeBounds.right) * 0.5 : width * 0.5;
      entry.placeAtRight = entry.leafScreenX >= treeCenterX;
      entry.screenY = entry.leafScreenY;
      entry.isVisible = inFrustum && !selectedConceptId;
      if (entry.isVisible) visible.push(entry);
    });
    const labelSafeTop = width <= 560 ? 214 : (width <= 860 ? 150 : 140);
    const columns = [
      visible.filter((entry) => !entry.placeAtRight),
      visible.filter((entry) => entry.placeAtRight)
    ];
    columns.forEach((column) => {
      column.sort((first, second) => first.screenY - second.screenY);
      let lastY = labelSafeTop - 48;
      column.forEach((entry) => {
        entry.screenY = Math.max(entry.screenY, labelSafeTop, lastY + 48);
        entry.screenY = Math.min(entry.screenY, height - 58);
        lastY = entry.screenY;
      });
    });
    labelEntries.forEach((entry) => {
      const labelWidth = entry.button.offsetWidth || 136;
      const treeBounds = projectedTreeBounds.get(entry.system);
      let gutterX = entry.placeAtRight ? width - LABEL_EDGE_PADDING : LABEL_EDGE_PADDING;
      if (entry.type === 'concept' && treeBounds) {
        if (entry.placeAtRight) {
          const sideSpan = Math.max(0, width - LABEL_EDGE_PADDING - treeBounds.right);
          const treeFacingX = treeBounds.right + sideSpan * LABEL_TREE_GAP_RATIO;
          gutterX = THREE.MathUtils.clamp(
            treeFacingX + labelWidth,
            LABEL_EDGE_PADDING + labelWidth,
            width - LABEL_EDGE_PADDING,
          );
        } else {
          const sideSpan = Math.max(0, treeBounds.left - LABEL_EDGE_PADDING);
          const treeFacingX = treeBounds.left - sideSpan * LABEL_TREE_GAP_RATIO;
          gutterX = THREE.MathUtils.clamp(
            treeFacingX - labelWidth,
            LABEL_EDGE_PADDING,
            width - LABEL_EDGE_PADDING - labelWidth,
          );
        }
      }
      entry.button.classList.toggle('is-left', entry.placeAtRight);
      entry.button.style.transform = entry.placeAtRight
        ? `translate3d(${gutterX}px, ${entry.screenY}px, 0) translate(-100%, -50%)`
        : `translate3d(${gutterX}px, ${entry.screenY}px, 0) translate(0, -50%)`;
      entry.button.style.opacity = entry.isVisible ? '1' : '0';
      entry.button.style.visibility = entry.isVisible ? 'visible' : 'hidden';
      const startX = entry.placeAtRight ? gutterX - labelWidth : gutterX + labelWidth;
      const startY = entry.screenY;
      const leafX = THREE.MathUtils.clamp(entry.leafScreenX, 8, width - 8);
      const leafY = THREE.MathUtils.clamp(entry.leafScreenY, 8, height - 8);
      const toLeafX = leafX - startX;
      const toLeafY = leafY - startY;
      const rawDistance = Math.max(1, Math.hypot(toLeafX, toLeafY));
      const maximumLength = entry.type === 'concept'
        ? MAX_CONCEPT_CONNECTOR_LENGTH
        : MAX_TREE_CONNECTOR_LENGTH;
      const unitX = toLeafX / rawDistance;
      const unitY = toLeafY / rawDistance;
      const treeInset = Math.min(CONNECTOR_TREE_INSET, rawDistance * 0.2);
      const connectorLength = Math.min(rawDistance - treeInset, maximumLength);
      const endX = leafX - unitX * treeInset;
      const endY = leafY - unitY * treeInset;
      const connectorStartX = endX - unitX * connectorLength;
      const connectorStartY = endY - unitY * connectorLength;
      entry.connector.setAttribute('d', `M ${connectorStartX.toFixed(1)} ${connectorStartY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`);
      entry.connector.style.opacity = entry.isVisible ? '1' : '0';
    });
  }

  function render(timestamp = 0) {
    if (destroyed) return;
    animationFrameId = requestAnimationFrame(render);
    if (document.hidden || timestamp - lastRenderedAt < TARGET_FRAME_INTERVAL) return;
    const delta = Math.min(clock.getDelta(), 0.05);
    lastRenderedAt = timestamp;
    if (cameraIsFlying) {
      camera.position.lerp(targetCameraPosition, 1 - Math.exp(-4.6 * delta));
      controls.target.lerp(targetControlPoint, 1 - Math.exp(-5.4 * delta));
      if (camera.position.distanceTo(targetCameraPosition) < 0.01
        && controls.target.distanceTo(targetControlPoint) < 0.01) {
        camera.position.copy(targetCameraPosition);
        controls.target.copy(targetControlPoint);
        cameraIsFlying = false;
      }
    }
    // OrbitControls documents that update() should follow manual camera or
    // target changes when damping is enabled.
    controls.update();
    if (!motionPaused) motionElapsed += delta;
    const elapsed = motionElapsed;
    getActiveSystems().forEach((entry) => {
      const uniforms = entry.system.uniforms;
      uniforms.u_time.value = elapsed;
      uniforms.uRepelStrength.value = damp(
        uniforms.uRepelStrength.value,
        repelTarget,
        POINTER_REPEL_RESPONSE,
        delta,
      );
      uniforms.uOpacity.value = damp(uniforms.uOpacity.value, entry.targetOpacity, 5, delta);
    });
    updateProjectedLabels();
    renderer.render(scene, camera);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(sceneHost);
  renderer.domElement.addEventListener('pointerenter', onPointerEnter);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerleave', onPointerLeave);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  controls.addEventListener('start', onControlsStart);
  controls.addEventListener('end', onControlsEnd);
  window.addEventListener('keydown', onKeyDown);
  resize();
  setMotionPaused(motionPaused);
  animationFrameId = requestAnimationFrame(render);

  return {
    isWebGLAvailable: true,
    setTrees,
    focusTree,
    focusConcept,
    clearConceptFocus,
    showOverview,
    setMotionPaused,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerenter', onPointerEnter);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('end', onControlsEnd);
      window.removeEventListener('keydown', onKeyDown);
      clearSceneContent();
      renderer.dispose();
      renderer.domElement.remove();
      root.dataset.renderer = 'destroyed';
    }
  };
}
