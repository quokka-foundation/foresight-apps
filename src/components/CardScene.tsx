'use client';

import { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useFBO } from '@/lib/webgl/useFbo';
import { RenderTexture } from '@/lib/webgl/RenderTexture';

/**
 * CardScene — Renders a 3D scene into an FBO, then applies a halftone
 * dot-matrix post-processing shader. Used for hero cards with the
 * Base website aesthetic.
 *
 * Pipeline:
 *   1. 3D scene (geometric shape + lighting) renders into FBO via RenderTexture
 *   2. A fullscreen quad reads the FBO texture
 *   3. Fragment shader converts it to halftone dot-matrix pattern
 *   4. Optional: pattern atlas lookup for tile-based rendering
 */

// ---- Halftone post-processing fragment shader ----
const halftoneFragmentShader = /* glsl */ `
precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_sceneTexture;
uniform sampler2D u_patternAtlas;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_dotScale;
uniform vec3 u_tintColor;
uniform float u_patternColumns;
uniform float u_usePatternAtlas;

float luminance(vec3 c) {
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

void main() {
  vec4 sceneColor = texture2D(u_sceneTexture, v_uv);

  // Cell-based halftone
  float cellSize = u_dotScale;
  vec2 pixelCoord = v_uv * u_resolution;
  vec2 cellIndex = floor(pixelCoord / cellSize);
  vec2 cellCenter = (cellIndex + 0.5) * cellSize / u_resolution;

  vec4 cellColor = texture2D(u_sceneTexture, cellCenter);
  float lum = luminance(cellColor.rgb);

  // Subtle time animation on cells
  float timeAnim = sin(cellIndex.x * 0.4 + cellIndex.y * 0.3 + u_time * 0.3) * 0.015;
  lum = clamp(lum + timeAnim, 0.0, 1.0);

  if (u_usePatternAtlas > 0.5) {
    // Pattern atlas mode: map luminance to pattern tile columns
    float cols = u_patternColumns;
    int patIdx = int(floor(lum * (cols - 1.0)));
    float patU = (fract(pixelCoord.x / cellSize) + float(patIdx)) / cols;
    float patV = fract(pixelCoord.y / cellSize);
    vec4 pattern = texture2D(u_patternAtlas, vec2(patU, patV));

    // Tint the pattern with category color
    vec3 tinted = pattern.rgb * u_tintColor;
    gl_FragColor = vec4(mix(sceneColor.rgb, tinted, 0.85), sceneColor.a);
  } else {
    // Dot-based halftone mode
    vec2 cellUV = fract(pixelCoord / cellSize);
    float dist = length(cellUV - 0.5);
    float radius = lum * 0.5;
    float dot = smoothstep(radius + 0.02, radius - 0.02, dist);

    vec3 dotColor = u_tintColor * dot;
    vec3 bgColor = vec3(0.04); // illoblack-ish background
    vec3 finalColor = mix(bgColor, dotColor, dot);

    gl_FragColor = vec4(finalColor, max(sceneColor.a, dot * 0.8));
  }
}
`;

const halftoneVertexShader = /* glsl */ `
varying vec2 v_uv;
void main() {
  v_uv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// ---- Fullscreen quad that applies the halftone shader ----
function HalftoneQuad({
  fboTexture,
  patternTexture,
  tintColor,
  dotScale,
  patternColumns,
  usePatternAtlas,
}: {
  fboTexture: THREE.Texture;
  patternTexture: THREE.Texture | null;
  tintColor: THREE.Color;
  dotScale: number;
  patternColumns: number;
  usePatternAtlas: boolean;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((s) => s.size);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(
    () => ({
      u_sceneTexture: { value: fboTexture },
      u_patternAtlas: { value: patternTexture },
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
      u_dotScale: { value: dotScale },
      u_tintColor: { value: tintColor },
      u_patternColumns: { value: patternColumns },
      u_usePatternAtlas: { value: usePatternAtlas ? 1.0 : 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Update resolution when size changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_resolution.value.set(size.width, size.height);
    }
  }, [size]);

  return (
    <mesh>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={halftoneVertexShader}
        fragmentShader={halftoneFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

// ---- Default 3D scene: floating geometric shape ----
function DefaultScene({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={0.4} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight position={[-3, -1, -3]} intensity={0.3} color="#4488ff" />
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <mesh ref={meshRef} scale={1.2}>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <icosahedronGeometry args={[1, 1]} />
          {/* eslint-disable-next-line react/no-unknown-property */}
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
        </mesh>
      </Float>
    </>
  );
}

// ---- Inner scene that runs inside the R3F Canvas ----
function CardSceneInner({
  color,
  dotScale,
  patternSrc,
  patternColumns,
  children3D,
}: {
  color: string;
  dotScale: number;
  patternSrc?: string;
  patternColumns: number;
  children3D?: React.ReactNode;
}) {
  const fbo = useFBO(512, 512, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  });

  const [patternTexture, setPatternTexture] = useState<THREE.Texture | null>(null);
  const tintColor = useMemo(() => new THREE.Color(color), [color]);

  useEffect(() => {
    if (!patternSrc) return;
    const loader = new THREE.TextureLoader();
    loader.load(patternSrc, (tex) => {
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      setPatternTexture(tex);
    });
  }, [patternSrc]);

  return (
    <>
      <RenderTexture fbo={fbo} width={512} height={512} renderPriority={1}>
        {children3D ?? <DefaultScene color={color} />}
      </RenderTexture>
      <HalftoneQuad
        fboTexture={fbo.texture}
        patternTexture={patternTexture}
        tintColor={tintColor}
        dotScale={dotScale}
        patternColumns={patternColumns}
        usePatternAtlas={!!patternSrc}
      />
    </>
  );
}

// ---- Public CardScene component ----
export type CardSceneProps = {
  /** Category color for halftone tint */
  color?: string;
  /** Cell size for dot-matrix grid (px) */
  dotScale?: number;
  /** Optional pattern atlas image URL */
  patternSrc?: string;
  /** Number of columns in the pattern atlas */
  patternColumns?: number;
  /** Width of the canvas */
  width?: number;
  /** Height of the canvas */
  height?: number;
  /** Custom CSS class */
  className?: string;
  /** Custom 3D scene children (replaces default icosahedron) */
  children3D?: React.ReactNode;
};

export function CardScene({
  color = '#0052FF',
  dotScale = 6,
  patternSrc,
  patternColumns = 6,
  width = 400,
  height = 240,
  className,
  children3D,
}: CardSceneProps) {
  return (
    <div
      className={className}
      style={{ width, height, position: 'relative', overflow: 'hidden' }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <CardSceneInner
            color={color}
            dotScale={dotScale}
            patternSrc={patternSrc}
            patternColumns={patternColumns}
            children3D={children3D}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
