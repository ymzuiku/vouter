# vouter

A react router, mobile first.

features:

- Like navigation, page is keep in dom
- Auto split code pages
- Easy preload some pages when entry a page

## Example

```tsx
import { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { vouter } from "vouter";

const { Router, paths } = vouter.create({
  "/": {
    render: () => import("./welcome"),
    // leave this page, auto remove in dom
    notKeep: true,
  },
  "/sign/login": {
    render: () => import("./sign/Login"),
  },
  "/product": {
    render: () => import("./Product"),
    // when enter product page, preload other page source code
    preload: ["/product/detail"],
  },
  "/product/detail": {
    render: () => import("./ProductDetail"),
  },
});

console.log(paths); // all paths map: {"/":"/", "/sign/login":"/sign/login", ...}

createRoot(document.getElementById("root")!).render(<Router />);
```

Use history:

```tsx
import { vouter } from "vouter";

function App() {
  const handlePushProduct = ()=>{
    vouter.push("/product", {id:"123"});
  }
  const handleReleaseProduct = ()=>{
    vouter.release("/product", {id:"123"});
  }
  const handleClearToProduct = ()=>{
    vouter.clearTo("/product", {id:"123"});
  }
  const handleGoBack = ()=>{
    vouter.goBack();
  }
  return <div>
      <div onClick={handlePushProduct}>push product</div>
      <div onClick={handleReleaseProduct}>release product</div>
      <div onClick={handleClearToProduct}>clear all stack and push product</div>
      <div onClick={handleGoBack}>go back</div>
  </div>
}

```

### Events listen

If history stack is zero, and need back other url::

```tsx
import { vouter } from "vouter";

vouter.setOnLastBack((url) => {
  if (url.indexOf("/product") === 0) {
    return "/";
  }
  return url;
});
```

When use history change:

```tsx
import { vouter } from "vouter";

historyProxy.listen((event, stack) => {
    console.log(event, stack); // "popstate", ["/", "/product"]
});

```