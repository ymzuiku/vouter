import { creator } from "./creator";
import { historyProxy } from "./historyProxy";
import { isIOSWechat } from "./isIOSWechat";
import { RouteItem } from "./Router";

historyProxy.useHash = true;

const routerPreloadCache = {} as { [key: string]: boolean };
export const routeMap = {} as Record<string, RouteItem>;

// 预加载页面
const preload = (url: string) => {
  if (
    typeof window === "undefined" ||
    (window as unknown as { isTest: boolean }).isTest
  ) {
    return;
  }
  if (routerPreloadCache[url]) {
    return;
  }
  const page = routeMap[url];
  if (!page) {
    console.error(`[create-react-ssx] ${url} isn't Router`);
    return;
  }
  routerPreloadCache[url] = true;
  return page.render();
};

// 计算URL
function fixUrl(url: string, params?: Record<string, string>): string {
  if (params) {
    return url + "?" + new URLSearchParams(params).toString();
  }
  return url;
}

// 路由管理
export const vouter = {
  search: () => {
    const list = location.href.split("#")[0].split("?");

    if (list.length < 2) {
      return new URLSearchParams();
    }
    return new URLSearchParams(list[1]);
  },
  hashSearch: () => {
    const list = location.href.split("#")[1].split("?");

    if (list.length < 2) {
      return new URLSearchParams();
    }
    return new URLSearchParams(list[1]);
  },
  nowUrl: () => {
    if (!location.hash) {
      return "/";
    }
    const list = location.hash.split("#");
    if (list.length < 2) {
      return "/";
    }

    return list[1].split("?")[0];
  },
  nowFullUrl: () => {
    if (!location.hash) {
      return "/";
    }
    const list = location.hash.split("#");
    if (list.length < 2) {
      return "/";
    }

    return list[1];
  },
  push: (url: string, params?: Record<string, string>) => {
    if (isIOSWechat()) {
      vouter.replace(url, params);
    } else {
      historyProxy.push(fixUrl(url, params));
    }
  },
  replace: (url: string, params?: Record<string, string>) => {
    historyProxy.replace(fixUrl(url, params));
  },
  goBack: () => {
    if (isIOSWechat()) {
      vouter.replace(historyProxy.stack[historyProxy.stack.length - 1]);
    } else {
      historyProxy.goBack();
    }
  },
  clearTo: (url: string, params?: Record<string, string>) => {
    historyProxy.clearTo(fixUrl(url, params));
  },
  preload,
  isIOSWechat,
  create: creator,
  setOnLastBack: (fn: (url: string) => string) => {
    historyProxy.onLastBack = fn;
  },
};
