---
title: 动态规划
course: algorithm-java
week: 8
date: 2026-10-20
---

# Week 08 · 动态规划

本周使用仓库内的 Markdown 文件作为课程资料测试。发布到 GitHub Pages 后，课程页中的“资源”按钮会打开排版后的阅读页面。

## 学习目标

- 理解最优子结构和重叠子问题。
- 能够写出状态定义与状态转移方程。
- 使用 Java 实现一个简单的动态规划算法。

## 课堂重点

1. 从递归搜索开始分析问题。
2. 用记忆化搜索消除重复计算。
3. 将递归关系改写为自底向上的状态转移。

## 一个简单例子

```java
int[] dp = new int[n + 1];
dp[0] = 0;
for (int i = 1; i <= n; i++) {
    dp[i] = Math.max(dp[i - 1], value[i]);
}
```

## 推荐阅读

- [动态规划简介](https://en.wikipedia.org/wiki/Dynamic_programming)
- [Java 官方文档](https://docs.oracle.com/en/java/)

> 练习：选择一个日常决策问题，写出状态、选择和转移方程。
