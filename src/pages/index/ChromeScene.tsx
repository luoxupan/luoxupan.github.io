import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import './index.less';

export function ChromeScene(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 按容器尺寸初始化，而不是 window 尺寸，这样放进右侧栏也能正确显示
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;

    // 基本使用流程
    const scene = new THREE.Scene();

    // 初始化相机、场景、渲染器等
    const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 1. 开启阴影支持
    renderer.shadowMap.enabled = true;

    // 2. 设置阴影类型
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. 设置背景色
    renderer.setClearColor(0xf0f0f0);

    container.appendChild(renderer.domElement);

    // 创建一个简单的立方体
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2196f3,
      roughness: 0.3,
      metalness: 0.2,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;

    // 添加到场景
    scene.add(cube);

    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    const axesHelper = new THREE.AxesHelper(30);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(50, 10);
    scene.add(gridHelper);

    // 新增加的初始化灯光的方法
    const initLights = () => {
      // 环境光：这决定了场景中最暗的地方有多亮。
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // 平行光：这是模拟太阳，必须比环境光亮得多，才能产生对比度。
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
      sunLight.position.set(10, 20, 10);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;

      // 扩大阴影相机的视锥体范围，避免阴影被截断
      const d = 50;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;

      scene.add(sunLight);
    };
    initLights();

    // 新增创建地面的方法
    const initGround = () => {
      const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.8,
        metalness: 0.0,
      });

      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -15;
      ground.receiveShadow = true;

      scene.add(ground);
    };
    initGround();

    // 容器尺寸变化时同步相机与渲染器
    function handleResize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", handleResize);

    // 动画循环
    function animate() {
      controls.update();
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="three-scene" ref={containerRef} />;
}
