if (!self.define) {
  let e,
    t = {};
  const o = (o, i) => (
    (o = new URL(o + ".js", i).href),
    t[o] ||
      new Promise((t) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = o), (e.onload = t), document.head.appendChild(e);
        } else (e = o), importScripts(o), t();
      }).then(() => {
        let e = t[o];
        if (!e) throw new Error(`Module ${o} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, n) => {
    const r =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (t[r]) return;
    let s = {};
    const l = (e) => o(e, r),
      u = { module: { uri: r }, exports: s, require: l };
    t[r] = Promise.all(i.map((e) => u[e] || l(e))).then((e) => (n(...e), s));
  };
}
define(["./workbox-fa446783"], function (e) {
  "use strict";
  self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute([{ url: "index.html", revision: "0.fo9ub6s5v4g" }], {}),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("index.html"), {
        allowlist: [/^\/$/],
      })
    );
});
