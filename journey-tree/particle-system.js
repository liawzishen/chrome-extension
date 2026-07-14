import * as THREE from 'three';
import { particleFragmentShader, particleVertexShader } from './shaders.js';

/**
 * These are shape rules, not coordinates. Changing one value regenerates the
 * entire tree while preserving the same algorithmic architecture.
 */
export const TREE_CONFIG = Object.freeze({
  seed: 130671,
  trunkSegments: 5,
  trunkSegmentLength: 1.02,
  sideBranchDepth: 5,
  crownBranchDepth: 5,
  rootCount: 7,
  rootDepth: 3,
  branchLengthDecay: 0.76,
  branchRadiusDecay: 0.7,
  rootLengthDecay: 0.7,
  forkAngleMin: THREE.MathUtils.degToRad(24),
  forkAngleMax: THREE.MathUtils.degToRad(43),
});

// Warm botanical palette. The video reference is used only for motion; color
// remains a root-to-leaf golden-brown gradient as requested.
const ROOT_EARTH = new THREE.Color('#351407');
const TRUNK_BRONZE = new THREE.Color('#82401a');
const BRANCH_GOLD = new THREE.Color('#b47428');
const LEAF_AMBER = new THREE.Color('#b76518');
const LEAF_LIGHT = new THREE.Color('#e1a33c');
const AMBIENT_DUST = new THREE.Color('#744224');
const DRIFT_STORAGE_MAX = 2.5;
const SIZE_STORAGE_MIN = 0.42;
const SIZE_STORAGE_RANGE = 0.82;
const PARTICLE_POINT_SIZE_GAIN = 1.1;
const PARTICLE_SPATIAL_SCALE = 1.04;

function seededRandom(seed = TREE_CONFIG.seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function randomBetween(random, min, max) {
  return min + (max - min) * random();
}

function randomNormal(random) {
  const u = Math.max(random(), 1e-7);
  const v = Math.max(random(), 1e-7);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Build a stable orthonormal frame around an arbitrary direction vector. */
function makeBasis(direction) {
  const tangent = direction.clone().normalize();
  const helper = Math.abs(tangent.y) < 0.9
    ? new THREE.Vector3(0, 1, 0)
    : new THREE.Vector3(1, 0, 0);
  const normal = new THREE.Vector3().crossVectors(tangent, helper).normalize();
  const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
  return { tangent, normal, binormal };
}

/**
 * Turn one skeletal rule into a curved branch. Control points follow the input
 * direction, while two seeded lateral offsets create the gnarled, living line.
 */
function createCurvedSegment(start, direction, length, radiusStart, radiusEnd, depth, kind, random) {
  const { tangent, normal, binormal } = makeBasis(direction);
  const bendA = randomBetween(random, -0.13, 0.13) * length;
  const bendB = randomBetween(random, -0.11, 0.11) * length;

  const end = start.clone()
    .addScaledVector(tangent, length)
    .addScaledVector(normal, bendA)
    .addScaledVector(binormal, bendB);
  const control1 = start.clone()
    .addScaledVector(tangent, length * 0.32)
    .addScaledVector(normal, bendA * 0.12);
  const control2 = start.clone()
    .addScaledVector(tangent, length * 0.72)
    .addScaledVector(normal, bendA * 0.78)
    .addScaledVector(binormal, bendB * 0.55);

  return {
    curve: new THREE.CubicBezierCurve3(start.clone(), control1, control2, end),
    radiusStart,
    radiusEnd,
    depth,
    kind,
    grainPhase: random() * Math.PI * 2,
  };
}

/**
 * Recursive binary branching rule. Every branch ends in two child rules:
 *
 *   B(p, d, L, r, n) -> curve(p, d, L, r)
 *                      + B(end, rotate(d, +theta), L*kL, r*kR, n+1)
 *                      + B(end, rotate(d, -theta), L*kL, r*kR, n+1)
 */
function growBranch(skeleton, start, direction, length, radius, depth, maxDepth, random) {
  const segment = createCurvedSegment(
    start,
    direction,
    length,
    radius,
    radius * TREE_CONFIG.branchRadiusDecay,
    depth,
    'branch',
    random,
  );
  skeleton.segments.push(segment);

  const end = segment.curve.getPoint(1);
  const endDirection = segment.curve.getTangent(1).normalize();
  if (depth >= maxDepth) {
    skeleton.terminals.push({ position: end, direction: endDirection, depth });
    return;
  }

  const { normal, binormal } = makeBasis(endDirection);
  const baseAzimuth = random() * Math.PI * 2;
  const forkAngle = randomBetween(random, TREE_CONFIG.forkAngleMin, TREE_CONFIG.forkAngleMax);

  for (let child = 0; child < 2; child += 1) {
    const azimuth = baseAzimuth + child * Math.PI + randomBetween(random, -0.18, 0.18);
    const rotationAxis = normal.clone()
      .multiplyScalar(Math.cos(azimuth))
      .addScaledVector(binormal, Math.sin(azimuth))
      .normalize();
    const childDirection = endDirection.clone()
      .applyAxisAngle(rotationAxis, forkAngle * randomBetween(random, 0.84, 1.08))
      // A small phototropic bias keeps the canopy tree-like rather than spherical.
      .addScaledVector(new THREE.Vector3(0, 1, 0), Math.max(0.03, 0.13 - depth * 0.02))
      .normalize();

    growBranch(
      skeleton,
      end,
      childDirection,
      length * TREE_CONFIG.branchLengthDecay * randomBetween(random, 0.96, 1.04),
      radius * TREE_CONFIG.branchRadiusDecay,
      depth + 1,
      maxDepth,
      random,
    );
  }
}

/** Roots use the same grammar with downward bias and slower, thinner forking. */
function growRoot(skeleton, start, direction, length, radius, depth, random) {
  const segment = createCurvedSegment(
    start,
    direction,
    length,
    radius,
    radius * 0.66,
    depth,
    'root',
    random,
  );
  skeleton.segments.push(segment);
  if (depth >= TREE_CONFIG.rootDepth) return;

  const end = segment.curve.getPoint(1);
  const tangent = segment.curve.getTangent(1).normalize();
  const { normal, binormal } = makeBasis(tangent);
  const baseAzimuth = random() * Math.PI * 2;

  for (let child = 0; child < 2; child += 1) {
    const azimuth = baseAzimuth + child * Math.PI;
    const axis = normal.clone()
      .multiplyScalar(Math.cos(azimuth))
      .addScaledVector(binormal, Math.sin(azimuth))
      .normalize();
    const nextDirection = tangent.clone()
      .applyAxisAngle(axis, randomBetween(random, 0.18, 0.38))
      .add(new THREE.Vector3(0, -0.12, 0))
      .normalize();
    growRoot(
      skeleton,
      end,
      nextDirection,
      length * TREE_CONFIG.rootLengthDecay,
      radius * 0.66,
      depth + 1,
      random,
    );
  }
}

/** Generate trunk, recursively forked crown/side branches, and radial roots. */
function generateSkeleton(random) {
  const skeleton = { segments: [], terminals: [] };
  const base = new THREE.Vector3(0, -2.05, 0);
  let start = base.clone();
  let direction = new THREE.Vector3(0.04, 1, 0.02).normalize();
  let trunkRadius = 0.38;
  let trunkLength = TREE_CONFIG.trunkSegmentLength;

  for (let level = 0; level < TREE_CONFIG.trunkSegments; level += 1) {
    const trunk = createCurvedSegment(
      start,
      direction,
      trunkLength,
      trunkRadius,
      trunkRadius * 0.84,
      level,
      'trunk',
      random,
    );
    skeleton.segments.push(trunk);
    start = trunk.curve.getPoint(1);
    direction = trunk.curve.getTangent(1).normalize();

    // Golden-angle azimuth prevents side branches from stacking in one plane.
    if (level >= 1) {
      const { normal, binormal } = makeBasis(direction);
      const azimuth = level * Math.PI * (3 - Math.sqrt(5));
      const axis = normal.clone()
        .multiplyScalar(Math.cos(azimuth))
        .addScaledVector(binormal, Math.sin(azimuth))
        .normalize();
      const sideDirection = direction.clone()
        .applyAxisAngle(axis, randomBetween(random, 0.58, 0.82))
        .normalize();
      growBranch(
        skeleton,
        start,
        sideDirection,
        trunkLength * randomBetween(random, 0.98, 1.18),
        trunkRadius * 0.62,
        0,
        TREE_CONFIG.sideBranchDepth,
        random,
      );
    }

    trunkRadius *= 0.84;
    trunkLength *= 0.92;
  }

  // The crown is generated by the same rule but starts with a wider fork.
  const crownBasis = makeBasis(direction);
  for (let crown = 0; crown < 2; crown += 1) {
    const crownDirection = direction.clone()
      .applyAxisAngle(crownBasis.normal, crown === 0 ? 0.48 : -0.48)
      .normalize();
    growBranch(
      skeleton,
      start,
      crownDirection,
      trunkLength,
      trunkRadius,
      0,
      TREE_CONFIG.crownBranchDepth,
      random,
    );
  }

  // Roots radiate algorithmically around the base and descend into the void.
  for (let rootIndex = 0; rootIndex < TREE_CONFIG.rootCount; rootIndex += 1) {
    const angle = (rootIndex / TREE_CONFIG.rootCount) * Math.PI * 2 + randomBetween(random, -0.16, 0.16);
    const rootDirection = new THREE.Vector3(
      Math.cos(angle) * 0.9,
      randomBetween(random, -0.6, -0.38),
      Math.sin(angle) * 0.64,
    ).normalize();
    growRoot(skeleton, base, rootDirection, randomBetween(random, 0.7, 0.94), 0.17, 0, random);
  }

  return skeleton;
}

/** Select maximally separated terminals, then map chapters chronologically. */
function assignChaptersToTerminals(terminals, chapters) {
  if (chapters.length > terminals.length) {
    throw new Error('The branch grammar must produce at least one terminal per chapter.');
  }

  const selected = [terminals.reduce((highest, item) => (
    item.position.y > highest.position.y ? item : highest
  ))];

  while (selected.length < chapters.length) {
    let best = null;
    let bestDistance = -Infinity;
    for (const terminal of terminals) {
      if (selected.includes(terminal)) continue;
      const nearestSelected = Math.min(...selected.map((chosen) => {
        const dx = terminal.position.x - chosen.position.x;
        const dy = terminal.position.y - chosen.position.y;
        const dz = terminal.position.z - chosen.position.z;
        return dx * dx + dy * dy + dz * dz * 0.22;
      }));
      if (nearestSelected > bestDistance) {
        bestDistance = nearestSelected;
        best = terminal;
      }
    }
    selected.push(best);
  }

  // CHAPTERS is chronological. Ascending terminal height makes the timeline
  // read naturally from the roots upward through the canopy.
  selected.sort((a, b) => a.position.y - b.position.y);
  return new Map(selected.map((terminal, index) => [terminal, chapters[index]]));
}

/**
 * A leaf is a thin ovate/acuminate parametric plate:
 *   axial(s) = (s - 1/2) * length
 *   halfWidth(s) = piecewisePower(s, variablePeak, baseExponent, tipExponent)
 *   p = center + forward*axial + side*v + normal*fold
 */
function generateLeaves(skeleton, chapters, random) {
  const { terminals } = skeleton;
  const chapterAssignments = assignChaptersToTerminals(terminals, chapters);
  const worldUp = new THREE.Vector3(0, 1, 0);
  const divergenceAngle = Math.PI * (3 - Math.sqrt(5));
  const minTerminalY = Math.min(...terminals.map((terminal) => terminal.position.y));
  const maxTerminalY = Math.max(...terminals.map((terminal) => terminal.position.y));
  const inverseTerminalHeight = 1 / Math.max(0.001, maxTerminalY - minTerminalY);
  const leaves = [];

  // Real broadleaf foliage grows at successive nodes along current-year shoots.
  // A few sparse terminals and occasional secondary shoots create natural crown
  // gaps and hierarchy instead of repeating one decorative cluster everywhere.
  terminals.forEach((terminal, terminalIndex) => {
    const chapter = chapterAssignments.get(terminal) ?? null;
    if (!chapter && random() < 0.12) return;

    const terminalBasis = makeBasis(terminal.direction);
    const shootCount = random() < 0.24 ? 2 : 1;

    for (let shootIndex = 0; shootIndex < shootCount; shootIndex += 1) {
      const shootDirection = terminal.direction.clone()
        .addScaledVector(terminalBasis.normal, randomBetween(random, -0.16, 0.16))
        .addScaledVector(terminalBasis.binormal, randomBetween(random, -0.13, 0.13))
        .addScaledVector(worldUp, randomBetween(random, 0.015, 0.075))
        .normalize();
      if (shootIndex > 0) {
        const lateralAxis = terminalBasis.normal.clone()
          .multiplyScalar(Math.cos(terminalIndex * 1.71))
          .addScaledVector(terminalBasis.binormal, Math.sin(terminalIndex * 1.71))
          .normalize();
        shootDirection.applyAxisAngle(
          lateralAxis,
          randomBetween(random, 0.27, 0.46),
        ).normalize();
      }

      // Give successive nodes enough longitudinal separation that the blades
      // read as alternate foliage along a twig, not a radial star/rosette.
      const shootLength = randomBetween(random, 0.42, 0.7)
        * (shootIndex === 0 ? 1 : randomBetween(random, 0.58, 0.76));
      const shoot = createCurvedSegment(
        terminal.position,
        shootDirection,
        shootLength,
        shootIndex === 0 ? 0.019 : 0.014,
        0.006,
        terminal.depth + 1,
        'branch',
        random,
      );
      skeleton.segments.push(shoot);

      const leafCount = shootIndex === 0
        ? (chapter ? 6 + Math.floor(random() * 4) : 4 + Math.floor(random() * 4))
        : 3 + Math.floor(random() * 2);
      const chapterLeafSlot = Math.min(leafCount - 1, Math.floor(leafCount * 0.64));
      const azimuthOffset = random() * Math.PI * 2 + terminalIndex * 0.07 + shootIndex * 1.63;

      for (let leafIndex = 0; leafIndex < leafCount; leafIndex += 1) {
        const bladeChapter = chapter && shootIndex === 0 && leafIndex === chapterLeafSlot
          ? chapter
          : null;
        const t = THREE.MathUtils.clamp(
          (leafIndex + 0.45 + randomBetween(random, -0.12, 0.12)) / (leafCount + 0.35),
          0.06,
          0.94,
        );
        const attachment = shoot.curve.getPointAt(t);
        const tangent = shoot.curve.getTangentAt(t).normalize();
        const shootBasis = makeBasis(tangent);
        const azimuth = azimuthOffset
          + leafIndex * divergenceAngle
          + randomBetween(random, -0.15, 0.15);
        const radial = shootBasis.normal.clone()
          .multiplyScalar(Math.cos(azimuth))
          .addScaledVector(shootBasis.binormal, Math.sin(azimuth))
          .normalize();
        const forward = radial.clone()
          .multiplyScalar(0.52)
          .addScaledVector(tangent, 0.46)
          .addScaledVector(worldUp, 0.08 + randomBetween(random, -0.08, 0.08))
          .normalize();

        const length = randomBetween(random, 0.24, 0.38)
          * THREE.MathUtils.lerp(0.9, 1.08, t)
          * (bladeChapter ? 1.03 : 1);
        const width = length * randomBetween(random, 0.17, 0.22);
        const height01 = THREE.MathUtils.clamp(
          (attachment.y - minTerminalY) * inverseTerminalHeight,
          0,
          1,
        );
        let inclination;
        if (height01 < 0.34) {
          inclination = randomBetween(random, 12, 28);
        } else if (height01 < 0.68) {
          inclination = randomBetween(random, 25, 45);
        } else {
          inclination = randomBetween(random, 42, 65);
        }
        inclination = THREE.MathUtils.degToRad(
          inclination + randomBetween(random, -11, 11),
        );
        const normal = worldUp.clone()
          .multiplyScalar(Math.cos(inclination))
          .addScaledVector(radial, Math.sin(inclination));
        normal.addScaledVector(forward, -normal.dot(forward));
        if (normal.lengthSq() < 0.001) normal.copy(shootBasis.binormal);
        normal.normalize();
        const side = new THREE.Vector3().crossVectors(normal, forward).normalize();

        const petioleLength = randomBetween(random, 0.035, 0.065);
        const petiole = createCurvedSegment(
          attachment,
          forward,
          petioleLength,
          0.006,
          0.0025,
          terminal.depth + 2,
          'branch',
          random,
        );
        skeleton.segments.push(petiole);
        const leafBase = petiole.curve.getPoint(1);
        const center = leafBase.clone().addScaledVector(forward, length * 0.49);

        leaves.push({
          index: leaves.length,
          terminalIndex,
          chapter: bladeChapter,
          isChapterCanopy: Boolean(chapter),
          center,
          forward,
          side,
          normal,
          length,
          width,
          widthPeak: randomBetween(random, 0.38, 0.46),
          baseExponent: randomBetween(random, 0.78, 0.96),
          tipExponent: randomBetween(random, 1.18, 1.45),
          sideAsymmetry: randomBetween(random, 0.95, 1.05),
          toothCount: 10 + Math.floor(random() * 7),
          phase: random() * Math.PI * 2,
          labelAnchor: center.clone()
            .addScaledVector(forward, length * 0.34)
            .addScaledVector(side, width * 0.74),
        });
      }
    }
  });

  return leaves;
}

export function getParticleBudget() {
  const memory = navigator.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // A side panel shares GPU/CPU time with the active browser tab. The previous
  // 1.75M-4.25M range could monopolize the GPU even on powerful laptops. These
  // tiers keep the same normalized geometry/shader path while placing a strict
  // ceiling on per-frame vertex work and initial typed-array allocation.
  if (prefersReducedMotion || memory <= 4 || cores <= 4) return 550_000;
  if (memory <= 8 || cores <= 8) return 900_000;
  return 1_350_000;
}

function createAttributeStorage(count) {
  return {
    positions: new Float32Array(count * 3),
    // Normalized integer attributes substantially reduce memory at 3M+ grains.
    drifts: new Int8Array(count * 3),
    colors: new Uint8Array(count * 3),
    sizes: new Uint8Array(count),
    phases: new Uint8Array(count),
    brightness: new Uint8Array(count),
    windMasks: new Uint8Array(count),
    surfaces: new Uint8Array(count),
  };
}

function writeParticle(attributes, index, point, random, options = {}) {
  const offset = index * 3;
  attributes.positions[offset] = point.x;
  attributes.positions[offset + 1] = point.y;
  attributes.positions[offset + 2] = point.z;

  // Avoid allocating a Vector3 per grain: at 3M+ particles that would create
  // severe garbage-collector pressure during tree construction.
  let driftX = randomBetween(random, -1, 1);
  let driftY = randomBetween(random, -1, 1);
  let driftZ = randomBetween(random, -1, 1);
  const driftLength = Math.hypot(driftX, driftY, driftZ) || 1;
  const driftQuantizer = 127 * (options.drift ?? 0.35) / DRIFT_STORAGE_MAX / driftLength;
  driftX *= driftQuantizer;
  driftY *= driftQuantizer;
  driftZ *= driftQuantizer;
  attributes.drifts[offset] = Math.round(driftX);
  attributes.drifts[offset + 1] = Math.round(driftY);
  attributes.drifts[offset + 2] = Math.round(driftZ);

  const color = options.color ?? LEAF_AMBER;
  attributes.colors[offset] = Math.round(THREE.MathUtils.clamp(color.r, 0, 1) * 255);
  attributes.colors[offset + 1] = Math.round(THREE.MathUtils.clamp(color.g, 0, 1) * 255);
  attributes.colors[offset + 2] = Math.round(THREE.MathUtils.clamp(color.b, 0, 1) * 255);

  const size = randomBetween(random, options.sizeMin ?? 0.62, options.sizeMax ?? 1.18);
  attributes.sizes[index] = Math.round(
    THREE.MathUtils.clamp((size - SIZE_STORAGE_MIN) / SIZE_STORAGE_RANGE, 0, 1) * 255,
  );
  attributes.phases[index] = Math.round(random() * 255);
  const brightness = randomBetween(
    random,
    options.brightnessMin ?? 0.42,
    options.brightnessMax ?? 1,
  );
  attributes.brightness[index] = Math.round(THREE.MathUtils.clamp(brightness, 0, 1) * 255);
  attributes.windMasks[index] = Math.round(
    THREE.MathUtils.clamp(options.windMask ?? 1, 0, 1) * 255,
  );
  attributes.surfaces[index] = Math.round(
    THREE.MathUtils.clamp(options.surface ?? 0.4, 0, 1) * 255,
  );
}

function createBranchSampleScratch() {
  return {
    tangent: new THREE.Vector3(),
    helper: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    binormal: new THREE.Vector3(),
  };
}

/** Populate a branch without allocating temporary vectors for every grain. */
function sampleBranchVolume(segment, random, output, scratch) {
  const t = random();
  segment.curve.getPointAt(t, output);
  const { tangent, helper, normal, binormal } = scratch;
  segment.curve.getTangentAt(t, tangent).normalize();
  helper.set(0, 1, 0);
  if (Math.abs(tangent.y) >= 0.9) helper.set(1, 0, 0);
  normal.crossVectors(tangent, helper).normalize();
  binormal.crossVectors(tangent, normal).normalize();
  const baseRadius = THREE.MathUtils.lerp(segment.radiusStart, segment.radiusEnd, t);

  // 72% of grains hug the bark shell; the remainder fills the volume. This
  // combination reveals both a crisp silhouette and a translucent interior.
  const radialFraction = random() < 0.72
    ? randomBetween(random, 0.76, 1.0)
    : Math.sqrt(random()) * 0.76;
  const corrugation = 0.9 + Math.sin(t * 22 + segment.grainPhase) * 0.1;
  const radius = baseRadius * radialFraction * corrugation;
  const angle = random() * Math.PI * 2 + t * 5.0;
  output
    .addScaledVector(normal, Math.cos(angle) * radius)
    .addScaledVector(binormal, Math.sin(angle) * radius);

  // Sparse escaping grains break the procedural tube edge into stardust.
  if (random() < 0.045) {
    output
      .addScaledVector(normal, randomNormal(random) * baseRadius * 0.35)
      .addScaledVector(binormal, randomNormal(random) * baseRadius * 0.35);
  }

  return radialFraction;
}

/** Populate a pointed, thin organic leaf plate at a terminal branch. */
function sampleLeafPlate(leaf, random, output) {
  const structureSample = random();
  let structureType = 0;
  let s;

  // Outlines and midribs use the full length. Interior samples favour the
  // middle, preventing a false pile-up of grains at the pointed tips.
  if (structureSample < 0.08) {
    structureType = 1;
    s = randomBetween(random, 0.02, 0.98);
  } else if (structureSample < 0.2) {
    structureType = 2;
    s = randomBetween(random, 0.01, 0.995);
  } else if (structureSample < 0.3) {
    structureType = 3;
    const veinIndex = Math.floor(random() * 5);
    const veinProgress = random();
    s = 0.2 + veinIndex * 0.125 + veinProgress * 0.055;
  } else {
    s = (random() + random()) * 0.5;
  }

  const axial = (s - 0.5) * leaf.length;
  // A variable ovate/acuminate envelope replaces the repeated symmetric almond.
  // Each blade has a slightly different widest point, base, tip, and tooth count.
  const profile = s <= leaf.widthPeak
    ? Math.pow(s / leaf.widthPeak, leaf.baseExponent)
    : Math.pow((1 - s) / (1 - leaf.widthPeak), leaf.tipExponent);
  const serration = 0.985 + Math.sin(
    s * Math.PI * 2 * leaf.toothCount + leaf.phase,
  ) * 0.015;
  const baseHalfWidth = leaf.width * profile * serration;
  const positiveHalfWidth = baseHalfWidth * leaf.sideAsymmetry;
  const negativeHalfWidth = baseHalfWidth * (2 - leaf.sideAsymmetry);

  // 70% lamina fill and only 30% combined structure avoid diagram-like outlines.
  let lateral;
  if (structureType === 1) {
    lateral = randomNormal(random) * Math.max(baseHalfWidth, leaf.width * 0.08) * 0.025;
  } else if (structureType === 2) {
    const edge = random() < 0.5 ? -1 : 1;
    const edgeWidth = edge > 0 ? positiveHalfWidth : negativeHalfWidth;
    lateral = edge * edgeWidth * randomBetween(random, 0.982, 1.008);
  } else if (structureType === 3) {
    const edge = random() < 0.5 ? -1 : 1;
    const veinProgress = random();
    const edgeWidth = edge > 0 ? positiveHalfWidth : negativeHalfWidth;
    lateral = edge * edgeWidth * veinProgress * 0.88
      + randomNormal(random) * leaf.width * 0.008;
  } else {
    lateral = randomBetween(random, -negativeHalfWidth, positiveHalfWidth);
  }
  const lateralWidth = lateral >= 0 ? positiveHalfWidth : negativeHalfWidth;
  const normalizedLateral = lateralWidth > 0.0001 ? lateral / lateralWidth : 0;
  const fold = Math.sin(Math.PI * s) * normalizedLateral * leaf.width * 0.05;
  const thickness = randomNormal(random) * 0.0025;

  output.copy(leaf.center)
    .addScaledVector(leaf.forward, axial)
    .addScaledVector(leaf.side, lateral)
    .addScaledVector(leaf.normal, fold + thickness);

  return structureType;
}

function buildAttributes(skeleton, leaves, particleBudget, random) {
  const attributes = createAttributeStorage(particleBudget);
  // Almost every grain belongs to the tree. Only a very small near-geometry
  // halo remains, so zooming never trades useful branch/leaf density for fog.
  const branchTarget = Math.floor(particleBudget * 0.38);
  const leafTarget = Math.floor(particleBudget * 0.995);
  const point = new THREE.Vector3();
  const particleColor = new THREE.Color();
  const branchScratch = createBranchSampleScratch();
  let cursor = 0;

  // Calculate bounds before population so color can transition by generated
  // height: earthen roots -> bronze trunk -> amber upper branches.
  const bounds = new THREE.Box3();
  for (const segment of skeleton.segments) {
    bounds.expandByPoint(segment.curve.getPoint(0));
    bounds.expandByPoint(segment.curve.getPoint(1));
  }
  for (const leaf of leaves) bounds.expandByPoint(leaf.center);
  bounds.expandByScalar(0.72);
  const inverseTreeHeight = 1 / Math.max(0.001, bounds.max.y - bounds.min.y);

  const branchWeights = skeleton.segments.map((segment) => (
    segment.curve.getLength()
    * (segment.radiusStart + segment.radiusEnd)
    * (segment.kind === 'trunk' ? 1.3 : 1)
  ));
  const branchWeightTotal = branchWeights.reduce((sum, value) => sum + value, 0);

  skeleton.segments.forEach((segment, index) => {
    const target = index === skeleton.segments.length - 1
      ? branchTarget
      : cursor + Math.max(18, Math.floor(branchTarget * branchWeights[index] / branchWeightTotal));
    while (cursor < Math.min(target, branchTarget)) {
      const radialFraction = sampleBranchVolume(segment, random, point, branchScratch);
      const height = THREE.MathUtils.clamp((point.y - bounds.min.y) * inverseTreeHeight, 0, 1);
      if (segment.kind === 'root') {
        particleColor.lerpColors(ROOT_EARTH, TRUNK_BRONZE, randomBetween(random, 0.05, 0.24));
      } else {
        particleColor.lerpColors(TRUNK_BRONZE, BRANCH_GOLD, Math.pow(height, 0.82));
      }
      writeParticle(attributes, cursor, point, random, {
        drift: segment.kind === 'root' ? 0.22 : 0.32,
        sizeMin: 0.64,
        sizeMax: segment.kind === 'trunk' ? 1.18 : 1.02,
        brightnessMin: segment.kind === 'root' ? 0.18 : 0.22,
        brightnessMax: segment.kind === 'root'
          ? 0.46
          : (segment.kind === 'trunk' ? 0.62 : 0.68),
        color: particleColor,
        // Shell grains receive the pale contour treatment in the fragment
        // shader; interior grains remain a deep translucent silhouette.
        surface: THREE.MathUtils.clamp((radialFraction - 0.42) / 0.58, 0.08, 1),
        // Reserve a low semantic band for root-shell flow while keeping roots
        // out of the wind calculation. The main trunk remains the zero anchor;
        // recursive branch masks grow with depth toward the leaf band at 1.
        windMask: segment.kind === 'root'
          ? 0.12
          : (segment.kind === 'branch'
            ? Math.min(0.84, 0.28 + segment.depth * 0.11)
            : 0),
      });
      cursor += 1;
    }
  });

  // Each chapter shoot receives a fixed, hidden close-up quota, then distributes
  // it among its naturally sized leaves by area. Their reduced per-grain
  // brightness compensates for that density, so no topic becomes an ornament.
  const leafParticleTotal = leafTarget - branchTarget;
  const leafAreas = leaves.map((leaf) => leaf.length * leaf.width);
  const leafAreaTotal = leafAreas.reduce((sum, value) => sum + value, 0);
  const topicGroups = new Map();
  leaves.forEach((leaf, index) => {
    if (!leaf.isChapterCanopy) return;
    if (!topicGroups.has(leaf.terminalIndex)) topicGroups.set(leaf.terminalIndex, []);
    topicGroups.get(leaf.terminalIndex).push(index);
  });
  const topicQuota = Math.min(70_000, Math.floor(leafParticleTotal * 0.027));
  const basePool = Math.max(0, leafParticleTotal - topicQuota * topicGroups.size);
  const leafCounts = leafAreas.map((area) => Math.floor(basePool * area / leafAreaTotal));

  for (const indices of topicGroups.values()) {
    const groupArea = indices.reduce((sum, index) => sum + leafAreas[index], 0);
    for (const index of indices) {
      leafCounts[index] += Math.floor(topicQuota * leafAreas[index] / groupArea);
    }
  }
  let unassignedLeafParticles = leafParticleTotal
    - leafCounts.reduce((sum, value) => sum + value, 0);
  for (let index = 0; unassignedLeafParticles > 0; index = (index + 1) % leaves.length) {
    leafCounts[index] += 1;
    unassignedLeafParticles -= 1;
  }

  leaves.forEach((leaf, index) => {
    const target = cursor + leafCounts[index];
    while (cursor < Math.min(target, leafTarget)) {
      const structureType = sampleLeafPlate(leaf, random, point);
      const isStructuralGrain = structureType > 0;
      const shimmer = THREE.MathUtils.clamp(random() * 0.74, 0, 0.84);
      particleColor.lerpColors(LEAF_AMBER, LEAF_LIGHT, shimmer);
      writeParticle(attributes, cursor, point, random, {
        drift: 0.5,
        sizeMin: isStructuralGrain ? 0.5 : 0.44,
        sizeMax: isStructuralGrain ? 0.86 : 0.78,
        // Densityâ€”not bloomâ€”builds the leaf silhouette.
        brightnessMin: leaf.isChapterCanopy
          ? (isStructuralGrain ? 0.12 : 0.08)
          : (isStructuralGrain ? 0.42 : 0.34),
        brightnessMax: leaf.isChapterCanopy
          ? (isStructuralGrain ? 0.28 : 0.2)
          : (isStructuralGrain ? 0.7 : 0.58),
        color: particleColor,
        surface: structureType === 2
          ? 1
          : (structureType === 1 ? 0.88 : (structureType === 3 ? 0.72 : 0.24)),
        windMask: 1,
      });
      cursor += 1;
    }
  });

  // The final 0.5% stays close to the geometry. It supports living-dust motion
  // without softening the botanical silhouettes.
  while (cursor < particleBudget) {
    if (random() < 0.68) {
      const sourceLeaf = leaves[Math.floor(random() * leaves.length)];
      sampleLeafPlate(sourceLeaf, random, point);
    } else {
      const sourceSegment = skeleton.segments[Math.floor(random() * skeleton.segments.length)];
      sampleBranchVolume(sourceSegment, random, point, branchScratch);
    }
    const longTail = random() < 0.035 ? 1.8 : 1;
    const haloSpread = randomBetween(random, 0.025, 0.16) * longTail;
    point.x += randomNormal(random) * haloSpread;
    point.y += randomNormal(random) * haloSpread * 0.72;
    point.z += randomNormal(random) * haloSpread;
    writeParticle(attributes, cursor, point, random, {
      drift: 1.7,
      sizeMin: 0.42,
      sizeMax: 0.72,
      brightnessMin: 0.1,
      brightnessMax: 0.28,
      color: AMBIENT_DUST,
      surface: 0.08,
      windMask: 1,
    });
    cursor += 1;
  }

  return { attributes, bounds };
}

/** Generate the complete tree and return metadata for labels / hit testing. */
export function createParticleTree(chapters, renderer, options = {}) {
  const requestedSeed = Number(options.seed);
  const random = seededRandom(Number.isFinite(requestedSeed) ? requestedSeed : TREE_CONFIG.seed);
  const skeleton = generateSkeleton(random);
  const leaves = generateLeaves(skeleton, chapters, random);
  const chapterLeaves = leaves.filter((leaf) => leaf.chapter);
  const requestedBudget = Number(options.particleBudget);
  const particleBudget = Number.isFinite(requestedBudget)
    ? Math.max(12_000, Math.round(requestedBudget))
    : getParticleBudget();
  const { attributes, bounds } = buildAttributes(skeleton, leaves, particleBudget, random);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(attributes.positions, 3));
  geometry.setAttribute('aDrift', new THREE.Int8BufferAttribute(attributes.drifts, 3, true));
  geometry.setAttribute('aColor', new THREE.Uint8BufferAttribute(attributes.colors, 3, true));
  geometry.setAttribute('aSize', new THREE.Uint8BufferAttribute(attributes.sizes, 1, true));
  geometry.setAttribute('aPhase', new THREE.Uint8BufferAttribute(attributes.phases, 1, true));
  geometry.setAttribute('aBrightness', new THREE.Uint8BufferAttribute(attributes.brightness, 1, true));
  geometry.setAttribute('aWindMask', new THREE.Uint8BufferAttribute(attributes.windMasks, 1, true));
  geometry.setAttribute('aSurface', new THREE.Uint8BufferAttribute(attributes.surfaces, 1, true));
  geometry.computeBoundingSphere();

  const treeHeight = Math.max(0.001, bounds.max.y - bounds.min.y);
  const outerRadius = Math.max(
    Math.abs(bounds.min.x),
    Math.abs(bounds.max.x),
    Math.abs(bounds.min.z),
    Math.abs(bounds.max.z),
    1,
  );
  const uniforms = {
    u_time: { value: 0 },
    uPointScale: { value: 17 * renderer.getPixelRatio() },
    uPointSizeGain: { value: PARTICLE_POINT_SIZE_GAIN },
    uEdgeDissolveStrength: {
      value: Number.isFinite(Number(options.edgeDissolveStrength))
        ? THREE.MathUtils.clamp(Number(options.edgeDissolveStrength), 0, 1)
        : 1,
    },
    uRepelRadius: { value: 0.52 },
    uRepelDepth: { value: 1.25 },
    uRepelStrength: { value: 0 },
    uMouseWorld: { value: new THREE.Vector3(1000, 1000, 1000) },
    uMouseRayOrigin: { value: new THREE.Vector3(1000, 1000, 1000) },
    uMouseRayDirection: { value: new THREE.Vector3(0, 0, -1) },
    uOpacity: { value: Number.isFinite(Number(options.opacity)) ? Number(options.opacity) : 0 },
    // Restore perceived density after adaptive vertex reduction. Increasing one
    // scalar is dramatically cheaper than drawing the removed 3M particles.
    uDensityGain: {
      value: THREE.MathUtils.clamp(Math.sqrt(4_250_000 / particleBudget), 1, 2.05),
    },

    // Public wind tuning surface. The bounds-derived gradient remains correct
    // even when TREE_CONFIG changes the generated tree proportions.
    uWindSpeed: { value: 0.24 },
    uWindStrength: { value: 0.11 },
    uWindFrequency: { value: 0.42 },
    uWindExponent: { value: 2.05 },
    uWindBaseHeight: { value: bounds.min.y + treeHeight * 0.28 },
    uWindTopHeight: { value: bounds.max.y },
    uWindTrunkRadius: { value: 0.48 },
    uWindOuterRadius: { value: outerRadius },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'Algorithmic stardust learning tree';
  points.scale.setScalar(PARTICLE_SPATIAL_SCALE);

  // ShaderMaterial performs attenuation explicitly in the vertex shader through
  // uPointScale / -viewPosition.z. The public flag is also set so this invariant
  // survives a future swap to THREE.PointsMaterial.
  material.sizeAttenuation = true;
  material.userData.sizeAttenuation = true;

  return {
    points,
    uniforms,
    particleBudget,
    skeleton,
    leaves,
    chapterLeaves,
    bounds,
    spatialScale: PARTICLE_SPATIAL_SCALE,
  };
}
