import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { createRenderer, disposeObjectTree, releaseRenderer } from "./webgl";
import './index.less';

/** 人物模型地址（远程托管，避免大文件占用 GitHub 仓库） */
const MODEL_URL = "https://luoxupan.github.io/big-file/glb/renwu.glb";
/** 归一化后的最大边长，人物模型即身高 */
const TARGET_SIZE = 3.2;
const BACKGROUND_COLOR = 0xf0f0f0;

export function CharacterScene(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<{ meshes: number; animation: string | null } | null>(null);

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
    let mixer: THREE.AnimationMixer | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let gui: GUI | undefined;
    /** 初始取景，重置视角时回到这里 */
    let defaultView: { position: THREE.Vector3; target: THREE.Vector3 } | undefined;
    const clock = new THREE.Clock();

    /** lil-gui 绑定的参数对象 */
    const conf = {
      playAnimation: true,
      hairColor: "#3b2a1f",
      hairPreset: "深棕（默认）",
      autoRotate: true,
      rotateSpeed: 0.8,
      keyIntensity: 2.2,
      zoomIn: () => {},
      zoomOut: () => {},
      resetView: () => {},
    };

    /** 头发颜色预设：换色按钮直接用这些值 */
    const HAIR_PRESETS: Record<string, string> = {
      "深棕（默认）": "#3b2a1f",
      冷黑: "#16161a",
      亚麻棕: "#8a6444",
      酒红: "#6d1f2b",
      雾蓝: "#2f4a6d",
      樱花粉: "#c9798f",
      银白: "#cfd2d6",
    };

    /** 参与染色的材质（hair 发丝 + scalp 发根），同一材质只收一次 */
    const hairMaterials: { material: THREE.MeshStandardMaterial; part: "hair" | "scalp" }[] = [];

    /**
     * 把头发贴图改写成「灰度 + 原 alpha」，颜色统一交给 material.color 控制。
     *
     * 为什么不能只改 material.color：
     * - hair 材质的 baseColor 是一张发丝 ID 彩图（青/紫/黄细线混杂），直接乘颜色会得到脏彩虹色；
     * - scalp 贴图不透明像素的平均亮度只有 0.095（最亮 0.28），乘任何颜色都还是接近黑色，
     *   所以「银白」「亚麻棕」这类浅色根本染不出来。
     * 两张图都按自身最大亮度归一化成灰度，既保住发丝层次，又让灰度上限到 1.0，
     * 任意亮度的颜色都能还原；alpha 原样保留，头发靠它镂空，不能动。
     */
    function neutralizeHairTexture(texture: THREE.Texture | null, floor: number) {
      const image = texture?.image as (HTMLImageElement & ImageBitmap) | undefined;
      const width = image?.width ?? 0;
      const height = image?.height ?? 0;
      if (!texture || !image || !width || !height) return;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      try {
        context.drawImage(image as CanvasImageSource, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        const { data } = imageData;

        // 先找不透明像素里的最大亮度，用它归一化
        let maxLum = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 8) continue;
          const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          if (lum > maxLum) maxLum = lum;
        }
        if (maxLum < 1) return;

        // 灰度映射到 [floor, 1]：floor 保住发丝明暗层次，上限 1 保住染色亮度
        for (let i = 0; i < data.length; i += 4) {
          const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / maxLum;
          const value = Math.round(255 * (floor + (1 - floor) * Math.min(1, lum)));
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }

        context.putImageData(imageData, 0, 0);
      } catch {
        // 贴图跨域时 getImageData 会抛 SecurityError，此时降级为「只乘颜色」
        return;
      }

      texture.image = canvas;
      texture.needsUpdate = true;
    }

    /** 应用头发颜色：发丝和发根一起改，否则头顶会露出原来的深色 */
    function applyHairColor(color: string) {
      hairMaterials.forEach(({ material }) => {
        material.color.set(color);
      });
    }

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

    /** 根据包围球自动摆放相机，让整个人物入画 */
    function frameCamera(bounds: THREE.Box3) {
      if (!camera || !controls) return;

      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const fitFov = Math.min(vFov, hFov);
      // 1.08 留一点上下留白，人物头顶和脚底都不会贴边
      const distance = (sphere.radius / Math.sin(fitFov / 2)) * 1.08;

      // 略微偏前的正面视角，人物五官和服装都看得清
      const direction = new THREE.Vector3(0.28, 0.16, 1).normalize();
      camera.position.copy(sphere.center).add(direction.multiplyScalar(distance));
      camera.near = distance / 200;
      camera.far = distance * 40;
      camera.updateProjectionMatrix();
      camera.lookAt(sphere.center);

      controls.target.copy(sphere.center);
      controls.minDistance = sphere.radius * 0.5;
      controls.maxDistance = distance * 2.2;
      controls.update();

      defaultView = {
        position: camera.position.clone(),
        target: controls.target.clone(),
      };
    }

    async function init() {
      const width = container!.clientWidth || 1;
      const height = container!.clientHeight || 1;

      // 1. 场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(BACKGROUND_COLOR);

      // 2. 相机
      camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 1000);

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

      // 环境贴图：人物皮肤/头发是高光材质，没有环境反射会显得又脏又平
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;
      pmremGenerator.dispose();

      // 4. 加载人物模型（58MB、20 张大贴图，需要进度反馈）
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
      pivot.name = "CharacterPivot";
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

        // 骨骼动画会让蒙皮后的包围球失效，关掉视锥裁剪避免人物被误判为不可见
        if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
          mesh.frustumCulled = false;
        }

        // 这个模型里头发是 hair（发丝卡片）+ scalp（头皮/发根）两个网格，染色要一起做
        const hairPart: "hair" | "scalp" | null =
          mesh.name === "hair" || mesh.name === "scalp" ? mesh.name : null;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          const standard = material as THREE.MeshStandardMaterial;
          if (!standard.isMeshStandardMaterial) return;
          standard.envMapIntensity = 0.7;
          standard.needsUpdate = true;

          if (hairPart && !hairMaterials.some((item) => item.material === standard)) {
            hairMaterials.push({ material: standard, part: hairPart });
          }
        });
      });

      // 头发贴图预处理 + 上默认色（放在遍历之后，此时材质已收集齐）
      hairMaterials.forEach(({ material, part }) => {
        // 发丝保留更多层次（floor 低一些），发根稍亮一点才不会像一块黑布
        neutralizeHairTexture(material.map, part === "scalp" ? 0.58 : 0.62);
      });
      applyHairColor(conf.hairColor);

      // 6. 灯光：主光带阴影 + 侧补光 + 轮廓光
      const framedBounds = new THREE.Box3().setFromObject(pivot);
      const framedSphere = framedBounds.getBoundingSphere(new THREE.Sphere());
      const center = framedSphere.center;
      const radius = framedSphere.radius;

      const keyLight = new THREE.DirectionalLight(0xfff4e6, conf.keyIntensity);
      // 光线抬高一些，人物投影才不会在地上拖得又长又糊
      keyLight.position
        .copy(center)
        .add(new THREE.Vector3(0.8, 2.2, 1).normalize().multiplyScalar(radius * 4));
      keyLight.target.position.copy(center);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = radius * 0.004;
      const shadowCamera = keyLight.shadow.camera as THREE.OrthographicCamera;
      shadowCamera.left = -radius * 1.2;
      shadowCamera.right = radius * 1.2;
      shadowCamera.top = radius * 1.2;
      shadowCamera.bottom = -radius * 1.2;
      shadowCamera.near = 0.01;
      shadowCamera.far = radius * 12;
      shadowCamera.updateProjectionMatrix();
      scene.add(keyLight);
      scene.add(keyLight.target);

      const fillLight = new THREE.DirectionalLight(0xbcd2ff, 0.9);
      fillLight.position
        .copy(center)
        .add(new THREE.Vector3(-1, 0.35, 0.6).normalize().multiplyScalar(radius * 3.5));
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
      rimLight.position
        .copy(center)
        .add(new THREE.Vector3(-0.4, 0.6, -1).normalize().multiplyScalar(radius * 3.5));
      scene.add(rimLight);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 0.4));

      // 只有接影地面，不画实体，人物才有"站在地上"的感觉
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(radius * 8, radius * 8),
        new THREE.ShadowMaterial({ opacity: 0.26 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(center.x, framedBounds.min.y - 0.005, center.z);
      ground.receiveShadow = true;
      scene.add(ground);

      // 7. 播放骨骼动画
      let animationName: string | null = null;
      let action: THREE.AnimationAction | undefined;
      if (gltf.animations.length > 0) {
        const clip = gltf.animations[0];
        animationName = clip.name;
        mixer = new THREE.AnimationMixer(model);
        action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
      } else {
        console.warn(`[CharacterScene] ${MODEL_URL} 中没有动画`);
      }
      setStats({ meshes, animation: animationName });

      // 8. 交互控制
      controls = new OrbitControls(camera!, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = conf.autoRotate;
      controls.autoRotateSpeed = conf.rotateSpeed;
      // 略低于水平线，避免转到地面以下露出接影板
      controls.maxPolarAngle = Math.PI * 0.52;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.7;
      frameCamera(framedBounds);

      // 9. 右上角控制面板：Three.js 官方 lil-gui
      conf.zoomIn = () => zoomBy(ZOOM_STEP);
      conf.zoomOut = () => zoomBy(1 / ZOOM_STEP);
      conf.resetView = () => {
        if (!camera || !controls || !defaultView) return;
        camera.position.copy(defaultView.position);
        controls.target.copy(defaultView.target);
        controls.update();
      };

      gui = new GUI({ container: container!, title: "模型参数", width: 196 });
      if (action) {
        gui
          .add(conf, "playAnimation")
          .name("动画播放")
          .onChange((value: boolean) => {
            if (action) action.paused = !value;
          });
      }
      if (hairMaterials.length > 0) {
        const hairFolder = gui.addFolder("头发");
        hairFolder
          .addColor(conf, "hairColor")
          .name("头发颜色")
          .onChange((value: string) => {
            applyHairColor(value);
          });
        hairFolder
          .add(conf, "hairPreset", Object.keys(HAIR_PRESETS))
          .name("头发颜色预设")
          .onChange((name: string) => {
            const preset = HAIR_PRESETS[name];
            if (!preset) return;
            conf.hairColor = preset;
            applyHairColor(preset);
            // 预设改的是 conf.hairColor，取色器控件要手动刷新才会显示新颜色
            hairFolder.controllers.forEach((controller) => controller.updateDisplay());
          });
      }
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
          keyLight.intensity = value;
        });
      gui.add(conf, "zoomIn").name("放大 ＋");
      gui.add(conf, "zoomOut").name("缩小 －");
      gui.add(conf, "resetView").name("重置视角");

      // 10. 自适应尺寸 + 循环渲染
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
      // AnimationMixer 必须每帧推进时间，骨骼动画才会真的播下去
      mixer?.update(delta);

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
        setError(loadError instanceof Error ? loadError.message : "人物模型加载失败");
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

      mixer?.stopAllAction();
      if (mixer && model) {
        mixer.uncacheRoot(model);
      }
      mixer = undefined;

      if (scene) {
        disposeObjectTree(scene);
      }
      envRenderTarget?.texture.dispose();
      envRenderTarget?.dispose();
      releaseRenderer(renderer);
    };
  }, []);

  return (
    <div className="three-scene three-scene-character" ref={containerRef}>
      {!isLoading && !error && stats && (
        <div className="three-scene-badge">
          <span className="dot" />
          renwu.glb · {stats.meshes} meshes{stats.animation ? ` · ${stats.animation}` : ""}
        </div>
      )}
      <div className="three-scene-hint">拖拽旋转 · 滚轮缩放</div>
      {(isLoading || error) && (
        <div className={error ? "three-scene-status is-error" : "three-scene-status"}>
          {error || `正在加载人物模型... ${progress}%`}
        </div>
      )}
    </div>
  );
}
