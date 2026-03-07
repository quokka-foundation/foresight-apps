'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useWebGLStore } from '@/lib/webgl/store';
import { WebGLShader } from '@/lib/webgl/WebGLShader';
import { useScrollPosition } from '@/lib/webgl/useScrollPosition';

export function WebGLCanvas() {
  const elements = useWebGLStore((s) => s.elements);
  const { getScrollPosition } = useScrollPosition();
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolution] = useState(() => new THREE.Vector2(430, 800));
  const [scrollOffset] = useState(() => new THREE.Vector2(0, 0));

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        resolution.set(clientWidth, clientHeight);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [resolution]);

  useEffect(() => {
    let animId: number;
    const updateScroll = () => {
      const { scrollTop, scrollX } = getScrollPosition();
      scrollOffset.set(scrollX, scrollTop);
      animId = requestAnimationFrame(updateScroll);
    };
    animId = requestAnimationFrame(updateScroll);
    return () => cancelAnimationFrame(animId);
  }, [getScrollPosition, scrollOffset]);

  if (elements.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        camera={{ position: [0, 0, 1] }}
        events={() => ({ enabled: false, priority: 0, compute: () => false })}
      >
        {elements.map((el, i) => (
          <WebGLShader
            key={i}
            domElement={el.element}
            fragmentShader={el.fragmentShader}
            customUniforms={el.customUniforms}
            resolution={resolution}
            scrollOffset={scrollOffset}
          />
        ))}
      </Canvas>
    </div>
  );
}
