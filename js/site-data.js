/* 只需要改这个文件，就能更新课程资料链接。所有资源都使用外部 URL。 */
window.SITE_DATA = {
  teacher: {
    name: "你的姓名",
    initials: "YN",
    title: "高校教师 · 计算机科学 · 人工智能",
    email: "your-email@example.com",
  },
  courses: [
    {
      id: "algorithm-java",
      semester: "2026 · Spring",
      title: "算法设计与分析基础（JAVA版）",
      shortTitle: "算法设计与分析",
      description: "从算法思想到 Java 实现，再到 AI 辅助编程与真实问题解决。",
      detail: "理解原理 → AI 辅助实现 → 真实问题 → 复盘与表达。",
      badge: "JAVA",
      resources: {
        slides: "https://drive.google.com/替换为你的讲义文件夹",
        code: "https://github.com/替换为你的代码仓库",
        assignments: "https://drive.google.com/替换为你的作业文件夹",
        recordings: "https://www.youtube.com/替换为你的播放列表",
      },
      weeks: [
        {
          no: "01",
          title: "为什么要学习算法？",
          text: "问题意识、算法复杂度、AI 时代的算法学习方式。",
          links: {
            slides: "https://drive.google.com/替换为第1周讲义",
            code: "https://github.com/替换为第1周代码",
            assignment: "https://drive.google.com/替换为第1周作业",
          },
        },
        {
          no: "02",
          title: "排序与搜索",
          text: "从暴力方法到分治思想，并用 Java 与 AI 编程工具完成实现。",
          links: {
            slides: "https://drive.google.com/替换为第2周讲义",
            code: "https://github.com/替换为第2周代码",
            video: "https://www.youtube.com/替换为第2周视频",
          },
        },
        {
          no: "03",
          title: "数据结构与算法设计",
          text: "线性结构、树、图，以及如何判断一个问题适合什么算法。",
          links: {
            slides: "https://drive.google.com/替换为第3周讲义",
            code: "https://github.com/替换为第3周代码",
            assignment: "https://drive.google.com/替换为第3周作业",
          },
        },
      ],
    },
  ],
  updates: [
    { date: "2026.03.14", title: "作业 02 已上载", text: "题目、提交格式和评分标准已放到课程页。" },
    { date: "2026.03.08", title: "新增课程录影", text: "第 02 周课堂录影已加入 YouTube 播放列表。" },
    { date: "2026.02.26", title: "课程资料区开放", text: "讲义、代码和作业链接现在可以按周次查看。" },
  ],
};
