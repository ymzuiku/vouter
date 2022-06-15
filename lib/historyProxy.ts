// 此文件要保持存粹，仅仅做 history 和 stack 的管理和事件监听

// popstate: 修改url，点击返回
type State = "popstate" | "pushState" | "replaceState" | "backState";
export interface Stack {
  url: string;
  path: string;
  time: number;
  index: number;
  // tempData 是一种临时数据，当页面返回时可以带会，如果发起push，replace，都会清理历史 tempData
  tempData?: any;
}
type Event = (typed: State, stack: Stack[]) => void;

const events = [] as Event[];

export const listen = (event: Event) => {
  events.push(event);
};

["popstate", "pushState", "replaceState", "backState"].forEach((v) => {
  window.addEventListener(v, () => {
    if (v === "popstate") {
      historyProxy.stack.pop();
    }
    events.forEach((e) => {
      e(v as State, historyProxy.stack);
    });
  });
});

const newStack = (url: string): Stack => {
  return {
    url,
    path: url.split("?")[0],
    time: Date.now(),
    index: historyProxy.stack.length,
  };
};

const push = (url: string) => {
  historyProxy.stack.forEach((s) => {
    s.tempData = undefined;
  });
  historyProxy.stack.push(newStack(url));
  if (historyProxy.useHash) {
    url = "/#" + url;
  }
  history.pushState(null, "", url);
  window.dispatchEvent(new Event("pushState"));
};
const replace = (url: string, data?: any) => {
  historyProxy.stack.forEach((s) => {
    s.tempData = undefined;
  });
  if (historyProxy.stack.length > 0) {
    historyProxy.stack.pop();
  }
  historyProxy.stack.push(newStack(url));
  if (historyProxy.useHash) {
    url = "/#" + url;
  }
  if (data) {
    const last = historyProxy.stack[historyProxy.stack.length - 1];
    last.tempData = data;
  }
  history.replaceState(null, "", url);
  window.dispatchEvent(new Event("replaceState"));
};

const goBack = (data?: any) => {
  if (historyProxy.stack.length > 1) {
    historyProxy.stack.pop();
  }
  let stack = historyProxy.stack[historyProxy.stack.length - 1];
  if (historyProxy.stack.length === 1) {
    const oldTime = stack.time;
    const oldUrl = stack.url;
    stack = newStack(historyProxy.onLastBack(stack));
    if (oldUrl === stack.url) {
      stack.time = oldTime;
    }
    historyProxy.stack[historyProxy.stack.length - 1] = stack;
  }

  let url = stack.url;
  if (historyProxy.useHash) {
    url = "/#" + stack.url;
  }
  if (data) {
    historyProxy.stack[historyProxy.stack.length - 1].tempData = data;
  }
  history.replaceState(null, "", url);
  window.dispatchEvent(new Event("backState"));
};

const clearTo = (url: string) => {
  historyProxy.stack = [newStack(url)];
  replace(url);
};

export const historyProxy = {
  push,
  replace,
  goBack,
  clearTo,
  listen,
  /** 当路径返回路径为最后一个时，可以修改返回路径 */
  onLastBack: (stack: Stack): string => {
    return stack.url;
  },
  newStack,
  stack: [] as Stack[],
  useHash: false,
};
