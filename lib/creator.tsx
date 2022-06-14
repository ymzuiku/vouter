import { lazy } from "react";
import { routeMap } from ".";
import { Route, RouteItem, Router } from "./Router";

export interface RoutesCreatorOptions {
  NotFoundComponent?: () => JSX.Element;
}

export const creator: <T extends Record<string, Route>>(
  routes: T,
  options?: RoutesCreatorOptions
) => {
  paths: Record<keyof typeof routes, string>;
  Router: () => JSX.Element;
} = (
  routes,
  options = {}
): {
  Router: () => JSX.Element;
  paths: Record<keyof typeof routes, string>;
} => {
  const paths = {} as Record<keyof typeof routes, string>;

  Object.keys(routes).forEach((k) => {
    (paths as Record<string, string>)[k] = k;
    const { render, ...rest } = routes[k];
    const item = {
      path: k,
      render,
      Component: lazy(render),
      ...rest,
    } as RouteItem;
    routeMap[k] = item;
  });

  return {
    paths,
    Router: () => {
      return <Router {...options} />;
    },
  };
};
