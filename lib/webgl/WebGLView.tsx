'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWebGLStore, type WebGLElement } from '@/lib/webgl/store';
import * as THREE from 'three';

// Rounded corner SDF shader functions (injected into fragment shaders)

const ROUNDED_CORNER_SHADER_FUNCTIONS = `
float roundedBoxSDF(vec2 center, vec2 size, float radius) {
  vec2 q = abs(center) - size + radius;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}
`;

const ROUNDED_CORNER_MAIN_INJECTION = `
  float d = roundedBoxSDF(
    (v_uv - 0.5) * u_domWH,
    u_domWH * 0.5,
    u_borderRadius
  );
  if (d > 0.5) discard;
`;

function injectRoundedCorners(shader: string, borderRadius: number): string {
  if (borderRadius <= 0) return shader;

  // Build uniforms to inject, skipping any already declared in the shader
  const uniformsToInject: string[] = [];
  if (!shader.includes('uniform vec2 u_domWH')) {
    uniformsToInject.push('uniform vec2 u_domWH;');
  }
  if (!shader.includes('uniform float u_borderRadius')) {
    uniformsToInject.push('uniform float u_borderRadius;');
  }

  // Inject uniforms
  let result = shader;
  if (uniformsToInject.length > 0) {
    result = result.replace(
      'varying vec2 v_uv;',
      `varying vec2 v_uv;\n${uniformsToInject.join('\n')}`,
    );
  }

  // Inject SDF function before main
  result = result.replace(
    'void main()',
    `${ROUNDED_CORNER_SHADER_FUNCTIONS}\nvoid main()`,
  );

  // Inject discard logic at start of main
  result = result.replace(
    'void main() {',
    `void main() {\n${ROUNDED_CORNER_MAIN_INJECTION}`,
  );

  return result;
}

type WebGLViewProps = {
  fragmentShader: string;
  customUniforms?: Record<string, THREE.Uniform>;
  borderRadius?: number;
  className?: string;
  children?: React.ReactNode;
};

export function WebGLView({
  fragmentShader,
  customUniforms,
  borderRadius = 0,
  className,
  children,
}: WebGLViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setElements = useWebGLStore((s) => s.setElements);

  const processedShader = borderRadius > 0
    ? injectRoundedCorners(fragmentShader, borderRadius)
    : fragmentShader;

  const processedUniforms = borderRadius > 0
    ? {
        ...customUniforms,
        u_borderRadius: new THREE.Uniform(borderRadius),
      }
    : customUniforms;

  const register = useCallback(() => {
    if (!ref.current) return;

    const element: WebGLElement = {
      element: ref.current,
      fragmentShader: processedShader,
      customUniforms: processedUniforms,
    };

    setElements((prev) => [...prev, element]);

    return () => {
      setElements((prev) => prev.filter((e) => e.element !== ref.current));
    };
  }, [processedShader, processedUniforms, setElements]);

  useEffect(() => {
    return register();
  }, [register]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
