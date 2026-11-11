import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CCDIKSolver, CCDIKHelper } from "three/examples/jsm/animation/CCDIKSolver.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import './index.less';

type SceneObjects = {
  head?: THREE.Object3D;
  lowerarm_l?: THREE.Object3D;
  Upperarm_l?: THREE.Object3D;
  hand_l?: THREE.Object3D;
  target_hand_l?: THREE.Object3D;
  sphere?: THREE.Mesh;
  kira?: THREE.SkinnedMesh;
};

function disposeObjectTree(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (!mesh.material) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        const texture = value as THREE.Texture;
        if (texture && typeof texture.dispose === "function") {
          texture.dispose();
        }
      });
      material.dispose();
    });
  });
}

export function IndexPage(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanupScene: (() => void) | null = null;
    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let orbitControls: OrbitControls | undefined;
    let transformControls: TransformControls | undefined;
    let mirrorSphereCamera: THREE.CubeCamera | undefined;
    let cubeRenderTarget: THREE.WebGLCubeRenderTarget | undefined;
    let mirrorSphereMaterial: THREE.MeshBasicMaterial | undefined;
    let dracoLoader: DRACOLoader | undefined;
    let gui: GUI | undefined;
    let stats: Stats | undefined;
    let ikSolver: CCDIKSolver | undefined;

    const OOI: SceneObjects = {};
    const v0 = new THREE.Vector3();
    const conf = {
      followSphere: false,
      turnHead: true,
      ik_solver: true,
      update: () => {},
    };

    async function init() {
      const WIDTH = container.clientWidth;
      const HEIGHT = container.clientHeight;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0xffffff, 0.17);
      scene.background = new THREE.Color(0xffffff);

      camera = new THREE.PerspectiveCamera(55, WIDTH / HEIGHT, 0.001, 5000);
      camera.position.set(0.9728517749133652, 1.1044765132727201, 0.7316689528482836);
      camera.lookAt(scene.position);

      const ambientLight = new THREE.AmbientLight(0xffffff, 8);
      scene.add(ambientLight);

      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(`${import.meta.env.BASE_URL}draco/gltf/`);
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      const gltf = await gltfLoader.loadAsync(`${import.meta.env.BASE_URL}models/gltf/kira.glb`);
      if (cancelled) {
        disposeObjectTree(gltf.scene);
        dracoLoader.dispose();
        return;
      }

      gltf.scene.traverse((node) => {
        if (node.name === "head") OOI.head = node;
        if (node.name === "lowerarm_l") OOI.lowerarm_l = node;
        if (node.name === "Upperarm_l") OOI.Upperarm_l = node;
        if (node.name === "hand_l") OOI.hand_l = node;
        if (node.name === "target_hand_l") OOI.target_hand_l = node;
        if (node.name === "boule") OOI.sphere = node as THREE.Mesh;
        if (node.name === "Kira_Shirt_left") OOI.kira = node as THREE.SkinnedMesh;
      });

      if (
        !OOI.head ||
        !OOI.lowerarm_l ||
        !OOI.Upperarm_l ||
        !OOI.hand_l ||
        !OOI.target_hand_l ||
        !OOI.sphere ||
        !OOI.kira
      ) {
        throw new Error("kira.glb 中缺少 IK 场景所需的节点");
      }

      scene.add(gltf.scene);

      const targetPosition = OOI.sphere.position.clone();
      OOI.hand_l.attach(OOI.sphere);

      cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
      mirrorSphereCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget);
      scene.add(mirrorSphereCamera);
      mirrorSphereMaterial = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture });
      OOI.sphere.material = mirrorSphereMaterial;

      OOI.kira.add(OOI.kira.skeleton.bones[0]);
      const iks = [
        {
          target: 22,
          effector: 6,
          links: [
            {
              index: 5,
              rotationMin: new THREE.Vector3(1.2, -1.8, -0.4),
              rotationMax: new THREE.Vector3(1.7, -1.1, 0.3),
            },
            {
              index: 4,
              rotationMin: new THREE.Vector3(0.1, -0.7, -1.8),
              rotationMax: new THREE.Vector3(1.1, 0, -1.4),
            },
          ],
        },
      ];
      ikSolver = new CCDIKSolver(OOI.kira, iks);
      const ccdikHelper = new CCDIKHelper(OOI.kira, iks, 0.01);
      scene.add(ccdikHelper);

      conf.update = updateIK;

      gui = new GUI();
      gui.add(conf, "followSphere").name("follow sphere");
      gui.add(conf, "turnHead").name("turn head");
      gui.add(conf, "ik_solver").name("IK auto update");
      gui.add(conf, "update").name("IK manual update()");
      gui.open();
      container.appendChild(gui.domElement);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(WIDTH, HEIGHT);
      container.appendChild(renderer.domElement);

      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.minDistance = 0.2;
      orbitControls.maxDistance = 1.5;
      orbitControls.enableDamping = true;
      orbitControls.target.copy(targetPosition);

      transformControls = new TransformControls(camera, renderer.domElement);
      transformControls.size = 0.75;
      transformControls.showX = false;
      transformControls.space = "world";
      transformControls.attach(OOI.target_hand_l);
      scene.add(transformControls.getHelper());

      transformControls.addEventListener("mouseDown", () => {
        orbitControls!.enabled = false;
      });
      transformControls.addEventListener("mouseUp", () => {
        orbitControls!.enabled = true;
      });

      stats = new Stats();
      container.appendChild(stats.dom);

      window.addEventListener("resize", handleResize);
      renderer.setAnimationLoop(animate);

      cleanupScene = () => {
        renderer?.setAnimationLoop(null);
        window.removeEventListener("resize", handleResize);
        orbitControls?.dispose();
        transformControls?.dispose();
        disposeObjectTree(scene!);
        mirrorSphereMaterial?.dispose();
        cubeRenderTarget?.dispose();
        dracoLoader?.dispose();
        gui?.destroy();
        stats?.dom.remove();
        renderer?.dispose();
        renderer?.domElement.remove();
      };
    }

    function animate() {
      if (!scene || !camera || !renderer || !orbitControls) return;

      if (OOI.sphere && mirrorSphereCamera) {
        OOI.sphere.visible = false;
        OOI.sphere.getWorldPosition(mirrorSphereCamera.position);
        mirrorSphereCamera.update(renderer, scene);
        OOI.sphere.visible = true;
      }

      if (OOI.sphere && conf.followSphere) {
        OOI.sphere.getWorldPosition(v0);
        orbitControls.target.lerp(v0, 0.1);
      }

      if (OOI.head && OOI.sphere && conf.turnHead) {
        OOI.sphere.getWorldPosition(v0);
        OOI.head.lookAt(v0);
        OOI.head.rotation.set(OOI.head.rotation.x, OOI.head.rotation.y + Math.PI, OOI.head.rotation.z);
      }

      if (conf.ik_solver) {
        updateIK();
      }

      orbitControls.update();
      renderer.render(scene, camera);
      stats?.update();
    }

    function updateIK() {
      ikSolver?.update();
      scene?.traverse((object) => {
        if ((object as THREE.SkinnedMesh).isSkinnedMesh) {
          (object as THREE.SkinnedMesh).computeBoundingSphere();
        }
      });
    }

    function handleResize() {
      if (!camera || !renderer || !container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    init().catch((loadError: unknown) => {
      if (cancelled) return;

      setError(loadError instanceof Error ? loadError.message : "Three.js 场景加载失败");
    }).finally(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      cleanupScene?.();
    };
  }, []);

  return (
    <div className="three-scene" ref={containerRef}>
      {(isLoading || error) && (
        <div className={error ? "three-scene-status is-error" : "three-scene-status"}>
          {error || "正在加载 Three.js IK 场景..."}
        </div>
      )}
    </div>
  );
}
