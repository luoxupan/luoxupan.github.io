import * as React from "react";
import "./index.less";

/** 外网（GitHub Pages）拉模型的提示语，首页所有 GLB 场景共用 */
const NETWORK_TIP = "GitHub外网加载需要一点时间，请耐心等待一下";

export type SceneLoadingProps = {
  /** 加载中的主文案，例如「正在加载 GPU 显卡模型...」 */
  label: string;
  /** 0-100 的下载进度；不传则只显示文案（无进度的场景） */
  progress?: number;
  /** 有值即切到错误态：只显示错误信息 */
  error?: string | null;
};

/**
 * 首页所有 GLB 场景共用的加载遮罩：主文案 + 橙色进度条 + 百分比 + 外网加载提示。
 * 定位交给 `.three-scene-status`（绝对定位在场景容器正中）。
 */
export function SceneLoading({ label, progress, error }: SceneLoadingProps): React.ReactElement {
  if (error) {
    return (
      <div className="three-scene-status is-error">
        <div className="three-scene-status__text">{error}</div>
      </div>
    );
  }

  const value = Math.max(0, Math.min(100, Math.round(progress ?? 0)));

  return (
    <div className="three-scene-status">
      <div className="three-scene-status__text">{label}</div>

      {progress !== undefined && (
        <>
          <div
            className="three-scene-progress"
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
          >
            <div className="three-scene-progress__bar" style={{ width: `${value}%` }} />
          </div>
          <div className="three-scene-status__percent">{value}%</div>
        </>
      )}

      <div className="three-scene-status__tip">{NETWORK_TIP}</div>
    </div>
  );
}
