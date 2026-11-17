import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { createRenderer, disposeObjectTree, releaseRenderer } from "./webgl";
import './index.less';

/** 沙漠场景模型地址（public/models/gltf 下，构建后按 BASE_URL 直接访问） */
const MODEL_URL = `${import.meta.env.BASE_URL}models/gltf/desert.glb`;
/** 归一化后的最大边长，保证不同模型都能装进同一视角 */
const TARGET_SIZE = 6;
const BACKGROUND_COLOR = 0xf0f0f0;
/** 默认取景的放大倍数：1 = 刚好装下整个模型，3 = 推近到局部特写 */
const DEFAULT_ZOOM = 3;

export function DesertScene(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [meshCount, setMeshCount] = React.useState(0);

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
    /** 初始取景，重置视角时回到这里 */
    let defaultView: { position: THREE.Vector3; target: THREE.Vector3 } | undefined;
    const clock = new THREE.Clock();

    /** lil-gui 绑定的参数对象 */
    const conf = {
      autoRotate: true,
      rotateSpeed: 0.6,
      sunIntensity: 2.8,
      zoomIn: () => {},
      zoomOut: () => {},
      resetView: () => {},
    };

    /** 每次点击缩放的比例（<1 是推近，取倒数即拉远） */
    const ZOOM_STEP = 0.78;

    /**
     * 沿「目标点 → 相机」方向推近/拉远，并夹在 OrbitControls 的距离范围内，
     * 避免一直点缩小把相机拉飞到模型之外、或推近穿过地面。
     */
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

    /** 根据包围球自动摆放相机，默认推近 DEFAULT_ZOOM 倍取景 */
    function frameCamera(bounds: THREE.Box3) {
      if (!camera || !controls) return;

      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const fitFov = Math.min(vFov, hFov);
      // fitDistance 是「刚好装下整个模型」的基准距离，雾和缩放上下限都锚定它，
      // 这样改默认放大倍数时不会连带影响雾效和可缩放范围
      const fitDistance = (sphere.radius / Math.sin(fitFov / 2)) * 0.8;
      const distance = fitDistance / DEFAULT_ZOOM;

      // 俯视一点的斜角，能同时看到地貌起伏与沙丘的受光面
      const direction = new THREE.Vector3(0.9, 0.62, 1).normalize();
      camera.position.copy(sphere.center).add(direction.multiplyScalar(distance));
      camera.near = fitDistance / 200;
      camera.far = fitDistance * 40;
      camera.updateProjectionMatrix();
      camera.lookAt(sphere.center);

      controls.target.copy(sphere.center);
      // 相对默认距离给出缩放区间，放大后仍留有再推近的余量
      controls.minDistance = distance * 0.4;
      // 上限对齐「刚好装下模型」的距离，再远模型会小成一粒且被雾冲淡
      controls.maxDistance = fitDistance * 1.4;
      controls.update();

      defaultView = {
        position: camera.position.clone(),
        target: controls.target.clone(),
      };

      // 雾的颜色与背景一致，让远处地形自然溶进底色
      // 起始距离按基准距离算，否则推近后模型远端会被雾冲淡成灰白
      if (scene) {
        scene.fog = new THREE.Fog(BACKGROUND_COLOR, fitDistance * 1.8, fitDistance * 4.5);
      }
    }

    async function init() {
      const width = container!.clientWidth || 1;
      const height = container!.clientHeight || 1;

      // 1. 场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(BACKGROUND_COLOR);

      // 2. 相机
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

      // 3. 渲染器
      renderer = createRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container!.appendChild(renderer.domElement);

      // 环境贴图：给 PBR 材质补一点环境反射，否则背光面容易发灰发死
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;
      pmremGenerator.dispose();

      // 4. 加载沙漠场景（26MB 左右，需要进度反馈）
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
      pivot.name = "DesertPivot";
      pivot.scale.setScalar(scale);
      model.position.copy(rawCenter).multiplyScalar(-1);
      pivot.add(model);
      scene.add(pivot);

      let meshes = 0;
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
          // 环境光只做补光，强度过高会把地表贴图的层次冲掉
          standard.envMapIntensity = 0.25;
          standard.needsUpdate = true;
        });
      });
      setMeshCount(meshes);

      // 6. 灯光：暖色阳光 + 天空/地面半球光
      const framedBounds = new THREE.Box3().setFromObject(pivot);
      const framedSphere = framedBounds.getBoundingSphere(new THREE.Sphere());
      const center = framedSphere.center;
      const radius = framedSphere.radius;

      const sun = new THREE.DirectionalLight(0xfff3e0, conf.sunIntensity);
      sun.position
        .copy(center)
        .add(new THREE.Vector3(1, 1.4, 0.7).normalize().multiplyScalar(radius * 4));
      sun.target.position.copy(center);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.bias = -0.0005;
      sun.shadow.normalBias = radius * 0.004;
      const shadowCamera = sun.shadow.camera as THREE.OrthographicCamera;
      shadowCamera.left = -radius * 1.6;
      shadowCamera.right = radius * 1.6;
      shadowCamera.top = radius * 1.6;
      shadowCamera.bottom = -radius * 1.6;
      shadowCamera.near = 0.01;
      shadowCamera.far = radius * 12;
      shadowCamera.updateProjectionMatrix();
      scene.add(sun);
      scene.add(sun.target);

      // 半球光只提供天空/地面色调，强度压住才不会被它冲淡阳光造成的明暗对比
      const skyLight = new THREE.HemisphereLight(0xffe6bf, 0x6d5a44, 0.35);
      scene.add(skyLight);

      // 7. 交互控制
      controls = new OrbitControls(camera!, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = conf.autoRotate;
      controls.autoRotateSpeed = conf.rotateSpeed;
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.rotateSpeed = 0.7;
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

      gui = new GUI({ container: container!, title: "场景参数", width: 196 });
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
        .add(conf, "sunIntensity", 0, 6, 0.1)
        .name("光照强度")
        .onChange((value: number) => {
          sun.intensity = value;
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
        setError(loadError instanceof Error ? loadError.message : "沙漠场景加载失败");
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

  const statusText = error
    ? error
    : `正在加载沙漠场景... ${progress}%`;

  return (
    <div className="three-scene three-scene-desert" ref={containerRef}>
      {!isLoading && !error && meshCount > 0 && (
        <div className="three-scene-badge">
          <span className="dot" />
          desert.glb · {meshCount} meshes
        </div>
      )}
      <div className="three-scene-hint">拖拽旋转 · 滚轮缩放</div>
      {(isLoading || error) && (
        <div className={error ? "three-scene-status is-error" : "three-scene-status"}>
          {statusText}
        </div>
      )}
    </div>
  );
}
