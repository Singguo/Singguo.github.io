/*
 * 数据加载器：页面数据位于 data/*.json。
 * 页面只需要引入本文件和 site-render.js，不需要再编辑 HTML。
 */
(function () {
  "use strict";

  const script = document.currentScript;
  const dataRoot = new URL("../data/", script && script.src ? script.src : location.href);

  function load(name) {
    return fetch(new URL(name + ".json", dataRoot).href, { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("无法加载 " + name + ".json (HTTP " + response.status + ")");
      return response.json();
    });
  }

  window.SITE_DATA_READY = Promise.all([load("site"), load("courses"), load("research"), load("resources")])
    .then(([site, courses, research, resources]) => {
      window.SITE_DATA = { ...site, courses, research, resources };
      return window.SITE_DATA;
    })
    .catch((error) => {
      console.error("网站数据加载失败：", error);
      window.SITE_DATA_ERROR = error;
      window.SITE_DATA = {};
      return window.SITE_DATA;
    });
})();
