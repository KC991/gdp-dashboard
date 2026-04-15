"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FaceParameters } from "@head-editor/shared";
import { applyDeformation } from "@head-editor/head-engine";

type ViewerStatus = {
  meshLoaded: boolean;
  loadError: string | null;
  vertexCount: number;
};

type Props = {
  params: FaceParameters;
  wireframe: boolean;
  onStatusChange?: (status: ViewerStatus) => void;
};

export default function HeadViewer({ params, wireframe, onStatusChange }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const baseRef = useRef<Float32Array | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.01, 200);
    camera.position.set(0, 0, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(2, 3, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const material = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, wireframe });
    materialRef.current = material;

    const loader = new OBJLoader();
    loader.load(
      "/meshes/base_mesh.obj",
      (obj) => {
        let meshFound = false;

        obj.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          meshFound = true;
          const mesh = child as THREE.Mesh;
          const geometry = mesh.geometry.toNonIndexed();
          geometry.computeBoundingBox();

          const box = geometry.boundingBox;
          if (box) {
            const center = new THREE.Vector3();
            box.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            geometry.computeBoundingBox();
            const centeredBox = geometry.boundingBox;
            if (centeredBox) {
              const size = new THREE.Vector3();
              centeredBox.getSize(size);
              const maxDim = Math.max(size.x, size.y, size.z, 0.001);
              const fov = (camera.fov * Math.PI) / 180;
              const dist = maxDim / (2 * Math.tan(fov / 2));
              camera.position.set(0, 0, dist * 1.35);
              camera.near = Math.max(0.01, dist / 100);
              camera.far = dist * 100;
              camera.updateProjectionMatrix();
              controls.target.set(0, 0, 0);
              controls.update();
            }
          }

          geometry.computeVertexNormals();
          geometryRef.current = geometry;
          baseRef.current = new Float32Array(geometry.attributes.position.array as Float32Array);

          const displayMesh = new THREE.Mesh(geometry, material);
          scene.add(displayMesh);

          onStatusChange?.({
            meshLoaded: true,
            loadError: null,
            vertexCount: geometry.attributes.position.count
          });
        });

        if (!meshFound) {
          const err = "OBJ loaded but no mesh objects were found.";
          setLoadError(err);
          onStatusChange?.({ meshLoaded: false, loadError: err, vertexCount: 0 });
        }
      },
      undefined,
      (error) => {
        const err = `Failed to load OBJ: ${String((error as Error)?.message ?? error)}`;
        setLoadError(err);
        onStatusChange?.({ meshLoaded: false, loadError: err, vertexCount: 0 });
      }
    );

    let raf = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [onStatusChange]);

  useEffect(() => {
    const geometry = geometryRef.current;
    const base = baseRef.current;
    if (!geometry || !base) return;

    const deformed = applyDeformation(base, params);
    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    attribute.copyArray(deformed);
    attribute.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [params]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = wireframe;
      materialRef.current.needsUpdate = true;
    }
  }, [wireframe]);

  return (
    <div className="viewer" ref={mountRef}>
      {loadError ? <div className="viewer-error">{loadError}</div> : null}
    </div>
  );
}
