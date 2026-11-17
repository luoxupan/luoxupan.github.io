import * as React from "react";
import "./index.less";

/** 导航项标识，同时也是各页面的“当前页”标识 */
export type ExtNavKey = "template" | "threejs" | "arch";

type NavItem = {
  key: ExtNavKey;
  label: string;
  href: string;
  icon: "external" | "image";
};

/** 顶部外链导航的配置：新增一项只需在这里追加 */
const NAV_ITEMS: NavItem[] = [
  {
    key: "template",
    label: "模板设计器",
    href: "https://luoxupan.github.io/wiki/pages/webapp/#/template",
    icon: "external",
  },
  {
    key: "threejs",
    label: "Three.js个人作品",
    href: "https://luoxupan.github.io/wiki/pages/threejs/",
    icon: "external",
  },
  {
    key: "arch",
    label: "web部署架构图",
    href: "https://luoxupan.github.io/wiki/image/web.png",
    icon: "image",
  },
];

function ExternalLinkIcon() {
  return (
    <svg
      className="ext-nav__icon"
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3h7v7" />
      <path d="M21 3l-9 9" />
      <path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

function ImageLinkIcon() {
  return (
    <svg
      className="ext-nav__icon"
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

type ExtNavProps = {
  /** 当前所在页面，对应项高亮且不可点击 */
  activeKey: ExtNavKey;
};

/**
 * 顶部外链导航栏：深色通栏 + 内容居中，当前页高亮为静态胶囊（不渲染成链接）。
 */
export function ExtNav({ activeKey }: ExtNavProps): React.ReactElement {
  return (
    <div className="ext-nav">
      <div className="ext-nav__inner">
        {NAV_ITEMS.map((item) => {
          if (item.key === activeKey) {
            return (
              <span
                key={item.key}
                className="ext-nav__item ext-nav__item--active"
                aria-current="page"
                title={`当前页面：${item.label}`}
              >
                {item.label}
              </span>
            );
          }

          return (
            <a
              key={item.key}
              className="ext-nav__item ext-nav__item--link"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={item.label}
            >
              <span>{item.label}</span>
              {item.icon === "image" ? <ImageLinkIcon /> : <ExternalLinkIcon />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
