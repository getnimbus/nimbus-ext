if (!self.define) {
  let e,
    t = {};
  const n = (n, i) => (
    (n = new URL(n + ".js", i).href),
    t[n] ||
      new Promise((t) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = n), (e.onload = t), document.head.appendChild(e);
        } else (e = n), importScripts(n), t();
      }).then(() => {
        let e = t[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, o) => {
    const s =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (t[s]) return;
    let r = {};
    const l = (e) => n(e, s),
      u = { module: { uri: s }, exports: r, require: l };
    t[s] = Promise.all(i.map((e) => u[e] || l(e))).then((e) => (o(...e), r));
  };
}
define(["./workbox-fa446783"], function (e) {
  "use strict";
  self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute([{ url: "index.html", revision: "0.q94p89n2ss8" }], {}),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("index.html"), {
        allowlist: [/^\/$/],
      })
    );
});
