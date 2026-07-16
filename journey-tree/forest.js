import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createParticleTree, getParticleBudget } from './particle-system.js';

const TARGET_FRAME_INTERVAL = 1000 / 30;
const OVERVIEW_GLOBAL_BUDGET_CAP = 260_000;
const OVERVIEW_BUDGET_RATIO = 0.72;
const OVERVIEW_MIN_TREE_BUDGET = 18_000;
const FOCUS_BACKGROUND_MIN_TREE_BUDGET = 4_000;
const FOCUS_BACKGROUND_MAX_RATIO = 0.24;
const POINTER_REPEL_STRENGTH = 2.15;
const POINTER_REPEL_RESPONSE = 28;
const POINTER_PARTICLE_HIT_THRESHOLD = 0.085;
const LABEL_TREE_GAP_RATIO = 0.25;
const LABEL_EDGE_PADDING = 18;
const MAX_CONCEPT_CONNECTOR_LENGTH = 112;
const CONNECTOR_TREE_INSET = 4;
const CONCEPT_CAMERA_DISTANCE = 2.75;
const CONCEPT_CAMERA_TARGET_DROP = 0.16;
const RIBBON_HORIZONTAL_GAP = 2.2;
const RIBBON_Z_SPACING = 9;
const RIBBON_ROW_STAGGER = 5.2;
const CHAPTER_PLOT_ROW_OFFSET = 44;
const CHAPTER_PLOT_COLLISION_GAP = 10;
const LIVE_TREE_LABEL_CLEARANCE = 18;
const COMPACT_RIBBON_CHAPTER_COUNT = 9;
const LAYOUT_STAGE_RADII = Object.freeze({
  plot: 1.45,
  seedling: 1.8,
  growing: 3,
  mature: 3.8,
});
const RIBBON_GROUND_Y = -1.64;
const OVERVIEW_SELECTED_TREE_SCALE = 0.62;
const OVERVIEW_CONTEXT_TREE_SCALE = 0.38;
const OVERVIEW_SELECTED_OPACITY = 0.98;
const OVERVIEW_CONTEXT_OPACITY = 0.58;
const BACKGROUND_TREE_OPACITY = 0.18;
const FOCUS_PARTICLE_RATIOS = Object.freeze({
  seedling: 0.26,
  growing: 0.72,
  mature: 1,
});

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
  const isNote = kind === 'note';
  eyebrow.textContent = isNote
    ? (record.eyebrow || 'VISUAL NOTE')
    : kind === 'concept'
      ? (record.role || formatTreeDate(record.createdAt))
    : formatTreeDate(record.createdAt);
  const title = document.createElement('span');
  title.className = 'forest-label__title';
  title.textContent = isNote ? record.title : (kind === 'concept' ? record.label : record.name);
  button.append(eyebrow, title);
  button.setAttribute('aria-label', isNote
    ? `Open Visual Note ${record.title}`
    : kind === 'concept'
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
  target.removeFromParent();
  target.geometry.dispose();
  target.material.dispose();
}

function damp(current, target, smoothing, deltaTime) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-smoothing * deltaTime));
}

function getRibbonRowCount(count) {
  return Math.max(1, Math.ceil(count / 4));
}

function buildLayout(records, aspect = 1) {
  const items = Array.isArray(records) ? records : [];
  const count = items.length;
  if (count <= 0) return [];
  const rows = getRibbonRowCount(count);
  const baseSize = Math.floor(count / rows);
  const remainder = count % rows;
  const rowSizes = Array.from({ length: rows }, (_, row) => baseSize + (row < remainder ? 1 : 0));
  const compactness = THREE.MathUtils.clamp(aspect, 0.72, 1.65);
  const horizontalGap = RIBBON_HORIZONTAL_GAP * THREE.MathUtils.lerp(
    1.18,
    1,
    (compactness - 0.72) / 0.93,
  );
  const layout = [];
  let itemIndex = 0;
  rowSizes.forEach((itemsInRow, row) => {
    const rowRecords = items.slice(itemIndex, itemIndex + itemsInRow);
    const radii = rowRecords.map((record) => (
      LAYOUT_STAGE_RADII[record?.growthStage] || LAYOUT_STAGE_RADII.mature
    ));
    const leftToRightCenters = [];
    let cursor = 0;
    radii.forEach((radius) => {
      leftToRightCenters.push(cursor + radius);
      cursor += radius * 2 + horizontalGap;
    });
    const rowWidth = Math.max(0, cursor - horizontalGap);
    const centeredPositions = leftToRightCenters.map((value) => value - rowWidth / 2);
    const direction = row % 2 === 0 ? 1 : -1;
    const rowStagger = row === 0
      ? 0
      : (row % 2 === 0 ? -1 : 1) * RIBBON_ROW_STAGGER;
    for (let slot = 0; slot < itemsInRow; slot += 1) {
      const column = direction === 1 ? slot : itemsInRow - 1 - slot;
      layout.push({
        index: itemIndex,
        row,
        x: centeredPositions[column] + rowStagger,
        y: 0,
        z: (row - (rows - 1) / 2) * RIBBON_Z_SPACING,
      });
      itemIndex += 1;
    }
  });
  return layout;
}

/**
 * Keep projected chapter controls independently clickable when perspective or
 * safe-area clamping brings two depth rows close together on screen.
 */
function separateChapterPlotPositions(items, width, safeTop, safeBottom, compact = false) {
  const visible = items.filter((item) => item.shouldShow);
  if (!visible.length) return items;
  const plotWidth = compact
    ? 46
    : width <= 560
    ? 92
    : THREE.MathUtils.clamp(width * 0.11, 96, 132);
  const minimumHorizontalGap = plotWidth + CHAPTER_PLOT_COLLISION_GAP;
  const minimumVerticalGap = compact ? 44 : (width <= 560 ? 76 : 88);
  const edgePadding = plotWidth / 2 + 8;
  const highestRow = visible.reduce((highest, item) => Math.max(highest, item.row), 0);
  const rowCenter = highestRow / 2;

  visible.forEach((item) => {
    const rootAlignedScreenY = item.screenY;
    const rowOffset = (item.row - rowCenter) * (compact ? 28 : CHAPTER_PLOT_ROW_OFFSET);
    const labelOffset = !compact && item.hasLiveTree
      ? Math.max(rowOffset, LIVE_TREE_LABEL_CLEARANCE)
      : rowOffset;
    item.minimumScreenY = !compact && item.hasLiveTree
      ? Math.min(safeBottom, rootAlignedScreenY + LIVE_TREE_LABEL_CLEARANCE)
      : safeTop;
    item.screenX = THREE.MathUtils.clamp(item.screenX, edgePadding, width - edgePadding);
    item.screenY = THREE.MathUtils.clamp(
      item.screenY + labelOffset,
      safeTop,
      safeBottom,
    );
  });

  // Dense ribbons use numbered plot markers, backed by the full title index.
  // Snap those small markers to the nearest free lane so every chapter remains
  // independently clickable even when perspective compresses the middle turn.
  if (compact) {
    const columnCount = Math.max(1, Math.floor((width - edgePadding * 2) / minimumHorizontalGap) + 1);
    const rowCount = Math.max(1, Math.floor((safeBottom - safeTop) / minimumVerticalGap) + 1);
    const columnStep = columnCount > 1
      ? (width - edgePadding * 2) / (columnCount - 1)
      : 0;
    const rowStep = rowCount > 1 ? (safeBottom - safeTop) / (rowCount - 1) : 0;
    const freeLanes = [];
    for (let row = 0; row < rowCount; row += 1) {
      for (let column = 0; column < columnCount; column += 1) {
        freeLanes.push({
          x: edgePadding + column * columnStep,
          y: safeTop + row * rowStep,
        });
      }
    }
    [...visible]
      .sort((first, second) => Number(second.isSelected) - Number(first.isSelected))
      .forEach((item) => {
        let bestIndex = 0;
        let bestDistance = Infinity;
        freeLanes.forEach((lane, index) => {
          const horizontalDistance = lane.x - item.screenX;
          const verticalDistance = lane.y - item.screenY;
          const distance = horizontalDistance * horizontalDistance
            + verticalDistance * verticalDistance * 1.35;
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
          }
        });
        const [lane] = freeLanes.splice(bestIndex, 1);
        if (!lane) return;
        item.screenX = lane.x;
        item.screenY = lane.y;
      });
    return items;
  }

  const placed = [];

  visible.forEach((item) => {
    for (let attempt = 0; attempt < visible.length * 2; attempt += 1) {
      const collision = placed.find((candidate) => (
        Math.abs(item.screenX - candidate.screenX) < minimumHorizontalGap
        && Math.abs(item.screenY - candidate.screenY) < minimumVerticalGap
      ));
      if (!collision) break;

      const prefersDown = item.row >= collision.row;
      const candidates = [
        collision.screenY + (prefersDown ? minimumVerticalGap : -minimumVerticalGap),
        collision.screenY + (prefersDown ? -minimumVerticalGap : minimumVerticalGap),
      ].filter((candidateY) => (
        candidateY >= item.minimumScreenY && candidateY <= safeBottom
      ));
      if (candidates.length) {
        candidates.sort((first, second) => (
          Math.abs(first - item.screenY) - Math.abs(second - item.screenY)
        ));
        item.screenY = candidates[0];
        continue;
      }

      const horizontalCandidates = [
        collision.screenX - minimumHorizontalGap,
        collision.screenX + minimumHorizontalGap,
      ].filter((candidateX) => candidateX >= edgePadding && candidateX <= width - edgePadding);
      if (!horizontalCandidates.length) break;
      horizontalCandidates.sort((first, second) => (
        Math.abs(first - item.screenX) - Math.abs(second - item.screenX)
      ));
      item.screenX = horizontalCandidates[0];
    }
    placed.push(item);
  });

  return items;
}

function growthLabel(record) {
  if (record.growthStage === 'plot') return 'Empty plot';
  if (record.growthStage === 'seedling') return 'Seedling';
  if (record.growthStage === 'growing') return 'Normal tree';
  return 'Huge tree';
}

function growthMeta(record) {
  const units = Number(record.growthUnitCount) || 0;
  const notes = Number(record.visualNoteCount) || 0;
  const sources = Number(record.sourceCount) || 0;
  return `${units} growth ${units === 1 ? 'unit' : 'units'} · ${notes} Visual ${notes === 1 ? 'Note' : 'Notes'} · ${sources} ${sources === 1 ? 'source' : 'sources'}`;
}

function particleBudgetForStage(record, totalBudget, overview = false) {
  if (record.growthStage === 'plot') return 0;
  const ratio = FOCUS_PARTICLE_RATIOS[record.growthStage] || 1;
  const focusedBudget = Math.max(18_000, Math.round(totalBudget * ratio));
  return overview ? Math.min(180_000, focusedBudget) : focusedBudget;
}

function allocateOverviewBudgets(records, totalBudget, options = {}) {
  const visible = records.filter((record) => record.growthStage !== 'plot');
  if (!visible.length) return new Map();
  const requestedMinimum = Math.max(
    2_000,
    Math.floor(Number(options.minimumTreeBudget) || OVERVIEW_MIN_TREE_BUDGET),
  );
  const hasPoolLimit = Number.isFinite(Number(options.poolLimit));
  const pool = Math.min(totalBudget, hasPoolLimit
    ? Math.max(0, Math.min(Math.round(Number(options.poolLimit)), Math.round(totalBudget)))
    : Math.max(
      requestedMinimum * visible.length,
      Math.min(OVERVIEW_GLOBAL_BUDGET_CAP, Math.round(totalBudget * OVERVIEW_BUDGET_RATIO)),
    ));
  if (!pool) return new Map();
  const minimumTreeBudget = Math.min(requestedMinimum, Math.floor(pool / visible.length));
  const weights = { seedling: 1, growing: 2, mature: 3 };
  const caps = { seedling: 48_000, growing: 112_000, mature: 180_000 };
  const remaining = Math.max(0, pool - minimumTreeBudget * visible.length);
  const totalWeight = visible.reduce((sum, record) => sum + (weights[record.growthStage] || 1), 0);
  return new Map(visible.map((record) => {
    const share = remaining * (weights[record.growthStage] || 1) / Math.max(1, totalWeight);
    const budget = Math.min(
      caps[record.growthStage] || caps.mature,
      Math.floor(minimumTreeBudget + share),
    );
    return [record.id, budget];
  }));
}

function buildSmoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) {
    const point = points[0];
    return `M ${(point.x - 30).toFixed(1)} ${point.y.toFixed(1)} L ${(point.x + 30).toFixed(1)} ${point.y.toFixed(1)}`;
  }
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const following = points[Math.min(points.length - 1, index + 2)];
    const controlOneX = current.x + (next.x - previous.x) / 6;
    const controlOneY = current.y + (next.y - previous.y) / 6;
    const controlTwoX = next.x - (following.x - current.x) / 6;
    const controlTwoY = next.y - (following.y - current.y) / 6;
    path += ` C ${controlOneX.toFixed(1)} ${controlOneY.toFixed(1)}, ${controlTwoX.toFixed(1)} ${controlTwoY.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  return path;
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
  const ribbonElement = root.querySelector('#forestRibbon');
  const ribbonBed = root.querySelector('#forestRibbonBed');
  const ribbonPath = root.querySelector('#forestRibbonPath');
  const ribbonPlots = root.querySelector('#forestRibbonPlots');
  const ribbonIndex = root.querySelector('#forestChapterIndex');
  const ribbonStatus = root.querySelector('#forestRibbonStatus');
  const loadingElement = root.querySelector('#forestLoading');
  const errorElement = root.querySelector('#forestWebglError');
  const particleCountElement = root.querySelector('#forestParticleCount');
  if (!sceneHost || !labelsLayer || !connectorsLayer || !ribbonElement
    || !ribbonBed || !ribbonPath || !ribbonPlots || !ribbonIndex || !ribbonStatus) {
    throw new Error('Learning Forest markup is incomplete.');
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
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
      focusVisualNote() {},
      clearVisualNoteFocus() {},
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
  renderer.setPixelRatio(constrained ? 1 : Math.min(window.devicePixelRatio, 1.75));
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
  controls.enabled = true;

  const initialTarget = new THREE.Vector3(0, 0.12, 0);
  const focusCameraPosition = new THREE.Vector3(0.15, 0.22, 14.1);
  const targetCameraPosition = focusCameraPosition.clone();
  const targetControlPoint = initialTarget.clone();
  camera.position.copy(focusCameraPosition);
  controls.target.copy(initialTarget);

  const pointer = new THREE.Vector2(2, 2);
  const raycaster = new THREE.Raycaster();
  const particleHitRay = new THREE.Ray();
  const particleHitInverse = new THREE.Matrix4();
  const particleHitPoint = new THREE.Vector3();
  const particleHitScale = new THREE.Vector3();
  const clock = new THREE.Clock();
  const totalParticleBudget = getParticleBudget();
  const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reducedMotion = Boolean(reducedMotionQuery?.matches);
  let trees = [];
  let overviewSystems = [];
  let focusSystem = null;
  let hitTargets = [];
  let labelEntries = [];
  let ribbonEntries = [];
  let ribbonLayout = [];
  let linkedTreeId = '';
  let selectedTreeId = '';
  let selectedVisualNoteId = '';
  let focusCameraDestination = focusCameraPosition.clone();
  let focusControlTarget = initialTarget.clone();
  let mode = 'empty';
  let cameraIsFlying = false;
  let isOrbitDragging = false;
  let motionPaused = reducedMotion;
  let motionHasStarted = !reducedMotion;
  let motionElapsed = 0;
  let pointerInside = false;
  let pointerPressed = false;
  let pointerGestureMoved = false;
  let lastPointerType = 'mouse';
  let activeOverviewTreeId = '';
  let repelTarget = 0;
  let pressedAt = { x: 0, y: 0, time: 0 };
  let animationFrameId = 0;
  let lastRenderedAt = -Infinity;
  let destroyed = false;
  let forestIsIntersecting = true;

  function isForestViewActive() {
    return !destroyed
      && !document.hidden
      && (document.hasFocus?.() ?? true)
      && forestIsIntersecting
      && !root.hidden
      && root.getClientRects().length > 0
      && root.getAttribute('aria-hidden') !== 'true';
  }

  function isForestAnimationActive() {
    return isForestViewActive() && !reducedMotion;
  }

  function stopAnimationLoop() {
    if (!animationFrameId) return;
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  function scheduleAnimationFrame() {
    if (animationFrameId || !isForestAnimationActive()) return;
    animationFrameId = requestAnimationFrame(render);
  }

  function requestForestRender() {
    if (!isForestViewActive()) {
      stopAnimationLoop();
      return;
    }
    if (reducedMotion) {
      drawForestFrame(performance.now(), true);
      return;
    }
    scheduleAnimationFrame();
  }

  function handleForestActivityChange() {
    if (!isForestViewActive()) {
      stopAnimationLoop();
      return;
    }
    lastRenderedAt = -Infinity;
    requestForestRender();
  }

  function handleForestBlur() {
    stopAnimationLoop();
  }

  function handleReducedMotionChange(event) {
    reducedMotion = Boolean(event.matches);
    root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
    if (reducedMotion) setActiveOverviewTree('');
    if (reducedMotion && cameraIsFlying) {
      camera.position.copy(targetCameraPosition);
      controls.target.copy(targetControlPoint);
      cameraIsFlying = false;
    }
    stopAnimationLoop();
    handleForestActivityChange();
  }

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

  function clearRibbon() {
    ribbonEntries = [];
    ribbonLayout = [];
    linkedTreeId = '';
    ribbonPlots.replaceChildren();
    ribbonIndex.replaceChildren();
    ribbonBed.setAttribute('d', '');
    ribbonPath.setAttribute('d', '');
    ribbonStatus.textContent = '';
  }

  function clearOverview() {
    activeOverviewTreeId = '';
    delete root.dataset.activeParticleTree;
    root.dataset.particleMotion = 'idle';
    overviewSystems.forEach((entry) => disposeSystem(scene, entry.system));
    overviewSystems = [];
  }

  function clearFocus() {
    disposeSystem(scene, focusSystem?.system);
    focusSystem = null;
  }

  function clearSceneContent() {
    selectedVisualNoteId = '';
    delete root.dataset.focusedVisualNote;
    clearLabels();
    clearHitTargets();
    clearOverview();
    clearFocus();
    clearRibbon();
  }

  function setMode(nextMode, treeId = '') {
    mode = nextMode;
    root.dataset.mode = nextMode;
    selectedTreeId = treeId;
    activeOverviewTreeId = '';
    repelTarget = 0;
    delete root.dataset.activeParticleTree;
    syncMotionDataset();
    controls.enabled = nextMode === 'overview' || nextMode === 'focus';
    options.onModeChange?.({ mode, treeId });
  }

  function syncMotionDataset() {
    root.dataset.motion = motionPaused
      ? 'paused'
      : mode === 'overview'
      ? activeOverviewTreeId ? 'active' : 'waiting'
      : 'playing';
    root.dataset.particleMotion = activeOverviewTreeId ? 'active' : 'idle';
  }

  function setMotionPaused(nextPaused) {
    motionPaused = Boolean(nextPaused);
    if (motionPaused) {
      setActiveOverviewTree('');
      repelTarget = 0;
    } else {
      motionHasStarted = true;
      if (mode === 'overview' && pointerInside) updateOverviewPointerActivation();
      if (mode !== 'overview') {
        getActiveSystems().forEach((entry) => {
          entry.system.uniforms.uEdgeDissolveStrength.value = 1;
        });
      }
    }
    syncMotionDataset();
    requestForestRender();
    return motionPaused;
  }

  function setCameraTarget(position, target) {
    targetCameraPosition.copy(position);
    targetControlPoint.copy(target);
    if (reducedMotion) {
      camera.position.copy(position);
      controls.target.copy(target);
      cameraIsFlying = false;
      requestForestRender();
      return;
    }
    cameraIsFlying = true;
  }

  function fitCameraToOverview() {
    if (!ribbonLayout.length) return;
    const bounds = new THREE.Box3();
    const systemsByTreeId = new Map(overviewSystems.map((entry) => [entry.record.id, entry]));
    ribbonEntries.forEach((ribbonEntry) => {
      const overviewEntry = systemsByTreeId.get(ribbonEntry.record.id);
      if (!overviewEntry) {
        bounds.expandByPoint(ribbonEntry.position);
        return;
      }
      overviewEntry.system.points.updateMatrixWorld(true);
      bounds.union(
        overviewEntry.system.bounds.clone().applyMatrix4(overviewEntry.system.points.matrixWorld),
      );
    });
    if (bounds.isEmpty()) {
      ribbonLayout.forEach((position) => (
        bounds.expandByPoint(new THREE.Vector3(position.x, 0, position.z))
      ));
    }
    // Reserve real visual breathing room above the tallest canopy and around
    // outer roots instead of fitting only the invisible planting coordinates.
    bounds.expandByVector(new THREE.Vector3(1.7, 2.2, 1.7));
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const fitHeightDistance = size.y / (2 * Math.tan(verticalFov / 2));
    const fitWidthDistance = size.x / (2 * Math.tan(verticalFov / 2) * Math.max(camera.aspect, 0.1));
    const distance = Math.max(fitHeightDistance, fitWidthDistance, size.z * 1.22, 10) * 1.24;
    const position = new THREE.Vector3(
      center.x,
      center.y + Math.max(7.2, size.z * 0.92),
      center.z + distance
    );
    setCameraTarget(position, center.clone().add(new THREE.Vector3(0, -0.6, 0)));
  }

  function setLinkedTree(treeId = '') {
    linkedTreeId = treeId;
    ribbonEntries.forEach((entry) => {
      const isLinked = Boolean(treeId && entry.record.id === treeId);
      entry.plot.classList.toggle('is-linked', isLinked);
      entry.indexButton.classList.toggle('is-linked', isLinked);
    });
    overviewSystems.forEach((entry) => {
      const baseOpacity = mode === 'focus'
        ? BACKGROUND_TREE_OPACITY
        : entry.record.id === selectedTreeId
        ? OVERVIEW_SELECTED_OPACITY
        : OVERVIEW_CONTEXT_OPACITY;
      entry.targetOpacity = treeId && entry.record.id === treeId ? 1 : baseOpacity;
    });
    requestForestRender();
  }

  function bindRibbonFeedback(element, treeId) {
    element.addEventListener('pointerenter', () => setLinkedTree(treeId));
    element.addEventListener('pointerleave', () => {
      if (linkedTreeId === treeId) setLinkedTree('');
    });
    element.addEventListener('focus', () => setLinkedTree(treeId));
    element.addEventListener('blur', () => {
      if (linkedTreeId === treeId) setLinkedTree('');
    });
  }

  function moveIndexFocus(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = Math.max(0, index - 1);
    if (event.key === 'ArrowRight') nextIndex = Math.min(ribbonEntries.length - 1, index + 1);
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = ribbonEntries.length - 1;
    ribbonEntries[nextIndex]?.indexButton.focus({ preventScroll: true });
  }

  function createPlotButton(record, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'forest-ribbon__plot';
    button.dataset.treeId = record.id;
    button.dataset.growth = record.growthStage;
    button.dataset.status = record.status;
    button.title = record.name;
    button.setAttribute(
      'aria-label',
      `Open chapter ${index + 1}, ${record.name}. ${growthLabel(record)}. ${growthMeta(record)}.`,
    );

    const number = document.createElement('span');
    number.className = 'forest-ribbon__plot-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const plant = document.createElement('span');
    plant.className = 'forest-ribbon__plant';
    plant.setAttribute('aria-hidden', 'true');
    const crown = document.createElement('span');
    crown.className = 'forest-ribbon__plant-crown';
    const stem = document.createElement('span');
    stem.className = 'forest-ribbon__plant-stem';
    const base = document.createElement('span');
    base.className = 'forest-ribbon__plant-base';
    const pulse = document.createElement('span');
    pulse.className = 'forest-ribbon__completion-pulse';
    plant.append(crown, stem, base, pulse);
    const title = document.createElement('span');
    title.className = 'forest-ribbon__plot-title';
    title.textContent = record.name;
    const meta = document.createElement('span');
    meta.className = 'forest-ribbon__plot-meta';
    meta.textContent = `${record.visualNoteCount || 0} ${(record.visualNoteCount || 0) === 1 ? 'note' : 'notes'} · ${record.sourceCount || 0} ${(record.sourceCount || 0) === 1 ? 'source' : 'sources'}`;
    button.append(number, plant, title, meta);
    button.addEventListener('click', () => focusTree(record.id));
    bindRibbonFeedback(button, record.id);
    return button;
  }

  function createIndexButton(record, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'forest-ribbon__index-button';
    button.dataset.treeId = record.id;
    button.dataset.status = record.status;
    button.setAttribute('aria-label', `Chapter ${index + 1}: ${record.name}`);
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.textContent = record.name;
    button.append(number, title);
    button.addEventListener('click', () => focusTree(record.id));
    button.addEventListener('keydown', (event) => moveIndexFocus(event, index));
    bindRibbonFeedback(button, record.id);
    return button;
  }

  function buildRibbon(activeTreeId, presentation) {
    ribbonLayout = buildLayout(trees, camera.aspect || 1);
    ribbonElement.hidden = false;
    ribbonElement.dataset.presentation = presentation;
    ribbonElement.dataset.density = trees.length >= COMPACT_RIBBON_CHAPTER_COUNT
      ? 'compact'
      : 'comfortable';
    ribbonEntries = trees.map((record, index) => {
      const plot = createPlotButton(record, index);
      const indexButton = createIndexButton(record, index);
      ribbonPlots.append(plot);
      ribbonIndex.append(indexButton);
      return {
        record,
        plot,
        indexButton,
        position: new THREE.Vector3(ribbonLayout[index].x, 0, ribbonLayout[index].z),
        layoutRow: ribbonLayout[index].row,
        projected: new THREE.Vector3(),
      };
    });
    const activeIndex = Math.max(0, trees.findIndex((tree) => tree.id === activeTreeId));
    ribbonEntries.forEach((entry, index) => {
      const isSelected = entry.record.id === activeTreeId;
      entry.plot.classList.toggle('is-selected', isSelected);
      entry.indexButton.classList.toggle('is-selected', isSelected);
      entry.plot.setAttribute('aria-current', isSelected ? 'step' : 'false');
      entry.indexButton.setAttribute('aria-current', isSelected ? 'step' : 'false');
      entry.plot.hidden = false;
      entry.plot.dataset.live = entry.record.growthStage === 'plot' ? 'false' : 'true';
    });
    const active = trees[activeIndex];
    if (active) {
      ribbonStatus.textContent = `${activeIndex + 1} of ${trees.length} · ${growthLabel(active)} · ${growthMeta(active)}`;
      requestAnimationFrame(() => {
        const selected = ribbonEntries[activeIndex]?.indexButton;
        if (!selected) return;
        const left = selected.offsetLeft - ribbonIndex.clientWidth / 2 + selected.offsetWidth / 2;
        ribbonIndex.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }
  }

  function addTreeHitTarget(record, system, position, visualScale) {
    const systemSize = system.bounds.getSize(new THREE.Vector3()).multiplyScalar(visualScale);
    const hitTarget = new THREE.Mesh(
      new THREE.BoxGeometry(
        Math.max(1.1, systemSize.x),
        Math.max(1.4, systemSize.y),
        Math.max(1.1, systemSize.z),
      ),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
    );
    const systemCenter = system.bounds.getCenter(new THREE.Vector3()).multiplyScalar(visualScale);
    hitTarget.position.copy(position).add(systemCenter);
    hitTarget.userData = { kind: 'tree', treeId: record.id };
    scene.add(hitTarget);
    hitTargets.push(hitTarget);
    return hitTarget;
  }

  function buildPreviewSystems({
    excludeTreeId = '',
    highlightedTreeId = '',
    dimmed = false,
    poolLimit,
    minimumTreeBudget = OVERVIEW_MIN_TREE_BUDGET,
  } = {}) {
    const budgets = allocateOverviewBudgets(
      trees.filter((record) => record.id !== excludeTreeId),
      totalParticleBudget,
      { poolLimit, minimumTreeBudget },
    );
    let particleTotal = 0;
    ribbonEntries.forEach((ribbonEntry) => {
      const record = ribbonEntry.record;
      const budget = budgets.get(record.id) || 0;
      if (!budget || record.id === excludeTreeId) return;
      const system = createParticleTree([], renderer, {
        seed: record.seed,
        particleBudget: budget,
        growthStage: record.growthStage,
        opacity: 0,
        edgeDissolveStrength: mode === 'overview' ? 0 : (motionHasStarted ? 1 : 0),
        motionStrength: mode === 'overview' ? 0 : 1,
      });
      const isHighlighted = !dimmed && record.id === highlightedTreeId;
      const overviewScale = isHighlighted
        ? OVERVIEW_SELECTED_TREE_SCALE
        : OVERVIEW_CONTEXT_TREE_SCALE;
      const visualScale = overviewScale * system.spatialScale;
      system.points.scale.setScalar(visualScale);
      system.points.position.copy(ribbonEntry.position);
      scene.add(system.points);
      const entry = {
        record,
        system,
        isHighlighted,
        targetOpacity: dimmed
          ? BACKGROUND_TREE_OPACITY
          : isHighlighted
          ? OVERVIEW_SELECTED_OPACITY
          : OVERVIEW_CONTEXT_OPACITY,
        targetScale: visualScale,
        targetMotionStrength: mode === 'overview' ? 0 : 1,
        motionElapsed: 0,
        hasInteracted: mode !== 'overview',
      };
      entry.hitTarget = addTreeHitTarget(record, system, ribbonEntry.position, visualScale);
      overviewSystems.push(entry);
      particleTotal += budget;
    });
    return particleTotal;
  }

  function getFocusPose(system, anchor) {
    const scale = system?.spatialScale || 1;
    const center = system
      ? system.bounds.getCenter(new THREE.Vector3()).multiplyScalar(scale).add(anchor)
      : anchor.clone().add(new THREE.Vector3(0, -1.25, 0));
    const size = system
      ? system.bounds.getSize(new THREE.Vector3()).multiplyScalar(scale)
      : new THREE.Vector3(2.4, 2.2, 2.4);
    const distance = THREE.MathUtils.clamp(Math.max(size.y * 1.78, size.x * 1.95, 5.8), 5.8, 17);
    return {
      position: center.clone().add(new THREE.Vector3(0.16, size.y * 0.04, distance)),
      target: center.clone().add(new THREE.Vector3(0, -size.y * 0.015, 0)),
    };
  }

  function buildOverview(preferredTreeId = selectedTreeId) {
    const activeRecord = trees.find((tree) => tree.id === preferredTreeId) || trees[0];
    clearSceneContent();
    if (!trees.length) {
      setMode('empty');
      ribbonElement.hidden = true;
      loadingElement.hidden = true;
      if (particleCountElement) particleCountElement.textContent = 'No grains';
      return;
    }
    setMode('overview', activeRecord.id);
    loadingElement.hidden = false;
    loadingElement.querySelector('span:last-child').textContent = 'Growing the learning forest';
    buildRibbon(activeRecord.id, 'overview');
    const particleTotal = buildPreviewSystems({ highlightedTreeId: activeRecord.id });
    if (particleCountElement) {
      particleCountElement.textContent = particleTotal
        ? `${Math.round(particleTotal / 1000)}K forest grains`
        : 'Bare learning plots';
    }
    fitCameraToOverview();
    loadingElement.hidden = true;
    requestForestRender();
  }

  function addVisualNoteLabels(record, system) {
    system.chapterLeaves.forEach((leaf) => {
      const note = record.visualNotes.find((item) => item.id === leaf.chapter.id);
      if (!note) return;
      const connector = createConnector(connectorsLayer);
      const button = createLabelButton(
        note,
        'note',
        () => focusVisualNote(record.id, note.id),
        () => { cameraIsFlying = false; },
      );
      labelsLayer.append(button);
      labelEntries.push({
        type: 'note',
        id: note.id,
        record: note,
        treeRecord: record,
        leaf,
        system,
        points: system.points,
        button,
        connector,
        projected: new THREE.Vector3(),
      });
      const hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(0.28, leaf.length * 0.72), 12, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
      );
      hitTarget.position.copy(leaf.center);
      hitTarget.userData = { kind: 'visual-note', treeId: record.id, artifactId: note.id };
      system.points.add(hitTarget);
      hitTargets.push(hitTarget);
    });
  }

  function focusVisualNote(treeId, artifactId) {
    const record = trees.find((tree) => tree.id === treeId);
    const note = record?.visualNotes.find((item) => item.id === artifactId);
    if (!record || !note) return false;
    if (!focusSystem || selectedTreeId !== record.id) focusTree(record.id);
    const entry = labelEntries.find((item) => (
      item.type === 'note'
      && item.treeRecord.id === record.id
      && item.id === note.id
    ));
    if (!entry) return false;
    const { cameraDestination, framingTarget } = getVisualNotePose(entry);
    selectedVisualNoteId = note.id;
    root.dataset.focusedVisualNote = note.id;
    labelEntries.forEach((item) => item.button.classList.toggle('is-selected', item.id === note.id));
    setCameraTarget(cameraDestination, framingTarget);
    options.onSelectVisualNote?.({ treeId: record.id, artifactId: note.id });
    requestForestRender();
    return true;
  }

  function getVisualNotePose(entry) {
    entry.points.updateMatrixWorld(true);
    const worldTarget = entry.leaf.center.clone().applyMatrix4(entry.points.matrixWorld);
    const approach = camera.position.clone().sub(worldTarget);
    if (approach.lengthSq() < 0.0001) approach.set(0.12, 0.06, 1);
    approach.normalize();
    const cameraDestination = worldTarget.clone()
      .addScaledVector(approach, CONCEPT_CAMERA_DISTANCE)
      .add(new THREE.Vector3(0, 0.08, 0));
    const framingTarget = worldTarget.clone().add(new THREE.Vector3(0, -CONCEPT_CAMERA_TARGET_DROP, 0));
    return { cameraDestination, framingTarget };
  }

  function clearVisualNoteFocus() {
    if (!selectedVisualNoteId) return false;
    selectedVisualNoteId = '';
    delete root.dataset.focusedVisualNote;
    labelEntries.forEach((entry) => entry.button.classList.remove('is-selected'));
    setCameraTarget(focusCameraDestination, focusControlTarget);
    requestForestRender();
    return true;
  }

  function focusTree(treeId) {
    const record = trees.find((tree) => tree.id === treeId);
    if (!record) return false;
    const wasOverview = mode === 'overview';
    const previousOverviewScale = overviewSystems.find((entry) => (
      entry.record.id === record.id
    ))?.system.points.scale.x;
    const previousAnchor = ribbonEntries.find((entry) => entry.record.id === record.id)?.position.clone();
    clearSceneContent();
    setMode('focus', record.id);
    loadingElement.hidden = false;
    loadingElement.querySelector('span:last-child').textContent = `Opening ${record.name}`;
    buildRibbon(record.id, 'focus');
    const anchor = ribbonEntries.find((entry) => entry.record.id === record.id)?.position.clone()
      || previousAnchor
      || new THREE.Vector3();
    const backgroundTreeCount = trees.filter((tree) => (
      tree.id !== record.id && tree.growthStage !== 'plot'
    )).length;
    const requestedFocusBudget = particleBudgetForStage(record, totalParticleBudget, false);
    const backgroundReserve = Math.min(
      Math.round(totalParticleBudget * FOCUS_BACKGROUND_MAX_RATIO),
      backgroundTreeCount * FOCUS_BACKGROUND_MIN_TREE_BUDGET,
    );
    const focusedBudget = record.growthStage === 'plot'
      ? 0
      : Math.max(18_000, Math.min(requestedFocusBudget, totalParticleBudget - backgroundReserve));
    const backgroundTotal = buildPreviewSystems({
      excludeTreeId: record.id,
      dimmed: true,
      poolLimit: Math.max(0, totalParticleBudget - focusedBudget),
      minimumTreeBudget: FOCUS_BACKGROUND_MIN_TREE_BUDGET,
    });
    if (record.growthStage === 'plot') {
      const pose = getFocusPose(null, anchor);
      focusCameraDestination.copy(pose.position);
      focusControlTarget.copy(pose.target);
      setCameraTarget(pose.position, pose.target);
      if (particleCountElement) particleCountElement.textContent = backgroundTotal ? `${Math.round(backgroundTotal / 1000)}K background grains` : 'Bare learning plot';
      loadingElement.hidden = true;
      options.onSelectTree?.({ treeId: record.id });
      requestForestRender();
      return true;
    }
    const noteBranches = record.visualNotes.map((note) => ({
      id: note.id,
      date: formatTreeDate(note.createdAt || record.createdAt),
      subheader: note.title,
    }));
    const system = createParticleTree(noteBranches, renderer, {
      seed: record.seed,
      particleBudget: focusedBudget,
      growthStage: record.growthStage,
      opacity: 0,
      edgeDissolveStrength: motionHasStarted ? 1 : 0,
      motionStrength: 1,
    });
    const focusedScale = system.spatialScale;
    const startingScale = wasOverview
      ? previousOverviewScale || OVERVIEW_SELECTED_TREE_SCALE * system.spatialScale
      : focusedScale;
    system.points.position.copy(anchor);
    system.points.scale.setScalar(startingScale);
    scene.add(system.points);
    focusSystem = {
      record,
      system,
      targetOpacity: 1,
      targetPosition: anchor.clone(),
      targetScale: focusedScale,
      targetMotionStrength: 1,
    };
    addVisualNoteLabels(record, system);
    if (reducedMotion) system.points.scale.setScalar(focusedScale);
    const pose = getFocusPose(system, anchor);
    focusCameraDestination.copy(pose.position);
    focusControlTarget.copy(pose.target);
    setCameraTarget(pose.position, pose.target);
    if (particleCountElement) {
      particleCountElement.textContent = focusedBudget >= 1_000_000
        ? `${(focusedBudget / 1_000_000).toFixed(2)}M focused grains`
        : `${Math.round(focusedBudget / 1000)}K focused grains`;
    }
    loadingElement.hidden = true;
    options.onSelectTree?.({ treeId: record.id });
    requestForestRender();
    return true;
  }

  function showOverview() {
    if (trees.length <= 1) {
      if (trees[0]) focusTree(trees[0].id);
      return;
    }
    buildOverview(selectedTreeId);
  }

  function setTrees(nextTrees) {
    const previousTreeId = selectedTreeId;
    const previousVisualNoteId = selectedVisualNoteId;
    const wasFocused = mode === 'focus';
    trees = Array.isArray(nextTrees)
      ? nextTrees.filter((tree) => tree?.id && tree?.name).map((tree) => {
        const concepts = (tree.concepts || []).slice(0, 7);
        const visualNotes = Array.isArray(tree.visualNotes)
          ? tree.visualNotes.filter((note) => note?.id && note?.title)
          : [];
        const visualNoteCount = Number.isFinite(Number(tree.visualNoteCount))
          ? Math.max(0, Math.floor(Number(tree.visualNoteCount)))
          : visualNotes.length;
        const sourceCount = Math.max(0, Math.floor(Number(tree.sourceCount) || 0));
        const growthUnitCount = Number.isFinite(Number(tree.growthUnitCount))
          ? Math.max(0, Math.floor(Number(tree.growthUnitCount)))
          : visualNoteCount + sourceCount;
        const growthStage = ['plot', 'seedling', 'growing', 'mature'].includes(tree.growthStage)
          ? tree.growthStage
          : (growthUnitCount === 0 ? 'plot' : growthUnitCount <= 2 ? 'seedling' : growthUnitCount <= 5 ? 'growing' : 'mature');
        return {
          ...tree,
          concepts,
          visualNotes,
          visualNoteCount,
          sourceCount,
          growthUnitCount,
          growthStage,
        };
      })
      : [];
    if (!trees.length) {
      clearSceneContent();
      setMode('empty');
      ribbonElement.hidden = true;
      loadingElement.hidden = true;
      requestForestRender();
      return;
    }
    if (trees.length === 1) {
      focusTree(trees[0].id);
      if (previousVisualNoteId && trees[0].visualNotes.some((note) => note.id === previousVisualNoteId)) {
        focusVisualNote(trees[0].id, previousVisualNoteId);
      }
      return;
    }
    if (wasFocused && trees.some((tree) => tree.id === previousTreeId)) {
      focusTree(previousTreeId);
      if (previousVisualNoteId && trees.find((tree) => tree.id === previousTreeId)?.visualNotes
        .some((note) => note.id === previousVisualNoteId)) {
        focusVisualNote(previousTreeId, previousVisualNoteId);
      }
      return;
    }
    buildOverview(trees.some((tree) => tree.id === previousTreeId) ? previousTreeId : trees[0].id);
  }

  function getActiveSystems() {
    return focusSystem ? [...overviewSystems, focusSystem] : overviewSystems;
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

  function rayTouchesOverviewParticle(entry) {
    const points = entry?.system?.points;
    const positions = points?.geometry?.getAttribute('position');
    if (!points || !positions?.count) return false;
    points.updateWorldMatrix(true, false);
    particleHitInverse.copy(points.matrixWorld).invert();
    particleHitRay.copy(raycaster.ray).applyMatrix4(particleHitInverse);
    points.getWorldScale(particleHitScale);
    const worldScale = Math.max(
      Math.abs(particleHitScale.x),
      Math.abs(particleHitScale.y),
      Math.abs(particleHitScale.z),
      0.001,
    );
    const localThreshold = POINTER_PARTICLE_HIT_THRESHOLD / worldScale;
    const localThresholdSquared = localThreshold * localThreshold;
    for (let index = 0; index < positions.count; index += 1) {
      particleHitPoint.fromBufferAttribute(positions, index);
      if (particleHitRay.distanceSqToPoint(particleHitPoint) <= localThresholdSquared) return true;
    }
    return false;
  }

  function findOverviewParticleEntryAtPointer() {
    if (mode !== 'overview' || motionPaused || reducedMotion || !pointerInside) return null;
    const treeTargets = overviewSystems
      .map((entry) => entry.hitTarget)
      .filter((target) => target?.parent);
    treeTargets.forEach((target) => target.updateWorldMatrix(true, false));
    const candidates = raycaster.intersectObjects(treeTargets, false);
    for (const candidate of candidates) {
      const entry = overviewSystems.find((item) => item.hitTarget === candidate.object);
      if (entry && rayTouchesOverviewParticle(entry)) return entry;
    }
    return null;
  }

  function setActiveOverviewTree(treeId = '') {
    const nextTreeId = mode === 'overview' && !motionPaused && !reducedMotion
      ? String(treeId || '')
      : '';
    repelTarget = nextTreeId ? POINTER_REPEL_STRENGTH : 0;
    if (nextTreeId === activeOverviewTreeId) {
      syncMotionDataset();
      return;
    }
    activeOverviewTreeId = nextTreeId;
    if (activeOverviewTreeId) {
      const activeEntry = overviewSystems.find((entry) => entry.record.id === activeOverviewTreeId);
      if (activeEntry) {
        activeEntry.hasInteracted = true;
        activeEntry.targetMotionStrength = 1;
        activeEntry.system.uniforms.uEdgeDissolveStrength.value = 1;
      }
      root.dataset.activeParticleTree = activeOverviewTreeId;
    } else {
      delete root.dataset.activeParticleTree;
    }
    syncMotionDataset();
    requestForestRender();
  }

  function updateOverviewPointerActivation() {
    if (pointerGestureMoved || (isOrbitDragging && !pointerPressed)) {
      setActiveOverviewTree('');
      return null;
    }
    const entry = findOverviewParticleEntryAtPointer();
    setActiveOverviewTree(entry?.record.id || '');
    return entry;
  }

  function onPointerEnter(event) {
    pointerInside = true;
    lastPointerType = event.pointerType || 'mouse';
    updatePointer(event);
    if (mode === 'overview') updateOverviewPointerActivation();
    else {
      repelTarget = isOrbitDragging || event.buttons !== 0
        ? 0
        : POINTER_REPEL_STRENGTH;
    }
  }

  function onPointerMove(event) {
    if (!pointerInside) return;
    lastPointerType = event.pointerType || lastPointerType;
    if (pointerPressed) {
      const moved = Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y);
      if (moved > 7) pointerGestureMoved = true;
    }
    updatePointer(event);
    if (mode === 'overview') {
      updateOverviewPointerActivation();
      return;
    }
    repelTarget = isOrbitDragging || event.buttons !== 0
      ? 0
      : POINTER_REPEL_STRENGTH;
  }

  function onPointerLeave() {
    pointerInside = false;
    pointerPressed = false;
    pointerGestureMoved = false;
    repelTarget = 0;
    setActiveOverviewTree('');
    pointer.set(2, 2);
  }

  function onPointerDown(event) {
    pointerInside = true;
    pointerPressed = true;
    pointerGestureMoved = false;
    lastPointerType = event.pointerType || 'mouse';
    pressedAt = { x: event.clientX, y: event.clientY, time: performance.now() };
    updatePointer(event);
    if (mode === 'overview') updateOverviewPointerActivation();
    else repelTarget = 0;
  }

  function onPointerUp(event) {
    const moved = Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y);
    const isClick = moved <= 7 && performance.now() - pressedAt.time <= 650;
    updatePointer(event);
    pointerPressed = false;
    if (mode === 'overview') {
      if (event.pointerType === 'touch' || pointerGestureMoved) setActiveOverviewTree('');
      else updateOverviewPointerActivation();
    }
    pointerGestureMoved = false;
    if (!isClick) return;
    raycaster.setFromCamera(pointer, camera);
    const intersection = raycaster.intersectObjects(hitTargets, false)[0];
    if (!intersection) return;
    const data = intersection.object.userData;
    if (data.kind === 'tree') focusTree(data.treeId);
    if (data.kind === 'visual-note') focusVisualNote(data.treeId, data.artifactId);
  }

  function onPointerCancel() {
    onPointerLeave();
  }

  function onControlsStart() {
    // A drag must have one visual owner. Stop camera flights and particle
    // repulsion while OrbitControls is rotating so the tree remains rigid in
    // its own coordinate space instead of appearing to shake under the cursor.
    cameraIsFlying = false;
    isOrbitDragging = true;
    repelTarget = 0;
    if (mode === 'overview' && (!pointerPressed || pointerGestureMoved)) {
      setActiveOverviewTree('');
    }
  }

  function onControlsEnd() {
    isOrbitDragging = false;
    if (mode === 'overview') {
      if (lastPointerType === 'touch' || pointerGestureMoved) setActiveOverviewTree('');
      else updateOverviewPointerActivation();
    } else {
      repelTarget = pointerInside ? POINTER_REPEL_STRENGTH : 0;
    }
    pointerGestureMoved = false;
  }

  function onKeyDown(event) {
    if (event.key === 'Escape' && selectedVisualNoteId) {
      clearVisualNoteFocus();
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
    ribbonPath.ownerSVGElement?.setAttribute('viewBox', `0 0 ${width} ${height}`);
    if ((mode === 'overview' || mode === 'focus') && trees.length) {
      const nextLayout = buildLayout(trees, camera.aspect || 1);
      ribbonLayout = nextLayout;
      ribbonEntries.forEach((entry, index) => {
        const position = nextLayout[index];
        entry.position.set(position.x, 0, position.z);
        entry.layoutRow = position.row;
      });
      overviewSystems.forEach((overviewEntry) => {
        const ribbonEntry = ribbonEntries.find((entry) => entry.record.id === overviewEntry.record.id);
        if (!ribbonEntry) return;
        overviewEntry.system.points.position.copy(ribbonEntry.position);
        const systemCenter = overviewEntry.system.bounds.getCenter(new THREE.Vector3())
          .multiplyScalar(overviewEntry.system.points.scale.x);
        overviewEntry.hitTarget?.position.copy(ribbonEntry.position).add(systemCenter);
      });
      if (mode === 'overview') {
        fitCameraToOverview();
      } else {
        const selectedEntry = ribbonEntries.find((entry) => entry.record.id === selectedTreeId);
        if (!selectedEntry) return;
        if (focusSystem) {
          focusSystem.targetPosition.copy(selectedEntry.position);
          focusSystem.system.points.position.copy(selectedEntry.position);
          focusSystem.system.points.updateMatrixWorld(true);
        }
        const selectedNoteEntry = selectedVisualNoteId
          ? labelEntries.find((entry) => entry.id === selectedVisualNoteId)
          : null;
        if (selectedNoteEntry) {
          const pose = getVisualNotePose(selectedNoteEntry);
          setCameraTarget(pose.cameraDestination, pose.framingTarget);
        } else {
          const pose = getFocusPose(focusSystem?.system || null, selectedEntry.position);
          focusCameraDestination.copy(pose.position);
          focusControlTarget.copy(pose.target);
          setCameraTarget(pose.position, pose.target);
        }
      }
    }
    requestForestRender();
  }

  function getRibbonRoot(entry) {
    const activeEntry = getActiveSystems().find((item) => item.record.id === entry.record.id);
    if (activeEntry) {
      activeEntry.system.points.updateMatrixWorld(true);
      const bounds = activeEntry.system.bounds;
      const center = bounds.getCenter(new THREE.Vector3());
      return new THREE.Vector3(center.x, bounds.min.y - 0.08, center.z)
        .applyMatrix4(activeEntry.system.points.matrixWorld);
    }
    if (mode === 'focus' && entry.record.id === selectedTreeId) {
      return entry.position.clone().add(new THREE.Vector3(0, RIBBON_GROUND_Y, 0));
    }
    return entry.position.clone().add(new THREE.Vector3(0, RIBBON_GROUND_Y, 0));
  }

  function updateRibbonProjection() {
    const width = sceneHost.clientWidth;
    const height = sceneHost.clientHeight;
    if (!width || !height || !ribbonEntries.length) return;
    const dockTop = ribbonIndex.parentElement?.getBoundingClientRect().top ?? height;
    const safeTop = width <= 560 ? 208 : (width <= 860 ? 150 : 112);
    const safeBottom = Math.max(safeTop, dockTop - 54);
    const compact = ribbonEntries.length >= COMPACT_RIBBON_CHAPTER_COUNT
      || (width <= 640 && ribbonEntries.length >= 6);
    ribbonElement.dataset.density = compact ? 'compact' : 'comfortable';
    const trackPoints = [];
    const projectedPlots = ribbonEntries.map((entry) => {
      const rootPoint = getRibbonRoot(entry);
      entry.projected.copy(rootPoint).project(camera);
      const inFrustum = entry.projected.z > -1 && entry.projected.z < 1
        && Math.abs(entry.projected.x) < 1.3 && Math.abs(entry.projected.y) < 1.3;
      const screenX = (entry.projected.x * 0.5 + 0.5) * width;
      const rawScreenY = (-entry.projected.y * 0.5 + 0.5) * height;
      const screenY = THREE.MathUtils.clamp(rawScreenY, safeTop, safeBottom);
      return {
        entry,
        row: entry.layoutRow || 0,
        screenX,
        screenY,
        routeX: THREE.MathUtils.clamp(screenX, 0, width),
        routeY: screenY,
        shouldShow: inFrustum,
        isSelected: entry.record.id === selectedTreeId,
        hasLiveTree: entry.record.growthStage !== 'plot',
        isBackgroundPlot: mode === 'focus' && entry.record.id !== selectedTreeId,
      };
    });
    separateChapterPlotPositions(projectedPlots, width, safeTop, safeBottom, compact)
      .forEach((item) => {
        const {
          entry,
          screenX,
          screenY,
          routeX,
          routeY,
          shouldShow,
          isBackgroundPlot,
        } = item;
        entry.plot.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`;
        entry.plot.style.opacity = shouldShow ? (isBackgroundPlot ? '0.32' : '1') : '0';
        entry.plot.style.visibility = shouldShow ? 'visible' : 'hidden';
        if (mode === 'overview' && shouldShow) trackPoints.push({ x: routeX, y: routeY });
      });
    const ribbonCurve = mode === 'overview' ? buildSmoothPath(trackPoints) : '';
    ribbonBed.setAttribute('d', ribbonCurve);
    ribbonPath.setAttribute('d', ribbonCurve);
  }

  function updateProjectedLabels() {
    const width = sceneHost.clientWidth;
    const height = sceneHost.clientHeight;
    if (!width || !height) return;
    const visibleNotes = [];
    const projectedTreeBounds = new Map();
    getActiveSystems().forEach((entry) => {
      projectedTreeBounds.set(
        entry.system,
        projectSystemHorizontalBounds(entry.system, camera, width),
      );
    });
    labelEntries.forEach((entry) => {
      const localAnchor = entry.leaf.labelAnchor;
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
      entry.isVisible = inFrustum && !selectedVisualNoteId;
      if (entry.isVisible) visibleNotes.push(entry);
    });
    const labelSafeTop = width <= 560 ? 238 : (width <= 860 ? 150 : 140);
    const columns = [
      visibleNotes.filter((entry) => !entry.placeAtRight),
      visibleNotes.filter((entry) => entry.placeAtRight)
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
      if (treeBounds) {
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
      const unitX = toLeafX / rawDistance;
      const unitY = toLeafY / rawDistance;
      const treeInset = Math.min(CONNECTOR_TREE_INSET, rawDistance * 0.2);
      const connectorLength = Math.min(rawDistance - treeInset, MAX_CONCEPT_CONNECTOR_LENGTH);
      const endX = leafX - unitX * treeInset;
      const endY = leafY - unitY * treeInset;
      const connectorStartX = endX - unitX * connectorLength;
      const connectorStartY = endY - unitY * connectorLength;
      entry.connector.setAttribute('d', `M ${connectorStartX.toFixed(1)} ${connectorStartY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`);
      entry.connector.style.opacity = entry.isVisible ? '1' : '0';
    });
  }

  function drawForestFrame(timestamp = 0, settleImmediately = false) {
    const delta = Math.min(clock.getDelta(), 0.05);
    lastRenderedAt = timestamp;
    if (cameraIsFlying) {
      if (settleImmediately) {
        camera.position.copy(targetCameraPosition);
        controls.target.copy(targetControlPoint);
        cameraIsFlying = false;
      } else {
        camera.position.lerp(targetCameraPosition, 1 - Math.exp(-4.6 * delta));
        controls.target.lerp(targetControlPoint, 1 - Math.exp(-5.4 * delta));
      }
      if (cameraIsFlying && camera.position.distanceTo(targetCameraPosition) < 0.01
        && controls.target.distanceTo(targetControlPoint) < 0.01) {
        camera.position.copy(targetCameraPosition);
        controls.target.copy(targetControlPoint);
        cameraIsFlying = false;
      }
    }
    // OrbitControls documents that update() should follow manual camera or
    // target changes when damping is enabled.
    controls.update();
    if (!motionPaused && !settleImmediately && mode !== 'overview') motionElapsed += delta;
    const elapsed = motionElapsed;
    getActiveSystems().forEach((entry) => {
      const uniforms = entry.system.uniforms;
      const isActiveOverviewEntry = mode === 'overview'
        && !motionPaused
        && entry.record.id === activeOverviewTreeId;
      if (entry.targetPosition) {
        if (settleImmediately) entry.system.points.position.copy(entry.targetPosition);
        else entry.system.points.position.lerp(entry.targetPosition, 1 - Math.exp(-4.8 * delta));
      }
      if (Number.isFinite(entry.targetScale)) {
        const nextScale = settleImmediately
          ? entry.targetScale
          : damp(entry.system.points.scale.x, entry.targetScale, 4.8, delta);
        entry.system.points.scale.setScalar(nextScale);
      }
      if (mode === 'overview') {
        if (isActiveOverviewEntry && !settleImmediately) entry.motionElapsed += delta;
        uniforms.u_time.value = entry.motionElapsed || 0;
      } else {
        uniforms.u_time.value = elapsed;
      }
      if (Number.isFinite(entry.targetMotionStrength)) {
        uniforms.uMotionStrength.value = settleImmediately
          ? entry.targetMotionStrength
          : damp(
            uniforms.uMotionStrength.value,
            entry.targetMotionStrength,
            POINTER_REPEL_RESPONSE,
            delta,
          );
      }
      const entryRepelTarget = mode === 'overview'
        ? isActiveOverviewEntry ? repelTarget : 0
        : repelTarget;
      uniforms.uRepelStrength.value = settleImmediately
        ? 0
        : damp(uniforms.uRepelStrength.value, entryRepelTarget, POINTER_REPEL_RESPONSE, delta);
      uniforms.uOpacity.value = settleImmediately
        ? entry.targetOpacity
        : damp(uniforms.uOpacity.value, entry.targetOpacity, 5, delta);
    });
    updateRibbonProjection();
    updateProjectedLabels();
    renderer.render(scene, camera);
  }

  function render(timestamp = 0) {
    animationFrameId = 0;
    if (!isForestAnimationActive()) return;
    if (timestamp - lastRenderedAt < TARGET_FRAME_INTERVAL) {
      scheduleAnimationFrame();
      return;
    }
    drawForestFrame(timestamp);
    scheduleAnimationFrame();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(sceneHost);
  const visibilityObserver = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([entry]) => {
      forestIsIntersecting = Boolean(entry?.isIntersecting);
      handleForestActivityChange();
    })
    : null;
  visibilityObserver?.observe(root);
  renderer.domElement.addEventListener('pointerenter', onPointerEnter);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerleave', onPointerLeave);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerCancel);
  controls.addEventListener('start', onControlsStart);
  controls.addEventListener('end', onControlsEnd);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('focus', handleForestActivityChange);
  window.addEventListener('blur', handleForestBlur);
  document.addEventListener('visibilitychange', handleForestActivityChange);
  reducedMotionQuery?.addEventListener?.('change', handleReducedMotionChange);
  root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  resize();
  setMotionPaused(motionPaused);
  handleForestActivityChange();

  return {
    isWebGLAvailable: true,
    setTrees,
    focusTree,
    focusVisualNote,
    clearVisualNoteFocus,
    showOverview,
    setMotionPaused,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopAnimationLoop();
      resizeObserver.disconnect();
      visibilityObserver?.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerenter', onPointerEnter);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerCancel);
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('end', onControlsEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('focus', handleForestActivityChange);
      window.removeEventListener('blur', handleForestBlur);
      document.removeEventListener('visibilitychange', handleForestActivityChange);
      reducedMotionQuery?.removeEventListener?.('change', handleReducedMotionChange);
      clearSceneContent();
      renderer.dispose();
      renderer.domElement.remove();
      root.dataset.renderer = 'destroyed';
    }
  };
}
