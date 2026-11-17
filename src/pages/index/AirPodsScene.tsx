import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { createRenderer, disposeObjectTree, releaseRenderer } from "./webgl";
import './index.less';

/** AirPods Max 模型地址（public/models/gltf 下，构建后按 BASE_URL 直接访问） */
const MODEL_URL = `${import.meta.env.BASE_URL}models/gltf/Airpods-max.glb`;
/** 归一化后的最大边长，保证模型能装进同一视角 */
const TARGET_SIZE = 4;
const BACKGROUND_COLOR = 0xf0f0f0;
/** 默认取景的放大倍数：1 = 刚好装下整个模型 */
const DEFAULT_ZOOM = 1.15;

export function AirPodsScene(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [meshCount, setMeshCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let envRenderTarget: THREE.WebGLRenderTarget | undefined;
    let model: THREE.Object3D | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let gui: GUI | undefined;
    let keyLight: THREE.DirectionalLight | undefined;
    /** 初始取景，重置视角时回到这里 */
    let defaultView: { position: THREE.Vector3; target: THREE.Vector3 } | undefined;
    /** 金属/阳极氧化铝外壳靠环境反射出质感，统一收集起来好调强度 */
    const envMaterials = new Set<THREE.MeshStandardMaterial>();
    const clock = new THREE.Clock();

    /** lil-gui 绑定的参数对象 */
    const conf = {
      autoRotate: true,
      rotateSpeed: 0.9,
      keyIntensity: 2.1,
      envIntensity: 1.0,
      zoomIn: () => {},
      zoomOut: () => {},
      resetView: () => {},
    };

    /** 每次点击缩放的比例（<1 是推近，取倒数即拉远） */
    const ZOOM_STEP = 0.8;

    /** 沿「目标点 → 相机」方向推近/拉远，并夹在 OrbitControls 的距离范围内 */
    function zoomBy(factor: number) {
      if (!camera || !controls) return;

      const offset = camera.position.clone().sub(controls.target);
      const distance = THREE.MathUtils.clamp(
        offset.length() * factor,
        controls.minDistance,
        controls.maxDistance
      );

      camera.position.copy(controls.target).add(offset.setLength(distance));
      controls.update();
    }

    /** 根据包围球自动摆放相机，保证模型完整入画 */
    function frameCamera(bounds: THREE.Box3) {
      if (!camera || !controls) return;

      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const fitFov = Math.min(vFov, hFov);
      // 刚好装下模型的基准距离
      const fitDistance = (sphere.radius / Math.sin(fitFov / 2)) * 1.05;
      const distance = fitDistance / DEFAULT_ZOOM;

      // 略偏右上的三分之四视角，能看到耳罩外侧的金属圆环和头梁弧线
      const direction = new THREE.Vector3(0.5, 0.35, 1).normalize();
      camera.position.copy(sphere.center).add(direction.multiplyScalar(distance));
      camera.near = distance / 200;
      camera.far = distance * 40;
      camera.updateProjectionMatrix();
      camera.lookAt(sphere.center);

      controls.target.copy(sphere.center);
      controls.minDistance = distance * 0.35;
      controls.maxDistance = fitDistance * 1.5;
      controls.update();

      defaultView = {
        position: camera.position.clone(),
        target: controls.target.clone(),
      };

      // 雾锚定基准距离，推近后模型边缘也不会被雾冲成灰白
      if (scene) {
        scene.fog = new THREE.Fog(BACKGROUND_COLOR, fitDistance * 2.2, fitDistance * 5);
      }
    }

    async function init() {
      const width = container!.clientWidth || 1;
      const height = container!.clientHeight || 1;

      // 1. 场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(BACKGROUND_COLOR);

      // 2. 相机
      camera = new THREE.PerspectiveCamera(36, width / height, 0.01, 1000);

      // 3. 渲染器
      renderer = createRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.shadowMap.enabled = true;
      // three r165+ 已移除 PCFSoftShadowMap，继续写它会回退并打警告，直接用 PCFShadowMap
      renderer.shadowMap.type = THREE.PCFShadowMap;
      container!.appendChild(renderer.domElement);

      // 环境贴图：这个模型用了 KHR_materials_clearcoat / specular，
      // 金属耳罩和阳极氧化外壳没有环境反射会变成死板的灰块
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;
      pmremGenerator.dispose();

      // 4. 加载模型（11MB，仍给进度反馈）
      const loader = new GLTFLoader();
      const gltf = await new Promise<Awaited<ReturnType<GLTFLoader["loadAsync"]>>>(
        (resolve, reject) => {
          loader.load(
            MODEL_URL,
            resolve,
            (event) => {
              if (cancelled || !event.total) return;
              setProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
            },
            reject
          );
        }
      );

      if (cancelled) {
        disposeObjectTree(gltf.scene);
        return;
      }

      // 5. 归一化：居中 + 缩放到统一尺寸
      model = gltf.scene;
      const rawBounds = new THREE.Box3().setFromObject(model);
      const rawCenter = rawBounds.getCenter(new THREE.Vector3());
      const rawSize = rawBounds.getSize(new THREE.Vector3());
      const maxDimension = Math.max(rawSize.x, rawSize.y, rawSize.z) || 1;
      const scale = TARGET_SIZE / maxDimension;

      const pivot = new THREE.Group();
      pivot.name = "AirPodsPivot";
      pivot.scale.setScalar(scale);
      model.position.copy(rawCenter).multiplyScalar(-1);
      pivot.add(model);
      scene.add(pivot);

      let meshes = 0;
      // 耳垫的织物是法线贴图做出来的编织纹，各向异性过滤不给的话斜视会糊成摩尔纹
      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      model.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;

        meshes += 1;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          const standard = material as THREE.MeshStandardMaterial;
          if (!standard.isMeshStandardMaterial) return;
          standard.envMapIntensity = conf.envIntensity;
          // clearcoat / sheen 这些扩展参数改完要重新编译着色器
          standard.needsUpdate = true;
          envMaterials.add(standard);

          const record = standard as unknown as Record<string, unknown>;
          Object.keys(record).forEach((key) => {
            const texture = record[key] as THREE.Texture;
            if (texture && typeof texture === "object" && texture.isTexture) {
              texture.anisotropy = maxAnisotropy;
            }
          });
        });
      });
      setMeshCount(meshes);

      // 6. 灯光：主光带阴影 + 冷色补光 + 轮廓光
      const framedBounds = new THREE.Box3().setFromObject(pivot);
      const framedSphere = framedBounds.getBoundingSphere(new THREE.Sphere());
      const center = framedSphere.center;
      const radius = framedSphere.radius;

      keyLight = new THREE.DirectionalLight(0xffffff, conf.keyIntensity);
      keyLight.position
        .copy(center)
        .add(new THREE.Vector3(0.9, 1.8, 1).normalize().multiplyScalar(radius * 4));
      keyLight.target.position.copy(center);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = radius * 0.004;
      const shadowCamera = keyLight.shadow.camera as THREE.OrthographicCamera;
      shadowCamera.left = -radius * 1.3;
      shadowCamera.right = radius * 1.3;
      shadowCamera.top = radius * 1.3;
      shadowCamera.bottom = -radius * 1.3;
      shadowCamera.near = 0.01;
      shadowCamera.far = radius * 12;
      shadowCamera.updateProjectionMatrix();
      scene.add(keyLight);
      scene.add(keyLight.target);

      const fillLight = new THREE.DirectionalLight(0xcfe0ff, 0.85);
      fillLight.position
        .copy(center)
        .add(new THREE.Vector3(-1, 0.3, 0.7).normalize().multiplyScalar(radius * 3.5));
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
      rimLight.position
        .copy(center)
        .add(new THREE.Vector3(-0.5, 0.5, -1).normalize().multiplyScalar(radius * 3.5));
      scene.add(rimLight);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9a9a, 0.35));

      // 只有接影地面，不画实体，产品才有摆在台面上的感觉
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(radius * 10, radius * 10),
        new THREE.ShadowMaterial({ opacity: 0.22 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(center.x, framedBounds.min.y - 0.002, center.z);
      ground.receiveShadow = true;
      scene.add(ground);

      // 7. 交互控制
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = conf.autoRotate;
      controls.autoRotateSpeed = conf.rotateSpeed;
      // 略低于水平线，避免转到地面以下露出接影板
      controls.maxPolarAngle = Math.PI * 0.54;
      controls.rotateSpeed = 0.75;
      controls.zoomSpeed = 0.7;
      frameCamera(framedBounds);

      // 8. 右上角控制面板：Three.js 官方 lil-gui
      conf.zoomIn = () => zoomBy(ZOOM_STEP);
      conf.zoomOut = () => zoomBy(1 / ZOOM_STEP);
      conf.resetView = () => {
        if (!camera || !controls || !defaultView) return;
        camera.position.copy(defaultView.position);
        controls.target.copy(defaultView.target);
        controls.update();
      };

      gui = new GUI({ container: container!, title: "模型参数", width: 196 });
      gui
        .add(conf, "autoRotate")
        .name("自动旋转")
        .onChange((value: boolean) => {
          if (controls) controls.autoRotate = value;
        });
      gui
        .add(conf, "rotateSpeed", 0, 3, 0.1)
        .name("旋转速度")
        .onChange((value: number) => {
          if (controls) controls.autoRotateSpeed = value;
        });
      gui
        .add(conf, "keyIntensity", 0, 6, 0.1)
        .name("光照强度")
        .onChange((value: number) => {
          if (keyLight) keyLight.intensity = value;
        });
      gui
        .add(conf, "envIntensity", 0, 3, 0.05)
        .name("反射强度")
        .onChange((value: number) => {
          envMaterials.forEach((material) => {
            material.envMapIntensity = value;
          });
        });
      gui.add(conf, "zoomIn").name("放大 ＋");
      gui.add(conf, "zoomOut").name("缩小 －");
      gui.add(conf, "resetView").name("重置视角");

      // 9. 自适应尺寸 + 循环渲染
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container!);
      window.addEventListener("resize", handleResize);

      clock.start();
      renderer.setAnimationLoop(animate);
    }

    function animate() {
      if (!renderer || !scene || !camera) return;

      const delta = clock.getDelta();
      // 传入 delta，自动旋转在低帧率时也不会变慢
      controls?.update(delta);
      renderer.render(scene, camera);
    }

    function handleResize() {
      if (!container || !camera || !renderer) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    init()
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "AirPods 模型加载失败");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;

      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();

      controls?.dispose();
      gui?.destroy();

      if (scene) {
        disposeObjectTree(scene);
      }
      envRenderTarget?.texture.dispose();
      envRenderTarget?.dispose();
      releaseRenderer(renderer);
    };
  }, []);

  return (
    <div className="three-scene three-scene-airpods" ref={containerRef}>
      {!isLoading && !error && meshCount !== null && (
        <div className="three-scene-badge">
          <span className="dot" />
          Airpods-max.glb · {meshCount} meshes
        </div>
      )}
      <div className="three-scene-hint">拖拽旋转 · 滚轮缩放</div>
      {(isLoading || error) && (
        <div className={error ? "three-scene-status is-error" : "three-scene-status"}>
          {error || `正在加载 AirPods Max 模型... ${progress}%`}
        </div>
      )}
    </div>
  );
}
