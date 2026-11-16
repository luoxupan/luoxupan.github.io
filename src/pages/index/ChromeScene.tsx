import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import './index.less';


export function ChromeScene(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {

    const container = containerRef.current;
    if (!container) return;
    // 基本使用流程
    const scene = new THREE.Scene();          // 1. 创建场景
    
    // 初始化相机、场景、渲染器等
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    }); // 3. 创建渲染器
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // 1. 开启阴影支持
    // 计算机渲染阴影非常耗费性能，所以默认是关闭的
    renderer.shadowMap.enabled = true;

    // 2. 设置阴影类型
    // PCFSoftShadowMap 能让阴影边缘带有模糊过渡，这是提升真实感的关键
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. 设置背景色
    // 使用深灰色代替纯黑色，能更好地衬托出物体的明暗交界线，避免暗部细节丢失
  	renderer.setClearColor(0x262626);

    container.appendChild(renderer.domElement);


    // 创建一个简单的立方体
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshStandardMaterial({  
      color: 0x2196f3,   
      roughness: 0.3,   // 表面比较光滑，会产生高光
      metalness: 0.2,    // 带有轻微的金属质感
    });
    const cube = new THREE.Mesh(geometry, material);

    // 设置为“投射阴影”，即该物体挡住光线时可以产生阴影
    cube.castShadow = true; 
    // 设置为“接收阴影”，即其他物体的影子可以投射在它身上
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
      
      // 平行光默认照射目标是原点 (0,0,0)。
      // 设置位置 (10, 20, 10) 意味着光线是从右上方(x=10, y=20)射向原点。
      // 这种 45 度角的侧顶光最容易展现物体轮廓。
      sunLight.position.set(10, 20, 10);
      
      // 只有主光源需要开启阴影，环境光无法产生阴影
      sunLight.castShadow = true;
      
      // 优化阴影的精细度
      // 默认的阴影贴图可能比较糊，这里将其分辨率调大一倍 (默认是 512x512)
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      
      // 解决阴影截断问题
      // 平行光的阴影计算区域是一个正方体盒子，如果场景很大，阴影可能会被切断。
      // 这里扩大阴影相机的视锥体范围
      const d = 50; 
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;

      scene.add(sunLight);
    }
    initLights()

    // 新增创建地面的方法
    const initGround = () => {
      const geometry = new THREE.PlaneGeometry(1000, 1000); // 地面设置大一点
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.8, // 地面粗糙一点，不反光
        metalness: 0.0 
      });
      
      const ground = new THREE.Mesh(geometry, material);
      ground.rotation.x = -Math.PI / 2; // 旋转90度平铺
      ground.position.y = -15; // 下沉到物体下方
      
      // 地面必须设置为“接收阴影”
      ground.receiveShadow = true;
      
      scene.add(ground);
    }

    initGround()
    
    // 动画循环
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      // 让立方体旋转起来
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }

    animate();

    return () => {
    };
  }, []);

  return <div className="three-scene" ref={containerRef} />;
}
