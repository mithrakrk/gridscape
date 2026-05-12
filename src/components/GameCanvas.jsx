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
        return sceneManagerRef.current.drawTrajectory(analysis);
      }
      return null;
    },
    fireBullet: (points, onUpdate, onComplete) => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.animateBullet(points, onUpdate, onComplete);
      }
    },
    loadLevel: (levelData) => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.loadLevel(levelData);
      }
    },
    setMode: (mode) => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.setMode(mode);
      }
    },
    getCameraPos: () => {
      if (sceneManagerRef.current) {
        return sceneManagerRef.current.camera.position;
      }
      return null;
    },
    paintCells: (cells, gridSize) => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.addPaintCells(cells, gridSize);
      }
    }
  }));

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});
