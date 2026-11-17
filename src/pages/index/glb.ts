import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/** 下载阶段最高只报到 99%，最后 1% 留给解析与建场景，由调用方在场景就绪后补 100% */
const MAX_DOWNLOAD_PERCENT = 99;

export type LoadGLTFOptions = {
  /** 下载进度回调（0-99），用来驱动进度条 */
  onProgress?: (percent: number) => void;
  /** 组件已卸载时返回 true，避免卸载后继续 setState */
  isCancelled?: () => boolean;
  /** 复用外部 loader（例如已经挂上 DRACOLoader 的 GLTFLoader） */
  loader?: GLTFLoader;
};

/**
 * 首页所有 GLB 场景共用的加载入口：行为和 `loader.loadAsync` 一致，额外带上下载进度。
 * 进度按字节数算，命中缓存拿不到 total 时也会缓慢自增，避免进度条一直停在 0%。
 */
export function loadGLTF(url: string, options: LoadGLTFOptions = {}): Promise<GLTF> {
  const { onProgress, isCancelled, loader = new GLTFLoader() } = options;

  return new Promise<GLTF>((resolve, reject) => {
    /** 拿不到 total（如命中缓存）时的兜底进度 */
    let fallbackPercent = 0;

    loader.load(
      url,
      resolve,
      (event) => {
        if (isCancelled?.()) return;

        if (!event.total) {
          fallbackPercent = Math.min(90, fallbackPercent + 10);
          onProgress?.(fallbackPercent);
          return;
        }

        onProgress?.(
          Math.min(MAX_DOWNLOAD_PERCENT, Math.round((event.loaded / event.total) * 100))
        );
      },
      reject
    );
  });
}
