# 煦意 · 数字花园

基于原 Astro 博客重整：首页聚焦学习与实验，全部旧文收录于“往日手记”，学习栏目内置机器人学实验室。

## 开发与构建

需要 Node.js >= 22.12.0。

```sh
npm ci
npm run dev
npm run build
npm run preview
```

生产文件输出到 `dist/`，可以继续通过原来的 GitHub Pages 或 Vercel 流程发布。`astro.config.mjs` 与 `public/CNAME` 保留原域名 `tthyq.ccwu.cc`。

## 栏目与内容

- `/`：新版数字花园首页，不展示旧文列表。
- `/columns/old-notes/`：“往日手记”专栏，16篇文章，按年份整理，支持关键词与标签筛选。
- `/blog/`：跳转到旧文专栏；原 `/blog/<slug>/` 文章地址继续有效。
- `/learn/`：学习空间与课程入口。
- `/review/`：每日温习，含74张机器人学概念卡、4801个考研标签词条与30则附出处的名言；支持翻卡自测、间隔复习、打卡日历、检索收藏、自建卡片及JSON备份合并。记录保存在当前浏览器。
- `/learn/robotics/`：完整机器人学实验室，支持1～8节机械臂、16节讲解、33道计算练习、20道概念自测、错题本与模拟考试。
- 原有关于、游戏、AI页面和留言墙保留，可由导航或页脚进入。

旧文章仍保存在 `src/content/blog/`，正文与原文件一致；“收起来”通过栏目与首页展示结构实现，无需移动或重写正文。

## 维护实验室

实验室静态源码已随博客放在 `public/learn/robotics/`，可直接独立使用，不依赖外站 iframe。

如需从独立实验室项目同步更新，在博客项目根目录运行：

```sh
node scripts/sync-robotics.mjs ../robotics-lab/dist
```

也可以传入其他已构建的实验室目录绝对路径。同步脚本会补上“返回学习空间”入口。各学习记录保存在浏览器，站点域名变化时不会自动迁移。

## 检查

`node scripts/check_review.mjs` 检查卡片完整性、复习调度、北京时间跨日、打卡去重及备份验证；内容来源与规则见 `docs/review-sources.md`。

`python scripts/verify_site.py` 检查产物内的站内链接、16篇文章页面与实验室资源；传入原项目路径可额外比较旧文文件哈希。

正式网站：https://tthyq.ccwu.cc/ 。main 分支推送后，Vercel 自动构建并更新生产站点；原 GitHub Pages 工作流同时保留。

## 游乐场与留言墙

游乐场共18款游戏：保留原6款，新增井字棋、四子棋、熄灯谜题、十五数码、迷宫、打地鼠、打砖块、乒乓对决、纸飞机、瞄准练习、打字小憩、迷你数独。

新游戏复用 src/scripts/arcade.js 和 game-math.js，验证命令为 node scripts/check_games.mjs。

留言墙恢复至主导航，继续使用原 Giscus 仓库与讨论分类，不保存本地假留言。需要 GitHub 登录才能发布评论。

本次补入2026年4月2日的《游戏杂谈》与2026年9月30日的随笔，后者附3幅原创SVG线稿，前者保留PDF中的7张插图。
