if (!self.define) {
  let e,
    t = {};
  const i = (i, o) => (
    (i = new URL(i + ".js", o).href),
    t[i] ||
      new Promise((t) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = i), (e.onload = t), document.head.appendChild(e);
        } else (e = i), importScripts(i), t();
      }).then(() => {
        let e = t[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (o, n) => {
    const r =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (t[r]) return;
    let s = {};
    const l = (e) => i(e, r),
      u = { module: { uri: r }, exports: s, require: l };
    t[r] = Promise.all(o.map((e) => u[e] || l(e))).then((e) => (n(...e), s));
  };
}
define(["./workbox-fa446783"], function (e) {
  "use strict";
  self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute([{ url: "index.html", revision: "0.u69pokl8si" }], {}),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("index.html"), {
        allowlist: [/^\/$/],
      })
    );
});
