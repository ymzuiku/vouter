import { createContext, Suspense, useContext, useMemo } from "react";
import { CreateObserver, useObserver } from "react-ob";
import { DivProps } from "react-override-props";
import { routeMap, vouter } from ".";
import { historyProxy, Stack } from "./historyProxy";

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

export type RouterProps = DivProps<{
  NotFoundComponent?: () => JSX.Element;
}>;

const routerOb = CreateObserver({
  n: 0,
});

historyProxy.listen(() => {
  routerOb.val.n += 1;
  routerOb.next();
});

function Empty() {
  return (
    <div style={{ padding: 100, margin: "0px auto", textAlign: "center" }}>
      <div>Not found page</div>
      <button
        style={{
          padding: "8px 16px",
          outline: "none",
          background: "#ddd",
          margin: 20,
          borderRadius: 10,
        }}
        onClick={() => {
          vouter.clearTo("/");
        }}
      >
        Go Home
      </button>
    </div>
  );
}

function stop(e: any) {
  e.preventDefault();
  e.stopPropagation();
}
const preloadCache = {} as Record<string, boolean>;

const routeCtx = createContext<RouteProps>({
  stack: historyProxy.newStack("/"),
  isBack: false,
  last: false,
});

export function useHistoryChange() {
  return useContext(routeCtx);
}

function Item({
  last,
  path,
  stack,
  Component,
  notKeep,
  preload,
  preloadDelay,
}: RouteItem & { last: boolean; stack: Stack }) {
  return useMemo(() => {
    if (notKeep && !last) {
      return null;
    }

    const zIndex = stack.index * 100;
    if (preload && !preloadCache[path]) {
      preloadCache[path] = true;
      setTimeout(() => {
        preload!.forEach(vouter.preload);
      }, preloadDelay || 500);
    }

    return (
      <routeCtx.Provider
        value={{ stack, isBack: last && stack.time + 100 < Date.now(), last }}
      >
        <Suspense key={path} fallback={<div></div>}>
          <div
            data-path={path}
            style={{
              zIndex,
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
            }}
            onTouchStart={last ? undefined : stop}
            onMouseDown={last ? undefined : stop}
          >
            <Component />
          </div>
        </Suspense>
      </routeCtx.Provider>
    );
  }, [last, stack.url]);
}

export function Router({ NotFoundComponent = Empty }: RouterProps) {
  if (!historyProxy.stack.length) {
    historyProxy.stack = [vouter.newStack(vouter.nowFullUrl())];
  }
  useObserver(routerOb, (s) => [s.n]);
  const len = historyProxy.stack.length - 1;
  return (
    <>
      {historyProxy.stack.map((stack, index) => {
        const item = routeMap[stack.path];
        if (item) {
          const last = len === index;
          return (
            <Item last={last} key={stack.url + index} stack={stack} {...item} />
          );
        }

        return <NotFoundComponent key={stack.url + index} />;
      })}
    </>
  );
}
