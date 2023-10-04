if (!self.define) {
  let e,
    t = {};
<<<<<<< HEAD
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
=======
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
>>>>>>> main
    const r =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (t[r]) return;
    let s = {};
<<<<<<< HEAD
    const l = (e) => n(e, r),
      u = { module: { uri: r }, exports: s, require: l };
    t[r] = Promise.all(i.map((e) => u[e] || l(e))).then((e) => (o(...e), s));
=======
    const l = (e) => o(e, r),
      c = { module: { uri: r }, exports: s, require: l };
    t[r] = Promise.all(i.map((e) => c[e] || l(e))).then((e) => (n(...e), s));
>>>>>>> main
  };
}
define(["./workbox-fa446783"], function (e) {
  "use strict";
  self.skipWaiting(),
    e.clientsClaim(),
<<<<<<< HEAD
    e.precacheAndRoute([{ url: "index.html", revision: "0.4dn8nioj0lg" }], {}),
=======
    e.precacheAndRoute([{ url: "index.html", revision: "0.ejl9ecr370o" }], {}),
>>>>>>> main
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("index.html"), {
        allowlist: [/^\/$/],
      })
    );
});
