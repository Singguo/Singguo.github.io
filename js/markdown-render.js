/* Lightweight Markdown renderer for local course notes.
 * It intentionally supports the Markdown commonly used in course materials:
 * headings, paragraphs, lists, links, blockquotes, tables, emphasis and code fences.
 */
(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);
  }

  function safeHref(value) {
    const href = String(value || "").trim();
    try {
      const resolved = new URL(href, window.MARKDOWN_BASE_URL || document.baseURI);
      const protocol = resolved.protocol.toLowerCase();
      if (["http:", "https:", "mailto:", "tel:"].includes(protocol)) return escapeHtml(href);
      if (protocol === "file:" || (protocol === location.protocol && resolved.origin === location.origin)) {
        return escapeHtml(resolved.href);
      }
    } catch (_) {
      return "#";
    }
    return "#";
  }

  function inline(value) {
    let text = escapeHtml(value);
    const tokens = [];
    const token = (html) => {
      const index = tokens.push(html) - 1;
      return `\u0000${index}\u0000`;
    };

    text = text.replace(/`([^`]+)`/g, (_, code) => token(`<code>${code}</code>`));
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_, alt, source) => {
      return token(`<img src="${safeHref(source)}" alt="${alt}" loading="lazy">`);
    });
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_, label, href) => {
      return token(`<a href="${safeHref(href)}">${label}</a>`);
    });
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
    text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
  }

  function isTableSeparator(line) {
    return /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|?\s*$/.test(line);
  }

  function renderTable(lines, start) {
    const header = lines[start].split("|").map((cell) => cell.trim()).filter(Boolean);
    const separator = lines[start + 1];
    if (!header.length || !isTableSeparator(separator)) return null;
    const rows = [];
    let index = start + 2;
    while (index < lines.length && lines[index].includes("|")) {
      rows.push(lines[index].split("|").map((cell) => cell.trim()).filter(Boolean));
      index += 1;
    }
    const html = `<table><thead><tr>${header.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows
      .map((row) => `<tr>${header.map((_, cellIndex) => `<td>${inline(row[cellIndex] || "")}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`;
    return { html, next: index };
  }

  function renderMarkdown(markdown) {
    let source = String(markdown || "").replace(/\r\n?/g, "\n");
    // Ignore an optional YAML frontmatter block.
    if (/^---\s*\n/.test(source)) {
      const end = source.indexOf("\n---", 4);
      if (end >= 0) source = source.slice(end + 4).replace(/^\n+/, "");
    }
    const lines = source.split("\n");
    const output = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) { index += 1; continue; }

      if (/^```/.test(line.trim())) {
        const language = line.trim().slice(3).trim();
        const code = [];
        index += 1;
        while (index < lines.length && !/^```/.test(lines[index].trim())) {
          code.push(lines[index]); index += 1;
        }
        if (index < lines.length) index += 1;
        output.push(`<pre><code class="language-${escapeHtml(language)}">${escapeHtml(code.join("\n"))}</code></pre>`);
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
      if (heading) {
        const level = heading[1].length;
        output.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        index += 1;
        continue;
      }

      if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
        output.push("<hr>"); index += 1; continue;
      }

      if (line.includes("|") && index + 1 < lines.length) {
        const table = renderTable(lines, index);
        if (table) { output.push(table.html); index = table.next; continue; }
      }

      if (/^\s*>/.test(line)) {
        const quote = [];
        while (index < lines.length && /^\s*>/.test(lines[index])) {
          quote.push(lines[index].replace(/^\s*>\s?/, "")); index += 1;
        }
        output.push(`<blockquote>${renderMarkdown(quote.join("\n"))}</blockquote>`);
        continue;
      }

      const list = line.match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
      if (list) {
        const ordered = /\d+\./.test(list[1]);
        const items = [];
        while (index < lines.length) {
          const item = lines[index].match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
          if (!item || (ordered !== /\d+\./.test(item[1]))) break;
          items.push(`<li>${inline(item[2])}</li>`); index += 1;
        }
        output.push(`<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`);
        continue;
      }

      const paragraph = [line];
      index += 1;
      while (index < lines.length && lines[index].trim() &&
        !/^```|^#{1,6}\s|^\s*>|^\s*([-+*]|\d+\.)\s+/.test(lines[index])) {
        paragraph.push(lines[index]); index += 1;
      }
      output.push(`<p>${inline(paragraph.join("\n")).replace(/\n/g, "<br>")}</p>`);
    }
    return output.join("\n");
  }

  window.renderMarkdown = renderMarkdown;
})();
