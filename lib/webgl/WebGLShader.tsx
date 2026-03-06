'use client';

import { useRef, useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useScrollPosition } from '@/lib/webgl/useScrollPosition';
import { useFrame } from '@react-three/fiber';

type DOMRect = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type WebGLShaderProps = {
  domElement: HTMLElement;
  fragmentShader: string;
  customUniforms?: Record<string, THREE.Uniform>;
  resolution: THREE.Vector2;
  scrollOffset: THREE.Vector2;
};

const commonVertex = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_scrollOffset;
uniform vec2 u_domXY;
uniform vec2 u_domWH;
uniform float u_maxContentWidth;
uniform float u_horizontalPadding;

varying vec2 v_uv;

void main() {
  vec2 pixelXY = u_domXY - u_scrollOffset + u_domWH * 0.5;

  if (u_resolution.x > u_maxContentWidth) {
    float centeringOffset = (u_resolution.x - u_maxContentWidth) * 0.5;
    pixelXY.x -= centeringOffset;
  }

  pixelXY.y = u_resolution.y - pixelXY.y;

  vec2 adjustedDomWH = u_domWH;
  adjustedDomWH.x -= u_horizontalPadding * 2.0;

  pixelXY += position.xy * adjustedDomWH;
  vec2 xy = pixelXY / u_resolution * 2. - 1.;
  v_uv = uv;
  gl_Position = vec4(xy, 0., 1.0);
}
`;

export { commonVertex };

export function WebGLShader({
  domElement,
  resolution,
  scrollOffset,
  fragmentShader,
  customUniforms,
}: WebGLShaderProps) {
  const { getScrollPosition } = useScrollPosition();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [hasValidDimensions, setHasValidDimensions] = useState(false);
  const rect = useRef<DOMRect>({ width: 0, height: 0, x: 0, y: 0 });

  useLayoutEffect(() => {
    let validationAttempts = 0;

    const updateRect = () => {
      const domRect = domElement.getBoundingClientRect();
      const { scrollTop, scrollX } = getScrollPosition();

      if (domRect.width < 10 || domRect.height < 10) {
        setHasValidDimensions(false);
        validationAttempts = 0;
        return false;
      }

      rect.current = {
        width: domRect.width,
        height: domRect.height,
        x: domRect.left + scrollX,
        y: domRect.top + scrollTop,
      };

      validationAttempts++;
      if (validationAttempts < 3) {
        setHasValidDimensions(false);
        return false;
      }

      setHasValidDimensions(true);
      return true;
    };

    const scheduledUpdate = () => {
      validationAttempts = 0;
      const tryUpdate = () => {
        if (!updateRect()) {
          requestAnimationFrame(tryUpdate);
        }
      };
      requestAnimationFrame(tryUpdate);
    };

    const resizeObserver = new ResizeObserver(() => { scheduledUpdate(); });
    window.addEventListener('resize', scheduledUpdate);
    resizeObserver.observe(domElement);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduledUpdate);
    };
  }, [domElement, getScrollPosition]);

  const domWH = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const domXY = useRef<THREE.Vector2>(new THREE.Vector2(1, 1));

  const uniforms = useMemo(
    () => ({
      u_domXY: { value: domXY.current },
      u_domWH: { value: domWH.current },
      u_resolution: { value: resolution },
      u_scrollOffset: { value: scrollOffset },
      u_maxContentWidth: { value: 430 }, // Mobile frame width
      u_horizontalPadding: { value: 0.0 },
      u_time: { value: 0 },
      ...customUniforms,
    }),
    [resolution, scrollOffset, customUniforms],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current || !hasValidDimensions) return;

    domWH.current.set(rect.current.width, rect.current.height);
    domXY.current.set(rect.current.x, rect.current.y);
    materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    materialRef.current.uniformsNeedUpdate = true;
  });

  if (!hasValidDimensions) return null;

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={commonVertex}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
