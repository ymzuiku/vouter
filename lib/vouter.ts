import { fixUrl } from "./fixUrl";
import { historyProxy, Stack } from "./historyProxy";
import { isIOSWechat } from "./isIOSWechat";
import { routeMap } from "./routeMap";

historyProxy.useHash = true;

const routerPreloadCache = {} as { [key: string]: boolean };

// 预加载页面
const preload = (url: string) => {
  if (typeof window === "undefined" || (window as unknown as { isTest: boolean }).isTest) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replace: (url: string, params?: Record<string, string>, data?: any) => {
    historyProxy.replace(fixUrl(url, params), data);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goBack: (data?: any) => {
    if (isIOSWechat()) {
      vouter.replace(historyProxy.stack[historyProxy.stack.length - 1].url, data);
    } else {
      historyProxy.goBack(data);
    }
  },
  clearTo: (url: string, params?: Record<string, string>) => {
    historyProxy.clearTo(fixUrl(url, params));
  },
  preload,
  newStack: historyProxy.newStack,
  isIOSWechat,
  getStack: () => historyProxy.stack,
  getLastStack: () => historyProxy.stack[historyProxy.stack.length - 1],
  isBack: () => {
    const lastStack = vouter.getLastStack();
    if (lastStack.url === vouter.nowFullUrl()) {
      return lastStack.time + 100 < Date.now();
    }
    return false;
  },
  setOnLastBack: (fn: (stack: Stack) => string) => {
    historyProxy.onLastBack = fn;
  },
};
