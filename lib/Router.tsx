import { Suspense, useMemo } from "react";
import { CreateObserver, useObserver } from "react-ob";
import { DivProps } from "react-override-props";
import { routeMap, vouter } from ".";
import { historyProxy } from "./historyProxy";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stop(e: any) {
  e.preventDefault();
  e.stopPropagation();
}

const preloadCache = {} as Record<string, boolean>;

function Item({
  last,
  path,
  Component,
  notKeep,
  preload,
  preloadDelay,
}: RouteItem & { last: boolean }) {
  return useMemo(() => {
    const zIndex = historyProxy.stack.indexOf(path) * 100;
    if (notKeep && !last) {
      return null;
    }

    if (preload && !preloadCache[path]) {
      preloadCache[path] = true;
      setTimeout(() => {
        preload!.forEach(vouter.preload);
      }, preloadDelay || 500);
    }

    return (
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
            visibility: last ? "visible" : "hidden",
            // display: last ? "block" : "none",
          }}
          onTouchStart={last ? undefined : stop}
          onMouseDown={last ? undefined : stop}
        >
          <Component path={path} />
        </div>
      </Suspense>
    );
  }, [last, path]);
}

export function Router({ NotFoundComponent = Empty }: RouterProps) {
  if (!historyProxy.stack.length) {
    historyProxy.stack = [vouter.nowFullUrl()];
  }
  useObserver(routerOb, (s) => [s.n]);
  const len = historyProxy.stack.length - 1;
  return (
    <>
      {historyProxy.stack.map((path, index) => {
        const item = routeMap[path.split("?")[0]];
        if (item) {
          const last = len === index;
          return <Item last={last} key={path + index} {...item} />;
        }

        return <NotFoundComponent key={path + index} />;
      })}
    </>
  );
}
