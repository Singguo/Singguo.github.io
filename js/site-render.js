/*
 * 主站渲染脚本：读取 data/*.json，生成课程、科研、资源等页面内容。
 * HTML 只保留结构和 data-render / data-field 占位标记。
 */
(function () {
  "use strict";

  const READY = window.SITE_DATA_READY || Promise.resolve(window.SITE_DATA || {});

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);
  }

  function getPath(object, path) {
    return path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), object);
  }

  function url(value) {
    const candidate = String(value == null ? "" : value).trim();
    if (!candidate) return "#";
    try {
      const protocol = new URL(candidate, document.baseURI).protocol.toLowerCase();
      if (["http:", "https:", "mailto:", "tel:"].includes(protocol)) return esc(candidate);
    } catch (_) {
      return "#";
    }
    return "#";
  }

  function courseUrl(id) {
    return "courses/course.html?id=" + encodeURIComponent(id);
  }

  function semesterLabel(course) {
    if (course.semester) return course.semester;
    const terms = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" };
    return [course.year, terms[String(course.term || "").toLowerCase()] || course.term].filter(Boolean).join(" · ");
  }

  function resourceLinks(resources, labels) {
    return Object.entries(resources || {})
      .filter(([, value]) => value)
      .map(([key, value]) => `<a href="${url(value)}">${esc(labels[key] || key)}</a>`)
      .join("");
  }

  function hydrateFields(data) {
    document.querySelectorAll("[data-field]").forEach((element) => {
      const value = getPath(data, element.getAttribute("data-field"));
      if (value == null || value === "") return;
      if (element.hasAttribute("data-href-field")) {
        element.href = url(value);
        return;
      }
      if (element.tagName === "A" && element.hasAttribute("data-email")) {
        element.href = "mailto:" + encodeURIComponent(value).replace(/%40/g, "@");
      }
      element.textContent = value;
    });

    const site = data.site || {};
    document.querySelectorAll("[data-site-avatar]").forEach((element) => {
      if (site.avatar) element.src = site.avatar;
    });
    if (site.name) document.title = document.title.replace(/郭畅（Sing）|Sing/g, site.name);
  }

  function renderCourseCards(container, data) {
    const courses = data.courses || [];
    container.innerHTML = courses.length
      ? courses.map((course, index) => `
  <article class="course-card${index === 0 ? " featured" : ""}">
    <span class="tag">${esc(semesterLabel(course))}</span>
    <h3>${esc(course.title)}</h3>
    <p>${esc(course.description)}</p>
    <div class="meta">讲义 · 代码 · 作业 · 实验 · 视频</div>
    <a href="${courseUrl(course.id)}">进入课程 →</a>
  </article>`).join("")
      : '<p style="color:#888">课程资料建设中。</p>';
  }

  function renderCourseRows(container, data) {
    const courses = data.courses || [];
    container.innerHTML = courses.length
      ? courses.map((course) => `
  <a class="course-row" href="${courseUrl(course.id)}">
    <div>
      <span class="tag">${esc(semesterLabel(course))}</span>
      <h2>${esc(course.title)}</h2>
      <p>${esc(course.description)}</p>
    </div>
    <span>进入课程 →</span>
  </a>`).join("")
      : '<div class="course-row"><div><p>课程资料建设中。</p></div></div>';
  }

  function renderUpdates(container, data) {
    const updates = data.updates || [];
    container.innerHTML = updates.length
      ? updates.map((item) => `
  <div class="updates-item">
    <span class="updates-date">${esc(item.date)}</span>
    <div><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p></div>
  </div>`).join("")
      : '<p style="color:#888">暂无更新。</p>';
  }

  const RESOURCE_META = [
    ["slides", "📚 课程讲义", "PDF / PPT / 阅读资料。"],
    ["resources", "📦 课程资源", "代码、论文、阅读材料与实验资料。"],
    ["assignment", "📝 作业", "题目、提交要求与评分标准。"],
    ["video", "🎬 课堂视频", "课程录屏与补充讲解。"],
  ];
  const WEEK_LABELS = { slides: "讲义", resources: "资源", code: "资源", assignment: "作业", video: "视频", experiment: "实验" };

  function renderCoursePage(data) {
    const id = new URLSearchParams(location.search).get("id");
    const courses = data.courses || [];
    const course = courses.find((item) => item.id === id) || courses[0];
    const head = document.querySelector('[data-render="course-head"]');
    const resources = document.querySelector('[data-render="course-resources"]');
    const weeks = document.querySelector('[data-render="course-weeks"]');
    if (!head || !course) return;

    if (data.teacher && data.teacher.name) document.title = `${course.title} | ${data.teacher.name}`;
    const badgeSub = course.badgeSub ? `<small>${esc(course.badgeSub)}</small>` : "";
    head.innerHTML = `
      <div>
        <span class="tag">${esc(semesterLabel(course))}</span>
        <h1>${esc(course.title)}</h1>
        <p class="lead">${esc(course.detail || course.description || "")}</p>
      </div>
      <div class="course-badge">${esc(course.badge || course.shortTitle || "")}${badgeSub}</div>`;

    if (resources) {
      const blocks = RESOURCE_META.filter(([key]) => course.resources && course.resources[key]);
      resources.innerHTML = blocks.length
        ? blocks.map(([key, label, description]) => `
  <section class="resource-block">
    <h2>${label}</h2>
    <p>${description}</p>
    <a href="${url(course.resources[key])}">打开 →</a>
  </section>`).join("")
        : '<p style="color:#888">资源链接整理中。</p>';
    }

    if (weeks) {
      const entries = course.weeks || [];
      weeks.innerHTML = entries.length
        ? entries.map((week) => `
  <div class="week">
    <div class="week-num">${esc(String(week.no).padStart(2, "0"))}</div>
    <div>
      <h3>${esc(week.title)}</h3>
      <p>${esc(week.text || "")}</p>
      <div class="links">${resourceLinks(week.resources || week.links, WEEK_LABELS)}</div>
    </div>
  </div>`).join("")
        : '<p style="color:#888">教学周次资料建设中。</p>';
    }
  }

  function renderTeacherBio(container, data) {
    const paragraphs = data.teacher && data.teacher.aboutBio || [];
    container.innerHTML = paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("");
  }

  function renderContactLinks(container, data) {
    const links = data.teacher && data.teacher.externalLinks || [];
    container.innerHTML = links.map((link) => `<a class="text-link" href="${url(link.url)}">${esc(link.label)}</a>`).join(" · ");
  }

  function renderResources(container, data) {
    const resources = data.resources || [];
    container.innerHTML = resources.length
      ? resources.map((item) => `
  <article class="paper">
    <span class="tag">${esc(item.tag)}</span>
    <h2>${esc(item.title)}</h2>
    <p>${esc(item.description)}</p>
    <a class="text-link" href="${url(item.url)}">${esc(item.label || "打开链接 →")}</a>
  </article>`).join("")
      : '<p style="color:#888">资源整理中。</p>';
  }

  function renderResearchJoin(container, data) {
    const join = data.research && data.research.join || {};
    const title = String(join.title || "").split("\n").map(esc).join("<br />");
    container.innerHTML = `
      <div>
        <p class="eyebrow">${esc(join.eyebrow || "JOIN US")}</p>
        <h2>${title}</h2>
      </div>
      <div>
        ${(join.paragraphs || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
        <div class="actions">
          <a class="button" href="contact.html">联系我</a>
          <a class="text-link" href="resources.html">先看看公开资源 →</a>
        </div>
      </div>`;
  }

  function renderResearchTopics(container, data) {
    const topics = data.research && data.research.topics || [];
    container.innerHTML = topics.map((topic) => `
  <article class="paper">
    <span class="tag">${esc(topic.tag)}</span>
    <h2>${esc(topic.title)}</h2>
    <p>${esc(topic.description)}</p>
    <a class="text-link" href="#papers" data-filter="${esc(topic.id)}" data-label="${esc(topic.title)}">研究成果 →</a>
  </article>`).join("");
  }

  function renderResearchPapers(container, data) {
    const publications = data.research && data.research.publications || [];
    container.innerHTML = publications.length
      ? publications.map((publication) => `
  <article class="pub" data-dir="${esc(publication.dir)}">
    <span class="pub-year">${esc(publication.year)}</span>
    <div>
      <h3>${esc(publication.title)}${publication.sample ? '<span class="sample">测试数据</span>' : ""}</h3>
      <p class="pub-meta">${esc(publication.authors)}${publication.venue ? " · " + esc(publication.venue) : ""}</p>
      ${publication.note ? `<p class="pub-note">${esc(publication.note)}</p>` : ""}
      <div class="links">${(publication.links || []).map((link) => `<a href="${url(link.url)}">${esc(link.label)}</a>`).join("")}</div>
    </div>
  </article>`).join("")
      : '<p style="color:#888">研究成果整理中。</p>';
  }

  function setupResearchFilter(data) {
    const pubs = Array.from(document.querySelectorAll(".pub"));
    const chip = document.getElementById("filter-chip");
    const chipLabel = document.getElementById("filter-label");
    const reset = document.getElementById("filter-reset");
    if (!pubs.length || !chip || !chipLabel || !reset) return;

    function applyFilter(dir, label) {
      pubs.forEach((pub) => { pub.hidden = dir !== "all" && pub.dataset.dir !== dir; });
      chip.hidden = dir === "all";
      chipLabel.textContent = label || "";
    }

    document.querySelectorAll("[data-filter]").forEach((link) => {
      link.addEventListener("click", () => applyFilter(link.dataset.filter, link.dataset.label));
    });
    reset.addEventListener("click", () => applyFilter("all", ""));

    const requested = new URLSearchParams(location.search).get("topic");
    if (requested) {
      const topic = (data.research && data.research.topics || []).find((item) => item.id === requested);
      if (topic) applyFilter(topic.id, topic.title);
    }
  }

  READY.then((data) => {
    hydrateFields(data);
    document.querySelectorAll('[data-render="course-cards"]').forEach((element) => renderCourseCards(element, data));
    document.querySelectorAll('[data-render="course-rows"]').forEach((element) => renderCourseRows(element, data));
    document.querySelectorAll('[data-render="updates"]').forEach((element) => renderUpdates(element, data));
    document.querySelectorAll('[data-render="course-head"]').forEach(() => renderCoursePage(data));
    document.querySelectorAll('[data-render="teacher-about-bio"]').forEach((element) => renderTeacherBio(element, data));
    document.querySelectorAll('[data-render="contact-links"]').forEach((element) => renderContactLinks(element, data));
    document.querySelectorAll('[data-render="resources-list"]').forEach((element) => renderResources(element, data));
    document.querySelectorAll('[data-render="research-join"]').forEach((element) => renderResearchJoin(element, data));
    document.querySelectorAll('[data-render="research-topics"]').forEach((element) => renderResearchTopics(element, data));
    document.querySelectorAll('[data-render="research-publications"]').forEach((element) => renderResearchPapers(element, data));
    if (document.querySelector('[data-render="research-publications"]')) setupResearchFilter(data);
  });
})();
