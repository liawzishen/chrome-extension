/**
 * Warm bronze-to-amber stardust shaders.
 *
 * The vertex stage owns every per-frame particle deformation. JavaScript only
 * advances uniforms; it never iterates through the millions of positions.
 */
export const particleVertexShader = /* glsl */ `
  uniform float u_time;
  uniform float uPointScale;
  uniform float uPointSizeGain;
  uniform float uEdgeDissolveStrength;
  uniform float uEdgeFlowScale;
  uniform float uRepelRadius;
  uniform float uRepelDepth;
  uniform float uRepelStrength;
  uniform vec3 uMouseWorld;
  uniform vec3 uMouseRayOrigin;
  uniform vec3 uMouseRayDirection;

  // Public wind controls. Tune these in createParticleTree() without rebuilding
  // geometry or moving a single particle on the CPU.
  uniform float uWindSpeed;
  uniform float uWindStrength;
  uniform float uWindFrequency;
  uniform float uWindExponent;
  uniform float uWindBaseHeight;
  uniform float uWindTopHeight;
  uniform float uWindTrunkRadius;
  uniform float uWindOuterRadius;

  attribute float aSize;
  attribute float aPhase;
  attribute float aBrightness;
  attribute float aWindMask;
  attribute float aSurface;
  attribute vec3 aDrift;
  attribute vec3 aColor;

  varying float vBrightness;
  varying float vSurface;
  varying float vPhase;
  varying float vDepthFlow;
  varying float vEdgeVisibility;
  varying float vEdgeFlow;
  varying vec3 vColor;

  void main() {
    vec3 originalPosition = position;

    // WIND GRADIENT ---------------------------------------------------------
    // Height and X/Z radius are normalized independently, combined, and then
    // raised to an exponent. Motion collapses near the center trunk and grows
    // rapidly toward high outer terminals. aWindMask is exactly zero for roots
    // and main-trunk grains, which makes them immutable anchors.
    float height01 = smoothstep(
      uWindBaseHeight,
      uWindTopHeight,
      originalPosition.y
    );
    float radial01 = smoothstep(
      uWindTrunkRadius,
      uWindOuterRadius,
      length(originalPosition.xz)
    );
    float gradientBase = clamp(height01 * 0.62 + radial01 * 0.72, 0.0, 1.0);
    // aWindMask 0.12 is reserved for roots so their exposed shells can flow
    // without making the root structure sway. Branch wind begins above 0.24.
    float windStructureMask = smoothstep(0.22, 0.46, aWindMask);
    float windGradient = pow(gradientBase, uWindExponent) * windStructureMask;

    // FLUID WIND ------------------------------------------------------------
    // Two broad spatial waves replace the two full 3D simplex evaluations that
    // previously ran for every particle, every frame. The result is still a
    // coherent volumetric cross-flow, at a small fraction of the GPU cost.
    float windTime = u_time * uWindSpeed;
    vec3 waveCoordinate = originalPosition * uWindFrequency;
    float primaryFlow = sin(
      dot(waveCoordinate, vec3(0.72, 1.11, 0.46)) + windTime * 0.72
    );
    float crossFlow = sin(
      dot(waveCoordinate, vec3(1.04, -0.38, 0.86)) - windTime * 0.51
    );
    float gust = 0.82 + 0.18 * sin(windTime * 0.37 + originalPosition.y * 0.22);
    vec3 fluidDirection = vec3(
      primaryFlow,
      crossFlow * 0.24,
      (crossFlow - primaryFlow * 0.35) * 0.62
    );
    vec3 windOffset = fluidDirection
      * uWindStrength
      * windGradient
      * gust;

    // DEPTH-LAYER FLOW ------------------------------------------------------
    // The reference animation behaves like a depth map slowly breathing apart:
    // contour grains drift more than the dark core, but never lose the form.
    float depthFlow = 0.5 + 0.5 * sin(
      originalPosition.y * 0.92
      + originalPosition.z * 1.38
      + primaryFlow * 1.75
      + aPhase * 6.28318
      - u_time * 0.44
    );
    vec3 encodedDriftDirection = normalize(aDrift + vec3(0.0001));
    float depthFlowStrength = mix(0.004, 0.026, windStructureMask)
      * mix(0.32, 1.0, aSurface)
      * (0.28 + depthFlow * 0.72);
    windOffset += encodedDriftDirection * depthFlowStrength;

    // EDGE RELEASE ---------------------------------------------------------
    // aWindMask separates the generated structures without another buffer:
    // trunk is 0, roots are 0.12, branches are 0.39-0.84, and leaves are 1.
    // A broad exposed-shell band makes the stream readable over the complete
    // tree. Structure-specific travel remains trunk < roots < branches < leaves.
    float contourSurfaceMask = smoothstep(0.68, 0.93, aSurface);
    float trunkContourMask = 1.0 - smoothstep(0.03, 0.08, aWindMask);
    float rootContourMask = smoothstep(0.06, 0.1, aWindMask)
      * (1.0 - smoothstep(0.16, 0.22, aWindMask));
    float branchContourMask = smoothstep(0.24, 0.46, aWindMask)
      * (1.0 - smoothstep(0.86, 0.96, aWindMask));
    float leafContourMask = smoothstep(0.94, 1.0, aWindMask);
    float branchOrLeafContour = max(branchContourMask, leafContourMask);
    float structureContourMask = max(
      max(trunkContourMask, rootContourMask),
      branchOrLeafContour
    );
    float edgeReleaseMask = contourSurfaceMask
      * structureContourMask
      * uEdgeDissolveStrength;
    vEdgeVisibility = 1.0;
    vEdgeFlow = 0.0;
    float edgePointGain = 1.0;
    if (edgeReleaseMask > 0.001) {
      // Uniformly distributed phases form a continuous hourglass-like stream:
      // while older contour grains accelerate outward and vanish, other grains
      // complete their invisible wrap and refill the exact source edge quickly.
      float edgeCycle = fract(aPhase + u_time * 0.22);
      float spawnVisibility = smoothstep(0.0, 0.06, edgeCycle);
      float travelProgress = smoothstep(0.02, 0.96, edgeCycle);
      float fadeVisibility = 1.0 - smoothstep(0.84, 0.995, edgeCycle);
      float filament = sin(
        u_time * 1.15
        + aPhase * 43.0
        + originalPosition.y * 0.78
        + originalPosition.x * 0.31
      );
      float verticalOutward = originalPosition.y - uWindBaseHeight;
      verticalOutward *= verticalOutward < 0.0 ? 0.28 : 0.18;
      vec3 outwardDirection = normalize(vec3(
        originalPosition.x,
        verticalOutward,
        originalPosition.z
      ) + encodedDriftDirection * 0.12 + vec3(0.0001));
      float rootToBranchDistance = mix(
        0.42,
        0.62,
        smoothstep(0.2, 0.5, aWindMask)
      );
      float trunkToRootDistance = mix(
        0.30,
        rootToBranchDistance,
        rootContourMask
      );
      float nonLeafFlowDistance = mix(
        trunkToRootDistance,
        rootToBranchDistance,
        smoothstep(0.22, 0.46, aWindMask)
      );
      float flowDistanceLimit = mix(
        nonLeafFlowDistance,
        1.02,
        leafContourMask
      );
      float flowDistance = travelProgress * travelProgress * flowDistanceLimit * uEdgeFlowScale;
      vec3 edgeReleaseOffset = outwardDirection * flowDistance;
      edgeReleaseOffset += encodedDriftDirection
        * filament
        * mix(0.012, 0.034, travelProgress);
      windOffset += edgeReleaseOffset * edgeReleaseMask;
      vEdgeVisibility = mix(
        1.0,
        spawnVisibility * fadeVisibility,
        edgeReleaseMask
      );
      float flowEmphasis = edgeReleaseMask
        * spawnVisibility
        * fadeVisibility
        * smoothstep(0.08, 0.52, travelProgress);
      edgePointGain = 1.0 + flowEmphasis * 0.58;
      vEdgeFlow = flowEmphasis;
    }

    vec3 windPosition = originalPosition + windOffset;
    vec4 worldPosition = modelMatrix * vec4(windPosition, 1.0);

    // MOUSE REPULSION -------------------------------------------------------
    // The uniform branch lets idle frames skip all ray-distance work. During
    // interaction, cheap phase hashes replace seven per-particle sine calls.
    vec3 mouseRepulsionOffset = vec3(0.0);
    if (uRepelStrength > 0.001) {
      vec3 safeRayDirection = normalize(uMouseRayDirection + vec3(0.00001));
      vec3 fromRayOrigin = worldPosition.xyz - uMouseRayOrigin;
      float rayT = max(dot(fromRayOrigin, safeRayDirection), 0.0);
      vec3 closestRayPoint = uMouseRayOrigin + safeRayDirection * rayT;
      vec3 away = worldPosition.xyz - closestRayPoint;
      float mouseDistance = length(away);
      float depthDistance = distance(closestRayPoint, uMouseWorld);
      float depthMask = 1.0 - smoothstep(
        uRepelDepth * 0.42,
        uRepelDepth,
        depthDistance
      );
      float phaseHash = fract(aPhase * 17.31 + 0.37) * 2.0 - 1.0;
      float irregularity = phaseHash * uRepelRadius * 0.085;
      float repel = 1.0 - smoothstep(
        0.0,
        uRepelRadius,
        mouseDistance + irregularity
      );
      repel = pow(max(repel, 0.0), 1.45) * depthMask * 0.72;

      vec3 hashFlow = vec3(
        fract(aPhase * 13.17 + 0.11),
        fract(aPhase * 29.73 + 0.47),
        fract(aPhase * 47.91 + 0.79)
      ) * 2.0 - 1.0;
      vec3 localFlow = normalize(aDrift * 2.5 + hashFlow * 0.22);
      vec3 radialDirection = normalize(away + localFlow * 0.035 + vec3(0.0001));
      vec3 tangentDirection = normalize(
        cross(safeRayDirection, radialDirection) + localFlow * 0.08
      );
      vec3 magneticDirection = normalize(
        radialDirection * 0.42
        + localFlow * 0.46
        + tangentDirection * phaseHash * 0.14
      );
      float interactionMask = mix(0.4, 1.0, aWindMask);
      mouseRepulsionOffset = magneticDirection
        * repel
        * uRepelRadius
        * 0.28
        * uRepelStrength
        * interactionMask;
    }

    // Final composition used by gl_Position:
    // originalPosition + windOffset (local) + mouseRepulsionOffset (world).
    vec3 finalWorldPosition = worldPosition.xyz + mouseRepulsionOffset;
    vec4 viewPosition = viewMatrix * vec4(finalWorldPosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float perspective = uPointScale / max(1.0, -viewPosition.z);
    float decodedSize = mix(0.5, 1.12, aSize) * mix(0.86, 1.08, aSurface);
    // Preserve visible grains during the close camera flight instead of
    // clamping every zoomed particle to the old 1.55 px ceiling.
    float closeUpCeiling = mix(1.72, 2.18, aSize);
    gl_PointSize = clamp(
      decodedSize * perspective * uPointSizeGain * edgePointGain,
      0.44 * uPointSizeGain,
      closeUpCeiling * uPointSizeGain * edgePointGain
    );
    vBrightness = aBrightness;
    vSurface = aSurface;
    vPhase = aPhase;
    vDepthFlow = depthFlow;
    vColor = aColor;
  }
`;

export const particleFragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform float uDensityGain;

  varying float vBrightness;
  varying float vSurface;
  varying float vPhase;
  varying float vDepthFlow;
  varying float vEdgeVisibility;
  varying float vEdgeFlow;
  varying vec3 vColor;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float radius = length(centered);
    if (radius > 0.5) discard;

    float edge = 1.0 - smoothstep(0.31, 0.5, radius);
    float pin = 1.0 - smoothstep(0.0, 0.13, radius);
    float shell = pow(clamp(vSurface, 0.0, 1.0), 0.72);
    float depthShimmer = 0.88 + vDepthFlow * 0.12;

    // Preserve the golden-brown gradient in close-up. Surface grains receive
    // only a warm amber lift; the video reference contributes motion, not color.
    vec3 warmHighlight = vec3(1.0, 0.64, 0.2);
    vec3 stardustColor = mix(vColor, warmHighlight, shell * 0.22);
    float microVariation = 0.94 + 0.08 * fract(vPhase * 17.13 + 0.37);
    stardustColor *= microVariation;

    // Higher per-grain clarity replaces the previous faint silver fog. The
    // smaller point ceiling prevents overlap from becoming cotton-like bloom.
    float opacityWeight = mix(0.62, 1.0, shell);
    float alpha = (0.105 + pin * 0.22)
      * edge
      * vBrightness
      * opacityWeight
      * depthShimmer
      * uDensityGain
      * uOpacity
      * vEdgeVisibility;
    // Released contour grains receive a restrained size, brightness, and alpha
    // lift so their outward travel reads from the full-tree camera distance.
    alpha *= 1.0 + vEdgeFlow * 0.78;
    stardustColor *= (0.88 + pin * 0.22) * (1.0 + vEdgeFlow * 0.22);

    gl_FragColor = vec4(stardustColor, alpha);
    #include <colorspace_fragment>
  }
`;
