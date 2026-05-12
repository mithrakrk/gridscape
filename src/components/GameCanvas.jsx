import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { SceneManager } from '../game/SceneManager';

export const GameCanvas = forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const sceneManagerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !sceneManagerRef.current) {
      sceneManagerRef.current = new SceneManager(containerRef.current);
    }

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.destroy();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    previewTrajectory: (analysis) => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.drawTrajectory(analysis);
      }
    }
  }));

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});
