# 郭畅（Sing）个人学术主页

这是一个面向教学、科研与开放课程资源的静态个人网站，部署后可通过 GitHub Pages 等静态托管服务访问。

网站包含：首页、个人信息、科研、课程、资源、联系和个人博客。主站采用“数据与页面分离”的结构：HTML 负责页面骨架，JSON 负责内容，JavaScript 负责渲染。因此，日常新增课程周次、替换资料链接、更新论文或资源卡片时，不需要修改 HTML。

## 主要页面

| 页面 | 地址 | 内容 |
| --- | --- | --- |
| 首页 | `index.html` | 个人简介、正在讲授课程、最近更新 |
| 个人信息 | `about.html` | 教师简介、联系方式和办公信息 |
| 科研 | `research.html` | 研究方向、成果列表和方向筛选 |
| 课程 | `courses.html` | 全部课程列表 |
| 课程详情 | `courses/course.html?id=课程ID` | 课程资源和按周次整理的资料 |
| Markdown 阅读页 | 由课程页自动跳转到 `courses/markdown.html` | 将课程 Markdown 排版为网页 |
| 资源 | `resources.html` | 讲义、课程资源、视频和阅读入口 |
| 联系 | `contact.html` | 邮箱、办公时间和外部链接 |
| 博客 | `blog/index.html` | Hexo 生成的博客静态页面 |

## 技术结构

```text
data/
├── site.json       站点、教师和首页更新信息
├── courses.json    课程、资源链接和每周资料
├── research.json   研究方向和成果
└── resources.json  公共资源卡片

js/
├── site-data.js    加载 JSON 数据
├── site-render.js  将数据渲染到各页面
└── markdown-render.js  将课程 Markdown 渲染为阅读页

*.html              页面骨架和占位标记
css/style.css       主站样式
blog/               Hexo 博客构建产物
.nojekyll            让 GitHub Pages 直接提供 JSON / Markdown 数据文件
```

## 本地预览

由于浏览器会限制 `file://` 页面读取 JSON，预览时请在仓库目录启动静态服务器：

```bash
python3 -m http.server 8080
```

然后打开 <http://127.0.0.1:8080/>。完整的数据字段说明、更新示例和发布流程见 [`网站数据更新与使用手册.md`](网站数据更新与使用手册.md)。

Windows 用户也可以双击 [`预览网站.bat`](预览网站.bat)，它会自动启动预览并打开浏览器。

## 部署

这是纯静态网站，不需要数据库或后端服务。将仓库推送到 GitHub 后，在仓库的 Pages 设置中选择分支和目录即可部署。大文件和视频建议使用云盘、代码托管或视频平台，网站只保存公开链接。

仓库包含 `.nojekyll`，用于确保 GitHub Pages 直接提供 `data/*.json` 和课程 Markdown 文件。部署后的 HTTPS 页面可以正常读取这些同源文件；直接双击 HTML 产生的 `file://` 页面则会受到浏览器安全策略限制。
