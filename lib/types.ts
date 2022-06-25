import { Stack } from "./historyProxy";

export interface RouteProps {
  stack: Stack;
  isBack: boolean;
  last: boolean;
}

export interface Route {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: () => Promise<{ default: any }>;
  // 当前页面进入后需要预加载的页面
  preload?: string[];
  // 延迟多长时间预加载，默认为500ms，把主要的价值时间预留给当前页面
  preloadDelay?: number;
  notKeep?: boolean;
  // 不匹配时，设置dispalyNone
  // displayNone?: boolean;
}

export interface RouteItem extends Route {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: any;
}
