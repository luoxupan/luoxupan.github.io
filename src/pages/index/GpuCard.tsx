import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import './index.less';

/** 显卡模型地址（放在 public/models/gltf 下，构建后按 BASE_URL 直接访问） */
const MODEL_URL = `${import.meta.env.BASE_URL}models/gltf/gpu_card.glb`;
/** GLB 内置的风扇旋转循环动画名，播放它风扇才会转动 */
const FAN_ANIMATION_NAME = "GPU_Fans_Spin_Loop";
/** 模型归一化后的最大边长，用于保证不同模型都能装进同一视角 */
const TARGET_SIZE = 4;
const BACKGROUND_COLOR = 0xf0f0f0;

/** 控制面板默认值，重置时回到这里 */
const DEFAULT_MODEL_COLOR = "#ffffff";
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };

/** 释放 GLTF 场景里的几何体、材质与贴图，避免切换页面时显存泄漏 */
function disposeObjectTree(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (!mesh.material) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const record = material as unknown as Record<string, unknown>;
      Object.keys(record).forEach((key) => {
        const value = record[key] as THREE.Texture;
        if (value && typeof value === "object" && typeof value.dispose === "function" && value.isTexture) {
          value.dispose();
        }
      });
      material.dispose();
    });
  });
}

export function GpuCard(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [animationName, setAnimationName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    let envRenderTarget: THREE.WebGLRenderTarget | undefined;
    let model: THREE.Object3D | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let gui: GUI | undefined;
    const clock = new THREE.Clock();

    /** lil-gui 绑定的参数对象：面板直接改这里，再由 onChange 应用到场景 */
    const conf = {
      color: DEFAULT_MODEL_COLOR,
      x: DEFAULT_POSITION.x,
      y: DEFAULT_POSITION.y,
      z: DEFAULT_POSITION.z,
      reset: () => {},
    };

    /** 根据模型包围球自动摆放相机，保证完整入画 */
    function frameCamera(bounds: THREE.Box3) {
      if (!camera || !controls) return;

      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const fitFov = Math.min(vFov, hFov);
      const distance = (sphere.radius / Math.sin(fitFov / 2)) * 0.95;

      // 显卡已竖起、风扇正对镜头，从正面略偏上的角度观察最直观
      const direction = new THREE.Vector3(0.3, 0.32, 1).normalize();
      camera.position.copy(sphere.center).add(direction.multiplyScalar(distance));
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.updateProjectionMatrix();
      camera.lookAt(sphere.center);

      controls.target.copy(sphere.center);
      controls.minDistance = sphere.radius * 0.9;
      controls.maxDistance = sphere.radius * 4.5;
      controls.update();
    }

    async function init() {
      const width = container!.clientWidth || 1;
      const height = container!.clientHeight || 1;

      // 1. 场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(BACKGROUND_COLOR);
      scene.fog = new THREE.Fog(BACKGROUND_COLOR, TARGET_SIZE * 4, TARGET_SIZE * 12);

      // 2. 相机
      camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 1000);
      camera.position.set(0, 0, TARGET_SIZE * 1.6);

      // 3. 渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container!.appendChild(renderer.domElement);

      // 环境贴图：金属/高光材质没有它会是死黑一片（该模型只有顶点色，没有贴图）
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;
      pmremGenerator.dispose();

      // 4. 加载 GPU 显卡模型
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(MODEL_URL);

      if (cancelled) {
        disposeObjectTree(gltf.scene);
        return;
      }

      // 归一化：居中 + 缩放到统一尺寸
      model = gltf.scene;
      const rawBounds = new THREE.Box3().setFromObject(model);
      const rawCenter = rawBounds.getCenter(new THREE.Vector3());
      const rawSize = rawBounds.getSize(new THREE.Vector3());
      const maxDimension = Math.max(rawSize.x, rawSize.y, rawSize.z) || 1;
      const scale = TARGET_SIZE / maxDimension;

      const pivot = new THREE.Group();
      pivot.name = "GpuCardPivot";
      pivot.scale.setScalar(scale);
      model.position.copy(rawCenter).multiplyScalar(-1);
      pivot.add(model);
      // 模型原始姿态是平放的（风扇朝上），竖起来让双风扇正对镜头
      pivot.rotation.x = -Math.PI / 2;
      scene.add(pivot);

      // 材质可能被多个 mesh 共享，用 Set 去重后再交给面板
      const panelMaterialSet = new Set<THREE.MeshStandardMaterial>();

      model.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // 模型里只有顶点色（COLOR_0），GLTF 默认材质是 metalness=1 / roughness=1，会偏暗
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          const standard = material as THREE.MeshStandardMaterial;
          if (!standard.isMeshStandardMaterial) return;
          // standard.vertexColors = true;
          // standard.metalness = 0.45;
          // standard.roughness = 0.38;
          // standard.envMapIntensity = 1.1;
          // standard.side = THREE.FrontSide;
          // standard.needsUpdate = true;
          panelMaterialSet.add(standard);
        });
      });

      const panelMaterials = Array.from(panelMaterialSet);

      // 右上角控制面板：Three.js 官方 lil-gui
      const applyPosition = () => {
        pivot.position.set(conf.x, conf.y, conf.z);
      };

      conf.reset = () => {
        conf.color = DEFAULT_MODEL_COLOR;
        conf.x = DEFAULT_POSITION.x;
        conf.y = DEFAULT_POSITION.y;
        conf.z = DEFAULT_POSITION.z;
        panelMaterials.forEach((material) => material.color.set(conf.color));
        applyPosition();
        gui?.controllersRecursive().forEach((controller) => controller.updateDisplay());
      };

      gui = new GUI({ container: container!, title: "模型参数", width: 196 });
      gui.addColor(conf, "color").name("颜色").onChange((value: string) => {
        panelMaterials.forEach((material) => material.color.set(value));
      });
      gui.add(conf, "x", -3, 3, 0.05).name("X").onChange(applyPosition);
      gui.add(conf, "y", -3, 3, 0.05).name("Y").onChange(applyPosition);
      gui.add(conf, "z", -3, 3, 0.05).name("Z").onChange(applyPosition);
      gui.add(conf, "reset").name("重置");

      // 5. 灯光 + 地面接影，让产品有落地的体积感
      const framedBounds = new THREE.Box3().setFromObject(pivot);
      const framedSphere = framedBounds.getBoundingSphere(new THREE.Sphere());
      const center = framedSphere.center;
      const radius = framedSphere.radius;

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
      keyLight.position.copy(center).add(new THREE.Vector3(1, 1.5, 1).normalize().multiplyScalar(radius * 3.2));
      keyLight.target.position.copy(center);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.bias = -0.0006;
      keyLight.shadow.normalBias = 0.02;
      const shadowCamera = keyLight.shadow.camera as THREE.OrthographicCamera;
      shadowCamera.left = -radius * 1.6;
      shadowCamera.right = radius * 1.6;
      shadowCamera.top = radius * 1.6;
      shadowCamera.bottom = -radius * 1.6;
      shadowCamera.near = 0.01;
      shadowCamera.far = radius * 10;
      shadowCamera.updateProjectionMatrix();
      scene.add(keyLight);
      scene.add(keyLight.target);

      const fillLight = new THREE.DirectionalLight(0x8fb6ff, 0.9);
      fillLight.position.copy(center).add(new THREE.Vector3(-1, 0.4, 0.8).normalize().multiplyScalar(radius * 3));
      scene.add(fillLight);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1f26, 0.55));

      const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.42 });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(radius * 8, radius * 8), groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(center.x, framedBounds.min.y - 0.01, center.z);
      ground.receiveShadow = true;
      scene.add(ground);

      // 6. 交互控制
      controls = new OrbitControls(camera!, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.minPolarAngle = Math.PI * 0.15;
      controls.maxPolarAngle = Math.PI * 0.85;
      controls.rotateSpeed = 0.75;
      controls.zoomSpeed = 0.7;
      frameCamera(framedBounds);

      // 7. 关键一步：播放 GLB 内置的风扇转动动画
      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        const namedClip = THREE.AnimationClip.findByName(gltf.animations, FAN_ANIMATION_NAME);
        if (!namedClip) {
          console.warn(
            `[GpuCard] 未找到动画 "${FAN_ANIMATION_NAME}"，退回到第一个动画：${gltf.animations[0].name}`
          );
        }
        const clip = namedClip || gltf.animations[0];

        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
        action.play();

        setAnimationName(clip.name);
      } else {
        console.warn(`[GpuCard] ${MODEL_URL} 中没有动画，风扇不会转动`);
      }

      // 8. 自适应尺寸 + 循环渲染
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
      // AnimationMixer 必须每帧推进时间，动画才会真的播下去
      mixer?.update(delta);

      controls?.update();
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
        setError(loadError instanceof Error ? loadError.message : "GPU 模型加载失败");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;

      renderer?.setAnimationLoop(null);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();

      mixer?.stopAllAction();
      if (mixer && model) {
        mixer.uncacheRoot(model);
      }
      mixer = undefined;

      controls?.dispose();
      gui?.destroy();

      if (scene) {
        disposeObjectTree(scene);
      }
      envRenderTarget?.texture.dispose();
      envRenderTarget?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div className="three-scene-gpu-card" ref={containerRef}>
      {animationName && (
        <div className="three-scene-gpu-card-badge">
          <span className="dot" />
          {animationName}
        </div>
      )}
      <div className="three-scene-gpu-card-hint">拖拽旋转 · 滚轮缩放</div>
      {(isLoading || error) && (
        <div className={error ? "three-scene-status is-error" : "three-scene-status"}>
          {error || "正在加载 GPU 显卡模型..."}
        </div>
      )}
    </div>
  );
}
