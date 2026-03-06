'use client';

import dynamic from 'next/dynamic';

const WebGLCanvas = dynamic(
  () => import('@/lib/webgl/WebGLCanvas').then((m) => m.WebGLCanvas),
  { ssr: false },
);

export function DynamicWebGLCanvas() {
  return <WebGLCanvas />;
}
