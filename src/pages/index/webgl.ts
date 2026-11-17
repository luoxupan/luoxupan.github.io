import * as THREE from "three";

/**
 * 释放 WebGL 渲染器。
 *
 * 关键点：`renderer.dispose()` 只回收 three 侧的资源（着色器程序、纹理、RenderTarget），
 * **WebGL 上下文本身不会被释放**，要等 GC。而浏览器对同时存活的上下文有硬上限
 * （Chrome 约 16 个，Safari/iOS 更少）。反复切换示例、或开发时 HMR 重跑 effect
 * 会不断新建上下文，累积到上限后新建渲染器就会抛
 * `Error creating WebGL context.`。所以这里必须显式 forceContextLoss() 立即归还。
 */
export function releaseRenderer(renderer?: THREE.WebGLRenderer | null): void {
  if (!renderer) return;

  renderer.setAnimationLoop(null);
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}

/** 创建渲染器；上下文创建失败时抛出带排查提示的可读错误 */
export function createRenderer(params?: THREE.WebGLRendererParameters): THREE.WebGLRenderer {
  try {
    return new THREE.WebGLRenderer(params);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `无法创建 WebGL 上下文（${detail}）：可能是浏览器硬件加速被关闭，或本次会话已打开过多 3D 场景，请刷新页面后重试。`
    );
  }
}

/** 释放模型/场景里的几何体、材质与贴图，避免切换示例后显存一直被占着 */
export function disposeObjectTree(root: THREE.Object3D): void {
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
        if (value && typeof value === "object" && value.isTexture && typeof value.dispose === "function") {
          value.dispose();
        }
      });
      material.dispose();
    });
  });
}
