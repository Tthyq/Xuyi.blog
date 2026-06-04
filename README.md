# 数字花园 | 沉淀与折腾

关于代码逻辑、硬件设计以及理性与感性的文字记录。

基于 [Astro](https://astro.build) 构建。

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器，默认 http://localhost:4321
npm run build      # 构建生产版本到 ./dist/
npm run preview    # 本地预览构建产物
```

## 项目结构

```
src/
├── assets/                 # 图片资源
├── components/             # UI 组件
│   ├── BaseHead.astro      # 全局 head 元信息 + 彩蛋脚本
│   ├── Footer.astro
│   ├── FormattedDate.astro
│   ├── Header.astro        # 导航栏
│   └── ParticleBackground.astro  # Canvas 粒子背景
├── content/                # 博客文章
├── layouts/                # 页面布局
│   ├── BlogPost.astro      # 博客文章布局
│   └── Layout.astro        # 通用布局
├── pages/                  # 路由页面
│   ├── index.astro         # 首页（门户）
│   ├── about.astro         # 关于
│   ├── blog/               # 博客列表 + 文章
│   ├── ai.astro            # AI 实验室（多模型对话 UI）
│   └── games/              # 游戏矩阵
│       ├── index.astro     # 游戏大厅
│       ├── snake.astro     # 贪吃蛇（含加速机制）
│       ├── tetris.astro    # 俄罗斯方块
│       └── minesweeper.astro  # 扫雷（三档难度）
└── styles/
    └── global.css          # 全局样式
```

## 功能特性

- **粒子背景** — Canvas 自绘粒子系统，鼠标悬停产生排斥效果
- **版面彩蛋** — 按下 `0` `1` 翻转反色；控制台输出艺术字问候
- **AI 实验室** — 五个模型页签切换，消息对话 UI，模拟思考延迟
- **游戏矩阵** — 贪吃蛇（含速度递增）、俄罗斯方块、扫雷（初级/中级/高级）

## 部署指南

### 方案一：Vercel（推荐）

1. **推送到 GitHub**

```bash
cd tthyq.blog
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Tthyq/Xuyi.blog.git
git push -u origin main
```

2. **在 Vercel 面板配置**

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Astro |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

3. **连接 GitHub 仓库**

登录 [vercel.com](https://vercel.com) → New Project → Import Git Repository → 选择 `tthyq.blog` → Deploy

### 方案二：GitHub Pages

1. **安装适配器**

```bash
npm install @astrojs/node
```

2. **修改 astro.config.mjs**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://YOUR_USERNAME.github.io',
  output: 'static',
});
```

3. **创建 GitHub Actions 工作流**

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

4. **在 GitHub 仓库设置中启用 Pages**

Settings → Pages → Source → 选择 "GitHub Actions"

## 技术栈

- **Astro** — 静态站点生成
- **Markdown / MDX** — 内容管理
- **Canvas API** — 粒子背景与游戏渲染
- **Vercel** — 部署托管
