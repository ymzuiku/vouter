// 此文件要保持存粹，仅仅做 history 和 stack 的管理和事件监听

// popstate: 修改url，点击返回
type State = "popstate" | "pushState" | "replaceState" | "backState";
type Event = (typed: State, stack: string[]) => void;

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

const push = (url: string) => {
  historyProxy.stack.push(url);
  if (historyProxy.useHash) {
    url = "/#" + url;
  }
  history.pushState(null, "", url);
  window.dispatchEvent(new Event("pushState"));
};
const replace = (url: string) => {
  if (historyProxy.stack.length > 0) {
    historyProxy.stack.pop();
  }
  historyProxy.stack.push(url);
  if (historyProxy.useHash) {
    url = "/#" + url;
  }
  history.replaceState(null, "", url);
  window.dispatchEvent(new Event("replaceState"));
};

const goBack = () => {
  let url = historyProxy.stack[historyProxy.stack.length - 1];
  if (historyProxy.stack.length === 1) {
    url = historyProxy.onLastBack(url);
    historyProxy.stack[historyProxy.stack.length - 1] = url;
  }
  if (historyProxy.stack.length > 1) {
    historyProxy.stack.pop();
  }

  if (historyProxy.useHash) {
    url = "/#" + url;
  }
  history.replaceState(null, "", url);
  window.dispatchEvent(new Event("backState"));
};

const clearTo = (url: string) => {
  historyProxy.stack = [url];
  replace(url);
};

export const historyProxy = {
  push,
  replace,
  goBack,
  clearTo,
  listen,
  /** 当路径返回路径为最后一个时，可以修改返回路径 */
  onLastBack: (url: string) => {
    return url;
  },
  stack: [] as string[],
  useHash: false,
};
