import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { GpuCard } from "./GpuCard";
import { ChromeScene } from "./ChromeScene";
import { KiraScene } from "./KiraScene";
import { CharacterScene } from "./CharacterScene";
import { AirPodsScene } from "./AirPodsScene";
import { ExtNav } from "components";
import "./index.less";

type Demo = {
  key: string;
  label: string;
  description: string;
  Component: React.ComponentType;
  /** 仅本地开发环境可见（生产构建下从列表隐藏） */
  devOnly?: boolean;
};

/** 是否处于本地开发环境（vite dev / npm run serve 为 true，生产构建为 false） */
const IS_DEV = import.meta.env.DEV;

/** 左侧列表的数据源：新增示例只需要在这里加一项 */
const demos: Demo[] = [
  { key: "character-scene", label: "CharacterScene", description: "GLTF 人物模型（骨骼动画）", Component: CharacterScene },
  { key: "airpods-scene", label: "AirPodsScene", description: "GLTF AirPods Max（产品展示）", Component: AirPodsScene },
  { key: "gpu-card", label: "GpuCard", description: "GPU 显卡 3D 模型（风扇动画）", Component: GpuCard },
  { key: "chrome-scene", label: "ChromeScene", description: "基础几何体 + 光照阴影", Component: ChromeScene, devOnly: true },
  { key: "kira-scene", label: "KiraScene", description: "GLTF 角色 IK 交互", Component: KiraScene, devOnly: true },
];

/** 实际可见的示例：生产环境过滤掉 devOnly 项 */
const visibleDemos = demos.filter((demo) => !demo.devOnly || IS_DEV);

/** URL 参数名，例如 /#/?curActiveKey=gpu-card */
const DEMO_PARAM = "curActiveKey";

export function IndexPage(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();

  // 以 URL 为唯一数据源：刷新、分享链接、浏览器前进/后退都会自动同步
  const keyFromUrl = searchParams.get(DEMO_PARAM);
  const activeDemo = visibleDemos.find((demo) => demo.key === keyFromUrl) ?? visibleDemos[0];
  const activeKey = activeDemo.key;
  const ActiveComponent = activeDemo.Component;

  return (
    <div className="demo-page">
      {/* 当前页为 Three.js 作品集：该项高亮且不可点击 */}
      <ExtNav activeKey="threejs" />

      <div className="demo-layout">
        <aside className="demo-layout__sidebar">
          <div className="demo-layout__sidebar-title">示例列表</div>
          <ul className="demo-layout__list">
            {visibleDemos.map((demo) => (
              <li key={demo.key} className="demo-layout__list-item">
                <button
                  type="button"
                  className={
                    demo.key === activeKey
                      ? "demo-layout__item is-active"
                      : "demo-layout__item"
                  }
                  onClick={() => setSearchParams({ [DEMO_PARAM]: demo.key })}
                >
                  <span className="demo-layout__item-label">{demo.label}</span>
                  <span className="demo-layout__item-desc">{demo.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="demo-layout__content">
          {/* key 保证切换时重新挂载，让 3D 场景正确初始化/释放 */}
          <ActiveComponent key={activeKey} />
        </main>
      </div>
    </div>
  );
}
