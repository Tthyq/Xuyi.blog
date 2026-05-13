---
title: '从零搭建个人博客：Astro 框架踩坑实录'
description: '记录使用 Astro 框架搭建博客过程中的技术决策、踩坑历程与优化方案'
pubDate: '2026-05-10'
tags: ["Tech & Projects"]
---

## 为什么选择 Astro

Astro 是一个现代化的静态站点生成器，它最吸引人的特性是 **零 JS 默认输出**——这意味着你可以使用 React、Vue 或 Svelte 编写组件，但最终生成的是纯 HTML 页面，只有在需要交互时才会加载对应的 JavaScript。

对于个人博客这种内容密集型站点来说，这几乎是完美的技术选型。

## 初始化过程

使用官方模板初始化项目非常简单：

```bash
npm create astro@latest -- --template blog
```

这个模板内置了 Markdown/MDX 支持、RSS 生成、站点地图等功能，免去了从零配置的繁琐。

## 遇到的坑

### 1. 字体加载策略

默认模板使用本地字体文件，但在国内网络环境下加载速度需要优化。最终选择了 `font-display: swap` 策略，确保文本在字体加载完成前以系统字体渲染，避免白屏。

### 2. 标签系统的实现

Astro 的 Content Collections 提供了 Schema 验证功能，但需要手动扩展标签字段。通过 Zod 定义 `tags` 数组字段后，还需要在渲染页面中做二次分类聚合。

## 总结

Astro 确实是个人博客的最佳实践之一。它的内容管理、性能优化和部署体验都相当出色。
