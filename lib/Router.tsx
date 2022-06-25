import { createContext, Suspense, useContext, useMemo } from "react";
import { CreateObserver, useObserver } from "react-ob";
import { DivProps } from "react-override-props";
import { historyProxy, Stack } from "./historyProxy";
import { routeMap } from "./routeMap";
import { RouteItem, RouteProps } from "./types";
import { vouter } from "./vouter";

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
        }}>
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
        preload.forEach(vouter.preload);
      }, preloadDelay || 500);
    }

    return (
      <routeCtx.Provider value={{ stack, isBack: last && stack.time + 100 < Date.now(), last }}>
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
            onMouseDown={last ? undefined : stop}>
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
          return <Item last={last} key={stack.url + index} stack={stack} {...item} />;
        }

        return <NotFoundComponent key={stack.url + index} />;
      })}
    </>
  );
}
