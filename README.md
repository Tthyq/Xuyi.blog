# 数字花园 | 沉淀与折腾

关于代码逻辑、硬件设计以及理性与感性的文字记录。

基于 [Astro](https://astro.build) 构建，使用官方 Blog 模板。

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器，默认 http://localhost:4321
npm run build      # 构建生产版本到 ./dist/
npm run preview    # 本地预览构建产物
```

## 部署到 Vercel

### 1. 推送到 GitHub

```bash
# 在 GitHub 上新建一个仓库（不要勾选 README 和 .gitignore）
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

### 2. Vercel 面板配置

| 配置项 | 值 |
|--------|-----|
| Framework Preset | **Astro**（自动识别） |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 18.x 或更高 |

导入 GitHub 仓库后，Vercel 会自动识别 Astro 框架，以上配置通常无需手动修改。

### 3. 域名（可选）

在 Vercel 项目设置的 Domains 中添加自定义域名。

## 技术栈

- **Astro** — 静态站点生成
- **Markdown / MDX** — 内容管理
- **Vercel** — 部署托管
